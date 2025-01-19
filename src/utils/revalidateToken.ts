import jwt from "jsonwebtoken"

export default function revalidateToken(token: string): string {
  const decodedToken = jwt.decode(token) as jwt.JwtPayload;

  if (!decodedToken || !decodedToken.iat) return ''; // No valid token or issue time

  const currentTime = Date.now(); // Current time in milliseconds
  const tokenTime = decodedToken.iat * 1000; // Token issued time in milliseconds
  const timeDiff = currentTime - tokenTime; // Difference in time

  // If more than 15 days have passed, return a new token
  if (timeDiff > 15 * 24 * 60 * 60 * 1000) {
    const newToken = jwt.sign({ id: decodedToken.id }, process.env.JWT_SECRET!, {
      expiresIn: '30d',
    });
    return newToken;
  }

  return ''; // Return empty string if no new token is needed
}
