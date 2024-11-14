import { db } from '@/db'
import { User } from '@/db/schema'
import { UserNotFoundError } from '@/errors/auth'
import { generateToken } from '@/utils/generate-token'
import { LoginSchema } from '@/validators/auth'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { Hono } from 'hono'

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
      throw new UserNotFoundError('user not found')
    }
    // eslint-disable-next-line ts/no-unsafe-assignment
    const isPasswordCorrect = bcrypt.compareSync(password, user.password)
    if (Boolean(isPasswordCorrect) === false) {
      throw new UserNotFoundError('password incorrect')
    }

    const token = generateToken(user.id)

    return c.json({ user, token })
  }
  catch (error) {
    if (!(error instanceof Error)) {
      return c.json({ message: 'Internal server error' }, 500)
    }
    return c.json({ message: error.message }, 400)
  }
})
