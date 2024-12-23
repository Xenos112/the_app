import { db } from '@/db'
import { Post } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function getPostById(id: string) {
  const [post] = await db.select().from(Post).where(eq(Post.id, id)).limit(1)

  return post ?? null
}
