import type { OAuth2Tokens } from 'arctic'
import { discord, type DiscordUser } from '@/lib/oauth/discord'
import { Hono } from 'hono'
import { getCookie } from 'hono/cookie'

export default new Hono().get('/', async (c) => {
  const url = new URL(c.req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  let tokens: OAuth2Tokens

  const storedState = getCookie(c, 'discord_oauth_state')

  if (code === null || state === null || storedState === null) {
    return c.text('Invalid request', 400)
  }

  if (state !== storedState) {
    return c.text('Invalid state', 400)
  }

  try {
    tokens = await discord.validateAuthorizationCode(code)
  }
  catch (error) {
    if (error instanceof Error) {
      return c.text(error.message, 500)
    }
  }

  const discordUserResponse = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${tokens!.accessToken()}`,
    },
  })
  const _discordUser = await discordUserResponse.json() as DiscordUser

  // todo: save the user in the database
  return c.redirect('/')
})
