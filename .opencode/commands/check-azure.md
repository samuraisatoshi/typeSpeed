---
description: Check Azure DevOps connection status for this workspace
---

Check Azure DevOps connectivity and workspace sync state.

**1. Auth** — `az account show -o json`. If fails: `az login` needed.
**2. Config** — `config-read section="azure-sync"`. Show org/project/repository.
**3. Connection** — `azure-discover`. Report success or error.
**4. Sync status** — `azure-status`. Show last sync time and pending items.

Final summary: one line per check — OK or action needed.
