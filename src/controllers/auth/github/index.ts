import type { Context } from 'hono'
import { github as githubOauth } from '@/lib/oauth/github'
import { generateState } from 'arctic'
import { setCookie } from 'hono/cookie'

export default function github(c: Context) {
  const state = generateState()
  const url = githubOauth.createAuthorizationURL(state, ['user'])

  setCookie(c, 'github_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  return c.redirect(url.toString(), 302)
}
