import { db } from '@/db'
import { Relations } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

/**
 * Follows a user by their ID.
 *
 * @param id - The ID of the user to follow.
 * @param target - The ID of the user to be followed.
 * @returns
 *
 * @example
 * ```typescript
 * await followUser("some_id", "other_id");
 * ```
 */
export default async function followUser(id: string, target: string) {
  const isFollowed = (await db.select().from(Relations).where(and(eq(Relations.user_id, id), eq(Relations.related_user_id, target))).limit(1)).length === 1
  if (isFollowed) {
    return
  }

  await db.insert(Relations).values({
    user_id: id,
    related_user_id: target,
  })
}
