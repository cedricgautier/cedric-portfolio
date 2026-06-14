import { defineConfig, devices } from "@playwright/test"

// The site is served under a project-page base, so the smoke test must load that
// exact path — both for vite preview's readiness check and for page navigation.
const BASE_URL = "http://localhost:4173/cedric-portfolio/"

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build output is served by `vite preview`; CI builds first, then runs this.
  webServer: {
    command: "npm run preview",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
