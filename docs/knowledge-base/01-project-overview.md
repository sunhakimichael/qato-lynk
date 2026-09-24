# 01 — Project overview

## Repository

- Root: `qato-lynk/` — pnpm 9 workspace + Turborepo, Node 22 (`.nvmrc`).
- `shared/` (`@qato/shared`) — environment config loader + zod schema (`shared/src/env/`).
- `automation/playwright/` (`@qato/automation-playwright`) — the test suite.
- `apps/qa-dashboard/` — reads the JUnit report (see ENGINEERING.md, Milestone 8).
- `ci/` + `azure-pipelines.yml` — CI adapters.
- `.env.local | .env.dev | .env.staging | .env.prod | .env.example` at the repo root.
- `.history/` — VS Code Local History snapshots (useful to see older versions of a file).

> Git note: `git status` shows many `D qato/...` entries — the project appears to have been moved
> out of a `qato/` subfolder to the repo root. Pre-existing; not touched in this session.

## Layers inside `automation/playwright/`

```
config/        Route Registry (absolute URLs), environments (base URLs, creator slug)
locators/      Pure locator factories: (page, ...args) => Locator. One file per page/component.
pages/         Page Objects — wrap locators with actions/readers. No assertions (except guards).
components/    Reusable UI pieces (sidebar, OTP modal, ...).
helpers/       Cross-cutting utilities (PaymentHelper, waitForPageReady, retryAfter).
factories/     Config-driven test data (getTestMember/Product/PaymentMethod).
journeys/      Multi-page business flows composed from page objects; return data, don't assert.
assertions/    expect()-based checks grouped by app (cms/, public/, member/).
fixtures/      Playwright fixtures (page objects, authenticated creator).
tests/         Specs, one Playwright project per app: tests/cms, tests/public, tests/member.
```

Rule of thumb when adding a feature: **locator → page method → journey → assertion → spec**, and add
a vitest unit test for any pure parsing logic (`__tests__/` next to the file).

## Playwright config (`automation/playwright/playwright.config.ts`)

- Loads env via `loadEnvConfig(REPO_ROOT)`.
- `timeout: TEST_TIMEOUT_MS` (whole test), `expect.timeout: DEFAULT_ACTION_TIMEOUT_MS`.
- `use.actionTimeout / navigationTimeout` from env.
- `fullyParallel: true`; retries 0 on local, 2 elsewhere.
- Projects: `cms`, `public`, `member`. **`member` has `dependencies: ["public"]`** — member login
  needs the purchase made by the public checkout first.
- Reporters: list/dot, HTML (`reports/html`), JUnit (`reports/junit/results.xml`).
- Artifacts on failure: `test-results/<test>/` (screenshot, video, `trace.zip`, `error-context.md`).

## Tests (5)

| Spec | Project | What |
|---|---|---|
| `tests/cms/login.spec.ts` | cms | Creator logs in, Product Orders heading visible |
| `tests/public/guest-checkout.spec.ts` | public | Guest checkout reaches payment page (`@smoke`) |
| `tests/public/virtual-account-purchase.spec.ts` | public | Full VA purchase + Duitku + Thank You + **CMS order verification** (`@regression @payment`) |
| `tests/member/request-otp.spec.ts` | member | Member requests OTP |
| `tests/member/download-purchased-content.spec.ts` | member | Needs a real `OTP_CODE` env var; skipped otherwise |

## Commands

Run from `automation/playwright/` (or use root turbo scripts):

```bash
npx tsc --noEmit                      # typecheck
npx vitest run                        # unit tests (45 at hand-off)
npx playwright test --list            # list e2e tests
npx playwright test tests/public/virtual-account-purchase.spec.ts   # creates a REAL order on dev
npx playwright test tests/cms/login.spec.ts
npx playwright show-trace test-results/<dir>/trace.zip
```

`shared/`: `npx vitest run` (13 tests), `npx tsc --noEmit`.

`APP_ENV` selects the env file (`local` default → `.env.local`; `development` → `.env.dev`;
`staging`; `production`).

## Ad-hoc exploration scripts

When a page's real DOM is unknown, the pattern used in this session was a throwaway script in
`automation/playwright/` (so imports resolve), run with `APP_ENV=local npx tsx ./.<name>.tmp.ts`,
that reuses existing journeys/page objects, dumps `innerText`/HTML/screenshot to the scratchpad,
and is deleted afterwards. Don't commit these.
