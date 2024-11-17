import type { Context } from 'hono'
import { db } from '@/db'
import { Save } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { and, eq } from 'drizzle-orm'
import { getCookie } from 'hono/cookie'

type GetPostSaveContext = Context<object, '/:id/saves', {
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

export default async function getPostSaves(c: GetPostSaveContext) {
  try {
    const { id } = c.req.valid('param')
    const token = getCookie(c, 'auth_token')
    const user = await validateToken(token ?? '')
    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ message: 'Post not found' }, 404)
    }

    const isSavedByAuthenticatedUser = user ? await db.select().from(Save).where(and(eq(Save.user_id, user.id), eq(Save.post_id, id))).limit(1) : []
    return c.json({ saves: post.saves_count, saved: isSavedByAuthenticatedUser.length > 0 })
  }
  catch (error) {
    return c.json({ error }, 500)
  }
}
