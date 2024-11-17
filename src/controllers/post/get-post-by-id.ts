import type { Context } from 'hono'
import _getPostById from '@/features/post/lib/get-post-by-id'

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
    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }
    return c.json(post)
  }
  catch (error) {
    return c.json({ error })
  }
}
