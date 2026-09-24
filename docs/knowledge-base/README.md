# Qato Knowledge Base (for agents)

Working notes for any agent (or engineer) picking up the Qato Playwright suite. Everything here was
**verified against the live dev environment on 2026-09-23/24** unless marked otherwise. It
complements, and does not replace:

- [`README.md`](../../README.md) — non-technical overview, how to run tests.
- [`docs/ENGINEERING.md`](../ENGINEERING.md) — milestone history, ADRs, locator registry findings.
- [`ci/README.md`](../../ci/README.md) — CI/CD.

## Read in this order

| # | File | What it covers |
|---|---|---|
| 1 | [01-project-overview.md](01-project-overview.md) | Repo layout, layers, commands, how a test is composed |
| 2 | [02-configuration.md](02-configuration.md) | `.env.*` files, every env var, randomized member email, timeouts |
| 3 | [03-purchase-flow.md](03-purchase-flow.md) | MyLink storefront → checkout → payment page → Thank You (verified DOM) |
| 4 | [04-duitku-sandbox.md](04-duitku-sandbox.md) | Paying a VA in the Duitku sandbox (verified DOM) |
| 5 | [05-cms-order-verification.md](05-cms-order-verification.md) | Creator CMS Orders list + Details comparison against the purchase |
| 6 | [06-known-issues-troubleshooting.md](06-known-issues-troubleshooting.md) | Rate limits, slow pages, flaky timing, how to read `test-results/` |
| 7 | [07-agent-guidelines.md](07-agent-guidelines.md) | How to work in this repo + the user's preferences and safety rules |
| 8 | [08-session-log-2026-09-23.md](08-session-log-2026-09-23.md) | Chronological log of the session that produced this KB, decisions and open items |

## 30-second summary

- **What:** Playwright + TypeScript QA automation for Lynk.id (pnpm/Turborepo monorepo). Three apps:
  CMS (creator admin), Public MyLink storefront, Member Area.
- **Main end-to-end test:** `automation/playwright/tests/public/virtual-account-purchase.spec.ts`
  1. Guest buys "Kyoto Travel Guide 001" on `https://dev-lynk-id.pytavia.id/qamike` with a randomized
     Gmail-dot alias of `MEMBER_EMAIL`, always paying with **CIMB Niaga Virtual Account**.
  2. Pays the VA in the **Duitku sandbox** (Bank Transfer → CIMB NIAGA VA → VA → Check → Transfer
     Amount = Amount → Pay → "SUCCESS").
  3. Confirms MyLink payment status → Thank You page.
  4. Logs in to the **CMS** as the creator (separate browser context), finds the order in Orders by
     **TRX ID (= MyLink "Inv. Number")**, checks the list card and the Details panel against the
     saved `PurchaseRecord`.
- **Status at hand-off:** purchase + Duitku parts pass end-to-end. CMS verification was validated
  read-only against an existing order (11/11 checks pass). The full chained run (purchase → CMS)
  has **not** been executed yet since it was added.
- **The dev environment is slow and rate-limited** (Cloudflare 429s, 60–160 s page loads). Most
  "failures" are environmental; see [06](06-known-issues-troubleshooting.md).
- **Every e2e purchase run creates a real order + sandbox payment on dev.** Ask the user before
  running it.
