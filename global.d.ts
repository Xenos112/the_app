declare namespace NodeJS {
  interface ProcessEnv {
    JWT_SECRET: string
    JWT_EXPIRES_IN: string
    DATABASE_URL: string
    GITHUB_CLIENT_ID: string
    GITHUB_SECRET: string
    DISCORD_CLIENT_ID: string
    DISCORD_SECRET: string
    DISCORD_REDIRECT_URI: string
  }
}
