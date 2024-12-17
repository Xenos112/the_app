import { log } from 'node:console'
import * as controllers from '@/controllers'
import authenticated from '@/middleware/authenticated'
import { CommentValidator, DeleteRouteValidator } from '@/validators/index'
import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { honoValidator, RouteValidator } from './validators'
import { LoginSchema, RegisterSchema } from './validators/auth'

config()

export const app = new Hono()
app.use(logger())
app.post('/auth/login', honoValidator(LoginSchema, 'json'), controllers.login)
app.post('/auth/register', honoValidator(RegisterSchema, 'json'), controllers.register)
app.get('/auth/discord', controllers.discord)
app.get('/auth/discord/callback', controllers.discordCallback)
app.get('/auth/github', controllers.github)
app.get('/auth/github/callback', controllers.githubCallback)
app.get('/me', controllers.me)
app.get('/post/:id', honoValidator(RouteValidator, 'param'), controllers.getPostById)
app.get('/post/:id/likes', honoValidator(RouteValidator, 'param'), controllers.getPostLike)
app.get('/post/:id/saves', honoValidator(RouteValidator, 'param'), controllers.getPostSaves)
app.get('/post/:id/comments', honoValidator(RouteValidator, 'param'), controllers.getPostComments)
app.put('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), controllers.likePost)
app.delete('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), honoValidator(RouteValidator, 'param'), controllers.unlikePost)
app.put('/post/:id/saves', authenticated, honoValidator(CommentValidator, 'param'), controllers.savePost)
app.delete('/post/:id/saves', authenticated, honoValidator(RouteValidator, 'param'), controllers.unsavePost)
app.post('/post/:id/comments', authenticated, honoValidator(CommentValidator, 'json'), controllers.addComment)
app.delete('/post/:id/comments/:commentId', authenticated, honoValidator(DeleteRouteValidator, 'param'), controllers.deleteCommentById)
app.delete('/post/:id', authenticated, honoValidator(RouteValidator, 'param'), controllers.deletePostById)
app.get('/user/:id', honoValidator(RouteValidator, 'param'), controllers.getUserById)

log(app.routes)
const port = process.env.NODE_ENV === 'test' ? 0 : 4000
serve({
  fetch: app.fetch,
  port,
})
