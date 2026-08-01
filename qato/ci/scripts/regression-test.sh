#!/usr/bin/env bash
set -euo pipefail

# APP_ENV, CMS_USERNAME, CMS_PASSWORD, MEMBER_EMAIL must be set by the
# calling job. Some @regression tests additionally need OTP_CODE and/or
# TRANSFER_AMOUNT to actually execute — without them, those specific tests
# skip (not fail), so this is still safe to run unattended.
pnpm exec playwright install --with-deps chromium
pnpm exec turbo run test:regression --filter=@qato/automation-playwright
