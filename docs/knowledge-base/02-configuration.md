# 02 — Configuration

Two validators read the same `.env.<APP_ENV>` file:

- `shared/src/env/schema.ts` + `loadEnvConfig.ts` — connectivity/credentials/timeouts. Cached per
  process. dotenv never overrides variables already in `process.env` (shell/CI values win).
- `automation/playwright/factories/testData.schema.ts` — QA fixture data (product, payment labels).

Empty values (`FOO=`) are treated as unset.

## Variables

| Var | Where validated | Notes |
|---|---|---|
| `APP_ENV` | shared | `local` \| `development` \| `staging` \| `production` |
| `CMS_BASE_URL`, `PUBLIC_BASE_URL`, `MEMBER_BASE_URL` | shared | local/dev: `https://dev-lynk-id.pytavia.id` (CMS + public share a domain), member `https://v2-member.pytavia.id` |
| `API_BASE_URL` | shared | optional, unused |
| `CREATOR_SLUG` | shared | `qamike` on local/dev |
| `DEFAULT_ACTION_TIMEOUT_MS` | shared | also used as `expect` timeout. 60000 on local/dev/staging |
| `DEFAULT_NAVIGATION_TIMEOUT_MS` | shared | 60000 on local/dev/staging |
| `PAGE_LOAD_TIMEOUT_MS` | shared, default 120000 | **new.** Max wait for a slow page's key element (then 1 reload for safe pages). |
| `TEST_TIMEOUT_MS` | shared, default 600000 | **new.** Whole-test budget (was accidentally `DEFAULT_ACTION_TIMEOUT_MS` = 60 s before). |
| `CMS_USERNAME`, `CMS_PASSWORD` | shared | creator login (never type these anywhere yourself — see 07) |
| `MEMBER_EMAIL` | shared, `email()` | buyer + member login email |
| `RANDOMIZE_MEMBER_EMAIL` | read raw in `loadEnvConfig.ts` | **new.** `true` → random Gmail dot alias per run |
| `TEST_PRODUCT_NAME/TYPE/PRICE/CURRENCY` | testData | `Kyoto Travel Guide 001`, `digital`, `150000`, `IDR` |
| `TEST_PRODUCT_LINK_LABEL` | testData | exact storefront link name: `Kyoto Travel Guide 001 IDR 150,000`. Must contain the product name. |
| `TEST_PAYMENT_METHOD_CHANNEL_LABEL` | testData | Duitku channel label: **`CIMB NIAGA VA`** (was wrongly `Virtual Account`) |
| `TEST_PAYMENT_METHOD_DISPLAY_NAME` | testData | MyLink payment page text: `CIMB Niaga Virtual Account` |
| ~~`TEST_PAYMENT_METHOD_POSITION`~~ | — | **removed.** Checkout now always selects CIMB by code (see 03). |
| `OTP_CODE` | read in spec | manual only, for `download-purchased-content.spec.ts` |

`PAGE_LOAD_TIMEOUT_MS` / `TEST_TIMEOUT_MS` were added to all five env files. Production keeps
15 s/30 s action/navigation timeouts.

## Randomized member email (`RANDOMIZE_MEMBER_EMAIL=true`)

Implemented in `shared/src/env/loadEnvConfig.ts` → `resolveRandomMemberEmail()`.

- Requirement: a fresh buyer email every run, but the **same** email for checkout and later member
  login, and the member OTP must land in a real inbox.
- `+` aliases (`x+abc@gmail.com`) were tried first — **Lynk's checkout/login forms reject `+`**.
- Solution: **Gmail ignores dots in the local part**, so 1–3 dots are inserted at random gaps:
  `xomaajah123@gmail.com` → `xomaa.jah.123@gmail.com`. All variants hit the same inbox; Lynk treats
  them as distinct customers. Only Gmail/googlemail domains are allowed (throws otherwise).
- ~175 combinations for an 11-char local part → occasional repeats (harmless: existing customer).
- Consistency across Playwright workers: the main process resolves it, writes the result back to
  `process.env.MEMBER_EMAIL` and sets `RANDOMIZE_MEMBER_EMAIL=false`; workers inherit the env and
  dotenv won't override, so every worker sees the same address.
- Pin a fixed email for a manual run: `RANDOMIZE_MEMBER_EMAIL=false npx playwright test ...`.
- Only `.env.local` enables it. The user has since changed the base `MEMBER_EMAIL` (runs used
  `qatesting606@gmail.com` variants such as `qate.st.ing6.06@gmail.com`).
- Tests: `shared/src/env/__tests__/loadEnvConfig.test.ts`.
