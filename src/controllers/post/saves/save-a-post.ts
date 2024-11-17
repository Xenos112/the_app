import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Post, Save } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type SavePostContext = Context<object, '/:id/saves', {
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

export default async function savePost(c: SavePostContext) {
  try {
    const { id } = c.req.valid('param')
    const token = getCookie(c, 'auth_token')
    if (token === undefined) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const user = await validateToken(token)
    if (!user) {
      return c.json({ message: 'Unauthorized' }, 401)
    }

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }

    const postLiked = await db.select().from(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, user.id))).limit(1)
    if (postLiked.length > 0) {
      return c.json({ liked: true })
    }

    await db.insert(Save).values({
      post_id: post.id,
      user_id: user.id,
    })

    await db.update(Post).set({ saves_count: post.saves_count! + 1 }).where(eq(Post.id, id))

    return c.json({ saved: true })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
