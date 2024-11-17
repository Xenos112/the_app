import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Like, Post } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type UnlikePostContext = Context<object, '/:id/likes', {
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

export default async function unlikePost(c: UnlikePostContext) {
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

    await db.delete(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, user.id)))
    await db.update(Post).set({ likes_count: post.likes_count! - 1 }).where(eq(Post.id, id))
    return c.json({ unliked: true })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
