import { db } from '@/db'
import { Post, User } from '@/db/schema'
import { app } from '@/index'
import { generateToken } from '@/utils/generate-token'
import { v4 as uuid } from 'uuid'
import { describe, expect, test } from 'vitest'

describe('get /post/:id', () => {
  test('should return 404 with `not found` message', async () => {
    const res = await app.request(`/post/${uuid()}`)
    const body = await res.json() as { message: string }
    expect(res.status).toBe(404)
    expect(body.message).toBe('Post not found')
  })

  test('should get the post', async () => {
    const id = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${id.at(0)?.id}`)
    expect(res.status).toBe(200)
  })
})

describe('put /post/:id/likes', () => {
  test('should return 200 with liked = true', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const post = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${post.at(0)?.id}/likes`, {
      method: 'PUT',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { liked: boolean }
    expect(res.status).toBe(200)
    expect(body.liked).toBe(true)
  })
})

describe('delete /post/:id/likes', () => {
  test('should return 200 with unliked = true', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const post = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${post.at(0)?.id}/likes`, {
      method: 'DELETE',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { unliked: boolean }
    expect(res.status).toBe(200)
    expect(body.unliked).toBe(true)
  })

  test('should return 401 with message \'Unauthorized\'', async () => {
    const post = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${post.at(0)?.id}/likes`, {
      method: 'DELETE',
    })
    const body = await res.json() as { message: string }
    expect(res.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  test('should return 404 with message \'Post not found\'', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const res = await app.request(`/post/${uuid()}/likes`, {
      method: 'DELETE',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { message: string }
    expect(res.status).toBe(404)
    expect(body.message).toBe('Post not found')
  })
})

describe('delete /post/:id/saves', () => {
  test('should return 200 with unsave = true', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const post = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${post.at(0)?.id}/saves`, {
      method: 'DELETE',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { unsave: boolean }
    expect(res.status).toBe(200)
    expect(body.unsave).toBe(true)
  })

  test('should return 401 with message \'Unauthorized\'', async () => {
    const post = await db.select().from(Post).limit(1)
    const res = await app.request(`/post/${post.at(0)?.id}/saves`, {
      method: 'DELETE',
    })
    const body = await res.json() as { message: string }
    expect(res.status).toBe(401)
    expect(body.message).toBe('Unauthorized')
  })

  test('should return 404 with message \'Post not found\'', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const res = await app.request(`/post/${uuid()}/saves`, {
      method: 'DELETE',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { message: string }
    expect(res.status).toBe(404)
    expect(body.message).toBe('Post not found')
  })

  test('should return 404 with message \'UUID is invalid\' for invalid post ID', async () => {
    const user = await db.select().from(User).limit(1)
    const token = generateToken(user.at(0)!.id)
    const res = await app.request(`/post/invalid-id/saves`, {
      method: 'DELETE',
      headers: {
        Cookie: `auth_token=${token}`,
      },
    })
    const body = await res.json() as { message: string }
    expect(res.status).toBe(400)
    expect(body).toStrictEqual(['UUID is invalid'])
  })
})
