import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { User } from '@/db/schema'
import { eq } from 'drizzle-orm'

type GetUserByIdContext = Context<object, '/:id', {
  in: {
    param: {
      id: string
    }
  }
  out: {
    param: {
      id: string
    }
  }
}>

// TEST: test out this route
export default async function getUserById(c: GetUserByIdContext) {
  try {
    const { id } = c.req.valid('param')
    const user = await db.select().from(User).where(eq(User.id, id)).limit(1)
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404)
    }

    return c.json({ user })
  }
  catch (error) {
    log(error)
    return c.json('Internal server error', 500)
  }
}
