import { db } from '@/db'
import { User } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function deleteUserById(id: string): Promise<void> {
  const users = await db.select().from(User).where(eq(User.id, id)).limit(1)
  if (users.length === 0) {
    return undefined
  }

  await db.delete(User).where(eq(User.id, id))
}
