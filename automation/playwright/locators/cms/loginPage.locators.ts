import type { Page } from "@playwright/test";

export const cmsLoginLocators = {
  /**
   * UPGRADED from the original codegen-derived accessibility locator
   * (getByRole('textbox', { name: 'Your username or email' })). The real
   * HTML shows `<label for="">` — an empty for attribute, not actually
   * bound to the input — so that accessible name only ever came from the
   * placeholder text, which is far more likely to change (copy edits,
   * i18n) than the input's real `id="username"` attribute. Per the
   * stated locator priority (data-testid > id/name > accessibility >
   * CSS > XPath), id wins here now that we can see it.
   */
  usernameInput: (page: Page) => page.locator("#username"),

  /** Same upgrade and same reasoning as usernameInput — real id="pwd1" confirmed in HTML. */
  passwordInput: (page: Page) => page.locator("#pwd1"),

  signInButton: (page: Page) => page.getByRole("button", { name: "Sign In" }),

  /**
   * Password visibility toggle. No id/data-testid on the button itself,
   * but it wraps an icon with a real, stable id ("eyeIcon1") — anchoring
   * the CSS selector to that real id is meaningfully more stable than a
   * positional/structural selector, even though it's still CSS rather
   * than a direct id/data-testid on the interactive element itself.
   */
  togglePasswordVisibilityButton: (page: Page) => page.locator("button:has(#eyeIcon1)"),

  /** `title` attribute confirms this is the same link `getByRole` resolves to. */
  forgotPasswordLink: (page: Page) => page.getByRole("link", { name: "Forgot Password?" }),

  /**
   * "Continue with Google" link. NOT using the id present in the HTML
   * (`id="curr-user-cell"` on the inner span) — that id appears TWICE in
   * this page's real markup (once in the visible login section, once in
   * the hidden registration section, which shares near-identical
   * markup). A duplicate id breaks Playwright's strict-mode uniqueness
   * requirement. Role-based matching works correctly here instead,
   * because Playwright's accessibility tree excludes the hidden
   * registration section (real `hidden` attribute), so only the visible
   * link resolves. Worth reporting upstream: duplicate ids are an actual
   * markup bug, not just a locator inconvenience.
   */
  continueWithGoogleLink: (page: Page) => page.getByRole("link", { name: "Continue with Google" }),

  /** `title="Register"` also present on this element, confirming the same target. */
  registerButton: (page: Page) => page.getByRole("button", { name: "Register" }),
};
