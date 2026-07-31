import type { Page } from "@playwright/test";

export const cmsLoginLocators = {
  usernameInput: (page: Page) => page.getByRole("textbox", { name: "Your username or email" }),
  passwordInput: (page: Page) => page.getByRole("textbox", { name: "Your Password" }),
  signInButton: (page: Page) => page.getByRole("button", { name: "Sign In" }),
};
