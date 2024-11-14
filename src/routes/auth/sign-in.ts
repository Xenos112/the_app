import { db } from '@/db'
import { User } from '@/db/schema'
import { generateToken } from '@/utils/generate-token'
import { RegisterSchema } from '@/validators/auth'
import { zValidator } from '@hono/zod-validator'
import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { Hono } from 'hono'

export default new Hono()
  .post('/', zValidator('json', RegisterSchema, (res, c) => {
    if (!res.success) {
      const errors = res.error.errors.map(e => e.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { email, password, user_name } = c.req.valid('json') as { email: string, password: string, user_name: string }
      const existingUser = (await db.select().from(User).where(or(eq(User.email, email), eq(User.user_name, user_name)))).at(0)
      if (existingUser) {
        return c.json({ error: 'User already exists' }, 400)
      }

      const passwordHash = await bcrypt.hash(password, 10) as string
      const user = await db.insert(User).values({ email, password: passwordHash, user_name }).returning()
      const token = generateToken(user.at(0)!.id)
      return c.json({ user, token })
    }
    catch (error) {
      if (error instanceof Error) {
        return c.json({ error: 'An error occurred' }, 500)
      }
      return c.json({ error: 'An error occurred' }, 500)
    }
  })
