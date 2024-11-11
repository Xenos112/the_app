import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import { Hono } from 'hono'
import { db } from './db'
import { User } from './db/schema'

config()

const app = new Hono()

app.get('/', async (c) => {
  const users = await db.select().from(User)
  return c.json(users)
})

const port = 3000
serve({
  fetch: app.fetch,
  port,
})
