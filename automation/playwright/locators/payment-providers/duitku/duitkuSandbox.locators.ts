import type { Page } from "@playwright/test";

/**
 * Duitku sandbox "Demo Transaction Area" (demosuccesstransaction.aspx).
 * Structure verified against the live page on 2026-09-23: the payment
 * method dropdown lists categories (".category"); clicking one reveals its
 * channels (".item[data-value]"), e.g. Bank Transfer -> CIMB NIAGA VA (B1).
 */
const exactText = (text: string) =>
  new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`);

export const duitkuSandboxLocators = {
  displaySelect: (page: Page) => page.locator("#selectDisplay"),
  selectedChannelText: (page: Page) => page.locator("#selectedText"),

  paymentCategory: (page: Page, category: string) =>
    page.locator("#selectDropdown .category").filter({ hasText: exactText(category) }),

  /**
   * A channel inside a category, by its exact label, e.g. "CIMB NIAGA VA".
   * The old `[data-value="VA"]` selector matched MAYBANK VA, not CIMB.
   */
  paymentChannelOption: (page: Page, category: string, channelLabel: string) =>
    page
      .locator(`#selectDropdown .item[data-category="${category}"]`)
      .filter({ hasText: exactText(channelLabel) }),

  vaNumberInput: (page: Page) => page.locator("#TextBoxOrderId"),
  checkButton: (page: Page) => page.locator("#Button1"),

  /** Server-side message after Check/Pay, e.g. "Object reference not set..." for an unknown VA. */
  errorLabel: (page: Page) => page.locator("#LabelError"),

  /** Read-only bill amount shown after Check, e.g. "Rp 153,000". */
  billAmountInput: (page: Page) => page.locator("#TextBoxAmount"),

  /**
   * Real DOM id has a typo ("Anount", not "Amount") in Duitku's own
   * sandbox markup — preserved exactly as recorded, not corrected, since
   * "fixing" it would break the match against the real page.
   */
  transferAmountInput: (page: Page) => page.locator("#TextBoxAnount"),

  payButton: (page: Page) => page.locator("#Button2"),
  /** Green "SUCCESS" box shown after a successful Pay (verified 2026-09-23). */
  successMessage: (page: Page) => page.getByText("SUCCESS", { exact: true }),
};
