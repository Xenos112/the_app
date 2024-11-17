import type { Context } from 'hono'
import { db } from '@/db'
import { Post } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type DeletePostById = Context<object, '/:id', {
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

export default async function deletePostById(c: DeletePostById) {
  try {
    const { id } = c.req.valid('param')
    const token = getCookie(c, 'auth_token')
    if (token === undefined) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }

    const user = await validateToken(token)
    if (!user) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    if (post.author_id !== user?.id) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    await db.delete(Post).where(eq(Post.id, id))
    return c.json({ deleted: true })
  }
  catch (error) {
    return c.json({ error, deleted: false })
  }
}
