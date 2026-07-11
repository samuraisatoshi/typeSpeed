Run ordered integration for swarm workers using dependency-aware merge sequencing.

**Mode detection:** check CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 (same as /swarm-start).

---

## Agent Teams mode

1. Get task states via `TaskList` — confirm all tasks completed before merging
2. Build merge candidate list from cards in doing/review/tested via `kanban-card-list`
3. Validate each candidate: AC met, gate evidence present, no TaskBlocked states
4. Determine merge order by card dependencies and domain boundaries
5. For each candidate: instruct team lead via `SendMessage` to merge branch and report result
6. Advance card via `kanban-card-move` after each successful merge
7. **Release worktree (CD-345)**: after merge success, call
   `WorktreeProvisioningService.release(cardId)`. The call is tolerant of
   "not provisioned" — it returns ok no-op so retries are safe. Skip
   silently if the service is unavailable (degraded mode).
8. When all candidates are merged, call
   `WorktreeProvisioningService.pruneAll()` once to reconcile orphan paths
   and dangling `jarvis/*` branches.
9. When all done: tell lead to run team cleanup

---

## ADK mode (fallback)

1. Build merge candidate list from cards in doing/review/tested via `kanban-card-list`
2. Validate each candidate: AC met, gate evidence present, environment active and linked
3. Determine merge order by card dependencies and domain boundaries
4. For each candidate: `env-merge` + follow-up `env-status`; mark blocked on conflict
5. Advance card via `kanban-card-move` after each successful merge
6. Publish final report: merged, blocked, skipped, required follow-ups

---

Rules:
- Never skip gates
- Never force push
- Keep conflict handling explicit and auditable
- Conflict on a worktree branch leaves the worktree intact — mark the
  card `blocked` so a follow-up can inspect `<repoRoot>/.jarvis/worktrees/<cardId>`
  before any prune.
