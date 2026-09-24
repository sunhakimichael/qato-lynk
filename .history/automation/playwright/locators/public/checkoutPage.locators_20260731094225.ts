import type { Page } from "@playwright/test";

export const publicCheckoutLocators = {
  emailInput: (page: Page) => page.getByRole("textbox", { name: "* Email" }),

  selectPaymentMethodButton: (page: Page) =>
    page.getByRole("button", { name: "Select payment method secure" }),

  /**
   * FRAGILE — recorded as a positional CSS selector (`li:nth-child(6)`)
   * with a non-semantic class name, not a role/name. Codegen couldn't
   * resolve an accessible name for this list item, which means the
   * payment method options likely aren't exposed with accessible text
   * today. Preserved exactly as recorded per instruction not to invent a
   * replacement — but this WILL break if the payment method list order
   * changes. Revisit once the real markup for this list is available
   * (e.g. re-run codegen hovering each option to check for a stable
   * role/name or data-testid).
   */
  paymentMethodOptionByPosition: (page: Page, position: number) =>
    page.locator(`li:nth-child(${position}) > .cursor-pointer`),

  confirmMethodButton: (page: Page) => page.getByRole("button", { name: "Confirm Method" }),

  /**
   * Exact accessible name as captured by codegen, including a leading
   * U+2060 WORD JOINER (invisible character). Do not "clean" this string —
   * getByRole matches against the real accessible name, so removing the
   * invisible character would break the match if it's genuinely present
   * in the DOM.
   */
  termsCheckbox: (page: Page) =>
    page.getByRole("checkbox", { name: "\u2060I agree to the Terms of Use" }),

  /**
   * Partial accessible name (Playwright's default role-name match is a
   * case-insensitive substring, not exact). The full checkbox label is
   * longer than what codegen captured; this substring is sufficient and
   * matches what codegen itself recorded.
   */
  communicationConsentCheckbox: (page: Page) =>
    page.getByRole("checkbox", { name: "I agree that my email and" }),

  /**
   * "Buy Now - IDR" intentionally excludes the amount. Because role-name
   * matching is substring-based by default, this already matches
   * regardless of the actual price shown (e.g. "Buy Now - IDR 85,000" in
   * dev/staging vs "Buy Now - IDR 10" in production), so no
   * environment-specific handling is needed here.
   */
  submitPurchaseButton: (page: Page) => page.getByRole("button", { name: "Buy Now - IDR" }),
};
