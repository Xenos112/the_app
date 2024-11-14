import { db } from '@/db'
import { Like } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

interface LikePost {
  postId: string
  userId: string
}

export async function likePost({ postId, userId }: LikePost) {
  await db.delete(Like).where(and(eq(Like.post_id, postId), eq(Like.user_id, userId)))
}
