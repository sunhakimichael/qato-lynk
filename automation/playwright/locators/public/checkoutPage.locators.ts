import type { Page } from "@playwright/test";

/**
 * Payment method codes as rendered in MyLink's checkout markup (verified
 * against dev on 2026-09-23). Only CIMB Niaga VA is used by the suite —
 * other methods fail in the sandbox.
 */
export const PAYMENT_METHOD_CODES = {
  CIMB_NIAGA_VA: "b1",
} as const;

export const publicCheckoutLocators = {
  emailInput: (page: Page) => page.getByRole("textbox", { name: "* Email" }),

  selectPaymentMethodButton: (page: Page) =>
    page.getByRole("button", { name: "Select payment method secure" }),

  /**
   * A payment method option, by the code MyLink uses for it in the
   * checkout markup (`<input name="payment_method" value="b1">` +
   * `<label data-payment-card="b1">`). Replaces the old positional
   * `li:nth-child(n)` selector, which silently picked a different bank
   * whenever the list changed. See PAYMENT_METHOD_CODES.
   */
  paymentMethodOption: (page: Page, code: string) => page.locator(`label[data-payment-card="${code}"]`),
  // type="radio" matters: the form also carries a hidden
  // <input name="payment_method"> that mirrors the selected code.
  paymentMethodRadio: (page: Page, code: string) =>
    page.locator(`input[type="radio"][name="payment_method"][value="${code}"]`),

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
    // page.getByRole("checkbox", { name: /I agree that the creator may contact me by email or phone/i, }),
    page.locator("#agree_detail"),


  /**
   * "Buy Now - IDR" intentionally excludes the amount. Because role-name
   * matching is substring-based by default, this already matches
   * regardless of the actual price shown (e.g. "Buy Now - IDR 85,000" in
   * dev/staging vs "Buy Now - IDR 10" in production), so no
   * environment-specific handling is needed here.
   */
  submitPurchaseButton: (page: Page) => page.getByRole("button", { name: "Buy Now - IDR" }),
};
