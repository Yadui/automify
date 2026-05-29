import { test, expect, Page } from "@playwright/test";

/**
 * Product demo walkthrough (for screen recording).
 *
 * Prerequisites:
 *   1. Dev server running:        npm run dev           (https://localhost:3000)
 *   2. Demo data seeded:          npx tsx scripts/seed-demo.ts
 *   3. Google Drive + Notion connected manually in the app beforehand.
 *
 * Run:  npm run demo
 *
 * The Run step polls real Google Drive — when the script is "waiting for
 * action", create a file in the connected Drive folder on camera. Publish
 * unlocks automatically once a run succeeds.
 */

const DEMO_EMAIL = "demo@automify.dev";
const DEMO_PASSWORD = "demo1234";
const SIMPLE = "Drive → Notion (Simple)";
const COMPLEX = "New File → Triage (Complex)";

// Small pause so each step is readable in the recording.
const beat = (page: Page, ms = 1200) => page.waitForTimeout(ms);

async function login(page: Page) {
  await page.goto("/local-login");
  await page.fill('input[name="email"]', DEMO_EMAIL);
  await page.fill('input[name="password"]', DEMO_PASSWORD);
  await page.getByRole("button", { name: /Continue locally/i }).click();
  await page.waitForURL("**/dashboard");
}

test("Automify product demo walkthrough", async ({ page }) => {
  // ---- 1. Sign in ----
  await login(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await beat(page, 1800);

  // ---- 2. Connections (show connected apps) ----
  await page.getByRole("link", { name: "Connections" }).click();
  await page.waitForURL("**/connections");
  await expect(page.getByRole("heading", { name: "Connections" })).toBeVisible();
  await beat(page, 2000);

  // ---- 3. Workflows list ----
  await page.getByRole("link", { name: "Workflows" }).click();
  await page.waitForURL("**/workflows");
  await expect(page.getByRole("heading", { name: "Workflows" })).toBeVisible();
  await beat(page, 1500);

  // ---- 4. Open the simple pre-built workflow ----
  await page.getByRole("link", { name: `Open ${SIMPLE}` }).click();
  await page.waitForURL("**/workflows/editor/**");
  // Canvas renders the two seeded nodes.
  await expect(
    page.locator(".react-flow__node", { hasText: "Google Drive" }),
  ).toBeVisible();
  await expect(
    page.locator(".react-flow__node", { hasText: "Notion" }),
  ).toBeVisible();
  await beat(page, 2000);

  // ---- 5. Inspect the trigger via the Configure wizard ----
  await page.locator(".react-flow__node", { hasText: "Google Drive" }).first().click();
  await page.getByRole("tab", { name: "Configure" }).click();
  await beat(page, 2500);

  // Inspect the Notion action too.
  await page.locator(".react-flow__node", { hasText: "Notion" }).first().click();
  await beat(page, 2500);

  // ---- 6. Save ----
  const saveBtn = page.getByRole("button", { name: "Save" });
  if (await saveBtn.isEnabled()) {
    await saveBtn.click();
    await beat(page, 1500);
  }

  // ---- 7. Run (waits for a real Drive file created on camera) ----
  const runBtn = page.getByRole("button", { name: "Run" });
  if (await runBtn.isEnabled()) {
    await runBtn.click();
    console.log(
      "\n>>> RUN STARTED — create a file in the connected Google Drive folder now.\n",
    );
    // Publish enables only after a successful run (lastRunSuccess).
    const publishBtn = page.getByRole("button", { name: /^(Publish|Unpublish)$/ });
    await expect(publishBtn).toBeEnabled({ timeout: 4 * 60 * 1000 });
    await beat(page, 1500);

    // ---- 8. Publish ----
    await publishBtn.click();
    await beat(page, 2000);
  } else {
    console.log(
      ">>> Run disabled (connections/trigger missing) — skipping Run/Publish.",
    );
  }

  // ---- 9. Showcase the complex workflow ----
  await page.getByRole("link", { name: "Workflows" }).click();
  await page.waitForURL("**/workflows");
  await beat(page, 1200);
  await page.getByRole("link", { name: `Open ${COMPLEX}` }).click();
  await page.waitForURL("**/workflows/editor/**");
  await expect(
    page.locator(".react-flow__node", { hasText: "Condition" }),
  ).toBeVisible();
  // Fit the larger graph into view for the camera.
  await beat(page, 3000);
});
