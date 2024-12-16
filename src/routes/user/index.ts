import deleteUserById from '@/controllers/user/delete-user-by-id'
import getUserById from '@/controllers/user/get-user-by-id'
import authMiddleware from '@/middleware/authenticated'
import { RouteValidator } from '@/validators'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'

export default new Hono()
  .get('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), getUserById)

  .delete('/:id', authMiddleware, zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), deleteUserById)
