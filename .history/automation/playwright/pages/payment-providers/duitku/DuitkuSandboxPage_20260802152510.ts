import type { Page, Locator } from "@playwright/test";
import { duitkuSandboxLocators } from "../../../locators/payment-providers/duitku/duitkuSandbox.locators";
import type { VirtualAccountPaymentProvider } from "../VirtualAccountPaymentProvider";
import { PaymentMismatchError } from "../PaymentMismatchError";

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

  /** Reads back the transfer amount field's current value — used to verify the fill actually took effect. */
  async getEnteredTransferAmount(): Promise<string> {
    return duitkuSandboxLocators.transferAmountInput(this.page).inputValue();
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
   * enter the transfer amount, VERIFY it actually landed correctly, and
   * only then pay.
   *
   * The verification step reads the field back via getEnteredTransferAmount()
   * and throws PaymentMismatchError if it doesn't match what was supposed
   * to be entered — this catches a silent fill() failure or any input
   * masking Duitku's form might apply, rather than assuming the write
   * succeeded and proceeding to pay an unverified amount.
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

    const enteredAmount = await this.getEnteredTransferAmount();
    if (enteredAmount !== transferAmount) {
      throw new PaymentMismatchError(transferAmount, enteredAmount);
    }

    await this.clickPay();
  }
}
