/**
 * Generic contract for completing a Virtual Account payment, regardless of
 * which provider (Duitku, or something else later) actually implements it.
 *
 * journeys/purchase/completeVirtualAccountPurchase.journey.ts depends on
 * this interface, not on any concrete provider — replacing Duitku with a
 * different provider means writing a new class that implements this same
 * method, with zero changes to the journey or anything upstream of it.
 */
export interface VirtualAccountPaymentProvider {
  completeVirtualAccountPayment(vaNumber: string, transferAmount: string): Promise<void>;
}
