import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Post, Save } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type UnSavePostContext = Context<object, '/:id/saves', {
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

export default async function unsavePost(c: UnSavePostContext) {
  try {
    const token = getCookie(c, 'auth_token')
    const { id } = c.req.valid('param')
    if (token === undefined) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const user = await validateToken(token)
    if (!user) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }

    await db.delete(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, user.id)))
    await db.update(Post).set({ saves_count: post.saves_count! - 1 }).where(eq(Post.id, id))
    return c.json({ unsave: true })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
