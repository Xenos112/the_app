import { db } from '@/db'
import { Post, User } from '@/db/schema'
import { app } from '@/index'
import { generateToken } from '@/utils/generate-token'
import { v4 as uuid } from 'uuid'
import { describe, expect, test } from 'vitest'

describe('get /post/:id', () => {
  test('should return 404 with `not found` message', async () => {
    const res = await app.request(`/post/${uuid()}`)
    const body = await res.json() as { error: string }
    expect(res.status).toBe(404)
    expect(body.error).toBe('Post not found')
  })

  test('should get the post', async () => {
    const id = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${id.at(0)?.id}`)
    expect(res.status).toBe(200)
  })
})
