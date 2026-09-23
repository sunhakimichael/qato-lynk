import { expect, type Page } from "@playwright/test";
import { loadEnvConfig } from "@qato/shared";
import { duitkuSandboxLocators } from "../../../locators/payment-providers/duitku/duitkuSandbox.locators";
import type { VirtualAccountPaymentProvider } from "../VirtualAccountPaymentProvider";
import { PaymentMismatchError } from "../PaymentMismatchError";
import { PaymentHelper } from "../../../helpers/PaymentHelper";

const DUITKU_SANDBOX_DEMO_URL = "https://sandbox.duitku.com/payment/demo/demosuccesstransaction.aspx";
const PAYMENT_CATEGORY = "Bank Transfer";

export class DuitkuSandboxPage implements VirtualAccountPaymentProvider {
  /** channelLabel matches the exact text in Duitku's channel dropdown, e.g. "CIMB NIAGA VA". */
  constructor(
    private readonly page: Page,
    private readonly channelLabel: string = "CIMB NIAGA VA",
  ) {}

  /**
   * Waits for the full "load" event, not just DOMContentLoaded: the sandbox
   * uses Cloudflare Rocket Loader, which defers the page's own scripts
   * (including the payment-method dropdown handler) until after load.
   */
  async goto(): Promise<void> {
    await this.page.goto(DUITKU_SANDBOX_DEMO_URL, {
      waitUntil: "load",
      timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS,
    });
  }

  /** Opens the dropdown, picks the Bank Transfer category, then the channel (CIMB NIAGA VA). */
  async selectChannel(): Promise<void> {
    const category = duitkuSandboxLocators.paymentCategory(this.page, PAYMENT_CATEGORY);

    // A click that lands before Rocket Loader has run the dropdown script is
    // silently ignored, so keep opening it until the categories show up.
    // Only click while closed — clicking an open dropdown closes it again.
    await expect(async () => {
      if (!(await category.isVisible())) {
        await duitkuSandboxLocators.displaySelect(this.page).click();
      }
      await expect(category).toBeVisible({ timeout: 2_000 });
    }, "Duitku sandbox payment method dropdown should open").toPass({ timeout: loadEnvConfig().PAGE_LOAD_TIMEOUT_MS });

    await category.click();
    await duitkuSandboxLocators.paymentChannelOption(this.page, PAYMENT_CATEGORY, this.channelLabel).click();

    const selected = (await duitkuSandboxLocators.selectedChannelText(this.page).innerText()).trim();
    if (selected !== this.channelLabel) {
      throw new Error(`Duitku sandbox selected "${selected}" instead of "${this.channelLabel}".`);
    }
  }

  async enterVaNumber(vaNumber: string): Promise<void> {
    await duitkuSandboxLocators.vaNumberInput(this.page).fill(vaNumber);
  }

  /**
   * Submits the VA lookup and waits for the Transfer Amount field, which
   * only appears once Duitku recognises the VA. If Duitku shows an error
   * instead (unknown/expired VA), fails with that message.
   */
  async clickCheck(): Promise<void> {
    await duitkuSandboxLocators.checkButton(this.page).click();

    const amountInput = duitkuSandboxLocators.transferAmountInput(this.page);
    const errorLabel = duitkuSandboxLocators.errorLabel(this.page);
    await amountInput.or(errorLabel.filter({ hasText: /\S/ })).first().waitFor({ state: "visible" });

    if (!(await amountInput.isVisible())) {
      const message = (await errorLabel.innerText()).trim();
      throw new Error(`Duitku sandbox rejected the VA number on Check: "${message}"`);
    }
  }

  /** The "Amount" Duitku shows for this VA after Check, as plain digits ("Rp 153,000" -> "153000"). */
  async getBillAmount(): Promise<string> {
    const raw = await duitkuSandboxLocators.billAmountInput(this.page).inputValue();
    const amount = PaymentHelper.normalizeCurrency(raw);
    if (!/^\d+$/.test(amount)) {
      throw new Error(`Could not parse the Amount shown by Duitku sandbox: "${raw}"`);
    }
    return amount;
  }

  async enterTransferAmount(amount: string): Promise<void> {
    await duitkuSandboxLocators.transferAmountInput(this.page).fill(amount);
  }

  /** Reads back the transfer amount field's current value — used to verify the fill actually took effect. */
  async getEnteredTransferAmount(): Promise<string> {
    return duitkuSandboxLocators.transferAmountInput(this.page).inputValue();
  }

  /** Clicks Pay and waits for Duitku's "SUCCESS" message; fails with Duitku's error text otherwise. */
  async clickPay(): Promise<void> {
    await duitkuSandboxLocators.payButton(this.page).click();

    const success = duitkuSandboxLocators.successMessage(this.page);
    const errorLabel = duitkuSandboxLocators.errorLabel(this.page);
    await success.or(errorLabel.filter({ hasText: /\S/ })).first().waitFor({ state: "visible" });

    if (!(await success.isVisible())) {
      const message = (await errorLabel.innerText()).trim();
      throw new Error(`Duitku sandbox payment failed after Pay: "${message}"`);
    }
  }

  /**
   * Sandbox flow: open the demo page, choose Bank Transfer -> CIMB NIAGA
   * VA, enter the VA number, click Check, read the Amount Duitku shows,
   * enter exactly that as Transfer Amount, and click Pay.
   *
   * `expectedAmount` is the amount MyLink displayed (the source of truth).
   * Duitku's Amount must match it — a difference means the wrong invoice
   * or a fee mismatch, so PaymentMismatchError is thrown instead of paying.
   * The entered field is also read back before paying, to catch a silent
   * fill() failure or input masking.
   */
  async completeVirtualAccountPayment(vaNumber: string, expectedAmount: string): Promise<void> {
    await this.goto();
    await this.selectChannel();
    await this.enterVaNumber(vaNumber);
    await this.clickCheck();

    const billAmount = await this.getBillAmount();
    if (billAmount !== expectedAmount) {
      throw new PaymentMismatchError(expectedAmount, billAmount);
    }

    await this.enterTransferAmount(billAmount);
    const enteredAmount = (await this.getEnteredTransferAmount()).replace(/[.,\s]/g, "");
    if (enteredAmount !== billAmount) {
      throw new PaymentMismatchError(billAmount, enteredAmount);
    }

    await this.clickPay();
  }
}
