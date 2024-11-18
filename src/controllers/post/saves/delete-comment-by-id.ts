import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Comment } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type DeleteCommentByIdContext = Context<object, '/:id/comments/:comment_id', {
  in: {
    param: {
      id: string
      comment_id: string
    }
  }
  out: {
    param: {
      id: string
      comment_id: string
    }
  }
}>

export default async function deleteCommentById(c: DeleteCommentByIdContext) {
  try {
    const { id, comment_id } = c.req.valid('param')

    const token = getCookie(c, 'auth_token')
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

    const comment = await db.select().from(Comment).where(and(eq(Comment.id, comment_id), eq(Comment.post_id, id))).limit(1)
    if (comment.length === 0) {
      return c.json({ message: 'Comment not found' }, 404)
    }

    if (comment[0].user_id !== user.id) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    await db.delete(Comment).where(and(eq(Comment.id, comment_id), eq(Comment.post_id, id)))
    return c.json({ message: 'Comment deleted' })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}