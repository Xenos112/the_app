import { db } from "@/db"
import { Media, Post, type UserSelect } from "@/db/schema"
import { type Context } from "hono"
import { type MediaSelect } from '@/db/schema'

const IMAGE_REGEX = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/g
const VIDEO_REGEX = /(https?:\/\/.*\.(?:mp4|webm|mov))/g
type CreatePostContext = Context<{}, '/post', {}>


export default async function createPost(c: CreatePostContext) {
  try {
    const medias: MediaSelect[] = [];
    const user = c.get('user') as UserSelect
    //FIX: add validation
    const { content, urls, communityId } = await c.req.json() as { content?: string, urls?: string[], communityId?: string }
    console.log(content)
    const [post] = await db.insert(Post).values({
      content: content ? content : '',
      author_id: user.id,
      community_id: communityId,
    }).returning()

    urls?.forEach(async (url) => {
      const isImage = IMAGE_REGEX.test(url)
      const [postMedia] = await db.insert(Media).values({
        type: isImage ? 'image' : 'video',
        target_id: post.id,
        target_type: 'post',
        url,
      }).returning()
      medias.push(postMedia)
    })
    // FIX: issue where the medias are not being returned
    return c.json({ data: { ...post, medias } })
  } catch (error) {
    return c.json({ error: 'something went wrong', e: error }, 500)
  }
}
