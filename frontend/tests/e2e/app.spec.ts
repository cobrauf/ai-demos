import { test, expect } from "@playwright/test";

test.describe("AI Demos App", () => {
  test("should load the mystery item game and display welcome message", async ({
    page,
  }) => {
    // Navigate to the homepage
    await page.goto("/");
    // Should redirect to the mystery item demo
    await expect(page).toHaveURL("/demos/mystery-item");
    // Wait for and verify the welcome message appears
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
  });

  test("should toggle the side menu", async ({ page }) => {
    await page.goto("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
    const menuTrigger = page.getByText("☰");
    await menuTrigger.click();
    await expect(
      page
        .locator(".side-menu, .sidebar, nav")
        .or(page.getByText("Mystery Item").or(page.getByText("Placeholder")))
    ).toBeVisible({ timeout: 5000 });
  });

  test("should allow typing in the chat input", async ({ page }) => {
    await page.goto("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
    const chatInput = page
      .locator('input[type="text"], textarea, [contenteditable="true"]')
      .last();
    const testMessage = "Is it an animal?";
    await chatInput.fill(testMessage);
    await expect(chatInput).toHaveValue(testMessage);
  });

  test("should navigate between demo views", async ({ page }) => {
    await page.goto("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
    await page.goto("/demos/placeholder");
    await expect(page).toHaveURL("/demos/placeholder");
    await page.goto("/demos/mystery-item");
    await expect(page).toHaveURL("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
  });
});
