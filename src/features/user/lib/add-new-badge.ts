import { db } from '@/db'
import { Badge, User, User_Badge } from '@/db/schema'
import { eq } from 'drizzle-orm'

interface AddNewBadgeProps {
  userId: string
  badgeId: string
}

export default async function addNewBadge({ userId, badgeId }: AddNewBadgeProps) {
  const badge = await db.select({ id: Badge.id }).from(Badge).where(eq(Badge.id, badgeId)).limit(1)
  const user = await db.select({ id: User.id }).from(User).where(eq(User.id, userId)).limit(1)
  if (badge.length === 0 || user.length === 0) {
    return false
  }

  await db.insert(User_Badge).values({
    badge_id: badgeId,
    user_id: userId,
  })

  return true
}
