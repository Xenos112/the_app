declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string
      JWT_EXPIRES_IN: string
      DATABASE_URL: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GITHUB_REDIRECT_URI: string
      DISCORD_CLIENT_ID: string
      DISCORD_SECRET: string
      DISCORD_REDIRECT_URI: string
    }
  }
}
