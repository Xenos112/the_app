import { z } from 'zod'

export const emailValidator = z.string({ message: 'Email is required' }).email({ message: 'Email is invalid' })
export const uuid = z.string({ message: 'UUID is required' }).uuid({ message: 'UUID is invalid' })

export const RouteValidator = z.object({
  id: uuid,
})
