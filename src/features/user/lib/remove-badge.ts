import { db } from '@/db'
import { User_Badge } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

interface RemoveBadgeProps {
  userId: string
  badgeId: string
}

export default async function removeBadge({ userId, badgeId }: RemoveBadgeProps) {
  await db.delete(User_Badge).where(and(eq(User_Badge.user_id, userId), eq(User_Badge.badge_id, badgeId)))
}
