import { Discord } from 'arctic'

export const discord = new Discord(
  process.env.DISCORD_CLIENT_ID!,
  process.env.DISCORD_SECRET!,
  process.env.DISCORD_REDIRECT_URI!,
)

export interface DiscordUser {
  id: string
  username: string
  discriminator: string
  avatar: string
  global_name: string
  email: string
}
