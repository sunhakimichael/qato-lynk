/**
 * What a completed purchase looked like from the buyer's side, captured
 * during the MyLink checkout so it can later be compared against the
 * creator's CMS Orders list and Order Details panel.
 *
 * All amounts are whole rupiah (e.g. 150000), parsed from the page — never
 * from test data — so the comparison checks what the buyer actually saw.
 */
export interface PurchaseRecord {
  /** Product name as shown on the checkout, e.g. "Kyoto Travel Guide 001". */
  itemName: string;
  /** Unit price of the item on the checkout. */
  itemPrice: number;
  /** Checkout "Subtotal" (sum of item prices). */
  subtotal: number;
  /** Checkout "Discount" (0 when no voucher). */
  discount: number;
  /** Checkout "Convenience fee" — paid by the buyer, NOT part of the creator's CMS total. */
  convenienceFee: number;
  /** Checkout "TOTAL" the buyer pays (subtotal - discount + convenience fee). */
  grandTotal: number;
  /** "Inv. Number" on the MyLink payment page — shown as "TRX ID" in the CMS. */
  trxId: string;
  /** Email the buyer checked out with (the member email). */
  customerEmail: string;
}

/**
 * The total the creator's CMS should show for this order: the item amount
 * after discount, excluding the convenience fee (verified on dev: checkout
 * TOTAL Rp 153,000 = Rp 150,000 + Rp 3,000 fee, CMS Total Rp 150,000).
 */
export function expectedCmsTotal(purchase: PurchaseRecord): number {
  return purchase.subtotal - purchase.discount;
}
