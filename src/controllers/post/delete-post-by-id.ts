import type validateToken from '@/utils/validate-token'
import type { Context } from 'hono'
import { db } from '@/db'
import { Post } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import { eq } from 'drizzle-orm'

type DeletePostById = Context<{
  Variables: {
    user: Exclude<Awaited<ReturnType<typeof validateToken>>, null>
  }
}, '/:id', {
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
    const user = c.get('user')

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
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
