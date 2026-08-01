import type { Page } from "@playwright/test";

export const publicPaymentStatusLocators = {
  invoiceNumberText: (page: Page) => page.getByText("Inv. Number:"),
  transactionDateText: (page: Page) => page.getByText("Trx. Date:"),
  checkTransactionButton: (page: Page) => page.getByRole("button", { name: "Check Transaction" }),

  productsLabelText: (page: Page) => page.getByText("Products :"),
  paymentAmountLabelText: (page: Page) => page.getByText("Payment Amount", { exact: true }),

  /**
   * The selected payment method's display name, e.g. "CIMB Niaga Virtual
   * Account". Parameterized rather than hardcoded — a different payment
   * method would render different text here.
   */
  paymentMethodParagraph: (page: Page, methodName: string) =>
    page.getByRole("paragraph").filter({ hasText: methodName }),

  /**
   * The "Copy" button next to the generated VA number. There is no
   * captured locator for the VA number's own text — codegen only recorded
   * clicking this button, not which element holds the raw number.
   * Retrieval goes through clipboard-read after this click; see
   * PublicPaymentStatusPage.copyVirtualAccountNumber().
   */
  copyVaNumberButton: (page: Page) => page.getByRole("button", { name: "Copy" }),
};
