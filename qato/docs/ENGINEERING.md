# Qato — Engineering Reference

This is the technical reference: architecture decisions, why things are built the way they are,
what's deliberately deferred, and the reasoning behind judgment calls made while interpreting
codegen output. If you want a plain-language walkthrough instead — what Qato is, how to run it,
how to read a test report — see [`../README.md`](../README.md).

---


## Architectural Decisions

Most decisions in this project are documented inline where they're made (see each milestone
section below). This one gets a formal record because it's explicitly revisitable, has real
operational consequences, and future contributors need to know it was a deliberate choice, not an
oversight — future high-stakes/revisitable calls should follow this same format.

### ADR-001: Virtual Account payment flow stays in `@regression`, not `@smoke`

**Status:** Accepted — 2026-08-03

**Context**

As of the `PaymentHelper.getPaymentAmount()` fix, `completeVirtualAccountPurchase` (Milestone 10)
is technically capable of running fully unattended — no human input is required anymore. This
raises the question of whether it should be promoted to `@smoke` (runs on every push/PR) or stay
in `@regression` (runs nightly + on manual release gate).

**Decision**

Keep it in `@regression` only. Do not promote to `@smoke`.

**Rationale**

- Every execution creates a **real transaction** in Duitku's sandbox and a **real order record**
  in the development/staging application. This is a side effect, not a read-only check.
- `@smoke` runs on every push — potentially many times a day across an active team, with no
  natural ceiling on how much test data that generates.
- `@regression` runs nightly (bounded to roughly once a day) plus occasional manual release
  checks — a predictable, quantifiable rate instead of an uncontrolled one.
- No test data lifecycle or cleanup policy exists anywhere in this project yet (no teardown, no
  expiry, no separation of test-created orders from real data). Accumulating that data slowly
  while a proper policy gets defined is preferable to accumulating it quickly.

**Consequences**

- Feedback on VA-payment regressions arrives nightly or at release time, not immediately on push.
- Dev/staging will still accumulate some test data over time, just at a controlled, predictable
  rate rather than an uncontrolled per-push rate.

**Revisit this decision once all three of the following are true:**

1. A documented test data lifecycle and cleanup policy exists.
2. A clear, agreed execution schedule for the regression suite is defined.
3. There's confidence the operational impact (sandbox load, order volume, any downstream
   reporting/analytics pollution) is acceptable.

See `README.md`'s "Test suite strategy" section for the plain-language version of this same
reasoning, aimed at a non-engineering audience.

## Status

**Milestone 1 complete:** repository foundation, Turborepo/pnpm workspace, environment config layer, Playwright skeleton.

**Milestone 2 complete:** Route Registry, Test Data factories.

**Milestone 3 complete:** Locator Registry and Page Objects for CMS Login, Public Storefront/Checkout,
and Member Login, built from real Playwright codegen output. API Registry remains deferred.

**Milestone 4 complete:** Journey Layer — `loginAsCreator`, `requestMemberOtp`, `viewProductOrders`,
`guestCheckout`. `journeys/member/` intentionally doesn't exist yet — see "Known gaps" below.

**Milestone 5 complete:** Assertions, Fixtures, Reports.

**Milestone 6 complete:** Smoke Tests — 3 real, runnable specs (CMS login, Member OTP request,
Guest checkout), tagged `@smoke` and scoped one-per-app via per-project `testDir`.

**Milestone 7 complete:** Full Purchase Journey — Member Login (OTP) → Library → Content Detail →
Download. See "Purchase Journey (Milestone 7)" below for two judgment calls made interpreting the
codegen, and why this test can't be tagged `@smoke`.

**Milestone 8 complete:** QA Dashboard (`apps/qa-dashboard/`) — reads the real JUnit report our
Playwright suite produces, no backend/DB. See "QA Dashboard (Milestone 8)" below for why.

