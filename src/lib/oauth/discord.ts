import { db } from '@/db'
import { Media, User } from '@/db/schema'
import { Discord } from 'arctic'
import { eq, or } from 'drizzle-orm'

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID,
  process.env.DISCORD_SECRET,
  process.env.DISCORD_REDIRECT_URI,
)

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  global_name: string
  email: string
}

export async function authenticate({ avatar, email, id, global_name }: DiscordUser) {
  const user = (await db
    .select()
    .from(User)
    .where(or(eq(User.email, email), eq(User.discord_id, id)))).at(0)

  if (user) {
    if (user.discord_id == null) {
      await db.update(User).set({ discord_id: id }).where(eq(User.id, user.id))
    }
    return user
  }
  else {
    const newUser = (await db.insert(User).values({
      email,
      discord_id: id,
      user_name: global_name,
    }).returning()).at(0)

    const imageId = (await db.insert(Media).values({
      type: 'image',
      target_id: newUser!.id,
      url: `https://cdn.discordapp.com/avatars/${id}/${avatar}.png`,
    }).returning()).at(0)?.id

    await db.update(User).set({ image_id: imageId }).where(eq(User.id, newUser!.id))
    return newUser
  }
}
