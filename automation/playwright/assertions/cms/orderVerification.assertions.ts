import { expect } from "@playwright/test";
import type { CmsOrderDetails, CmsOrderListEntry } from "../../pages/cms/CmsOrdersPage";
import { expectedCmsTotal, type PurchaseRecord } from "../../journeys/purchase/purchaseRecord";

/**
 * The order's card in the CMS Orders list matches the purchase: paid, same
 * customer, same product, and the creator's total (excluding the buyer's
 * convenience fee). Soft assertions, so every mismatch is reported at once.
 */
export function expectOrderListedInCms(entry: CmsOrderListEntry, purchase: PurchaseRecord): void {
  expect.soft(entry.status, "Order status in the CMS list").toBe("SUCCESS");
  expect.soft(entry.customerEmail, "Customer email in the CMS list").toBe(purchase.customerEmail);
  expect.soft(entry.cardText, "Product name in the CMS list").toContain(purchase.itemName);
  expect.soft(entry.total, "Total Transactions in the CMS list").toBe(expectedCmsTotal(purchase));
}

/** The CMS Order Details panel matches what the buyer saw on MyLink. */
export function expectOrderDetailsMatchPurchase(details: CmsOrderDetails, purchase: PurchaseRecord): void {
  expect.soft(details.status, "Order Details status").toBe("SUCCESS");
  expect.soft(details.itemName, "Order Details item name").toBe(purchase.itemName);
  expect.soft(details.trxId, "Order Details TRX ID vs MyLink Inv. Number").toBe(purchase.trxId);
  expect.soft(details.itemPrice, "Order Details item price").toBe(purchase.itemPrice);
  expect.soft(details.itemTotal, "Order Details Total item vs checkout Subtotal").toBe(purchase.subtotal);
  expect.soft(details.total, "Order Details Total vs checkout Subtotal - Discount").toBe(expectedCmsTotal(purchase));
  expect.soft(details.customerEmail, "Order Details customer email").toBe(purchase.customerEmail);
  expect.soft(details.customerText, "Order Details Customer block").toContain(purchase.customerEmail);
}
