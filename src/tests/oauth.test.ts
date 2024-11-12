import { app } from '@/index'
import { describe, expect, it } from 'vitest'

describe('discord oauth', () => {
  it('should re-direct to discord oauth', async () => {
    const res = await app.request('/auth/discord')
    expect(res.status).toBe(302)
  })

  it('should return a discord state', async () => {
    const res = await app.request('/auth/discord')
    expect(res.headers.get('set-cookie')).toBeDefined()
    const discordState = res.headers.get('set-cookie')?.includes('discord_oauth_state=')
    expect(discordState).toBe(true)
  })

  it('should return response of 400  with `Invalid state` message', async () => {
    const res = await app.request('/auth/discord/callback?code=1234&state=1234')
    const message = await res.text()
    expect(res.status).toBe(400)
    expect(message).toBe('Invalid state')
  })
})

describe('github oauth', () => {
  it('should re-direct to github oauth', async () => {
    const res = await app.request('/auth/github')
    expect(res.status).toBe(302)
  })
  it('should return a github state', async () => {
    const res = await app.request('/auth/github')
    expect(res.headers.get('set-cookie')).toBeDefined()
    const githubState = res.headers.get('set-cookie')?.includes('github_oauth_state=')
    expect(githubState).toBe(true)
  })

  it('should return response of 400 with `Invalid state` message', async () => {
    const res = await app.request('/auth/github/callback?code=1234&state=1234')
    const message = await res.text()
    expect(res.status).toBe(400)
    expect(message).toBe('Invalid state')
  })
})
