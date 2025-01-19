import jwt from 'jsonwebtoken'

export function generateToken(userId: string) {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
  return token
}
