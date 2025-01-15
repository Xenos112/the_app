import { db } from "@/db";
import { test, expect, describe } from "vitest";
import { app } from "@/index";
import { generateToken } from "@/utils/generate-token";
import type { MediaSelect, Post } from "@/db/schema";

describe("create a post", () => {
  test("should create a post", async () => {
    const randomUser = await db.query.User.findFirst().then(user => user!.id)
    const token = generateToken(randomUser)

    const res = await app.request('/post', {
      method: 'POST',
      headers: {
        cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({
        content: "test",
        urls: [
          'https://test.com/image.png',
          'https://test.com/image2.png',
          'https://test.com/image3.png',
        ]
      }),
    })
    const data = (await res.json()).data as typeof Post.$inferSelect & { medias: MediaSelect[] }

    expect(res.status).toBe(200)
    expect(data.id).toBeDefined()
    expect(data.content).toBe('test')
    expect(data.author_id).toBe(randomUser)
    expect(data.medias).toBeDefined()
    expect(data.medias.length).toBe(3)
  })

  test("should create a post", async () => {
    const randomUser = await db.query.User.findFirst().then(user => user!.id)
    const token = generateToken(randomUser)

    const res = await app.request('/post', {
      method: 'POST',
      headers: {
        cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({
        urls: [
          'https://test.com/image.png',
          'https://test.com/image2.png',
          'https://test.com/image3.png',
        ]
      }),
    })
    const data = (await res.json()).data as typeof Post.$inferSelect & { medias: MediaSelect[] }

    expect(res.status).toBe(200)
    expect(res.status).toBe(200)
    expect(data.id).toBeDefined()
    expect(data.author_id).toBe(randomUser)
    expect(data.medias).toBeDefined()
  })

  test("should create a post", async () => {
    const randomUser = await db.query.User.findFirst().then(user => user!.id)
    const token = generateToken(randomUser)

    const res = await app.request('/post', {
      method: 'POST',
      headers: {
        cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({
        content: "test",
        urls: [
          'https://test.com/image.png',
          'https://test.com/image2.png',
          'https://test.com/image3.png',
        ]
      }),
    })
    expect(res.status).toBe(200)
  })
  test("should create a post", async () => {
    const randomUser = await db.query.User.findFirst().then(user => user!.id)
    const token = generateToken(randomUser)

    const res = await app.request('/post', {
      method: 'POST',
      headers: {
        cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({
        content: "test",
        urls: [
          'https://test.com/image.png',
          'https://test.com/image2.png',
          'https://test.com/image3.png',
        ]
      }),
    })
    expect(res.status).toBe(200)
  })
  test("should create a post", async () => {
    const randomUser = await db.query.User.findFirst().then(user => user!.id)
    const token = generateToken(randomUser)

    const res = await app.request('/post', {
      method: 'POST',
      headers: {
        cookie: `auth_token=${token}`,
      },
      body: JSON.stringify({
        content: "test",
      }),
    })
    expect(res.status).toBe(200)
  })

  test("should return 401 when the user is not logged in", async () => {
    const res = await app.request('/post', {
      method: 'POST',
      body: JSON.stringify({
        content: "test",
        urls: [
          'https://test.com/image.png',
          'https://test.com/image2.png',
          'https://test.com/image3.png',
        ]
      }),
    })
    expect(res.status).toBe(401)
  })
})

