import { github } from '@/lib/oauth/github'
import { generateState } from 'arctic'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import githubCallback from './callback'

export default new Hono()
  .get('/', (c) => {
    const state = generateState()
    const url = github.createAuthorizationURL(state, ['user'])

    setCookie(c, 'github_oauth_state', state, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'lax',
    })

    return c.redirect(url.toString(), 302)
  })
  .route('/callback', githubCallback)
