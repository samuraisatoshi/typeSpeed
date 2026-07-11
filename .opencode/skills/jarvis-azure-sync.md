---
description: JARVIS Azure DevOps sync workflow — push/pull cards, create PRs, manage teams and area paths
---

Sync local kanban with Azure DevOps. Prerequisites: `az login`, `config-read section="azure-sync"` shows org/project/repository.

**Sync:** `azure-status` → `azure-sync` (bidirectional) or `azure-push`/`azure-pull` individually. Use `dry_run=true` to preview.

**PR:** `azure-pr-create` with org/project/repository/title/description/source_branch/target_branch. Link work items via `work_item_ids`.

**Team setup:** If Area Path errors on push → `/setup-team` or `azure-discover` to inspect.

**Polling:** `azure-poll-start` → `azure-events-list` → `azure-poll-stop`.

**Errors:** 401 → `az login`; Area Path not found → `/setup-team`; conflicts on pull → resolve manually.

If `repoType` is `MAIN-NO-REPO`, run sync in child module workspaces.
