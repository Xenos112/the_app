import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { Hono } from 'hono'
import auth from './routes/auth'

config()

export const app = new Hono().route('/auth', auth)

const port = 3000
serve({
  fetch: app.fetch,
  port,
})
