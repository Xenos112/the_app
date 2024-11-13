import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [tsconfigPaths()],
  envDir: '.env.testing',
  test: {
    include: ['src/**/*.test.ts'],
  },
})
