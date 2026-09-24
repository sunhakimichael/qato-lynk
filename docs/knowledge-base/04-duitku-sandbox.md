# 04 — Duitku sandbox payment (verified DOM)

Page object: `pages/payment-providers/duitku/DuitkuSandboxPage.ts`
Locators: `locators/payment-providers/duitku/duitkuSandbox.locators.ts`
URL: `https://sandbox.duitku.com/payment/demo/demosuccesstransaction.aspx` (ASP.NET WebForms, postbacks).

## Steps the user specified

1. Choose payment method: **Bank Transfer → CIMB NIAGA VA**.
2. Enter the VA number, click **Check**.
3. An **Amount** appears — enter the same value as **Transfer Amount**, click **Pay**.

## Implementation (`completeVirtualAccountPayment(vaNumber, expectedAmount)`)

| Step | Locator / behavior |
|---|---|
| open | `goto(..., { waitUntil: "load" })` — **must be `load`**, see Rocket Loader below |
| open dropdown | `#selectDisplay`, retried via `expect(...).toPass()` until the category is visible (click only while closed) |
| category | `#selectDropdown .category` with exact text `Bank Transfer` |
| channel | `#selectDropdown .item[data-category="Bank Transfer"]` exact text `CIMB NIAGA VA` (`data-value="B1"`); then asserts `#selectedText` == label. Hidden field `#hfPaymentMethod` becomes `B1`. |
| VA | `#TextBoxOrderId` (placeholder "Enter Virtual Account Number") |
| Check | `#Button1`; waits for `#TextBoxAnount` **or** a non-empty `#LabelError` |
| Amount | `#TextBoxAmount` (read-only, e.g. `Rp 153,000`) → normalized `153000` |
| compare | Duitku Amount must equal MyLink Payment Amount → else `PaymentMismatchError` |
| Transfer Amount | `#TextBoxAnount` (**sic**, Duitku's typo) — filled, then read back and compared |
| Pay | `#Button2`; waits for exact text `SUCCESS` (green box) or `#LabelError` |

Other fields after Check: `#TextBoxPaymentMethod` ("CIMB NIAGA VA"), `#TextBoxName` ("devlinkid"),
`#TextBoxDescription`, `#TextBoxInfoText`, `#Button3` (Back).

## Gotchas found

- **Old channel selector was wrong:** `.item[data-value="VA"]` is **MAYBANK VA**, not CIMB.
- **Cloudflare Rocket Loader** (`rocket-loader.min.js`) defers the page's own scripts until after
  `load`. A click on `#selectDisplay` right after DOMContentLoaded is silently ignored → categories
  never appear. Fix = `waitUntil: "load"` + the open-until-visible retry.
- Unknown/expired VA → `#LabelError`: `Object reference not set to an instance of an object.`
- The sandbox opens in a **new tab** (`page.context().newPage()`), closed afterwards; the MyLink
  payment tab is brought back to front for `Check Transaction`.
- Other channel codes in the dropdown: `BT` Permata, `A1` ATM Bersama, `I1` BNI, `M2` Mandiri,
  `BC` BCA, `BR` BRI, `BV` BSI, … (QRIS/Retail/E-Commerce categories also exist).

## Verified

- VA `1199016372289005` was paid manually via this page object on 2026-09-23 (user-approved):
  Amount `Rp 153,000` → `153000` → **SUCCESS**.
- Channel selection re-tested 3/3 after the Rocket Loader fix.
