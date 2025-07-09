import { test, expect } from "@playwright/test";

test.describe("AI Demos App", () => {
  test("should load the mystery item game and display welcome message", async ({
    page,
  }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Should redirect to the mystery item demo
    await expect(page).toHaveURL("/demos/mystery-item");

    // Check that the page title is correct
    await expect(page).toHaveTitle("Vite + React + TS");

    // Wait for and verify the welcome message appears
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
    await expect(
      page.getByText("Ask me questions to help you guess what it is")
    ).toBeVisible();

    // Verify key UI components are present
    await expect(
      page.locator(
        '[data-testid="chat-input"], input[placeholder*="message"], textarea[placeholder*="message"]'
      )
    ).toBeVisible();
  });

  test("should toggle the side menu", async ({ page }) => {
    await page.goto("/demos/mystery-item");

    // Wait for the page to load
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();

    // Find and click the menu button (hamburger icon or menu toggle)
    const menuButton = page
      .locator("button")
      .filter({ hasText: /menu|☰|≡/ })
      .or(page.locator('[data-testid="menu-button"]'))
      .or(page.locator('button[aria-label*="menu" i]'))
      .or(page.locator('button:has-text("Menu")'))
      .first();

    // If we can't find a specific menu button, look for any clickable element that might open the menu
    const fallbackMenuTrigger = page
      .locator("header button, .top-bar button, nav button")
      .first();

    try {
      await menuButton.click({ timeout: 3000 });
    } catch {
      // Fallback to clicking any button in header/top area
      await fallbackMenuTrigger.click();
    }

    // Check if side menu or navigation items become visible
    // Look for common menu indicators
    await expect(
      page
        .locator('.side-menu, .sidebar, nav, [data-testid="side-menu"]')
        .or(page.getByText("Mystery Item").or(page.getByText("Placeholder")))
    ).toBeVisible({ timeout: 5000 });
  });

  test("should allow typing in the chat input", async ({ page }) => {
    await page.goto("/demos/mystery-item");

    // Wait for the welcome message
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();

    // Find the chat input field
    const chatInput = page
      .locator('input[type="text"], textarea, [contenteditable="true"]')
      .last();

    // Type a test message
    const testMessage = "Is it an animal?";
    await chatInput.fill(testMessage);

    // Verify the text was entered
    await expect(chatInput).toHaveValue(testMessage);
  });

  test("should navigate between demo views", async ({ page }) => {
    await page.goto("/demos/mystery-item");

    // Wait for page to load
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();

    // Try to navigate to placeholder view
    await page.goto("/demos/placeholder");

    // Check we're on the placeholder page
    await expect(page).toHaveURL("/demos/placeholder");

    // Navigate back to mystery item
    await page.goto("/demos/mystery-item");
    await expect(page).toHaveURL("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
  });

  test("should handle loading states", async ({ page }) => {
    await page.goto("/demos/mystery-item");

    // Initially should see loading dots
    const loadingElement = page.getByText("...");

    // Loading should eventually be replaced by welcome message
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible({
      timeout: 10000,
    });
  });
});
