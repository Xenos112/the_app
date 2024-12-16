import { db } from '@/db'
import { Media, User } from '@/db/schema'
import { GitHub } from 'arctic'
import { config } from 'dotenv'
import { eq, or } from 'drizzle-orm'

config()

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID,
  process.env.GITHUB_SECRET,
  process.env.GITHUB_REDIRECT_URI,
)

export interface GitHubUser {
  id: number
  login: string
  node_id: string
  avatar_url: string
  name: string
  email: string | null
}

export async function authenticate({ email, id, avatar_url, name }: GitHubUser) {
  const user = (await db
    .select()
    .from(User)
    .where(or(eq(User.email, email!), eq(User.github_id, id.toString())))).at(0)

  if (user) {
    if (user.github_id === null) {
      await db
        .update(User)
        .set({ github_id: id.toString() })
        .where(eq(User.id, user.id))
    }
    return user
  }
  else {
    const newUser = (await db.insert(User).values({
      email: email!,
      github_id: id.toString(),
      user_name: name,
    }).returning()).at(0)

    const imageId = (await db
      .insert(Media)
      .values({
        type: 'image',
        target_id: newUser!.id,
        url: avatar_url,
      })
      .returning())
      .at(0)
      ?.id

    await db
      .update(User)
      .set({ image_id: imageId })
      .where(eq(User.id, newUser!.id))
    return newUser
  }
}
