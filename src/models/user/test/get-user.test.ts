import { db } from '@/db'
import { describe, expect, test } from 'vitest'
import getUser from '../get-user'

describe('get-user', () => {
  test('it should throw error cuz of invalid userId', async () => {
    const userId = 'INVALID_USER_ID'

    void expect(async () => getUser(userId)).rejects.toThrowError()
  })

  test('it will get the user data', async () => {
    const randomUserId = (await db.query.User.findFirst())?.id as string

    const userData = await getUser(randomUserId)
    expect(userData!).toHaveProperty('id')
  })
})
