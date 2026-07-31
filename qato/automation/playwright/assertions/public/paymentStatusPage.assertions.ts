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
