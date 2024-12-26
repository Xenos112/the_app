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

  const [profilePicture] = await db.select().from(Media).where(eq(Media.target_id, user.id)).limit(1)
  if (profilePicture != null && 'id' in profilePicture)
    user.avatar = profilePicture

  return user
}