**Milestone 9 complete:** CI/CD — GitHub Actions (primary) + Azure DevOps (secondary), both thin
adapters over a shared `ci/scripts/` layer. See `ci/README.md` for the full design, required
secrets, and what's honestly not built yet (no `@regression` suite, no deployment step).

**Milestone 10 complete:** Virtual Account payment completion (dev/staging only) via Duitku
Sandbox. Payment provider isolated behind `VirtualAccountPaymentProvider` — see
"Payment Completion (Milestone 10)" below for two real gaps flagged rather than invented around.

**Milestone 11 complete:** Regression suite. `@smoke` is now a subset of `@regression`, not a
separate invented suite — see "Regression Suite (Milestone 11)" below for why.

## Requirements

- Node 22.x (see `.nvmrc`)
- pnpm 9.15.0 (pinned via `packageManager` in `package.json`; use `corepack enable`)

## Setup

```bash
corepack enable
pnpm install
```

## Environments

Qato tests run against four environments, selected via `APP_ENV`:

| APP_ENV | File | Notes |
|---|---|---|
| `local` | `.env.local` | Mirrors `development` today — no local server exists yet |
| `development` | `.env.dev` | |
| `staging` | `.env.staging` | |
| `production` | `.env.prod` | |

`APP_ENV` defaults to `local` if unset.

**Important:** `CMS_BASE_URL`, `PUBLIC_BASE_URL`, and `MEMBER_BASE_URL` are domain roots only —
they never include a creator slug or a path like `/login`. Those are composed from
`CREATOR_SLUG` at the Route Registry layer (Milestone 2), because the creator slug differs
across environments (`qamike` in dev/staging, `mikesun` in production).

Every env file ships with placeholder credentials (`CHANGE_ME`). The schema validates them
strictly, so tests will refuse to run until real values are supplied — either by editing
`.env.local` directly (never commit real credentials) or injecting them via CI secrets.

See `.env.example` for the full variable reference.

## Packages

- **`shared`** — environment loading and validation (`@qato/shared`). Framework-agnostic;
  will be reused by the QA dashboard app (Milestone 8) as well as the automation suite.
- **`automation/playwright`** — Playwright configuration, Route Registry (`config/routes.ts`),
  and Test Data factories (`factories/testData.ts`). Page Objects, Locators, and Journeys
  arrive in Milestones 3–4.

## Route Registry

`cmsRoutes`, `publicRoutes`, and `memberRoutes` (in `automation/playwright/config/routes.ts`)
compose **absolute** URLs from the active environment's base URL + `CREATOR_SLUG`. Absolute,
not relative, because Journeys cross applications on different domains (e.g. Public MyLink →
Member Area), so relying on a single Playwright project's `baseURL` for relative navigation
would break mid-journey.

## Test Data

`getTestCreator()`, `getTestMember()`, `getTestProduct()` (in `automation/playwright/factories/`)
are the single facade for QA fixtures. All values come from the per-environment `.env.*` files —
nothing is hardcoded in test or journey code. Product fixture fields (`TEST_PRODUCT_*`) are
validated by their own schema (`factories/testData.schema.ts`), separate from `shared`'s
connectivity schema, since fixture data is automation-specific and has no reason to be a
dependency of the future dashboard app.

## Application-domain tags

Alongside the execution-suite tags (`@smoke`, `@regression`), every test also carries an
application-domain tag: `@cms`, `@mylink`, or `@member`, plus `@payment` for tests that complete a
real payment. These are two independent, orthogonal tag dimensions on the same flat Playwright tag
array — no custom tagging framework, no hierarchy, just `--grep` on plain strings. That's the
entire mechanism; it's deliberately this simple, per instruction ("keep the tagging strategy
simple, scalable, and provider-agnostic").

**Naming note:** the tag is `@mylink`, but the folder is `tests/public/` (and `pages/public/`,
`locators/public/`). This mismatch is intentional, not an inconsistency to fix — `public` was the
established folder name since Milestone 3, while `@mylink` matches the product's actual name (the
original brief calls it "Public MyLink"). Renaming the folder wasn't requested and isn't free
(touches every import across pages/locators/journeys/tests for that app), so the tag uses the
product name while the folder keeps its existing structure.

