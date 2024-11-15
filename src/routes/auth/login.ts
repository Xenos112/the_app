import { db } from '@/db'
import { User } from '@/db/schema'
import { generateToken } from '@/utils/generate-token'
import { LoginSchema } from '@/validators/auth'
import { zValidator } from '@hono/zod-validator'
import * as bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

export default new Hono().post('/', zValidator('json', LoginSchema, (res, c) => {
  if (!res.success) {
    const errors = res.error.issues.map(error => error.message)
    return c.json(errors, 400)
  }
}), async (c) => {
  try {
    const { email, password } = c.req.valid('json') as { email: string, password: string }
    const user = (await db.select().from(User).where(eq(User.email, email))).at(0)
    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    if (user.password === null) {
      return c.json({ message: 'this Account Is Linked with a social account' }, 401)
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password) as unknown as string
    if (Boolean(isPasswordCorrect) === false) {
      return c.json({ message: 'Incorrect password' }, 401)
    }

    const token = generateToken(user.id)
    setCookie(c, 'auth_token', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
    return c.json({ user, token })
  }
  catch (error) {
    if (error instanceof Error) {
      return c.json({ message: 'Internal server error' }, 500)
    }
    return c.json({ message: 'Internal server error' }, 500)
  }
})
