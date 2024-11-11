import { GitHub } from 'arctic'
import { config } from 'dotenv'

config()

export const github = new GitHub(
  process.env.GITHUB_CLIENT_ID!,
  process.env.GITHUB_SECRET!,
  null,
)

export interface GitHubUser {
  id: number
  login: string
  node_id: string
  avatar_url: string
  name: string
  email: string | null
}
