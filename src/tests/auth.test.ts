import { app } from '@/index'
import { describe, expect, it } from 'vitest'

describe('post /auth/login', () => {
  it('should return two errors with status 400', async () => {
    const res = await app.request('/auth/login', {
      body: JSON.stringify('testing'),
      method: 'POST',
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body[0]).toBe('Email is required')
    expect(body[1]).toBe('Password is required')
    expect(res.status).toBe(400)
  })

  it('should validate email and password and return 400', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        password: '123',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body[0]).toBe('Email is required')
    expect(body[1]).toBe('Password must be at least 8 characters')
    expect(res.status).toBe(400)
  })

  it('should pass the email but throws for wrong password', async () => {
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
    expect(body[0]).toBe('Password must be at least 8 characters')
    expect(res.status).toBe(400)
  })
  it('should pass the password but throws for wrong email', async () => {
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
    expect(body[0]).toBe('Email is invalid')
    expect(res.status).toBe(400)
  })
  it('should return error with `not found` message', async () => {
    const res = await app.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@test.com',
        password: '12334',
      }),
      headers: new Headers({ 'Content-Type': 'application/json' }),
    })
    const body = await res.json() as string[]
    expect(body).toBeDefined()
    expect(body).toEqual({
      message: 'user not found',
    })
    expect(res.status).toBe(400)
  })
})
