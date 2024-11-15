import type { Prettify } from '@/types'
import { db } from '@/db'
import { Media } from '@/db/schema'
import validateToken from '@/utils/validate-token'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

export default new Hono().get('/', async (c) => {
  const token = getCookie(c, 'auth_token')
  if (token === undefined) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const user = await validateToken(token)
  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

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
})
