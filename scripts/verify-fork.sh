#!/usr/bin/env bash
# Offline regression checks for the independent fork, with no API calls or live data.
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/verify-local-groups.sh
pnpm exec vitest run \
  apps/mobile/lib/source-auth.test.ts \
  apps/mobile/lib/integrations-screen.test.tsx \
  apps/mobile/lib/thread-keyboard-offset.test.ts \
  apps/mobile/lib/thread-composer.test.tsx \
  apps/mobile/lib/keyboard-scroll-back.test.ts
pnpm exec tsc --noEmit --pretty false -p apps/mobile/tsconfig.json
