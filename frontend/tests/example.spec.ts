import { test, expect } from "@playwright/test";

test("example test - verify Playwright is working", async ({ page }) => {
  // Navigate to the app
  await page.goto("/");

  // Simple check that the page loads
  await expect(page).toHaveTitle(/Vite \+ React/);

  // Check that React app mounted
  await expect(page.locator("#root")).toBeVisible();
});
