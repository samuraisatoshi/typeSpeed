---
description: JARVIS kanban card lifecycle — grooming, sprint management, gate tasks, and board operations
---

Pipeline: `backlog→grooming→ready→doing→review→tested→done`. Never skip steps.

**Before coding:** `kanban-fast-track title="..."` (creates card + scope doc via Ollama). Or manually: create card → scope doc → AC (min 2) → estimate → assign epic → `kanban-grooming-validate` → `ready` → assign agent+sprint → `doing`.

**After coding:** build + test → commit `Add X (CD-XXX)` → `kanban-card-close` (meets all AC + gates, advances to done).

**Tools:** `rag-oracle-search query="kanban" domain="tools"`

**Guardrails:** No code without card in `doing`. No grooming skip. No commit to `main`. No push without approval.
