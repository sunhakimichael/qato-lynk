import type { Page } from "@playwright/test";

export const memberLoginLocators = {
  emailInput: (page: Page) => page.getByRole("textbox", { name: "Input your active email" }),
  signInButton: (page: Page) => page.getByRole("button", { name: "Sign in" }),
};
