import type { Context } from 'hono'
import _getPostById from '@/features/post/lib/get-post-by-id'
import { db } from '@/db'
import { Like, Media, Save, type PostSelect } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'
import validateToken from '@/utils/validate-token'

type GetUserByIdContext = Context<object, '/:id', {
  in: {
    param: {
      id: string
    }
  }
  out: {
    param: {
      id: string
    }
  }
}>

export default async function getPostById(c: GetUserByIdContext) {
  try {
    const { id } = c.req.valid('param')
    const authToken = getCookie(c, 'auth_token')
    let userId: string | undefined

    if (authToken) {
      userId = (await validateToken(authToken))?.id
    }

    const post = await _getPostById(id) as (PostSelect & { pictures?: { type: string, url: string }[] })
    if (post === null) {
      return c.json({ error: 'Post not found' }, 404)
    }

    const postPictures = await db.select({ type: Media.type, url: Media.url }).from(Media).where(eq(Media.target_id, id))
    post.pictures = postPictures

    if (!userId) {
      return c.json({ data: { ...post, isLiked: false, isSaved: false } })
    }

    const isLiked = (await db.select().from(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, userId))).limit(1)).length === 1
    const isSaved = (await db.select().from(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, userId))).limit(1)).length === 1
    return c.json({ data: { ...post, isLiked, isSaved } })
  }

  catch (error) {
    return c.json({ error }, 500)
  }
}
