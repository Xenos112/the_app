import { db } from '@/db'
import { Post, type PostInsert } from '@/db/schema'

export async function createPost({ author_id, community_id, content }: PostInsert) {
  const post = await db.insert(Post).values({
    author_id,
    community_id,
    comments_count: 0,
    content,
    likes_count: 0,
  }).returning()

  return post[0]
}
