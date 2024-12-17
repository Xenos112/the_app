import type { Context } from 'hono'
import { discord as discordOauth } from '@/lib/oauth/discord'
import { generateState } from 'arctic'
import { setCookie } from 'hono/cookie'

export default function discord(c: Context) {
  const state = generateState()
  const url = discordOauth.createAuthorizationURL(state, ['email', 'identify'])

  setCookie(c, 'discord_oauth_state', state, {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax',
  })

  return c.redirect(url.toString(), 302)
}
