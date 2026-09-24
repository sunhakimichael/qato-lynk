# 07 — Guidelines for agents working here

## About the user

- QA automation engineer on Lynk.id (git user `MikeRay`). Writes in **Indonesian** (often mixed
  with English terms). Reply in Indonesian, keep code/comments/docs in English like the codebase.
- Gives step-by-step business requirements ("pilih Bank Transfer lalu pilih CIMB NIAGA VA …") and
  expects them implemented exactly, then verified.
- Frequently asks to diagnose failures from `automation/playwright/test-results/` (see 06).
- Sometimes edits files between turns (e.g. changed `MEMBER_EMAIL`, added `console.log`s) — treat
  on-disk changes as intentional.

## Side effects — ask first

| Action | Effect | Rule |
|---|---|---|
| `npx playwright test tests/public/virtual-account-purchase.spec.ts` | creates a real order on dev + sandbox payment | Run when the user asks ("jalankan test …"); otherwise offer the command |
| `guest-checkout.spec.ts` | creates an order (unpaid → EXPIRED) | same |
| Clicking **Pay** in Duitku for a given VA | pays that invoice | only with explicit approval (was approved once for VA `1199016372289005`) |
| Read-only exploration (open pages, click Details, dump DOM) | none | fine |

Never type credentials (CMS password etc.) into a browser yourself. Running the project's own
journeys that read `CMS_USERNAME/CMS_PASSWORD` from `.env` is how CMS pages were explored.

## Working method that proved reliable

1. **Verify against the live DOM before writing a locator.** Use the built-in browser (read-only)
   or a throwaway `tsx` script that reuses existing journeys and dumps text/HTML/screenshot. Record
   what you verified (and the date) in the locator file's comment.
2. Prefer stable hooks in this order: ids (`#od_trxid`), data attributes (`data-payment-card`,
   `data-ref-id`), role + exact name, exact text. Avoid positional selectors.
3. Keep the layering: locators → page object → journey (returns data) → assertions → spec.
4. Parse amounts with `PaymentHelper.parseRupiah()`; compare numbers, not formatted strings.
5. Fail with actionable messages (page name, URL, what to change in `.env`).
6. After every change: `npx tsc --noEmit` and `npx vitest run` in `automation/playwright/`
   (and `shared/` if touched). Add unit tests for pure logic.
7. Tell the user plainly what was verified live vs. only type-checked.

## Conventions

- Config-driven test data; no hardcoded products/emails. Business-scope constants (e.g. CIMB code,
  supported environments) live in code with a comment explaining why.
- Comments explain *why* (and flag assumptions), matching the existing verbose style.
- Soft assertions (`expect.soft`) when comparing many fields of one record.
- Don't commit/push unless asked. Temp scripts go to the scratchpad or are deleted.
