import type { Context } from 'hono'
import { db } from '@/db'
import { Like } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type GetPostLikeContext = Context<object, '/:id/likes', {
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

export default async function getPostLike(c: GetPostLikeContext) {
  try {
    const { id } = c.req.valid('param')
    const post = await _getPostById(id)
    const token = getCookie(c, 'auth_token')
    const user = token ? await validateToken(token) : null
    if (!post) {
      return c.json({ error: 'Post not found' }, 404)
    }

    const isLikedByAuthenticatedUser = user ? await db.select().from(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, user.id))).limit(1) : []
    return c.json({ data: { likes: post.likes_count, liked: isLikedByAuthenticatedUser.length > 0 } })
  }
  catch (error) {
    return c.json({ error }, 500)
  }
}
