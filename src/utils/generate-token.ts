import jwt from 'jsonwebtoken'

export function generateToken(userId: string) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET) as string
  return token
}
