import { db } from '@/db'
import { User } from '@/db/schema'

async function main() {
  await db.delete(User)
}

void main()
