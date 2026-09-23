import type { PublicPaymentStatusPage } from "../pages/public/PublicPaymentStatusPage";
import type { VirtualAccountPaymentProvider } from "../pages/payment-providers/VirtualAccountPaymentProvider";

/**
 * Consolidates Virtual Account payment mechanics: reading values MyLink
 * displays, normalizing them for comparison, and driving a payment
 * provider — kept separate from journeys/purchase/ so the journey reads
 * as a clean sequence of steps rather than a mix of page-reading and
 * provider-driving logic.
 */
export class PaymentHelper {
  constructor(
    private readonly paymentStatusPage: PublicPaymentStatusPage,
    private readonly paymentProvider: VirtualAccountPaymentProvider,
  ) {}

  /**
   * Retrieves the generated VA number via MyLink's own "Copy" button +
   * clipboard read. See PublicPaymentStatusPage.copyVirtualAccountNumber()
   * for the full reasoning — this just delegates to it.
   */
  async getVirtualAccountNumber(): Promise<string> {
    return this.paymentStatusPage.copyVirtualAccountNumber();
  }

  /**
   * Reads the payment amount directly from MyLink's invoice section —
   * this is the source of truth, never test data or hardcoded config, so
   * the automation keeps working if prices, discounts, taxes, or
   * promotions change.
   *
   * Confirmed via two independent facts: the "Payment Amount" label is
   * captured in codegen (`getByText('Payment Amount', { exact: true })`),
   * and the numeric value itself was confirmed to appear within
   * `#invoiceSection` as period-separated digits (e.g. "88.000"). No
   * narrower locator exists for the value alone, so this reads the whole
   * section's text and extracts the number following the label — using
   * two confirmed facts together, not a guessed DOM structure. Throws
   * with the raw text included if the pattern isn't found, so a
   * mismatch surfaces loudly rather than silently returning garbage.
   */
  async getPaymentAmount(): Promise<string> {
    const invoiceSectionText = await this.paymentStatusPage.getInvoiceSectionText();
    return PaymentHelper.extractPaymentAmountFromText(invoiceSectionText);
  }

  /**
   * Pure extraction logic, separated from the page read above so it's
   * unit-testable without a browser. Looks for "Payment Amount" followed
   * by a run of digits/periods/commas (skipping anything in between,
   * e.g. an "IDR" or "Rp" prefix or line breaks).
   */
  static extractPaymentAmountFromText(invoiceSectionText: string): string {
    const match = invoiceSectionText.match(/Payment Amount[^\d]*([\d.,]+)/i);
    const amount = match?.[1];
    if (amount === undefined) {
      throw new Error(
        `Could not extract Payment Amount from the invoice section. Expected to find "Payment ` +
          `Amount" followed by a number, but no match was found. Raw text was: "${invoiceSectionText}"`,
      );
    }
    return amount;
  }

  /**
   * Strips currency symbols (IDR, Rp), thousand separators (both "," and
   * "." appear inconsistently as thousand separators in Indonesian
   * currency formatting), and whitespace — leaving a plain digit string
   * suitable for exact comparison. Pure function, no page interaction.
   */
  static normalizeCurrency(raw: string): string {
    return raw
      .replace(/(IDR|Rp)/gi, "")
      .replace(/[.,\s]/g, "")
      .trim();
  }

  /**
   * Normalizes the MyLink-sourced amount and pays via the configured
   * provider. The provider itself is responsible for verifying the
   * amount it actually entered matches what it was given — see
   * DuitkuSandboxPage.completeVirtualAccountPayment(), which reads its
   * own field back and throws PaymentMismatchError on any discrepancy.
   */
  async payViaDuitkuSandbox(vaNumber: string, mylinkAmount: string): Promise<void> {
    const normalizedAmount = PaymentHelper.normalizeCurrency(mylinkAmount);
    await this.paymentProvider.completeVirtualAccountPayment(vaNumber, normalizedAmount);
  }
}