**`@payment` applied narrowly, not broadly.** Only `virtual-account-purchase.spec.ts` carries it —
`guest-checkout.spec.ts` reaches the payment confirmation page but never completes an actual
gateway payment (no VA/Duitku interaction), so it's `@mylink` only. `@payment` means "this test
completes a real payment through a provider," not "this test's flow happens to pass through a
checkout page."

Current mapping, verified via `--grep`:

| Test | Tags |
|---|---|
| `cms/login.spec.ts` | `@cms`, `@smoke`, `@regression` |
| `public/guest-checkout.spec.ts` | `@mylink`, `@smoke`, `@regression` |
| `public/virtual-account-purchase.spec.ts` | `@mylink`, `@payment`, `@regression` |
| `member/request-otp.spec.ts` | `@member`, `@smoke`, `@regression` |
| `member/download-purchased-content.spec.ts` | `@member`, `@regression` |

```
pnpm test:cms | test:mylink | test:member | test:smoke | test:regression | test:payment
```

Not wired into `ci/scripts/` — these are for targeted local/manual use (e.g. "I only changed the
Member Area, just run those"). The CI pipelines still run `@smoke` (per push) and `@regression`
(nightly/release); adding app-scoped CI jobs wasn't requested and isn't justified yet by suite size
(5 tests total).

## Regression Suite (Milestone 11)

```
pnpm test:regression   # playwright test --grep @regression
```

**Design decision: `@smoke` is a subset of `@regression`, not a separate suite.** The instruction
was to build this "using the completed Page Objects and end-to-end flows" — not to invent new
test scenarios with no codegen evidence behind them. So rather than fabricate additional coverage,
all 3 existing `@smoke` tests were re-tagged `["@smoke", "@regression"]`, and the 2 tests that
were already built but couldn't be `@smoke` (OTP-dependent download, Virtual Account purchase) got
`@regression` added. Result: 5 tests total under `@regression`, 3 of which are also `@smoke`.

**This is safe to run unattended, and now does.** `nightly.yml` and `release.yml` (Milestone 9)
were upgraded from re-running `@smoke` to running `@regression` — this works because
`test.skip()` doesn't fail a build. Without `OTP_CODE`, the download test skips cleanly; the other
4 tests execute (the VA purchase test no longer needs manual input at all, see Payment Completion
below — it stays `@regression` for a different reason now, see **ADR-001**). `ci.yml` (the fast
per-push check) intentionally still runs only `@smoke` — regression's job is thoroughness, not
speed.

## Payment Completion (Milestone 10)

```
pages/payment-providers/
├── VirtualAccountPaymentProvider.ts   # interface — journeys depend on this, not Duitku directly
└── duitku/DuitkuSandboxPage.ts        # implements it
journeys/purchase/completeVirtualAccountPurchase.journey.ts
```

**Isolation, as requested:** the Purchase Journey depends on `VirtualAccountPaymentProvider`
(one method: `completeVirtualAccountPayment(vaNumber, transferAmount)`), not on `DuitkuSandboxPage`
concretely. Replacing Duitku later means writing a new class implementing that same interface —
zero changes to `journeys/purchase/` or anything upstream of it.

**Two real gaps — one now fully resolved, one still open:**

1. **VA number** — resolved in Milestone 10. `PublicPaymentStatusPage.copyVirtualAccountNumber()`
   clicks the real recorded "Copy" button and reads the clipboard afterward
   (`navigator.clipboard.readText()`, after granting `clipboard-read`/`clipboard-write` on the
   browser context). Chromium-only, which matches this framework's default browser.
2. **Payment amount** — resolved after Milestone 10 shipped, once `#invoiceSection` was confirmed
   to contain the value. `PaymentHelper.getPaymentAmount()` reads that section's full text and
   extracts the number following the "Payment Amount" label via
   `PaymentHelper.extractPaymentAmountFromText()` — a pure, unit-tested function (4 tests: normal
   case, comma separator, same-line label+value, and the throw-with-raw-text failure mode). This
   combines two independently confirmed facts (the label's existence, and the section's contents)
   rather than guessing a DOM structure — there was no equivalent of the VA number's "Copy" button
   to fall back on here, so this was the more defensible middle ground. `transferAmount` was
   removed entirely from the journey's parameters as a result — MyLink is now the *only* source for
   this value, not an overridable convention.

**`helpers/PaymentHelper.ts`** — first real use of the `helpers/` folder from the original project
structure. Consolidates VA-payment mechanics (`getVirtualAccountNumber`, `getPaymentAmount`,
`normalizeCurrency`, `payViaDuitkuSandbox`) separately from journey orchestration.
`normalizeCurrency` and `extractPaymentAmountFromText` are both pure and fully unit tested (10
tests total) — `normalizeCurrency` strips `IDR`/`Rp` prefixes and the inconsistent comma/period
thousand-separator formatting seen in Indonesian currency display.

**Amount validation is real on both ends now.** `DuitkuSandboxPage.completeVirtualAccountPayment()`
reads `#TextBoxAnount` back via `.inputValue()` immediately after filling it and throws
`PaymentMismatchError` (a shared, provider-agnostic error type in `pages/payment-providers/`) if
it doesn't match exactly — catching a silent fill failure or provider-side input masking rather
than assuming the write succeeded.

**Suite placement is a formal decision, not an implementation detail.** This flow is tagged
`@regression`, not `@smoke`, because of its operational impact (real sandbox transactions, real
orders, no cleanup policy yet) — see **ADR-001** at the top of this document for the full
rationale and the conditions under which this gets revisited.

**Other flagged assumptions:**
- **Buyer email defaults to `getTestMember().email`**, not the throwaway address in the recorded
  session. Deliberate: for "continue with Library and Download verification" to actually work,
  the purchase has to belong to the same account that later checks the library.
- **Same-tab Duitku navigation assumed, not confirmed.** The 3 codegen sessions were separate
  `test()` blocks, so whether the real app opens the payment provider in a new tab couldn't be
  determined. If it does, `DuitkuSandboxPage` needs `context.waitForEvent('page')` handling.
- **Dev/staging only**, per instruction — enforced in the test file, not the journey (env-specific
  rules stay out of reusable journey functions, consistent with every other milestone).

`tests/public/virtual-account-purchase.spec.ts` requires `TRANSFER_AMOUNT` and skips outside
local/development/staging — not tagged `@smoke` for the same reason as the OTP test.

## QA Dashboard (Milestone 8)

```
apps/qa-dashboard/
├── app/{layout,page}.tsx        # Server Component, reads the report fresh per request
├── lib/{types,reportPaths,parseJunitReport}.ts
├── lib/__tests__/parseJunitReport.test.ts   # 5 unit tests
└── components/{PassRateGauge,RunSummaryStats,TestResultsTable,NoReportFound,ui/*}.tsx
```

**Scoping decision:** the tech stack lists Fastify + Prisma + SQLite for a backend, but nothing
persists any test-run data yet — no schema, no migrations, no history to query. Building that
stack from scratch just to have somewhere to store data would be exactly the premature
infrastructure this project avoids. Instead, the dashboard reads `automation/playwright/reports/junit/results.xml`
directly — real data our suite already produces, zero speculative infrastructure. Historical
trends become a real, well-justified milestone once there's more than one run's worth of data to
show a trend over.

**shadcn/ui components are hand-authored, not CLI-generated.** The `npx shadcn add` CLI needs
network access to fetch component source, which this sandbox's network allowlist doesn't include
(package registries only). `components/ui/{card,badge}.tsx` are structurally compatible with real
shadcn output — you can run the actual CLI locally later without conflict.

**Fonts load via a `<link>` tag, not `next/font/google`.** `next/font` downloads font files from
Google at *build time*; in this sandbox that would break `next build` entirely. A stylesheet link
is the same thing a normal website does, works offline-gracefully with the Tailwind fallback
stack, and doesn't risk breaking anyone's CI later either.

**Signature design element:** a radial pass-rate gauge — the one number a QA engineer opens this
page to see first. Status color (pass/fail/skip) is semantic, not decorative, sourced directly
from JUnit's own result categories.

**Verified for real, not just typechecked:** ran an actual `next build` (production build,
succeeded, no font/network issues) and `next start`, then `curl`'d the live server twice — once
confirming the empty state renders correctly with no report present, and once with a throwaway
sample JUnit XML (deleted immediately after) confirming the full pipeline actually works: file →
XML parse → summary computation → real rendered HTML, including the correct 50% pass rate and the
actual failure message text appearing on the page.

## Purchase Journey (Milestone 7)

Completes the flow that Milestone 4's `guestCheckout()` didn't cover: `loginAsMember()` (OTP
entry) → `viewLibrary()` / `downloadPurchasedContent()` (`journeys/member/`).

```
journeys/authentication/loginAsMember.journey.ts   # requestMemberOtp + OTP code entry
journeys/member/viewLibrary.journey.ts             # login -> Library page
journeys/member/downloadPurchasedContent.journey.ts # login -> Library -> Content Detail -> download
```

**Why this test isn't tagged `@smoke`:** the OTP code is a fresh, real one-time code delivered to
the member's actual inbox every run. There's no email-polling integration in this project, so it
can never run unattended. `tests/member/download-purchased-content.spec.ts` accepts it via an
`OTP_CODE` env var and explicitly skips (with a clear reason) when it's absent, rather than
pretending this is CI-safe:

```bash
OTP_CODE=123456 npx playwright test download-purchased-content
```

**Two judgment calls made interpreting this codegen session** (both documented in
`journeys/member/downloadPurchasedContent.journey.ts`):

1. The recorded session clicked "Check Details" at position 4, then "Go Back", then position 2 —
   only the position-2 path has confirmed downstream success (heading assertion, download
   completed). I treated the first click+back as recording exploration and built the Journey
   around position 2 only. This is an interpretation, not a confirmed fact.
2. A trailing `getByText('Content detail Japan Trip').click()` after the download already
   completed was dropped — no demonstrated purpose at that point in the flow.

**A real improvement over Milestone 3's OTP locator:** this codegen session captured `#otp_1`
through `#otp_6` — stable ID selectors — replacing what would otherwise have been a guess. The
FRAGILE utility-class container flagged in Milestone 3 is still there for the modal wrapper, but
digit entry itself is on solid ground now.

## Smoke Tests (Milestone 6)

```
tests/
├── cms/login.spec.ts               # loginAsCreator -> Orders page loaded
├── public/guest-checkout.spec.ts   # full guest checkout -> payment confirmed
└── member/request-otp.spec.ts      # member email -> OTP challenge appears
```

```bash
pnpm test:smoke              # runs only tests tagged @smoke
APP_ENV=staging pnpm test:smoke
```

**Fixed a real scoping bug while building this:** without a per-project `testDir`, every
Playwright project (`cms`/`public`/`member`) would discover and run *every* spec file, tripling
execution and running e.g. the CMS login test under the `public` and `member` projects too. Each
project now points at its own `tests/{cms,public,member}/` folder — confirmed via `--list`:
exactly 3 tests total, one per project, no duplicates.

`guest-checkout.spec.ts` explicitly `test.skip()`s with a clear reason outside dev/staging,
rather than guessing production's unverified product-link label format (see Milestone 3's note
on the "85k" formatting assumption).

