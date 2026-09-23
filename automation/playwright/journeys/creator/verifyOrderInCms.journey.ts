import type { Page } from "@playwright/test";
import { viewProductOrders } from "./viewProductOrders.journey";
import type { CreatorCredentials } from "../authentication/loginAsCreator.journey";
import type { CmsOrderDetails, CmsOrderListEntry } from "../../pages/cms/CmsOrdersPage";
import type { PurchaseRecord } from "../purchase/purchaseRecord";

export interface CmsOrderVerificationResult {
  listEntry: CmsOrderListEntry;
  details: CmsOrderDetails;
}

/**
 * Creator side of a purchase: logs in to the CMS, opens Orders, finds the
 * order by its TRX ID (MyLink's Inv. Number), reads its list card, then
 * opens Details and reads the panel. Returns what the CMS shows — compare
 * it against the PurchaseRecord with expectOrderListedInCms() and
 * expectOrderDetailsMatchPurchase().
 *
 * Use a page from a separate browser context from the buyer's: MyLink and
 * the CMS share a domain, and the creator session should not mix with the
 * guest checkout session.
 */
export async function verifyOrderInCms(
  page: Page,
  purchase: PurchaseRecord,
  credentials?: CreatorCredentials,
): Promise<CmsOrderVerificationResult> {
  const ordersPage = await viewProductOrders(page, credentials);

  const listEntry = await ordersPage.getOrderListEntry(purchase.trxId);
  await ordersPage.openOrderDetails(purchase.trxId);
  const details = await ordersPage.getOrderDetails();

  return { listEntry, details };
}
