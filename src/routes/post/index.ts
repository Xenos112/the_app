import { db } from '@/db'
import { Post } from '@/db/schema'
import getPostById from '@/features/post/lib/delete-post-by-id'
import validateToken from '@/utils/validate-token'
import { uuid } from '@/validators'
import { zValidator } from '@hono/zod-validator'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
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
  .delete('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const token = getCookie(c, 'auth_token')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
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
  })
  .get('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
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
      return c.json({ likes: post.likes_count })
    }
    catch (error) {
      return c.json({ error }, 500)
    }
  })