## Assertions, Fixtures, Reports (Milestone 5)

**Assertions** (`assertions/{cms,public,components}/`) wrap `expect()` in semantic, named
functions — `expectProductOrdersPageLoaded()`, `expectPaymentConfirmed()`,
`expectOtpChallengePresented()`. Each maps 1:1 to an `expect()` call actually present in your
codegen output; nothing here was invented. This is also why there's no CMS-login or checkout-step
assertion — the recorded session never asserted anything mid-flow, only at the two end states
(Orders page loaded, purchase confirmed) plus the OTP challenge.

**Fixtures** (`fixtures/`) extend Playwright's `test` with pre-instantiated Page Objects
(`pages.fixture.ts`) and a pre-authenticated creator session (`journeys.fixture.ts`,
`authenticatedCreatorHome`). Import `test`/`expect` from `fixtures/` (not `@playwright/test`
directly) in any spec that needs them — this is what Milestone 6 will do.

**Reports**: the reporter setup from Milestone 1 already covered artifacts (screenshot/video/trace
on failure), HTML, and JUnit. The one real gap was reporter noise — Milestone 5 adds
`process.env.CI ? "dot" : "list"` so local runs stay readable and CI logs stay compact once
Milestone 9 wires up a pipeline.

## Journeys (Milestone 4)

