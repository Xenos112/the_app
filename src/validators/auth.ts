import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string({ message: 'Email is required' }).email({ message: 'Email is invalid' }),
  password: z.string({ message: 'Password is required' }).min(8, { message: 'Password must be at least 8 characters' }),
})

export const RegisterSchema = z.object({
  email: z.string({ message: 'Email is required' }).email({ message: 'Email is invalid' }),
  password: z.string({ message: 'Password is required' }).min(8, { message: 'Password must be at least 8 characters' }),
  user_name: z.string({ message: 'Name is required' }).min(3, { message: 'Name must be at least 3 characters' }).max(20, { message: 'Name must be at most 20 characters' }),
})
