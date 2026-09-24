# 03 — MyLink purchase flow (verified DOM)

Journey: `journeys/purchase/completeVirtualAccountPurchase.journey.ts` (full VA flow) and
`guestCheckout.journey.ts` (stops at the payment page). Both share the same checkout steps.

```
Storefront /qamike ──click product──▶ Product detail /qamike/<hash> ──Buy Now──▶
Checkout /qamike/<hash>/checkout?type=detail&token=… ──fill email, pick CIMB, confirm,
read order summary, tick 2 boxes, "Buy Now - IDR …"──▶ Payment page /checkout/payme?token=…
──(onPaymentPageReady assertions, read VA + amount + Inv. Number)──▶ Duitku sandbox (new tab, see 04)
──▶ back on MyLink tab: "Check Transaction" ──▶ Thank You /payment-thankyou
```

## Slow-page handling (`helpers/waitForPageReady.ts`)

- `gotoSlowPage(page, url)` → `page.goto(url, { waitUntil: "domcontentloaded", timeout: PAGE_LOAD_TIMEOUT_MS })`.
  (Waiting for `load` hangs on heavy pages: YouTube embeds, TikTok, many scripts.)
- `waitForPageReady(page, keyLocator, { pageName, reloadOnTimeout })` waits up to
  `PAGE_LOAD_TIMEOUT_MS` for the key element; optionally reloads **once**; then throws a clear
  `"<page> page did not finish loading within …ms. URL: …"` error.
- Reload is only enabled for pages where a reload is a harmless GET.

| Page | Page object | Key element | Reload? |
|---|---|---|---|
| Storefront | `PublicStorefrontPage.goto()` / `clickProduct()` | `menu-white` button, then product link | yes |
| Product detail | `PublicProductDetailPage.waitForLoad()` (called by `clickBuyNow`) | `Buy Now` button | yes |
| Checkout | `PublicCheckoutPage.waitForLoad()` | URL `/checkout` + `* Email` textbox | yes |
| Payment page | `PublicPaymentStatusPage.waitForLoad()` | URL `/checkout/payme` + `#invoiceSection` | **no** (reached right after submit) |
| CMS login/dashboard/orders | see 05 | | yes |

## Checkout page — verified markup

Payment method list (opened by `Select payment method secure` button) is grouped
(`li.checkout-payment-method-group` → Instant Payment, Virtual Account, Credit cards, Others).
Each option:

```html
<input type="radio" name="payment_method" value="b1" id="payment-method-IDR-b1" class="… sr-only">
<label for="payment-method-IDR-b1" data-payment-card="b1" …><img alt="CIMB"></label>
```

Codes seen: `sp` QRIS, `sa` ShopeePay, `ov` OVO, `da` Dana, `bc` BCA, `bt` Permata, `br` BRI,
`bv` BSI, **`b1` CIMB**, `i1` BNI, `m2` Mandiri, `va` Maybank, `mc` Master, `visa`, `a1` ATM
Bersama, `ft` Retail.

- **Always CIMB:** `PublicCheckoutPage.selectCimbNiagaVirtualAccount()` clicks
  `label[data-payment-card="b1"]` and asserts `input[type="radio"][name="payment_method"][value="b1"]`
  is checked. Constant `PAYMENT_METHOD_CODES.CIMB_NIAGA_VA` in `locators/public/checkoutPage.locators.ts`.
  - The old positional selector `li:nth-child(6) > .cursor-pointer` actually selected **BNI**.
  - `type="radio"` matters: there is also a hidden `<input name="payment_method">` mirroring the value.
  - Other methods fail in the sandbox — user requirement: never pick anything else.
- Then `Confirm Method` button, `⁠I agree to the Terms of Use` checkbox (leading U+2060!),
  `#agree_detail` checkbox, submit `Buy Now - IDR …`.

Order summary (`PublicCheckoutPage.getOrderSummary()`, called right after `confirmPaymentMethod()`):

| Field | Locator | Example |
|---|---|---|
| item name | `li:has(#prc) p.line-clamp-2` (first) | `Kyoto Travel Guide 001` |
| item price | `#prc` (first) | `150,000` |
| subtotal | `input[data-subtotalamount]` value | `150000` |
| discount | `input[data-discountamount]` value | `0` |
| convenience fee | `input[data-feeamount]` value | `3000` after CIMB chosen (0 before) |
| grand total | `[data-grandtotal]` text | `Rp 153,000` |

The fee is recalculated by `GET /v1/api/payments/calc-con-fee?value=150000&type=B1&ow0=qamike`
after the method is chosen; `getOrderSummary()` waits for that response, then polls until
`TOTAL == subtotal − discount + fee`.

## Submit + Cloudflare 429 retry (`PublicCheckoutPage.submitPurchase()`)

Clicking `Buy Now - IDR …` fires `POST /v4/api/payments/integrations/duitku/inquiry` (creates the
VA). When Cloudflare rate-limits it (HTTP 429, "Error 1015", `retry-after: 10`), **the checkout
shows no error and just sits there**. So `submitPurchase()`:

1. Races the inquiry response vs navigation to `/checkout/payme`.
2. On 429: logs a warning, waits `retry-after` (`helpers/retryAfter.ts`: seconds or HTTP date,
   default 30 s, max 60 s), clicks again (`MAX_SUBMIT_ATTEMPTS = 2`).
3. Second 429 → `CheckoutRateLimitedError` (`pages/public/CheckoutRateLimitedError.ts`).

Proven in a real run (waited 9 s, retried, succeeded). Open question for backend: does the second
click risk a duplicate order? Earlier requests (`addon/proceed`, `api/c/sc1`, …) did succeed before
the blocked inquiry. If yes, set `MAX_SUBMIT_ATTEMPTS = 1`.

## Payment page (`/checkout/payme`)

- `#invoiceSection` innerText, e.g.
  `Inv. Number:\n02c150e89a3864fe53de8ae39aa916b6\n09:56\nTrx. Date:\n23-Sep-2026\n\nPayment Amount\n\n153.000`.
- `PaymentHelper.getPaymentAmount()` → `153.000`; `PublicPaymentStatusPage.getInvoiceNumber()` →
  the 32-hex **Inv. Number = CMS TRX ID** (`PaymentHelper.extractInvoiceNumberFromText`).
- VA number: page's `Copy` button + clipboard read (Chromium only).
- Payment method text: paragraph `CIMB Niaga Virtual Account`; bank code `022`.
- Assertions on this page must run **before paying** — the tab later becomes the Thank You page.
  Use the journey option `onPaymentPageReady(paymentStatusPage)` (the spec does this for
  `expectVirtualAccountPaymentDisplayed`).
- After the Duitku payment: `Check Transaction` button → Thank You page
  (`Your purchase was successful`, receipt email, order summary incl. convenience fee).

## `PurchaseRecord` (`journeys/purchase/purchaseRecord.ts`)

Returned as `result.purchase` by `completeVirtualAccountPurchase()` and attached to the report as
`purchase-record`:

```ts
{ itemName, itemPrice, subtotal, discount, convenienceFee, grandTotal, trxId, customerEmail }
```

`expectedCmsTotal(p) = p.subtotal - p.discount` (the creator's total excludes the buyer's fee).
