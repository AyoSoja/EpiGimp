import { defineConfig } from '@playwright/test'

const PORT = 5174

export default defineConfig({
  testDir: 'e2e',
  outputDir: 'node_modules/.tmp/playwright-results',
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    browserName: 'chromium',
    viewport: { width: 1400, height: 900 },
  },
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
  },
})
