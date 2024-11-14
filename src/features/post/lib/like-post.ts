import { db } from '@/db'
import { Like } from '@/db/schema'

interface LikePost {
  postId: string
  userId: string
}

export async function likePost({ postId, userId }: LikePost) {
  await db.insert(Like).values({
    post_id: postId,
    user_id: userId,
  })
}
