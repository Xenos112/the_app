import { db } from '@/db'
import { Post } from '@/db/schema'
import { app } from '@/index'
import { v4 as uuid } from 'uuid'
import { describe, expect, test } from 'vitest'

describe('post Route', () => {
  test('return 404 for random uuids', async () => {
    const randomPostUUID = uuid()
    const res = await app.request(`/post/${randomPostUUID}`)
    expect(res.status).toBe(404)
  })

  test('return 400 for non uuid', async () => {
    const invalidPostUUID = 'invalid'
    const res = await app.request(`/post/${invalidPostUUID}`)
    expect(res.status).toBe(400)
  })

  // HACK: maybe i can make it efficient in a way to reduce the created posts for each test
  test('it should return 200 with data field that have the id and content and userId', async () => {
    const randomUser = await db.query.User.findFirst()
    const postUUID = uuid()
    const [createdPostByTheUser] = await db.insert(Post).values({
      id: postUUID,
      content: 'title',
      author_id: randomUser!.id,
    }).returning()

    const res = await app.request(`/post/${createdPostByTheUser.id}`)
    const post = (await res.json()).data as typeof Post.$inferSelect

    expect(res.status).toBe(200)
    expect(post.id).toBe(postUUID)
    expect(post.content).toBe('title')
  })
})
