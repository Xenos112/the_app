import jwt from "jsonwebtoken"

export default function revalidateToken(token: string): string | null {
  // see if the token is within the last 15 days
  const decodedToken = jwt.decode(token) as jwt.JwtPayload
  if (!decodedToken || !decodedToken?.iat) return ''

  const currentTime = new Date().setTime(Date.now())
  const tokenTime = new Date(decodedToken.iat * 1000)
  //@ts-ignore - this is a valid way to do it
  const timeDiff = currentTime.getTime() - tokenTime.getTime()

  if (timeDiff > 15 * 24 * 60 * 60 * 1000) {
    return ''
  }

  const newToken = jwt.sign({ id: decodedToken.id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })

  return newToken
}
