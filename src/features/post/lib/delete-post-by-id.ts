import { db } from '@/db'
import { Post } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function getPostById(id: string) {
  const post = await db.delete(Post).where(eq(Post.id, id)).returning()

  return post[0] ?? null
}
