import { describe, test, expect } from 'vitest'
import { app } from '@/index'
import { v4 as uuid } from 'uuid'

describe("User Routes", () => {
  test("return 404 with error `not found` for when the user is not in the database", async () => {
    const randomUserId = uuid()

    const res = await app.request(`/user/${randomUserId}`)
    const body = await res.json() as { error: string }
    expect(res.status).toBe(404)
    expect(body.error).toBe('User not found')
  })

  test('return status 400 for when the uuid is not valid', async () => {
    const nonValidUserId = 'not_a_valid';

    const res = await app.request(`/user/${nonValidUserId}`)
    expect(res.status).toBe(400)
  })
})
