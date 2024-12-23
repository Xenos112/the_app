import type validateToken from '@/utils/validate-token'
import type { Context } from 'hono'
import { log } from 'node:console'
import { db } from '@/db'
import { Post, Save } from '@/db/schema'
import _getPostById from '@/features/post/lib/get-post-by-id'
import { and, eq } from 'drizzle-orm'

type UnSavePostContext = Context<{
  Variables: {
    user: Exclude<Awaited<ReturnType<typeof validateToken>>, null>
  }
}, '/:id/saves', {
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

export default async function unsavePost(c: UnSavePostContext) {
  try {
    const { id } = c.req.valid('param')
    const user = c.get('user')

    const post = await _getPostById(id)
    if (post === null) {
      return c.json({ error: 'Post not found' }, 404)
    }

    await db.delete(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, user.id)))
    await db.update(Post).set({ saves_count: post.saves_count! - 1 }).where(eq(Post.id, id))
    return c.json({ unsaved: true })
  }
  catch (error) {
    log(error)
    return c.json('internal server error', 500)
  }
}
