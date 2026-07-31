import type { Page } from "@playwright/test";

export const cmsOrdersLocators = {
  productOrdersHeading: (page: Page) => page.getByRole("heading", { name: "Product Orders" }),
};
