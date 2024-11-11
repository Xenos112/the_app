import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './schema'

config()

const db = drizzle(process.env.DATABASE_URL)
export { db, schema }
