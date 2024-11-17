import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Comment } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { getCookie } from 'hono/cookie'

type AddCommentContext = Context<object, '/:id/comments', {
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
} & {
  in: {
    json: {
      image_url?: string | null | undefined
      content?: string | null | undefined
    }
  }
  out: {
    json: {
      image_url?: string | null | undefined
      content?: string | null | undefined
    }
  }
}>

export default async function addComment(c: AddCommentContext) {
  try {
    const { id } = c.req.valid('param')
    const { content, image_url } = c.req.valid('json')

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

    const comment = await db.insert(Comment).values({
      image_url,
      content,
      post_id: id,
      user_id: user.id,
    }).returning()
    return c.json(comment[0])
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
