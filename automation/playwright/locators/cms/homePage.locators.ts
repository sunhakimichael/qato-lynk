import type { Page } from "@playwright/test";

export const cmsHomeLocators = {
  ordersLink: (page: Page) => page.getByRole("link", { name: "Orders" }),
};
