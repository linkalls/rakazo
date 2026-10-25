#!/usr/bin/env bash
# Focused, offline regression suite for the fork's group orchestrator.
# Requires the checked-in pnpm lockfile and a compatible Node installation.
set -euo pipefail
cd "$(dirname "$0")/.."
pnpm --filter @rakazo/db generate
pnpm exec vitest run \
  packages/adapters/src/local-group-dispatch.test.ts \
  packages/adapters/src/local-group-review.test.ts \
  packages/adapters/src/local-group-history.test.ts \
  packages/adapters/src/group-handoff.test.ts \
  packages/adapters/src/job-reconciler.test.ts \
  packages/adapters/src/schedule-tools.test.ts \
  packages/core/src/bot-role-seed.test.ts \
  packages/db/src/bot-update.test.ts
