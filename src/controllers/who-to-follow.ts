import type { Context } from 'hono'
import { db } from '@/db'
import validateToken from '@/utils/validate-token'
import { getCookie } from 'hono/cookie'

// TEST: need testing
export default async function whoToFollow(c: Context) {
  const token = getCookie(c, 'auth_token')
  const user = (token != null) ? await validateToken(token) : await db.query.User.findFirst()

  const whoToFollow = await db.execute(
    `
      SELECT DISTINCT u.id,
        u.user_name,
        u.bio,
        u.image_id,
        u.banner_id,
        u.created_at,
        array_agg(DISTINCT c.id) as common_communities
      FROM users u
      LEFT JOIN community_users c ON c.user_id = u.id
      LEFT JOIN community_users cu ON cu.user_id = $1 AND cu.community_id = c.community_id
      WHERE u.id != ${user?.id}
      AND (cu.user_id IS NOT NULL OR (u.bio IS NOT NULL AND u.bio ILIKE '%' || $2 || '%' AND u.bio ILIKE '%' || $3 || '%' AND u.bio ILIKE '%' || $4 || '%'))
      GROUP BY u.id
      ORDER BY array_length(common_communities, 1) DESC
      LIMIT 5
    `,
  )

  return c.json(whoToFollow)
}
