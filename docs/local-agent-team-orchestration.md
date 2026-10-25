# Local agent-team orchestration (experimental)

This fork adds an **opt-in** group collaboration mode to Rakazo. It is designed to work with **any group name** and any combination of Bot names, titles, and descriptions. The group name is passed to the model as ordinary team context, **not** used as a hard-coded feature switch or a source of new permissions.

## Behavior

When a user sends a request in a group, the first selected Bot becomes the goal owner. If it completes without an explicit `handoff_to_bot`, the worker queues **independent tasks for up to eight other active group members**. Each specialist uses its own stored title and description, produces findings in the existing group thread, and can investigate or check evidence relevant to its role.

The worker waits for the selected members to finish before queuing a single internal synthesis for the original owner. The owner compares the findings with the original request and can request a further *distinct* stage via the existing handoff tool if significant gaps remain. The existing bounded goal assessment mechanism limits additional cycles. Peer tools cannot independently transfer ownership during the automatic fan-out, preventing duplicate coordinator runs; they share results in the group instead.

The **group name remains meaningful** to the LLM: for example, `Investment Research` frames its purpose while `Code Review` frames a different purpose. Neither string is a special case in the dispatcher.

### Scope and safety

- Internal tasks reuse the original **user message ID**, not synthetic user messages. For team peers and initial synthesis, history and related attachments are scoped to the current user request and subsequent group replies to avoid dragging unrelated earlier conversations into the investigation.
- A new user request supersedes older autonomous continuation. A time window, round budget, stage-completion checks, durable state markers, and deterministic run nonces reduce duplication or runaway chains.
- Existing Rakazo approval and access controls still apply. A team member does not receive new privileges because of its name or the group name.
- Existing owner-selected handoffs take precedence over the automatic fan-out.
- Ambiguous Bot names do not receive invented specialties. Recognized names can seed editable profile details when enabled; user-written profile fields are not overwritten.

This is **not** a complete replacement for a goal planner that continuously optimizes a dynamically constructed DAG, and not an always-on background agent. Currently the initial owner can post a preliminary answer before the specialists complete; the subsequent synthesis is a separate group reply. Up to eight other members may be dispatched even for a simple group question, so configure costs and active group membership accordingly.

## Self-hosted opt-in

The worker needs the following environment variables:

```env
RAKAZO_GROUP_REVIEW_ENABLED=true
RAKAZO_GROUP_REVIEW_SINCE=2026-10-26T00:00:00Z
RAKAZO_GROUP_HANDOFF_CONTEXT=true
RAKAZO_BOT_ROLE_AUTOFILL=true
```

`RAKAZO_GROUP_REVIEW_SINCE` is a **forward-only cutoff**. Set it to the actual deployment timestamp in UTC so existing completed group conversations are not retroactively restarted. The timestamp above is an example only. `RAKAZO_BOT_ROLE_AUTOFILL` should also be enabled on API instances when Bot profile seeds are desired.

The local Docker build recipe is `infra/compose/Dockerfile.orchestrator-local`. Do not use this as an upstream production release without further review and operational testing. The fork intentionally leaves the standard Web UI and upstream repository untouched.

## Main code

- `packages/adapters/src/local-group-dispatch.ts` — peer fan-out, join and final synthesis
- `packages/adapters/src/local-group-history.ts` — active-goal history scoping
- `packages/adapters/src/local-group-review.ts` — bounded re-evaluation
- `packages/adapters/src/job-reconciler.ts` — completion-driven scheduling
- `packages/adapters/src/schedule-tools.ts`, `executor.ts` — peer handoff restrictions
- `packages/core/src/bot-role-seed.ts` — conservative Bot-name role defaults
- `packages/db/src/repos.ts`, `bot-update.ts` — creation and rename behavior

Regression tests live next to the corresponding source modules. This branch is intended for an independent fork and makes **no** upstream pull request.
