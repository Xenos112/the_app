import { describe, test, expect } from "vitest";
import { app } from '@/index'
import { v4 as uuid } from 'uuid'
import { db } from "@/db";
import { strictEqual } from 'assert'
import { generateToken } from "@/utils/generate-token";

describe('Post Like GET Route', () => {
  test('should return 400 for non valid UUIDs', async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test("It Should return 404 for not found posts", async () => {
    const randomPostUUID = uuid()
    const res = await app.request(`/post/${randomPostUUID}/likes`)
    expect(res.status).toBe(404)
  })

  test("It should return 200 with data field that have is liked and likes_count", async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toBeDefined()
    expect(body.data).toHaveProperty('liked')
    expect(body.data).toHaveProperty('likes')
    strictEqual(typeof body.data.liked, 'boolean')
    strictEqual(typeof body.data.likes, 'number')
  })
})


describe("Post Put Like Route", () => {
  test("return 400 for non valid UUIDs", async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test("return 404 for not found posts", async () => {
    const nonValidUUID = uuid()
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(404)
  })

  test("It should Like the post and return field with liked to be boolean", async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const randomUserUUID = await db.query.User.findFirst().then(user => user!.id)
    const authToken = generateToken(randomUserUUID)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'PUT',
      headers: {
        cookie: `auth_token=${authToken}`
      }
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.liked).toBeDefined()
    strictEqual(typeof body.liked, 'boolean')
  })

  test("it should return 401 when the user is not logged in", async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'PUT'
    })
    expect(res.status).toBe(401)
  })
})

describe("Post Delete Like Route", () => {
  test("return 400 for non valid UUIDs", async () => {
    const nonValidUUID = 'random'
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(400)
  })

  test("return 404 for not found posts", async () => {
    const nonValidUUID = uuid()
    const res = await app.request(`/post/${nonValidUUID}/likes`)
    expect(res.status).toBe(404)
  }
  )

  test("it should return 401 when the user is not logged in", async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'DELETE'
    })
    expect(res.status).toBe(401)
  })

  test("It should Like the post and return field with unliked to be boolean", async () => {
    const randomPostUUID = await db.query.Post.findFirst().then(post => post!.id)
    const randomUserUUID = await db.query.User.findFirst().then(user => user!.id)
    const authToken = generateToken(randomUserUUID)
    const res = await app.request(`/post/${randomPostUUID}/likes`, {
      method: 'DELETE',
      headers: {
        cookie: `auth_token=${authToken}`
      }
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.unliked).toBeDefined()
    strictEqual(typeof body.unliked, 'boolean')
  })
})
