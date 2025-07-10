import { test, expect } from "@playwright/test";

test.describe("SharedModal Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/demos/mystery-item");
    await expect(page.getByText("Welcome to The Guessing Game!")).toBeVisible();
    await page.waitForTimeout(5000);
  });

  test("should open and close modal with cancel button", async ({ page }) => {
    const newChatButton = page.getByRole("button").nth(1);
    const cancelButton = page.getByRole("button", { name: "Cancel" });
    const confirmButton = page.getByRole("button", { name: "Confirm" });

    await newChatButton.click();
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await cancelButton.click();
    await expect(cancelButton).not.toBeVisible();
    await expect(confirmButton).not.toBeVisible();
  });

  test("should close modal with X button", async ({ page }) => {
    const newChatButton = page.getByRole("button").nth(1);
    const cancelButton = page.getByRole("button", { name: "Cancel" });
    const confirmButton = page.getByRole("button", { name: "Confirm" });
    const closeButton = page.getByRole("button", { name: "Close modal" });

    await newChatButton.click();
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await closeButton.click();
    await expect(cancelButton).not.toBeVisible();
    await expect(confirmButton).not.toBeVisible();
  });

  test("should close modal with Escape key", async ({ page }) => {
    const newChatButton = page.getByRole("button").nth(1);
    const cancelButton = page.getByRole("button", { name: "Cancel" });
    const confirmButton = page.getByRole("button", { name: "Confirm" });

    await newChatButton.click();
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(cancelButton).not.toBeVisible();
    await expect(confirmButton).not.toBeVisible();
  });

  test("should confirm action when clicking confirm button", async ({
    page,
  }) => {
    const newChatButton = page.getByRole("button").nth(1);
    const cancelButton = page.getByRole("button", { name: "Cancel" });
    const confirmButton = page.getByRole("button", { name: "Confirm" });

    await newChatButton.click();
    await expect(cancelButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();
    await expect(cancelButton).not.toBeVisible();
    await expect(confirmButton).not.toBeVisible();
    await expect(
      page.getByText(/Tool call: (reset_game|generate_mystery_item)/)
    ).toBeVisible({ timeout: 10000 });
  });
});

//   test("should close modal when clicking backdrop", async ({ page }) => {
//     const newChatButton = page.getByRole("button").nth(1);
//     const cancelButton = page.getByRole("button", { name: "Cancel" });
//     const confirmButton = page.getByRole("button", { name: "Confirm" });

//     await newChatButton.click();
//     await expect(cancelButton).toBeVisible();
//     await expect(confirmButton).toBeVisible();
//     await page.locator(".modalOverlay").click({ position: { x: 10, y: 10 } });
//     await expect(cancelButton).not.toBeVisible();
//     await expect(confirmButton).not.toBeVisible();
//   });
