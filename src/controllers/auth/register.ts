import type { Context } from 'hono'
import { db } from '@/db'
import { User } from '@/db/schema'
import { generateToken } from '@/utils/generate-token'
import bcrypt from 'bcrypt'
import { eq, or } from 'drizzle-orm'
import { setCookie } from 'hono/cookie'

type RegisterContext = Context<object, '/', {
  in: {
    json: {
      email: string
      password: string
      user_name: string
    }
  }
  out: {
    json: {
      email: string
      password: string
      user_name: string
    }
  }
}>

async function register(c: RegisterContext) {
  try {
    const { email, password, user_name } = c.req.valid('json') as { email: string, password: string, user_name: string }
    const existingUser = (await db.select().from(User).where(or(eq(User.email, email), eq(User.user_name, user_name)))).at(0)
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400)
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await db.insert(User).values({ email, password: passwordHash, user_name }).returning()
    const token = generateToken(user.at(0)!.id)
    setCookie(c, 'auth_token', token, {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
    })
    return c.json({ user, token })
  }
  catch (error) {
    if (error instanceof Error) {
      return c.json({ error: 'An error occurred' }, 500)
    }
    return c.json({ error: 'An error occurred' }, 500)
  }
}

export default register