```
journeys/
├── authentication/  loginAsCreator, requestMemberOtp
├── creator/         viewProductOrders
└── purchase/        guestCheckout
```

Journeys are plain async functions, not classes — a Journey is a procedure (compose Page Objects,
return the resulting page/component for the caller to assert against), not a stateful entity, so a
class here would be ceremony without benefit. Page Objects stay classes because they genuinely hold
cohesive per-page state and multiple related methods.

**`journeys/member/` doesn't exist.** The project brief's Purchase Journey diagram is
Product Detail → Checkout → **Member Login → Library → Download**. `guestCheckout()` covers
through Checkout/payment confirmation — everything the codegen actually verified. Member Login →
Library → Download needs Page Objects for pages nobody has recorded yet. Building that folder now
would mean empty or invented content, which this project explicitly avoids. Same reasoning applies
to `requestMemberOtp()`: it stops at the OTP challenge appearing, since completing verification
needs a real one-time code and the OTP entry UI was never captured.

## Page Objects (Milestone 3)

Built from real Playwright codegen output, not invented selectors. Structure:

```
locators/{cms,public,member,components}/   # raw Locator-returning functions, one file per page
pages/{cms,public,member}/                 # classes wrapping locators in named actions
components/                                # shared overlay/modal components (e.g. OtpModal)
```

