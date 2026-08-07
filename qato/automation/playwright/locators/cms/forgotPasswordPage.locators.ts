import type { Page } from "@playwright/test";

export const cmsForgotPasswordLocators = {
  /** No id/data-testid; `name="user_email"` is the most stable attribute present. */
  emailInput: (page: Page) => page.locator('input[name="user_email"]'),

  /** `title="Reset Password"` confirms the same target as the visible text. */
  submitButton: (page: Page) => page.getByRole("button", { name: "Reset Password" }),

  /**
   * Cloudflare Turnstile widget (id="cf-turnstile") — a real, currently
   * rendered anti-bot challenge on this form. NOTE: an older canvas-based
   * captcha also appears in this page's source, but it's wrapped in an
   * HTML comment (`<!-- ... -->`) and never rendered — no locator was
   * created for it since it doesn't exist in the actual DOM.
   *
   * FLAG: automating actual form submission on this page will likely be
   * blocked by Turnstile in real dev/staging environments unless there's
   * a known test sitekey or bypass configured server-side. No evidence
   * of one in this HTML. This locator exists for presence assertions
   * only until that's resolved.
   */
  turnstileWidget: (page: Page) => page.locator("#cf-turnstile"),
};
