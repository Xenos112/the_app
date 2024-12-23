import { log } from 'node:console'
import * as controllers from '@/controllers'
import authenticated from '@/middleware/authenticated'
import { CommentValidator, DeleteRouteValidator } from '@/validators/index'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { honoValidator, RouteValidator } from './validators'
import { LoginSchema, RegisterSchema } from './validators/auth'

config()

export const app = new Hono()
app.use(logger())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

  .post('/auth/login', honoValidator(LoginSchema, 'json'), controllers.login)
  .post('/auth/register', honoValidator(RegisterSchema, 'json'), controllers.register)
  .get('/auth/discord', controllers.discord)
  .get('/auth/discord/callback', controllers.discordCallback)
  .get('/auth/github', controllers.github)
  .get('/auth/github/callback', controllers.githubCallback)
  .get('/me', authenticated, controllers.me)
  .get('/post/:id', honoValidator(RouteValidator, 'param'), controllers.getPostById)
  .get('/post/:id/likes', honoValidator(RouteValidator, 'param'), controllers.getPostLike)
  .get('/post/:id/saves', honoValidator(RouteValidator, 'param'), controllers.getPostSaves)
  .get('/post/:id/comments', honoValidator(RouteValidator, 'param'), controllers.getPostComments)
  .put('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), controllers.likePost)
  .delete('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), honoValidator(RouteValidator, 'param'), controllers.unlikePost)
  .put('/post/:id/saves', authenticated, honoValidator(RouteValidator, 'param'), controllers.savePost)
  .delete('/post/:id/saves', authenticated, honoValidator(RouteValidator, 'param'), controllers.unsavePost)
  .post('/post/:id/comments', authenticated, honoValidator(CommentValidator, 'json'), controllers.addComment)
  .delete('/post/:id/comments/:commentId', authenticated, honoValidator(DeleteRouteValidator, 'param'), controllers.deleteCommentById)
  .delete('/post/:id', authenticated, honoValidator(RouteValidator, 'param'), controllers.deletePostById)
  .get('/user/:id', honoValidator(RouteValidator, 'param'), controllers.getUserById)

log(app.routes)
const port = process.env.NODE_ENV === 'test' ? 0 : 4000
serve({
  fetch: app.fetch,
  port,
})
