import type { Page } from "@playwright/test";

export const memberContentDetailLocators = {
  goBackLink: (page: Page) => page.getByRole("link", { name: "Go Back" }),
  heading: (page: Page) => page.locator("h2"),
  continueReadingLink: (page: Page) => page.getByRole("link", { name: "Continue Reading" }),
};
