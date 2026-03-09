const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Product listing

test("homepage loads and shows the store heading", async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByText("E-Commerce Store")).toBeVisible();
});

test("products section heading is visible", async ({ page }) => {
  await page.goto(BASE_URL);
  await expect(page.getByText("Products")).toBeVisible();
});

test("at least one product card is rendered from the API", async ({ page }) => {
  await page.goto(BASE_URL);

  // Wait for product cards — seeded DB has 5 products
  const buyButtons = page.getByText("Buy Now");
  await expect(buyButtons.first()).toBeVisible({ timeout: 10_000 });

  const count = await buyButtons.count();
  expect(count).toBeGreaterThanOrEqual(1);
});

test("seeded products are displayed by name", async ({ page }) => {
  await page.goto(BASE_URL);

  // The seed script inserts Laptop, Mouse, Keyboard, Monitor, Headphones
  await expect(page.getByText("Laptop")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("Mouse")).toBeVisible();
  await expect(page.getByText("Keyboard")).toBeVisible();
});

test("product cards show a price", async ({ page }) => {
  await page.goto(BASE_URL);
  // Any text matching $NNN.NN
  await expect(page.locator("text=/\\$[0-9]+\\.[0-9]{2}/").first()).toBeVisible(
    {
      timeout: 10_000,
    },
  );
});

// Buy Now / order creation

test("clicking Buy Now shows an order confirmation alert", async ({ page }) => {
  await page.goto(BASE_URL);

  // Wait for products to load
  await expect(page.getByText("Buy Now").first()).toBeVisible({
    timeout: 10_000,
  });

  // Listen for the alert BEFORE clicking
  const dialogPromise = page.waitForEvent("dialog");
  await page.getByText("Buy Now").first().click();

  const dialog = await dialogPromise;
  expect(dialog.message()).toBe("Order created!");
  await dialog.accept();
});

test("full user journey: load page → view product → place order", async ({
  page,
}) => {
  await page.goto(BASE_URL);

  // 1. Verify store loads
  await expect(page.getByText("E-Commerce Store")).toBeVisible();

  // 2. Products are visible
  await expect(page.getByText("Buy Now").first()).toBeVisible({
    timeout: 10_000,
  });

  // 3. Click Buy Now and handle the confirmation
  const dialogPromise = page.waitForEvent("dialog");
  await page.getByText("Buy Now").first().click();
  const dialog = await dialogPromise;
  expect(dialog.message()).toBe("Order created!");
  await dialog.accept();

  // 4. Page is still intact after order
  await expect(page.getByText("E-Commerce Store")).toBeVisible();
});
