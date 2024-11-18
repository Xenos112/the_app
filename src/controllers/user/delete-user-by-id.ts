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

export default async function deleteUserById(c: GetUserByIdContext) {
  try {
    await db.delete(User).where(eq(User.id, c.req.param('id')))
    return c.json({ userDeleted: true })
  }
  catch (error) {
    log(error)
    return c.json('Internal server error', 500)
  }
}
