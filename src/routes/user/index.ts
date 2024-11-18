import deleteUserById from '@/controllers/user/delete-user-by-id'
import getUserById from '@/controllers/user/get-user-by-id'
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

  .delete('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), deleteUserById)
