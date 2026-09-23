#!/usr/bin/env bash
set -euo pipefail

pnpm exec turbo run build --filter=@qato/qa-dashboard
