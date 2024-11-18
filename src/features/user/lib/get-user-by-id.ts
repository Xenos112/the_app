import { db } from '@/db'
import { User } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function getUserById(id: string) {
  const users = await db.select().from(User).where(eq(User.id, id)).limit(1)
  if (users.length === 0) {
    return null
  }

  const user = users[0]
  return user
}
