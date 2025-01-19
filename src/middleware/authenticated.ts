import revalidateToken from '@/utils/revalidateToken'
import validateToken from '@/utils/validate-token'
import { getCookie, setCookie } from 'hono/cookie'
import { createMiddleware } from 'hono/factory'

const authMiddleware = createMiddleware<{
  Variables: { user: Exclude<Awaited<ReturnType<typeof validateToken>>, null> }
}>(async (c, next) => {
  const token = getCookie(c, 'auth_token')

  if (token == null) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  const user = await validateToken(token)

  if (!user) {
    return c.json({ message: 'Unauthorized' }, 401)
  }

  // TEST: this part of code needs to be tested to make sure the token is valid
  const newToken = revalidateToken(token)
  if (newToken) {
    setCookie(c, 'auth_token', newToken, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
  }

  c.set('user', user)

  return next()
})

export default authMiddleware
