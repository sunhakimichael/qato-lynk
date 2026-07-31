import type { Page } from "@playwright/test";

export const publicPaymentStatusLocators = {
  invoiceNumberText: (page: Page) => page.getByText("Inv. Number:"),
  transactionDateText: (page: Page) => page.getByText("Trx. Date:"),
  checkTransactionButton: (page: Page) => page.getByRole("button", { name: "Check Transaction" }),
};
