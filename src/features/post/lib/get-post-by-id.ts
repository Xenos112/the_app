import { db } from '@/db'
import { Post } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function getPostById(id: string) {
  const post = await db.query.Post.findFirst({
    where: eq(Post.id, id),
  })

  return post ?? null
}
