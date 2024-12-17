import type { ValidationTargets } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

export const emailValidator = z.string({ message: 'Email is required' }).email({ message: 'Email is invalid' })
export const uuid = z.string({ message: 'UUID is required' }).uuid({ message: 'UUID is invalid' })
export const RouteValidator = z.object({
  id: uuid,
})

export const CommentValidator = z.object({
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
}).refine(data => data.content !== null || data.image_url !== null, {
  message: 'Either content or image_url must be provided',
})

export const DeleteRouteValidator = z.object({
  id: uuid,
  comment_id: uuid,
})

export function honoValidator<T extends z.ZodTypeAny>(
  zodValidator: T,
  location: (keyof ValidationTargets) = 'json',
) {
  return zValidator(location, zodValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  })
}
