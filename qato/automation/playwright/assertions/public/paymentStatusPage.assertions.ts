import { expect } from "@playwright/test";
import type { PublicPaymentStatusPage } from "../../pages/public/PublicPaymentStatusPage";

/** Matches the 3 recorded codegen assertions after a successful guest checkout. */
export async function expectPaymentConfirmed(
  paymentStatusPage: PublicPaymentStatusPage,
): Promise<void> {
  await expect(paymentStatusPage.invoiceNumberText).toBeVisible();
  await expect(paymentStatusPage.transactionDateText).toBeVisible();
  await expect(paymentStatusPage.checkTransactionButton).toBeVisible();
}

/** Matches the 3 recorded assertions confirming VA payment details are displayed. */
export async function expectVirtualAccountPaymentDisplayed(
  paymentStatusPage: PublicPaymentStatusPage,
  methodName: string,
): Promise<void> {
  await expect(paymentStatusPage.productsLabelText).toBeVisible();
  await expect(paymentStatusPage.paymentAmountLabelText).toBeVisible();
  await expect(paymentStatusPage.paymentMethodParagraph(methodName)).toBeVisible();
}
