import type { Page } from "@playwright/test";

export const thankYouLocators = {
  successMessage: (page: Page) => page.getByText("Your purchase was successful"),
};
