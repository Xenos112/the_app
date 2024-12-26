import { db } from '@/db'
import { Relations, User } from '@/db/schema'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'
import followUser from '../follow-user'

beforeEach(async () => {
  await db.delete(Relations)
})

describe('follow-user', () => {
  test('it should throw error cuz of invalid userId', async () => {
    const userId = 'INVALID_USER_ID'
    const target = 'INVALID_USER_ID'

    void expect(async () => followUser(userId, target)).rejects.toThrowError()
  })
  test('it should follow a user and then will return true cuz he followed him', async () => {
    const [user1, user2] = (await db.select().from(User).limit(2)) as typeof User.$inferSelect[]

    expect(async () => followUser(user1.id, user2.id)).not.toThrow()

    // this is if we ran the function and he already followed the user
    expect(async () => followUser(user1.id, user2.id)).not.toThrow()
  })
})
