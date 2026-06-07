import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config tuned for recording a product demo (not CI assertions).
 * - Runs headed with slowMo so the screen capture is watchable.
 * - Records video + trace for every run.
 * - Targets the local HTTPS dev server (server.js, self-signed cert).
 *
 * Start the dev server first (npm run dev), seed the demo data
 * (npx tsx scripts/seed-demo.ts), then: npm run demo
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 5 * 60 * 1000, // Drive polling can wait minutes for a real file
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.DEMO_BASE_URL || "https://localhost:3000",
    ignoreHTTPSErrors: true,
    viewport: { width: 1440, height: 900 },
    video: "on",
    trace: "on",
    actionTimeout: 30_000,
    launchOptions: {
      slowMo: 350,
    },
  },
  projects: [
    {
      name: "demo",
      use: { ...devices["Desktop Chrome"], headless: false },
    },
  ],
});
