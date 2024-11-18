import { app } from '@/index'
import { describe, expect, test } from 'vitest'

describe('post /auth/login', () => {
  test('should return two errors with status 400', async () => {
    const res = await app.request('/auth/login', {
      body: JSON.stringify('testing'),
      method: 'POST',
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    expect(body).toEqual(['Email is required', 'Password is required'])
    expect(res.status).toBe(400)
  })

  test('should validate email and password and return 400', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: '123',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toHaveLength(2)
    expect(body).toEqual(['Email is required', 'Password must be at least 8 characters'])
    expect(res.status).toBe(400)
  })

  test('should pass the email but throws for wrong password', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual(['Password must be at least 8 characters'])
    expect(res.status).toBe(400)
  })
  test('should pass the password but throws for wrong email', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test',
        password: '123345678',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual(['Email is invalid'])
    expect(res.status).toBe(400)
  })
  test('should return error with `not found` message', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '123345678',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual({
      message: 'User not found',
    })
    expect(res.status).toBe(404)
  })
})

describe('post /auth/sign-in', () => {
  test('should return two errors with status 400', async () => {
    const res = await app.request('/auth/sign-in', {
      body: JSON.stringify('testing'),
      method: 'POST',
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual(['Email is required', 'Password is required', 'Name is required'])
    expect(res.status).toBe(400)
  })

  test('should throw one error with status 400 and email error', async () => {
    const res = await app.request('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test',
        password: '12345678',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual(['Email is invalid', 'Name is required'])
    expect(res.status).toBe(400)
  })
})
