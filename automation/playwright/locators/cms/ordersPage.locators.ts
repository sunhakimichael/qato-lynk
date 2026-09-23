import type { Page } from "@playwright/test";

/**
 * CMS Product Orders list + Order Details panel. Structure verified against
 * dev on 2026-09-23:
 * - each order is a `.op3-order-card` holding a checkbox input with the
 *   order's data attributes (data-ref-id = TRX ID, data-cust-email,
 *   data-status);
 * - each card has TWO "Details" links (desktop + mobile layout), only one
 *   of them visible;
 * - Details opens the panel on the right (#orderDetailsContent) on the
 *   same page, with stable `od_*` ids.
 */
export const cmsOrdersLocators = {
  productOrdersHeading: (page: Page) => page.getByRole("heading", { name: "Product Orders" }),

  /** The order card whose TRX ID (data-ref-id) matches. */
  orderCardByTrxId: (page: Page, trxId: string) =>
    page.locator(".op3-order-card").filter({ has: page.locator(`input[data-ref-id="${trxId}"]`) }),
  /** The data-carrying checkbox inside an order card. */
  orderCardData: (page: Page, trxId: string) => page.locator(`.op3-order-card input[data-ref-id="${trxId}"]`),

  /**
   * The visible Order Details panel. Like the Details links, the panel
   * exists twice (desktop + mobile layout), so everything below is scoped
   * to the visible one.
   */
  orderDetailsContent: (page: Page) => page.locator("#orderDetailsContent").filter({ visible: true }),
  orderDetailsPanel: (page: Page, trxId: string) =>
    cmsOrdersLocators.orderDetailsContent(page).filter({ has: page.locator(`[data-transaction-id="${trxId}"]`) }),
  orderDetailsVars: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("[data-order-details-vars]"),
  orderDetailsStatus: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("#od_status"),
  orderDetailsItemName: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("#od_title"),
  /** Line under the item name, e.g. "1 x Rp. 150,000". */
  orderDetailsItemLine: (page: Page) =>
    cmsOrdersLocators.orderDetailsContent(page).locator("p").filter({ hasText: /^\s*\d+\s*x\s*Rp/ }).first(),
  /** e.g. "TRX ID: 78ae0f6c87a7b6d8e0b4d96dc52af085". */
  orderDetailsTrxId: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("#od_trxid"),
  /** "Total item (n items)" amount. */
  orderDetailsItemTotal: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("#od_amnitem"),
  orderDetailsTotal: (page: Page) => cmsOrdersLocators.orderDetailsContent(page).locator("#od_ttltrx"),
  /** Customer block: the innermost container holding the "Customer" heading. */
  orderDetailsCustomer: (page: Page) =>
    cmsOrdersLocators
      .orderDetailsContent(page)
      .locator("div")
      .filter({ has: page.getByText("Customer", { exact: true }) })
      .last(),
};
