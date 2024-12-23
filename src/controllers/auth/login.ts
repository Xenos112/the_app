import type { Context } from 'hono'
import { db } from '@/db'
import { User } from '@/db/schema'
import { generateToken } from '@/utils/generate-token'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { setCookie } from 'hono/cookie'

type LoginContext = Context<object, '/', {
  in: {
    json: {
      email: string
      password: string
    }
  }
  out: {
    json: {
      email: string
      password: string
    }
  }
}>

async function login(c: LoginContext) {
  try {
    const { email, password } = c.req.valid('json') as { email: string, password: string }
    const user = (await db.select().from(User).where(eq(User.email, email))).at(0)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }

    if (user.password === null) {
      return c.json({ error: 'this Account Is Linked with a social account' }, 401)
    }

    const isPasswordCorrect = bcrypt.compareSync(password, user.password) as unknown as string
    if (Boolean(isPasswordCorrect) === false) {
      return c.json({ error: 'Incorrect password' }, 401)
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
      return c.json({ error: 'Internal server error' }, 500)
    }
    return c.json({ error: 'Internal server error' }, 500)
  }
}

export default login
