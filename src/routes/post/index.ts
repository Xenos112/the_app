import { log } from 'node:console'
import { db } from '@/db'
import { Comment, Like, Post, Save } from '@/db/schema'
import getPostById from '@/features/post/lib/get-post-by-id'
import validateToken from '@/utils/validate-token'
import { uuid } from '@/validators'
import { zValidator } from '@hono/zod-validator'
import { and, eq } from 'drizzle-orm'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'
import { z } from 'zod'

const RouteValidator = z.object({
  id: uuid,
})

const CommentValidator = z.object({
  content: z.string().nullable().optional(),
  image_url: z.string().nullable().optional(),
}).refine(data => data.content !== null || data.image_url !== null, {
  message: 'Either content or image_url must be provided',
})

const DeleteRouteValidator = z.object({
  id: uuid,
  comment_id: uuid,
})

export default new Hono()
  .get('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }
      return c.json(post)
    }
    catch (error) {
      return c.json({ error })
    }
  })
  .delete('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const token = getCookie(c, 'auth_token')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      const user = await validateToken(token)
      if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      if (post.author_id !== user?.id) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      await db.delete(Post).where(eq(Post.id, id))
      return c.json({ deleted: true })
    }
    catch (error) {
      return c.json({ error, deleted: false })
    }
  })
  .get('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const post = await getPostById(id)
      const token = getCookie(c, 'auth_token')
      const user = await validateToken(token ?? '')
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }
      const isLikedByAuthenticatedUser = user ? await db.select().from(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, user.id))).limit(1) : []
      return c.json({ likes: post.likes_count, liked: isLikedByAuthenticatedUser.length > 0 })
    }
    catch (error) {
      return c.json({ error }, 500)
    }
  })
  .put('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
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

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
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
  })
  .delete('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const token = getCookie(c, 'auth_token')
      const { id } = c.req.valid('param')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const user = await validateToken(token)
      if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      await db.delete(Like).where(and(eq(Like.post_id, id), eq(Like.user_id, user.id)))
      await db.update(Post).set({ likes_count: post.likes_count! - 1 }).where(eq(Post.id, id))
      return c.json({ unliked: true })
    }
    catch (error) {
      log(error)
      return c.json('internal server error', 500)
    }
  })
  .get('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const token = getCookie(c, 'auth_token')
      const user = await validateToken(token ?? '')
      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      const isSavedByAuthenticatedUser = user ? await db.select().from(Save).where(and(eq(Save.user_id, user.id), eq(Save.post_id, id))).limit(1) : []
      return c.json({ saves: post.saves_count, saved: isSavedByAuthenticatedUser.length > 0 })
    }
    catch (error) {
      return c.json({ error }, 500)
    }
  })
  .put('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
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

      const post = await getPostById(id)
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
  })
  .delete('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const token = getCookie(c, 'auth_token')
      const { id } = c.req.valid('param')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const user = await validateToken(token)
      if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      await db.delete(Save).where(and(eq(Save.post_id, id), eq(Save.user_id, user.id)))
      await db.update(Post).set({ saves_count: post.saves_count! - 1 }).where(eq(Post.id, id))
      return c.json({ unsave: true })
    }
    catch (error) {
      log(error)
      return c.json('internal server error', 500)
    }
  })

  .get('/:id/comments', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      // todo: add limit and other url params
      const { id } = c.req.valid('param')
      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }
      const comments = await db.select().from(Comment).where(eq(Comment.post_id, id)).limit(10)
      return c.json(comments)
    }
    catch (error) {
      log(error)
      return c.json('internal server error', 500)
    }
  })
  .post('/:id/comments', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), zValidator('json', CommentValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id } = c.req.valid('param')
      const { content, image_url } = c.req.valid('json')

      const token = getCookie(c, 'auth_token')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const user = await validateToken(token)
      if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      const comment = await db.insert(Comment).values({
        image_url,
        content,
        post_id: id,
        user_id: user.id,
      }).returning()
      return c.json(comment[0])
    }
    catch (error) {
      log(error)
      return c.json('internal server error', 500)
    }
  })
  .delete('/:id/comments/:comment_id', zValidator('param', DeleteRouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), async (c) => {
    try {
      const { id, comment_id } = c.req.valid('param')

      const token = getCookie(c, 'auth_token')
      if (token === undefined) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const user = await validateToken(token)
      if (!user) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      const post = await getPostById(id)
      if (post === null) {
        return c.json({ message: 'Post not found' }, 404)
      }

      const comment = await db.select().from(Comment).where(and(eq(Comment.id, comment_id), eq(Comment.post_id, id))).limit(1)
      if (comment.length === 0) {
        return c.json({ message: 'Comment not found' }, 404)
      }

      if (comment[0].user_id !== user.id) {
        return c.json({ message: 'Unauthorized' }, 401)
      }

      await db.delete(Comment).where(and(eq(Comment.id, comment_id), eq(Comment.post_id, id)))
      return c.json({ message: 'Comment deleted' })
    }
    catch (error) {
      log(error)
      return c.json('internal server error', 500)
    }
  })
