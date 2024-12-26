import type { Context } from 'hono'
import { db } from '@/db'
import { Like, Media, type PostSelect, Save, User } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import getUser from '@/models/user/get-user'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type GetUserByIdContext = Context<object, '/:id', {
  in: {
    param: {
      id: string
    }
  }
  out: {
    param: {
      id: string
    }
  }
}>

export default async function getPostById(c: GetUserByIdContext) {
  try {
    const { id } = c.req.valid('param')
    const authToken = getCookie(c, 'auth_token')
    let userId: string | undefined

    if (authToken != null) {
      userId = (await validateToken(authToken))?.id
    }

    const post = await _getPostById(id) as (PostSelect & { pictures?: { type: string, url: string }[] })
    if (post === null) {
      return c.json({ error: 'Post not found' }, 404)
    }
    // FIX: this code is garbage and need to be fixed
    // TODO: make functions for the user to get his full profile picture
    const postAuthor = await getUser(post.author_id)

    const postPictures = await db.select({ type: Media.type, url: Media.url }).from(Media).where(eq(Media.target_id, id))
    post.pictures = postPictures

    if (userId == null) {
      return c.json({ data: { ...post, author: { ...postAuthor, profile_picture_url: postAuthor?.avatar?.url }, isLiked: false, isSaved: false } })
    }

    const isLiked = (await db.select().from(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, userId))).limit(1)).length === 1
    const isSaved = (await db.select().from(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, userId))).limit(1)).length === 1
    return c.json({ data: { ...post, author: { ...postAuthor, profile_picture_url: postAuthor?.avatar?.url }, isLiked, isSaved } })
  }

  catch (error) {
    return c.json({ error }, 500)
  }
}
