import { expect, type Page, type Response } from "@playwright/test";
import { publicCheckoutLocators, PAYMENT_METHOD_CODES } from "../../locators/public/checkoutPage.locators";
import { waitForPageReady } from "../../helpers/waitForPageReady";
import { loadEnvConfig } from "@qato/shared";
import { parseRetryAfterMs } from "../../helpers/retryAfter";
import { CheckoutRateLimitedError } from "./CheckoutRateLimitedError";
import { PaymentHelper } from "../../helpers/PaymentHelper";
import type { PurchaseRecord } from "../../journeys/purchase/purchaseRecord";

/** Checkout amounts and item, as the buyer saw them before paying. */
export type CheckoutOrderSummary = Omit<PurchaseRecord, "trxId" | "customerEmail">;

/** Recalculates the convenience fee once a payment method is chosen. */
const CONVENIENCE_FEE_URL = /\/payments\/calc-con-fee/;
/** The request that creates the VA at Duitku once "Buy Now" is clicked. */
const PAYMENT_INQUIRY_URL = /\/payments\/integrations\/duitku\/inquiry/;
const PAYMENT_PAGE_URL = /\/checkout\/payme/;
/** First try plus one retry after a Cloudflare 429. */
const MAX_SUBMIT_ATTEMPTS = 2;

export class PublicCheckoutPage {
  /** Settles once the fee for the chosen payment method has been calculated (or timed out). */
  private feeCalculated: Promise<unknown> = Promise.resolve();

  constructor(private readonly page: Page) {}

  /**
   * Waits for the checkout page after clicking Buy Now, which can take a
   * long time. Reloading is safe here: the checkout URL is a plain GET
   * and nothing has been submitted yet.
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForURL(/\/checkout/, { timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS, waitUntil: "domcontentloaded" });
    await waitForPageReady(this.page, publicCheckoutLocators.emailInput(this.page), {
      pageName: "Checkout",
      reloadOnTimeout: true,
    });
  }

  async fillEmail(email: string): Promise<void> {
    await publicCheckoutLocators.emailInput(this.page).fill(email);
  }

  async openPaymentMethodSelector(): Promise<void> {
    await publicCheckoutLocators.selectPaymentMethodButton(this.page).click();
  }

  /**
   * Always selects CIMB Niaga Virtual Account — the only payment method
   * that works end-to-end in the sandbox. Selected by its checkout code
   * (not list position), then verified as checked so a wrong bank can
   * never be submitted silently.
   */
  async selectCimbNiagaVirtualAccount(): Promise<void> {
    const code = PAYMENT_METHOD_CODES.CIMB_NIAGA_VA;
    const option = publicCheckoutLocators.paymentMethodOption(this.page, code);
    await waitForPageReady(this.page, option, { pageName: "Checkout payment method list" });
    this.feeCalculated = this.page
      .waitForResponse((res) => CONVENIENCE_FEE_URL.test(res.url()), { timeout: loadEnvConfig().DEFAULT_ACTION_TIMEOUT_MS })
      .catch(() => undefined);
    await option.click();
    await expect(
      publicCheckoutLocators.paymentMethodRadio(this.page, code),
      "CIMB Niaga Virtual Account should be selected",
    ).toBeChecked();
  }

  async confirmPaymentMethod(): Promise<void> {
    await publicCheckoutLocators.confirmMethodButton(this.page).click();
  }

  /**
   * Reads the item and PAYMENT DETAIL amounts. Call after the payment
   * method is confirmed: the convenience fee (and so TOTAL) only settles
   * once the fee for that method has been calculated, so this waits for
   * that request and then for TOTAL to equal subtotal - discount + fee.
   */
  async getOrderSummary(): Promise<CheckoutOrderSummary> {
    await this.feeCalculated;

    const read = async (): Promise<CheckoutOrderSummary> => ({
      itemName: (await publicCheckoutLocators.itemName(this.page).innerText()).trim(),
      itemPrice: PaymentHelper.parseRupiah(await publicCheckoutLocators.itemPrice(this.page).innerText()),
      subtotal: PaymentHelper.parseRupiah(await publicCheckoutLocators.subtotalAmount(this.page).inputValue()),
      discount: PaymentHelper.parseRupiah(await publicCheckoutLocators.discountAmount(this.page).inputValue()),
      convenienceFee: PaymentHelper.parseRupiah(
        await publicCheckoutLocators.convenienceFeeAmount(this.page).inputValue(),
      ),
      grandTotal: PaymentHelper.parseRupiah(await publicCheckoutLocators.grandTotal(this.page).innerText()),
    });

    let summary = await read();
    await expect
      .poll(
        async () => {
          summary = await read();
          return summary.grandTotal - (summary.subtotal - summary.discount + summary.convenienceFee);
        },
        { message: "Checkout TOTAL should equal subtotal - discount + convenience fee" },
      )
      .toBe(0);
    return summary;
  }

  async acceptTermsOfUse(): Promise<void> {
    await publicCheckoutLocators.termsCheckbox(this.page).check();
  }

  async acceptCommunicationConsent(): Promise<void> {
    await publicCheckoutLocators.communicationConsentCheckbox(this.page).check();
  }

  /**
   * Clicks "Buy Now" and watches the payment inquiry request. If Cloudflare
   * answers it with HTTP 429 (rate limit), waits for Retry-After and clicks
   * once more — safe because the blocked request never reached MyLink, so
   * no VA was created. A second 429 throws CheckoutRateLimitedError right
   * away instead of timing out on the payment page.
   */
  async submitPurchase(): Promise<void> {
    for (let attempt = 1; attempt <= MAX_SUBMIT_ATTEMPTS; attempt += 1) {
      const outcome = this.waitForSubmitOutcome();
      await publicCheckoutLocators.submitPurchaseButton(this.page).click();
      const response = await outcome;

      if (response?.status() !== 429) {
        // Navigated, inquiry accepted, or nothing observed — the payment
        // page's own waitForLoad() takes it from here.
        return;
      }
      if (attempt === MAX_SUBMIT_ATTEMPTS) {
        throw new CheckoutRateLimitedError(attempt, response.url());
      }

      const waitMs = parseRetryAfterMs((await response.headerValue("retry-after")) ?? undefined);
      console.warn(`Payment inquiry rate-limited (HTTP 429); retrying "Buy Now" in ${waitMs}ms.`);
      await this.page.waitForTimeout(waitMs);
    }
  }

  /**
   * Resolves with the payment inquiry response, or undefined once the page
   * has moved to the payment page (or nothing happened within the page
   * load timeout). Must be started before the click so the response isn't
   * missed.
   */
  private waitForSubmitOutcome(): Promise<Response | undefined> {
    const timeout = loadEnvConfig().PAGE_LOAD_TIMEOUT_MS;
    const inquiry = this.page
      .waitForResponse((res) => PAYMENT_INQUIRY_URL.test(res.url()) && res.request().method() === "POST", {
        timeout,
      })
      .catch(() => undefined);
    const navigated = this.page
      .waitForURL(PAYMENT_PAGE_URL, { timeout, waitUntil: "commit" })
      .then(() => undefined)
      .catch(() => undefined);
    return Promise.race([inquiry, navigated]);
  }
}
