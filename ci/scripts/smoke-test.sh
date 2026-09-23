#!/usr/bin/env bash
set -euo pipefail

# APP_ENV, CMS_USERNAME, CMS_PASSWORD, MEMBER_EMAIL must be set by the
# calling job (from provider-specific secrets/variables). This script
# doesn't know or care which provider set them.
pnpm exec playwright install --with-deps chromium
pnpm exec turbo run test:smoke --filter=@qato/automation-playwright
