import getPostById from '@/features/post/lib/delete-post-by-id'
import { uuid } from '@/validators'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
import { z } from 'zod'

const RouteValidator = z.object({
  id: uuid,
})

export default new Hono()
  .get('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }
      return c.json(post)
    }
    catch (error) {
      return c.json({ error })
    }
  })
