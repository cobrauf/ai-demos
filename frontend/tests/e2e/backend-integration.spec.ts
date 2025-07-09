import { test, expect } from "@playwright/test";

test.describe("Backend Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the mystery item game
    await page.goto("/demos/mystery-item");

    // Wait for the welcome message to ensure the app is loaded
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();

    // Wait a bit more for the backend to be ready
    await page.waitForTimeout(5000);
  });

  test("should show different tool calls for different user inputs", async ({
    page,
  }) => {
    const chatInput = page.locator("textarea");

    // Test 1: Ask a question - should trigger answer_question tool
    await chatInput.fill("Is it alive?");
    await chatInput.press("Enter");
    await expect(page.getByText("Tool call: answer_question")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(1000);

    // Test 2: Make a guess - should trigger check_guess tool
    await chatInput.fill("Is it a dog?");
    await chatInput.press("Enter");
    await expect(page.getByText("Tool call: check_guess")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(1000);

    // Test 3: Ask for a hint - should trigger give_hint tool
    await chatInput.fill("hint please");
    await chatInput.press("Enter");
    await expect(page.getByText("Tool call: give_hint")).toBeVisible({
      timeout: 5000,
    });
    await page.waitForTimeout(1000);
  });

  //   test("should handle backend errors gracefully", async ({ page }) => {
  //     const chatInput = page.locator("textarea");

  //     // Send a very long or potentially problematic message
  //     const longMessage = "a".repeat(1000);
  //     await chatInput.fill(longMessage);
  //     await chatInput.press("Enter");

  //     // Should either get a response or an error message, but not crash
  //     await expect(
  //       page.getByText(/Tool call:|Sorry|trouble connecting|try again/).first()
  //     ).toBeVisible({ timeout: 20000 });
  //   });

  //   test("should show loading state while waiting for backend response", async ({
  //     page,
  //   }) => {
  //     const chatInput = page.locator("textarea");

  //     // Type and send a message
  //     await chatInput.fill("What am I guessing?");
  //     await chatInput.press("Enter");

  //     // Should immediately show loading dots
  //     await expect(page.getByText("...")).toBeVisible({ timeout: 1000 });

  //     // Loading should eventually be replaced by actual response
  //     await expect(page.getByText(/Tool call:|Sorry/).first()).toBeVisible({
  //       timeout: 15000,
  //     });
  //   });

  //   test("should maintain conversation history", async ({ page }) => {
  //     const chatInput = page.locator("textarea");

  //     // Send first message
  //     await chatInput.fill("First question");
  //     await chatInput.press("Enter");

  //     // Wait for response
  //     await expect(page.getByText("First question")).toBeVisible();
  //     await expect(page.getByText(/Tool call:/).first()).toBeVisible({
  //       timeout: 15000,
  //     });

  //     // Send second message
  //     await chatInput.fill("Second question");
  //     await chatInput.press("Enter");

  //     // Wait for second response
  //     await expect(page.getByText("Second question")).toBeVisible();

  //     // Both messages should still be visible in conversation history
  //     await expect(page.getByText("First question")).toBeVisible();
  //     await expect(page.getByText("Second question")).toBeVisible();

  //     // Should have multiple tool calls visible
  //     const toolCalls = page.getByText(/Tool call:/);
  //     await expect(toolCalls).toHaveCount(2, { timeout: 15000 });
  //   });

  //   test("should handle new game functionality", async ({ page }) => {
  //     // Click the new chat button
  //     const newChatButton = page
  //       .locator("button")
  //       .filter({ hasText: /New Chat/ })
  //       .or(page.locator('[data-testid="new-chat"]'))
  //       .or(page.locator('button:has-text("New Chat")'))
  //       .first();

  //     await newChatButton.click();

  //     // Should open a confirmation modal
  //     await expect(page.getByText(/Start new chat|reset|new game/i)).toBeVisible({
  //       timeout: 5000,
  //     });

  //     // Confirm the new game
  //     const confirmButton = page
  //       .locator("button")
  //       .filter({ hasText: /Confirm|Yes|OK/ })
  //       .first();
  //     await confirmButton.click();

  //     // Should get a reset response and tool call
  //     await expect(
  //       page.getByText(/Tool call: (reset_game|generate_mystery_item)/)
  //     ).toBeVisible({ timeout: 15000 });
  //   });
});
