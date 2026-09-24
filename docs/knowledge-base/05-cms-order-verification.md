# 05 — CMS order verification (verified DOM)

Goal (user requirement): after a successful purchase, log in to the CMS as the creator → Orders →
find the new order → check it's listed with the right product → open **Details** → compare item
name, TRX ID (vs payment page), item price/total item, Total, customer email.

## Code

| Piece | File |
|---|---|
| journey | `journeys/creator/verifyOrderInCms.journey.ts` → `{ listEntry, details }` |
| login + open Orders | `journeys/creator/viewProductOrders.journey.ts` (login → sidebar Orders → `CmsOrdersPage.waitForLoad()`) |
| page object | `pages/cms/CmsOrdersPage.ts`: `waitForLoad`, `waitForOrder(trxId)`, `getOrderListEntry(trxId)`, `openOrderDetails(trxId)`, `getOrderDetails()` |
| locators | `locators/cms/ordersPage.locators.ts` |
| assertions | `assertions/cms/orderVerification.assertions.ts`: `expectOrderListedInCms`, `expectOrderDetailsMatchPurchase` (soft) |
| spec wiring | `tests/public/virtual-account-purchase.spec.ts` (step "Verify the order in CMS Orders") |

The spec runs the CMS part in a **separate `browser.newContext()`** (MyLink and CMS share the domain
`dev-lynk-id.pytavia.id`; keep buyer and creator sessions apart). A manually created context does
not inherit `playwright.config.ts` `use` options, so the spec sets default action/navigation
timeouts on that page itself. Tracing/video are not recorded for that context.

## Orders list — verified markup (`/admin/orders/home`)

Each order is a card `.op3-order-card` (`op3-order-success` / expired variants) containing a
checkbox carrying all key data:

```html
<input data-checkbox type="checkbox"
  data-order-id="6ab3c303…-1790165763946" data-transaction-id="6ab3c304…"
  data-source="DUITKU-B1" data-code="D775326PHIE1NQJ47H0A0C"
  data-ref-id="78ae0f6c87a7b6d8e0b4d96dc52af085"      ← = TRX ID = MyLink Inv. Number
  data-cust-email="qate.st.ing6.06@gmail.com" data-created-at="23 Sep 2026 19:15"
  data-product-type="content" data-status="SUCCESS" …>
```

Card text: `23 Sep 2026 19:15 SUCCESS Customer: <email> Kyoto Travel Guide 001 content Total Transactions Rp. 150,000 Details`.

- Card lookup: `.op3-order-card` filtered by `has: input[data-ref-id="<trxId>"]`. `waitForOrder()`
  reloads until it appears (up to `PAGE_LOAD_TIMEOUT_MS`). Newest first, 20 per page.
- **Each card has two "Details" links** (desktop `onclick="see_detail(...)"` + mobile
  `href="/admin/order/detail?id=<ref-id>&pg=1"`), one hidden → click `.filter({ visible: true })`.
- Default date filter: last 30 days.

## Order Details panel — verified markup

Opens on the right of the same page (no navigation). **The panel also exists twice** (desktop +
mobile) → all locators are scoped to `#orderDetailsContent` `.filter({ visible: true })`.

| Field | Locator | Example |
|---|---|---|
| vars | `[data-order-details-vars]` (`data-transaction-id`, `data-cust-email`, …) | |
| status | `#od_status` | `SUCCESS` |
| item name | `#od_title` | `Kyoto Travel Guide 001` |
| qty × price | `p` matching `^\d+ x Rp` | `1 x Rp. 150,000` |
| TRX ID | `#od_trxid` | `TRX ID: 78ae0f6c87a7b6d8e0b4d96dc52af085` |
| Total item | `#od_amnitem` (label `#od_ttlitem` "Total item (1 items)") | `Rp. 150,000` |
| addon / shipping | both `#od_ttlshipping` (duplicate id in app) | `Rp. 0` |
| discount | `#od_ttldiscount` | `- Rp. 0` |
| Total | `#od_ttltrx` | `Rp. 150,000` |
| customer | block with heading `Customer` | `qate.st.ing6.06@gmail.com` |

## Comparison rules

| CMS value | Compared with |
|---|---|
| list status / details status | `SUCCESS` |
| list `data-cust-email`, details email + Customer block | `purchase.customerEmail` |
| list card text contains / details `#od_title` | `purchase.itemName` |
| details TRX ID | `purchase.trxId` (MyLink Inv. Number) |
| details unit price | `purchase.itemPrice` |
| details Total item | `purchase.subtotal` |
| list Total Transactions, details Total | `expectedCmsTotal = subtotal − discount` |

**Convenience fee is excluded on the CMS side:** buyer paid Rp 153,000 (150,000 + 3,000 fee), CMS
Total shows Rp 150,000. If the business rule changes, edit `expectedCmsTotal()`.

## Verified

Run read-only against existing order `78ae0f6c…` (`qate.st.ing6.06@gmail.com`): **11/11 checks
PASS**, CMS part took ~162 s on a slow day. The chained purchase → CMS run in the spec is still
unexecuted.
