import { db } from "@/db"
import { Media, Post, type UserSelect } from "@/db/schema"
import { type Context } from "hono"
import { type MediaSelect } from '@/db/schema'
import { eq } from "drizzle-orm"

const IMAGE_REGEX = /(http|https):\/\/.+\.(jpg|jpeg|png|gif)/

type CreatePostContext = Context<{}, '/post', {}>

async function createPostSchema(userId: string, content?: string, communityId?: string) {
  const [post] = await db.insert(Post).values({
    content: content,
    author_id: userId,
    community_id: communityId,
  }).returning()
  return post
}

function insertMedias(postId: string, mediaUrls?: string[]): Promise<void> {
  mediaUrls?.forEach(async (url) => {
    const isImage = IMAGE_REGEX.test(url)
    await db.insert(Media).values({
      type: isImage ? 'image' : 'video',
      target_id: postId,
      target_type: 'post',
      url,
    })
  })
  return Promise.resolve()
}

async function getMedias(postId: string) {
  const medias = await db.select().from(Media).where(eq(Media.target_id, postId))
  return medias as MediaSelect[]
}


export default async function createPost(c: CreatePostContext) {
  try {
    const user = c.get('user') as UserSelect
    //FIX: add validation
    const { content, urls, communityId } = await c.req.json() as { content?: string, urls?: string[], communityId?: string }

    const post = await createPostSchema(user.id, content, communityId)
    await insertMedias(post.id, urls) as void
    const medias = await getMedias(post.id)
    console.log(medias)

    // TODO: rename the medias to something else to ensure the correctness in the frontend
    return c.json({ data: { ...post, medias } })
  } catch (error) {
    return c.json({ error: 'something went wrong', e: error }, 500)
  }
}
