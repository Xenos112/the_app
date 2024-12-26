import { strictEqual } from 'node:assert'
import { db } from '@/db'
import { app } from '@/index'
import { generateToken } from '@/utils/generate-token'
import { v4 as uuid } from 'uuid'
import { describe, expect, test } from 'vitest'

describe('post Like GET Route', () => {
  test('should return 400 for non valid UUIDs', async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test('it Should return 404 for not found posts', async () => {
    const randomPostUUID = uuid()
    const res = await app.request(`/post/${randomPostUUID}/likes`)
    expect(res.status).toBe(404)
  })

  test('it should return 200 with data field that have is liked and likes_count', async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`)
    expect(res.status).toBe(200)
    const body = await res.json() as { data: { liked: boolean, likes: number } }
    expect(body.data).toBeDefined()
    expect(body.data).toHaveProperty('liked')
    expect(body.data).toHaveProperty('likes')
    strictEqual(typeof body.data.liked, 'boolean')
    strictEqual(typeof body.data.likes, 'number')
  })
})

describe('post Put Like Route', () => {
  test('return 400 for non valid UUIDs', async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test('return 404 for not found posts', async () => {
    const nonValidUUID = uuid()
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(404)
  })

  test('it should Like the post and return field with liked to be boolean', async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const randomUserUUID = await db.query.User.findFirst().then(user => user!.id)
    const authToken = generateToken(randomUserUUID)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'PUT',
      headers: {
        cookie: `auth_token=${authToken}`,
      },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { liked: boolean }
    expect(body.liked).toBeDefined()
    strictEqual(typeof body.liked, 'boolean')
  })

  test('it should return 401 when the user is not logged in', async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'PUT',
    })
    expect(res.status).toBe(401)
  })
})

describe('post Delete Like Route', () => {
  test('return 400 for non valid UUIDs', async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test('return 404 for not found posts', async () => {
    const nonValidUUID = uuid()
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(404)
  })

  test('it should return 401 when the user is not logged in', async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'DELETE',
    })
    expect(res.status).toBe(401)
  })

  test('it should Like the post and return field with unliked to be boolean', async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const randomUserUUID = await db.query.User.findFirst().then(user => user!.id)
    const authToken = generateToken(randomUserUUID)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'DELETE',
      headers: {
        cookie: `auth_token=${authToken}`,
      },
    })
    expect(res.status).toBe(200)
    const body = await res.json() as { unliked: boolean }
    expect(body.unliked).toBeDefined()
    strictEqual(typeof body.unliked, 'boolean')
  })
})
