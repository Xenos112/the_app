import type { OAuth2Tokens } from 'arctic'
import type { Context } from 'hono'
import { authenticate, github, type GitHubUser } from '@/lib/oauth/github'
import { generateToken } from '@/utils/generate-token'
import { getCookie, setCookie } from 'hono/cookie'

export default async function (c: Context) {
  const url = new URL(c.req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  let tokens: OAuth2Tokens

  const storedState = getCookie(c, 'github_oauth_state')

  if (code === null || state === null || storedState === null) {
    return c.text('Invalid request', 400)
  }

  if (state !== storedState) {
    return c.text('Invalid state', 400)
  }

  try {
    tokens = await github.validateAuthorizationCode(code)
  }
  catch (error) {
    if (error instanceof Error) {
      return c.text(error.message, 500)
    }
  }

  const githubUserResponse = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${tokens!.accessToken()}`,
    },
  })
  const githubUser = await githubUserResponse.json() as GitHubUser
  const user = await authenticate(githubUser)
  const authToken = generateToken(user!.id)
  setCookie(c, 'auth_token', authToken, {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
  })
  return c.json(user)
}
