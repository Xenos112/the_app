import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

config()

export const db = drizzle(process.env.DATABASE_URL, { logger: true, schema, casing: 'snake_case' })
