import type { Page } from "@playwright/test";

export const otpModalLocators = {
  heading: (page: Page) => page.getByRole("heading", { name: "OTP Verification" }),
  description: (page: Page) => page.getByText("Input 6 digit verification"),
  modal: (page: Page) => page.locator("#modalMemberOtp"),

  /** OTP digit input, 1-indexed (matches the recorded #otp_1 through #otp_6 ids). */
  otpDigitInput: (page: Page, position: number) => page.locator(`#otp_${position}`),

  /**
   * FRAGILE — raw utility/atomic CSS classes (Tachyons-style:
   * "Ta(c)" = text-align center, "Mt(18px)" = margin-top 18px). These are
   * styling hooks, not semantic identifiers, and will break the moment
   * this element's styling changes. Codegen couldn't resolve a role or
   * accessible name for it (likely the OTP digit-input container or a
   * resend-code timer with no text/label). Preserved exactly as recorded;
   * revisit once the real purpose/markup of this element is confirmed.
   */
  otpDigitsContainer: (page: Page) => page.locator(".Ta\\(c\\).Mt\\(18px\\) > div"),
};
