Welcome a new user to the JARVIS development methodology. Present a concise onboarding guide.

Optional focus via $ARGUMENTS (e.g. "kanban", "solid", "sessions") — if provided, emphasise that section.

## Step 1 — Present the guide

JARVIS combines a kanban board, Obsidian vault, Ollama (local AI), and MCP tools.

**First steps:**
1. `/healthcheck` — verify all services are up
2. `kanban-board-view` — see current board state
3. If empty, create first epic: `kanban-epic-create title="..."`

**Kanban pipeline:** `backlog→grooming→ready→doing→review→tested→done`
- Before coding: `kanban-fast-track title="..."` (creates card + scope doc via Ollama)
- After coding: build + test → commit `Add X (CD-XXX)` → `kanban-card-close`

**Full methodology:** See `AGENTS.md` for design principles, guardrails, kanban lifecycle, and git workflow.

**Skills reference:**
- Kanban workflow → skill `jarvis-kanban`
- Azure DevOps sync → skill `jarvis-azure-sync`
- TLA+ formal spec → skill `jarvis-tla-spec`

**Architecture:** SOLID + DDD. Domain layer zero external deps. Max 530 lines/file. No cross-context imports.

**Session lifecycle:** `context-session-start` at start, `/context-checkpoint` at end.

**Tools:** Use JARVIS MCP tools (`file-read`, `rag-search`, `vault-manage`) instead of native Claude Code tools.

## Step 2 — Next action

Ask: "What would you like to work on first?" Suggest `/healthcheck`, `kanban-board-view`, or `/start-card CD-XXX`.
