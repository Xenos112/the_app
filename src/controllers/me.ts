import type { Prettify } from '@/types'
import type validateToken from '@/utils/validate-token'
import type { Context } from 'hono'
import { db } from '@/db'
import { Media } from '@/db/schema'
import { eq } from 'drizzle-orm'

type MeContext = Context<{
  Variables: {
    user: Exclude<Awaited<ReturnType<typeof validateToken>>, null>
  }
}, '/', object>

async function me(c: MeContext) {
  const user = c.get('user')

  let userImageProfile: string = ''
  if (typeof user.image_id === 'string') {
    const [userProfilePicture] = await db
      .select({ image_url: Media.url })
      .from(Media)
      .where(eq(Media.id, user.image_id))
    userImageProfile = userProfilePicture.image_url ?? ''
  }

  type ValidateToken = Awaited<ReturnType<typeof validateToken>>
  const finaleUserResponse = {
    ...user,
    image_url: userImageProfile,
    password: null,
    github_id: null,
    discord_id: null,
  } as Prettify<Partial<ValidateToken> & { image_url: string }>

  delete finaleUserResponse.password
  delete finaleUserResponse.github_id
  delete finaleUserResponse.discord_id
  delete finaleUserResponse.image_id
  delete finaleUserResponse.banner_id
  delete finaleUserResponse.bio
  return c.json((finaleUserResponse) as ValidateToken & { image_url: string | null })
}

export default me