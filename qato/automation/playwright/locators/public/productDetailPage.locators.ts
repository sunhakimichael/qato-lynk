import type { Page } from "@playwright/test";

export const publicProductDetailLocators = {
  buyNowButton: (page: Page) => page.getByRole("button", { name: "Buy Now" }),
};
