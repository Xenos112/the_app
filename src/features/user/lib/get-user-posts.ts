import { db } from '@/db'
import { Post } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

interface GetUserPosts {
  userId: string
  limit?: number
}

export default async function getUserPosts({ userId, limit }: GetUserPosts) {
  const posts = await db.select().from(Post).where(and(eq(Post.author_id, userId), eq(Post.community_id, ''))).limit(limit ?? 10)

  if (posts.length === 0)
    return null

  return posts
}
