import type { Page, Locator } from "@playwright/test";
import { duitkuSandboxLocators } from "../../../locators/payment-providers/duitku/duitkuSandbox.locators";
import type { VirtualAccountPaymentProvider } from "../VirtualAccountPaymentProvider";

const DUITKU_SANDBOX_DEMO_URL = "https://sandbox.duitku.com/payment/demo/demosuccesstransaction.aspx";

export class DuitkuSandboxPage implements VirtualAccountPaymentProvider {
  /** channelLabel matches the exact text in Duitku's channel dropdown, e.g. "CIMB NIAGA VA". */
  constructor(
    private readonly page: Page,
    private readonly channelLabel: string = "CIMB NIAGA VA",
  ) {}

  async goto(): Promise<void> {
    await this.page.goto(DUITKU_SANDBOX_DEMO_URL);
  }

  async selectChannel(): Promise<void> {
    await duitkuSandboxLocators.displaySelect(this.page).click();
    await duitkuSandboxLocators.bankTransferOption(this.page).click();
    await duitkuSandboxLocators.paymentChannelOption(this.page, this.channelLabel).click();
  }

  async enterVaNumber(vaNumber: string): Promise<void> {
    await duitkuSandboxLocators.vaNumberInput(this.page).fill(vaNumber);
  }

  async clickCheck(): Promise<void> {
    await duitkuSandboxLocators.checkButton(this.page).click();
  }

  async enterTransferAmount(amount: string): Promise<void> {
    await duitkuSandboxLocators.transferAmountInput(this.page).fill(amount);
  }

  async clickPay(): Promise<void> {
    await duitkuSandboxLocators.payButton(this.page).click();
  }

  get successStatus(): Locator {
    return duitkuSandboxLocators.successStatus(this.page);
  }

  /**
   * Full flow, matching the order recorded in codegen: navigate to the
   * sandbox demo page, select the channel, enter the VA number, check it,
   * enter the transfer amount, and pay.
   *
   * ASSUMPTION (flagged, not invented): the recorded codegen for this step
   * was a separate test() block starting with a fresh `page.goto()` to
   * sandbox.duitku.com, distinct from the MyLink checkout session. This
   * implementation assumes same-tab navigation (matching the literal
   * recorded goto), not a new tab/window. If the real app actually opens
   * the payment provider in a new tab, this needs updating with
   * `context.waitForEvent('page')` handling — there's no way to confirm
   * that from the codegen provided.
   */
  async completeVirtualAccountPayment(vaNumber: string, transferAmount: string): Promise<void> {
    await this.goto();
    await this.selectChannel();
    await this.enterVaNumber(vaNumber);
    await this.clickCheck();
    await this.enterTransferAmount(transferAmount);
    await this.clickPay();
  }
}
