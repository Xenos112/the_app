import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import routes from './routes'

config()

export const app = new Hono()
  .use(logger())
  .route('/', routes)

console.log(app.routes)
const port = 4000
serve({
  fetch: app.fetch,
  port,
})
