# 06 — Known issues & troubleshooting

## How to analyze a failed run (`automation/playwright/test-results/`)

The user usually asks: *"coba periksa error yang terjadi sesuai file hasil pengujian di folder
automation/playwright/test-results"*. Procedure that worked:

1. `cat test-results/.last-run.json`, list `test-results/<test-dir>/`.
2. Read `test-failed-1.png` (screenshot) and `error-context.md` (ARIA snapshot of the **main** page
   at failure — note: if the failure happened in another tab, e.g. Duitku, the snapshot still
   shows the MyLink tab).
3. Unzip `trace.zip` into the scratchpad and parse JSON lines:
   - `test.trace`: `type=before` (`callId`, `title`, `params`) and `type=after` with `error` → the
     step list + the failing step.
   - `0-trace.trace`: browser-level calls, `console` events (`messageType`, `text`), results (e.g.
     clipboard VA number, invoice text).
   - `0-trace.network`: HAR-like `snapshot.request/response` (status, headers like
     `retry-after`, `cf-ray`), bodies in `resources/<_sha1>`.
4. Look at requests after the last successful action — most root causes were visible there.

## Environment issues (dev = `dev-lynk-id.pytavia.id`)

| Symptom | Cause | Handling |
|---|---|---|
| After "Buy Now - IDR", page never moves to `/checkout/payme`; no error on screen | Cloudflare **429 Error 1015** on `POST …/duitku/inquiry` | 1 automatic retry after `retry-after`, then `CheckoutRateLimitedError` (see 03). Long-term: ask infra to exempt automation traffic on dev/staging. |
| Console: WebSocket `socket.io` 429/502, `POST /v1/api/conversion/addtocart` 500 | dev instability | Non-blocking so far |
| `page.goto: Timeout … waiting until "load"` (CMS login, storefront) | heavy/slow pages | `gotoSlowPage` (`domcontentloaded`) + `waitForPageReady` |
| CMS dashboard/orders `goto` timeouts (≥120 s) | very slow server; Orders was also loaded twice | fixed double-load; slow-load helper on CMS pages |
| Login step errors right after many runs | likely throttling from repeated logins | wait a few minutes before retrying |

## Automation gotchas (all fixed, keep in mind for new pages)

- **Duplicate responsive elements** (CMS Details links, Details panel): always filter
  `{ visible: true }` or you get strict-mode violations.
- **Hidden mirror inputs** (checkout `payment_method`): scope by `type="radio"`.
- **Positional selectors lie**: `li:nth-child(6)` = BNI, `data-value="VA"` = Maybank.
- **Rocket Loader (Duitku)**: wait for `load`, retry opening dropdowns.
- **Assert before navigating away**: payment-page assertions via `onPaymentPageReady`.
- **Test timeout**: must cover several slow pages; use `TEST_TIMEOUT_MS`, never per-test
  `test.setTimeout` (removed from `tests/cms/login.spec.ts`).
- **`page.evaluate` with tsx**: helper functions declared inside `evaluate` callbacks can fail with
  `__name is not defined` (esbuild keepNames). Prefer plain locators over in-page DOM walking.
- **Clipboard**: VA read via `Copy` + `navigator.clipboard.readText()` — Chromium only.

## Leftovers worth knowing

- `CmsOrdersPage.goto()` and `CmsDashboardPage.goto()` contain user-added `console.log`
  (Navigating/Status/Final URL) debug lines — kept intentionally.
- `#od_ttlshipping` id is duplicated in the app (addon + shipping rows).
- `docs/ENGINEERING.md` still describes `TEST_PAYMENT_METHOD_POSITION` historically (ADR text);
  README row was updated.
