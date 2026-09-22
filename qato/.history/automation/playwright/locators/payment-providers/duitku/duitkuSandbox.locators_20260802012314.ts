import type { Page } from "@playwright/test";

export const duitkuSandboxLocators = {
  displaySelect: (page: Page) => page.locator("#selectDisplay"),
  bankTransferOption: (page: Page) => page.getByText("Bank Transfer"),

  /** Parameterized by the exact channel label shown in the dropdown, e.g. "CIMB NIAGA VA". */
  paymentChannelOption: (page: Page, channelLabel: string) => page.getByText(channelLabel),

  vaNumberInput: (page: Page) =>
    page.getByRole("textbox", { name: "Enter Virtual Account Number" }),
  checkButton: (page: Page) => page.getByRole("button", { name: "Check" }),

  paymentMethodLabel: (page: Page) => page.getByText("Payment Method"),
  paymentMethodValue: (page: Page) => page.getByRole("textbox", { name: "Payment Method" }),
  transferAmountLabel: (page: Page) => page.getByText("Transfer Amount"),

  /**
   * Real DOM id has a typo ("Anount", not "Amount") in Duitku's own
   * sandbox markup — preserved exactly as recorded, not corrected, since
   * "fixing" it would break the match against the real page.
   */
  transferAmountInput: (page: Page) => page.locator("#TextBoxAnount"),

  payButton: (page: Page) => page.getByRole("button", { name: "Pay" }),
  successStatus: (page: Page) => page.getByText("SUCCESS"),
};
