/**
 * Thrown whenever an amount actually used for payment doesn't match the
 * amount it was supposed to be sourced from. Any VirtualAccountPaymentProvider
 * implementation can throw this — it's not Duitku-specific.
 */
export class PaymentMismatchError extends Error {
  constructor(expectedAmount: string, actualAmount: string) {
    super(
      `Payment amount mismatch: expected "${expectedAmount}" but the payment provider recorded ` +
        `"${actualAmount}". The amount used for payment must always be sourced from MyLink — ` +
        `never from test data or hardcoded config — and must match exactly what was entered.`,
    );
    this.name = "PaymentMismatchError";
  }
}
