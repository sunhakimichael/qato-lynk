import type { Page, Locator } from "@playwright/test";
import { publicPaymentStatusLocators } from "../../locators/public/paymentStatusPage.locators";

export class PublicPaymentStatusPage {
  constructor(private readonly page: Page) {}

  /**
   * Waits for the post-purchase redirect to the payment/invoice page.
   *
   * The recorded codegen script literally `page.goto()`'d a one-time
   * payment token URL (`/checkout/payme?token=...`). Replaying that exact
   * URL would fail immediately — the token is single-use and already
   * consumed by the recording session. Waiting for the URL pattern after
   * PublicCheckoutPage.submitPurchase() reflects the actual behavior (a
   * client-side redirect after purchase) without hardcoding a dead token.
   * This is the one place in this milestone where the recorded step
   * couldn't be replayed literally.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL(/\/checkout\/payme/);
  }

  get invoiceNumberText(): Locator {
    return publicPaymentStatusLocators.invoiceNumberText(this.page);
  }

  get transactionDateText(): Locator {
    return publicPaymentStatusLocators.transactionDateText(this.page);
  }

  get checkTransactionButton(): Locator {
    return publicPaymentStatusLocators.checkTransactionButton(this.page);
  }
}
