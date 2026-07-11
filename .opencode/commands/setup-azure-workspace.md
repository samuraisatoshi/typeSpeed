---
description: Configure Azure DevOps sync for this workspace (org, project, repository)
---

Guide the user through Azure DevOps workspace configuration. Stop at each failure.

**1. Check current config** — `config-read section="azure-sync"`. Show org/project/repository values.
**2. Fill missing values** — if org, project, or repository is empty: ask user for each, then `config-write section="azure-sync"` with the values provided.
**3. Validate connection** — `azure-discover` with the configured org/project. Success: ready. Auth error: run `az login` first. Not-found: verify org/project/repository names.
**4. Link workspace** — if not yet linked: `azure-board-setup` to connect board and sync settings.

Final summary: one-line status per step.
