import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Comment } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import { eq } from 'drizzle-orm'

type GetPostCommentsContext = Context<object, '/:id/comments', {
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

export default async function getPostComments(c: GetPostCommentsContext) {
  try {
    // todo: add limit and other url params
    const { id } = c.req.valid('param')
    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }
    const comments = await db.select().from(Comment).where(eq(Comment.post_id, id)).limit(10)
    return c.json(comments)
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
