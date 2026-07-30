# Qato

Production-grade QA Automation Platform for the CMS, Public MyLink, and Member Area applications.

## Status

**Milestone 1 complete:** repository foundation, Turborepo/pnpm workspace, environment config layer, Playwright skeleton.

**Milestone 2 complete:** Route Registry, Test Data factories.
Locator Registry and API Registry were deliberately deferred — see "Deferred scope" below.
No Page Objects, Journeys, or actual test specs exist yet — that's Milestones 3–7.

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

## Deferred scope (Milestone 2)

- **Locator Registry** — needs real page selectors. All three app domains blocked automated
  fetching (bot detection / robots.txt), so real selectors will be supplied when we pair on
  Page Objects in Milestone 3, where they'll be used immediately rather than sitting unused.
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
