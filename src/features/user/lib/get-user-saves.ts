import { db } from '@/db'
import { Post, Save } from '@/db/schema'
import { eq, inArray } from 'drizzle-orm'

interface GetUserSaves {
  userId: string
  limit?: number
}

export default async function getUserSaves({ userId, limit }: GetUserSaves) {
  const saves = await db.select({ ids: Save.post_id }).from(Save).where(eq(Save.user_id, userId)).limit(limit ?? 10)

  const posts = await db.select().from(Post).where(inArray(Post.id, saves.map(save => save.ids))).limit(limit ?? 10)

  if (posts.length === 0) {
    return null
  }
  // todo: add media
  return posts
}
