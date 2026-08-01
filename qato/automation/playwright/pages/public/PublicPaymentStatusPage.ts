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

  async clickCheckTransaction(): Promise<void> {
    await publicPaymentStatusLocators.checkTransactionButton(this.page).click();
  }

  get productsLabelText(): Locator {
    return publicPaymentStatusLocators.productsLabelText(this.page);
  }

  get paymentAmountLabelText(): Locator {
    return publicPaymentStatusLocators.paymentAmountLabelText(this.page);
  }

  /** `methodName` e.g. "CIMB Niaga Virtual Account" — see locator comment for why this is parameterized. */
  paymentMethodParagraph(methodName: string): Locator {
    return publicPaymentStatusLocators.paymentMethodParagraph(this.page, methodName);
  }

  /**
   * Retrieves the generated Virtual Account number via the page's own
   * "Copy" button + a clipboard read, rather than a text locator — none
   * was captured in codegen (only the button click was recorded). Grants
   * clipboard-read/write permissions on the browser context immediately
   * before use, since the page's own Copy button implementation likely
   * needs clipboard-write to function, and reading the result needs
   * clipboard-read.
   *
   * Reliable in Chromium only, which matches this framework's default
   * (no browserName is set anywhere in this project, so Chromium is used
   * throughout — see playwright.config.ts).
   */
  async copyVirtualAccountNumber(): Promise<string> {
    await this.page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await publicPaymentStatusLocators.copyVaNumberButton(this.page).click();
    return this.page.evaluate(() => navigator.clipboard.readText());
  }
}
