import { db } from '@/db'
import { Community_User } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

/**
 * it check if the user in the community and if not it make make him join the community
 *
 * @param userId- the corresponding user id
 * @param communityId - the community ID he wants to join
 * @returns boolean indicating the user have joined the community
 *
 * @example
 * ```ts
 * const isJoined = await joinCommunity("user_id", "communityId")
 * ```
 */
export default async function joinCommunity(userId: string, communityId: string): Promise<boolean> {
  // first check if the user is already in the community
  const isJoined = (await db.select().from(Community_User).where(and(eq(Community_User, userId), eq(Community_User, communityId))).limit(1)).length === 1
  if (isJoined)
    return true

  await db.insert(Community_User).values({
    user_id: userId,
    community_id: communityId,
  })

  return true
}

// TODO: need testing
