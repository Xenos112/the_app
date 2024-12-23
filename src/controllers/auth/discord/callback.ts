import type { OAuth2Tokens } from 'arctic'
import type { Context } from 'hono'
import { authenticate, discord, type DiscordUser } from '@/lib/oauth/discord'
import { generateToken } from '@/utils/generate-token'
import { getCookie, setCookie } from 'hono/cookie'

export default async function callback(c: Context) {
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
  const discordUser = await discordUserResponse.json() as DiscordUser

  const user = await authenticate(discordUser)
  const authToken = generateToken(user!.id)
  setCookie(c, 'auth_token', authToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })

  return c.redirect('http://localhost:3000/', 302)
}
