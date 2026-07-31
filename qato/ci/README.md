# CI/CD

## Design

All real logic lives in `ci/scripts/*.sh`. Every CI provider config
(`.github/workflows/*.yml`, `azure-pipelines.yml`) is a thin adapter that
just checks out the repo, sets up Node/pnpm, and calls one of these scripts:

| Script | What it does |
|---|---|
| `install.sh` | `pnpm install --frozen-lockfile` |
| `typecheck.sh` | Typechecks every package via turbo |
| `unit-test.sh` | Runs unit tests (Vitest) across every package via turbo |
| `smoke-test.sh` | Installs Playwright browsers, runs the `@smoke` suite |
| `build-dashboard.sh` | Builds `@qato/qa-dashboard` |

**Why this matters:** adding GitLab CI or Jenkins later (both explicitly deferred to a future
milestone, not built speculatively now) means writing a `.gitlab-ci.yml` or `Jenkinsfile` that
calls these same five scripts. No change to the automation framework, no change to what "smoke
test" or "typecheck" means — that logic is defined once, here.

## Providers

- **GitHub Actions** (primary): `.github/workflows/ci.yml`, `nightly.yml`, `release.yml`
- **Azure DevOps** (secondary): `azure-pipelines.yml`, mirrors `ci.yml` stage-for-stage

## Required secrets

Both providers need these configured before `smoke-e2e`/`SmokeE2E` or the release gate will pass:

| Variable | GitHub Actions | Azure DevOps |
|---|---|---|
| `CMS_USERNAME` | Repo → Settings → Secrets and variables → Actions | Pipeline → Variables (mark secret) |
| `CMS_PASSWORD` | same | same |
| `MEMBER_EMAIL` | same | same |

These are still `CHANGE_ME` placeholders in `.env.dev`/`.env.staging`/`.env.prod` (see Milestone 1)
— nothing here works until real values are supplied. That's expected, not a bug: the env schema
validates strictly and fails loudly rather than silently running against garbage credentials.

## What's honestly NOT here yet

- **No `@regression` suite.** `nightly.yml` currently re-runs `@smoke` on a schedule, because
  that's all that exists. It's a real, useful thing to have (a scheduled smoke check), but it
  isn't "regression testing" and the workflow doesn't claim otherwise. When regression tests get
  tagged in future work, this workflow needs zero redesign — just an added `--grep` filter or job.
- **No deployment step in `release.yml`.** It validates (typecheck, unit tests, smoke, dashboard
  build) but doesn't deploy anything — no hosting/deployment target has been decided for the QA
  dashboard yet. Add that step when that decision is made.
- **GitLab CI and Jenkins** are deferred to a future milestone, per your instruction. The
  `ci/scripts/` layer is what makes that low-effort when it happens.
