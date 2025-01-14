import { db } from '@/db/index'
import { Media, User } from '@/db/schema'
import { eq, getTableColumns } from 'drizzle-orm'

export type UserData = Omit<typeof User.$inferSelect & { avatar?: typeof Media.$inferSelect }, 'password'>

/**
 * Retrieves a user by its ID
 *
 * @param {string} id - The user ID
 *
 * @returns {Promise<UserData | null>} The user data or null if user does not exist
 */
export default async function getUser(id: string): Promise<UserData | null> {
  const { password, ...userFetchedCols } = getTableColumns(User)

  const [user] = (await db.select({ ...userFetchedCols }).from(User).where(eq(User.id, id)).limit(1)) as UserData[]
  if (user == null)
    return null

  if (user.image_id !== null) {
    const [profilePicture] = await db.select().from(Media).where(eq(Media.id, user.image_id)).limit(1)
    user.avatar = profilePicture
  }

  return user
}
