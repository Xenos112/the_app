import { log } from 'node:console'
import fs from 'node:fs'
import * as controllers from '@/controllers'
import authenticated from '@/middleware/authenticated'
import { CommentValidator, DeleteRouteValidator } from '@/validators/index'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { v4 as uuidv4 } from 'uuid'
import { honoValidator, RouteValidator } from './validators'
import { LoginSchema, RegisterSchema } from './validators/auth'
import { createNodeWebSocket } from '@hono/node-ws'
import { db } from './db'
import { Message } from './db/schema'

config()

// TODO: move the type to somewhere else
type WebSocketPayload = {
  senderId: string,
  message: string,
  receiverId: string,
}

export const app = new Hono()
// websocket node-server
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })
app.use('*', serveStatic({ root: './uploads' }))
app.use(logger())
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))

  .post('/auth/login', honoValidator(LoginSchema, 'json'), controllers.login)
  .post('/auth/register', honoValidator(RegisterSchema, 'json'), controllers.register)
  .get('/auth/discord', controllers.discord)
  .get('/auth/discord/callback', controllers.discordCallback)
  .get('/auth/github', controllers.github)
  .get('/auth/github/callback', controllers.githubCallback)
  .get('/me', authenticated, controllers.me) // TEST: Need Testing
  .get('/post/:id', honoValidator(RouteValidator, 'param'), controllers.getPostById)
  .get('/post/:id/likes', honoValidator(RouteValidator, 'param'), controllers.getPostLike)
  .get('/post/:id/saves', honoValidator(RouteValidator, 'param'), controllers.getPostSaves)
  .get('/post/:id/comments', honoValidator(RouteValidator, 'param'), controllers.getPostComments)
  .put('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), controllers.likePost)
  .delete('/post/:id/likes', authenticated, honoValidator(RouteValidator, 'param'), controllers.unlikePost)
  .put('/post/:id/saves', authenticated, honoValidator(RouteValidator, 'param'), controllers.savePost)
  .delete('/post/:id/saves', authenticated, honoValidator(RouteValidator, 'param'), controllers.unsavePost)
  .post('/post/:id/comments', authenticated, honoValidator(CommentValidator, 'json'), controllers.addComment)
  .delete('/post/:id/comments/:commentId', authenticated, honoValidator(DeleteRouteValidator, 'param'), controllers.deleteCommentById)
  .delete('/post/:id', authenticated, honoValidator(RouteValidator, 'param'), controllers.deletePostById)
  .get('/user/:id', honoValidator(RouteValidator, 'param'), controllers.getUserById)
  .get('/who-to-follow', controllers.whoToFollow)
  .post('/post', authenticated, controllers.createPost)
  .post('/upload', async (c) => {
    try {
      const form = await c.req.formData()
      const files = form.getAll('file')

      const uploadDir = './uploads'
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }

      const fileUrls = []

      for (const f of files) {
        if (f instanceof File) {
          const fileBytes = await f.arrayBuffer()
          const fileName = `${uuidv4()}.${f.type.split('/')[1]}`
          const filePath = `./uploads/${fileName}`

          fs.writeFileSync(filePath, Buffer.from(fileBytes))

          const url = `http://localhost:4000/${fileName}`
          fileUrls.push(url)
        }
      }
      return c.json({ message: 'Files uploaded successfully', urls: fileUrls })
    }
    catch (error) {
      console.error(error)
      return c.json({ message: 'Error uploading files', error: (error as Error).message })
    }
  })
  .get('/ws', upgradeWebSocket(_c => ({
    onMessage: async (event, ws) => {
      try {
        const payload = JSON.parse(event.data.toString()) as WebSocketPayload

        const [newMessage] = await db.insert(Message).values({
          receiver_id: payload.receiverId,
          sender_id: payload.senderId,
          message: payload.message,
        }).returning()

        ws.send(JSON.stringify(newMessage))
      } catch (error) {
        ws.send(JSON.stringify({ message: 'Error inserting message' }))
      }
    }
  })))

log(app.routes)
const port = process.env.NODE_ENV === 'test' ? 0 : 4000
const server = serve({
  fetch: app.fetch,
  port,
})

// websocket injection
injectWebSocket(server)
