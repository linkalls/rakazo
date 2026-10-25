# Independent Rakazo fork

This fork is based on a specific upstream `main` commit, rather than copying locally patched production JavaScript. Keep the group, native MCP and native keyboard changes in separate development branches; the `feat/unified-upstream-main` branch merges all three onto the latest fetched upstream `main`. The fork `main` stays an unmodified mirror of upstream.

## Included changes

- **Group collaboration** (`feat/independent-group-orchestration`): bounded fan-out, original-owner synthesis and up to three follow-up assessments. Group names are supplied as untrusted context rather than special routing flags. Explicit `@BotName` requests choose participating peers; otherwise all remaining active group members participate in roster order. There is no additional dispatcher headcount cap; the upstream group creation contract currently accepts two to ten bots. The owner may use the existing handoff tool for a targeted follow-up. This is **not** an unconstrained autonomous conversation planner.
- **Native MCP authentication** (`feat/native-mcp-authentication`): bearer, optional authentication, and encrypted API keys sent using configurable header names. The OAuth option creates a registered remote MCP server and opens the official Rakazo Web callback in the device browser. The browser must be signed into the same instance; the completed callback is handled by the server. No access tokens or client secrets are committed.
- **Native Android keyboard behavior** (`fix/android-keyboard-follow`): use the native `KeyboardAvoidingView.automaticOffset` so Android reads the view's current window coordinates instead of stale JavaScript measurements. Preserve the existing iOS header behavior. Native-device smoke testing is still necessary across software keyboards and window sizes.

## Reproducing group functionality on a new host

1. Check out a reviewed commit from `feat/unified-upstream-main` (or just the group branch), and install the version of Node required by `package.json` plus the locked pnpm version.
2. Copy the standard self-host environment sample privately and configure authentication, database, and service credentials. Do not put `.env`, credentials, or runtime data in Git.
3. Run `pnpm install --frozen-lockfile` and `bash scripts/verify-fork.sh` before deploying.
4. Build `rakazo/app:independent-groups` using `infra/compose/Dockerfile.orchestrator-local` and the exact source revision. See `docs/local-agent-team-orchestration.md` for the Docker build and opt-in Compose commands.
5. Set `RAKAZO_GROUP_REVIEW_SINCE` to **deployment time in UTC**. Validate Compose, back up your database, and only then start the modified stack. The feature uses an additive migration for its completion marker.

`elie222/rakazo#2136` already ships Android CSV support in upstream `main` and is intentionally **not copied** to this fork as a second patch. Remove obsolete manual Web/PWA JavaScript overrides when deliberately upgrading an existing installation after validating that the normal upstream fix works.

The original experimental smoke scripts and JSONL logs are deliberately excluded: they were coupled to a particular host and live data. `scripts/verify-fork.sh` is an offline, deterministic replacement. The native app is built and installed separately using the normal Expo tooling and needs a compatible API deployed first.

## Validation and limitations

Run `bash scripts/verify-fork.sh` to exercise group scheduling/review, native custom-source auth, keyboard offsets, and native TypeScript checks. A passing unit suite does not replace live OAuth callback tests on a phone, keyboard interaction testing with Gboard or a floating keyboard, PostgreSQL migration integration checks, or a clean production Docker image build. A preliminary coordinator reply may appear before the team synthesis. Avoid enabling automatic multi-agent dispatch if the cost or latency is unacceptable.
