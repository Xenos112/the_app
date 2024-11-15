import { db } from '@/db'
import { User } from '@/db/schema'
import { eq } from 'drizzle-orm'
import jwt from 'jsonwebtoken'

export default async function validateToken(token: string) {
  const { id } = jwt.verify(token, process.env.JWT_SECRET) as { id: string }
  const user = (await db.select().from(User).where(eq(User.id, id))).at(0)
  if (!user) {
    return null
  }

  // todo: check if token is still valid
  return user
}