Page Objects expose UI actions and locator getters only — no `expect()` calls inside them
(assertions are a separate layer, arriving in Milestone 5).

**Known open items, carried over from codegen:**
- Two locators are flagged `FRAGILE` in code comments and preserved exactly as recorded
  rather than replaced with a guess: the payment method list item (`li:nth-child(6)`, no
  accessible name available) and the OTP modal's digits container (raw utility CSS classes).
  Revisit both once the real markup is available.
- The storefront product link locator requires the caller to supply the exact accessible
  name (e.g. `"Japan Trip Ebook IDR 85k"`). The "85k" thousands-abbreviation format was only
  confirmed in dev; production's fixture (`Help-PDF`, 10 IDR) is under 1,000 and its display
  format is unverified. Confirm this before Milestone 7.
- `PublicPaymentStatusPage.waitForLoad()` waits for a URL pattern instead of replaying the
  recorded `page.goto()` — that step hardcoded a single-use payment token that would already
  be expired on replay.

## Deferred scope (Milestone 2)

- **API Registry** — no backend API host/spec confirmed yet (`API_BASE_URL` is unset). Will be
  built once a real host and endpoints exist. Building it against nothing would be exactly the
  placeholder scaffolding this project explicitly avoids.

## Commands

```bash
pnpm typecheck        # typecheck all packages
pnpm test             # run unit tests (shared package env logic)
pnpm test:e2e         # run Playwright tests (none exist yet — Milestone 6)
pnpm test:e2e:ui      # Playwright UI mode
```

Run any command against a specific environment by prefixing `APP_ENV`:

```bash
APP_ENV=staging pnpm test:e2e
```
