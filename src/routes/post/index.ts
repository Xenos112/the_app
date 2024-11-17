import addComment from '@/controllers/post/comments/add-comment'
import getPostComments from '@/controllers/post/comments/get-post-comments'
import deletePostById from '@/controllers/post/delete-post-by-id'
import getPostById from '@/controllers/post/get-post-by-id'
import getPostLike from '@/controllers/post/likes/get-post-like'
import likePost from '@/controllers/post/likes/like-a-post'
import unlikePost from '@/controllers/post/likes/unlike-a-post'
import deleteCommentById from '@/controllers/post/saves/delete-comment-by-id'
import getPostSaves from '@/controllers/post/saves/get-post-save'
import savePost from '@/controllers/post/saves/save-a-post'
import unsavePost from '@/controllers/post/saves/unsave-a-post'
import { uuid } from '@/validators'
import { zValidator } from '@hono/zod-validator'
import { Hono } from 'hono'
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
  }), getPostById)

  .delete('/:id', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), deletePostById)

  .get('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), getPostLike)

  .put('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), likePost)

  .delete('/:id/likes', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), unlikePost)

  .get('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), getPostSaves)

  .put('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), savePost)

  .delete('/:id/saves', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), unsavePost)

  .get('/:id/comments', zValidator('param', RouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), getPostComments)

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
  }), addComment)

  .delete('/:id/comments/:comment_id', zValidator('param', DeleteRouteValidator, (res, c) => {
    if (!res.success) {
      const errors = res.error.issues.map(error => error.message)
      return c.json(errors, 400)
    }
  }), deleteCommentById)
