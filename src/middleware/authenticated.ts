import validateToken from '@/utils/validate-token'
import { getCookie } from 'hono/cookie'
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
  c.set('user', user)

  return next()
})

export default authMiddleware
