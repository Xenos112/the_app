import { discord } from '@/lib/oauth/discord'
import { generateState } from 'arctic'
import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import discordCallback from './callback'

export default new Hono()
  .get('/', (c) => {
    const state = generateState()
    const url = discord.createAuthorizationURL(state, ['email', 'identify'])

    setCookie(c, 'discord_oauth_state', state, {
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 60 * 10,
      sameSite: 'lax',
    })

    return c.redirect(url.toString(), 302)
  })
  .route('/callback', discordCallback)
