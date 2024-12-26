import type validateToken from '@/utils/validate-token'
import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Like, Post } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import { and, eq } from 'drizzle-orm'

type LikePostContext = Context<{
  Variables: {
    user: Exclude<Awaited<ReturnType<typeof validateToken>>, null>
  }
}, '/:id/likes', {
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

export default async function likePost(c: LikePostContext) {
  try {
    const { id } = c.req.valid('param')
    const user = c.get('user')

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ error: 'Post not found' }, 404)
    }

    const postLiked = await db.select().from(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, user.id))).limit(1)
    if (postLiked.length > 0) {
      return c.json({ liked: true })
    }
    await db.insert(Like).values({
      post_id: post.id,
      user_id: user.id,
    })
    await db.update(Post).set({ likes_count: post.likes_count! + 1 }).where(eq(Post.id, id))
    return c.json({ liked: true })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
