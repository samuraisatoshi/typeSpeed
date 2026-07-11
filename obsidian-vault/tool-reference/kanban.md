# Tool Reference — Kanban

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## kanban-ac-add

Add acceptance criterion. Provide only `description` for plain-text criterion, or include type/verifiable_by/automated for structured one.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `description` (string, required) — Acceptance criterion description
- `type` (enum, optional) — Verification type
- `verifiable_by` (string, optional) — How the criterion is verified
- `automated` (boolean, optional) — Whether verification is automated

## kanban-ac-delete

Remove acceptance criterion by its 0-based index.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion

## kanban-ac-get

Get single acceptance criterion by its 0-based index.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion

## kanban-ac-list

List all acceptance criteria of card with their 0-based index, description, type, verifiable_by, automated and met flag. Returns only AC array — does not load full card.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)

## kanban-ac-meet

Mark acceptance criterion as met by its 0-based index.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion

## kanban-ac-unmet

Revert acceptance criterion to not-met by its 0-based index.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion

## kanban-ac-update

Update acceptance criterion by its 0-based index without recreating it. Only provided fields change; met flag is preserved.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion
- `description` (string, optional) — New description
- `type` (enum, optional) — Verification type
- `verifiable_by` (string, optional) — How the criterion is verified
- `automated` (boolean, optional) — Whether verification is automated

## kanban-auto-groom

Groom existing card via Ollama gpt-oss:20b (local, free). REPLACES (saves ~80% tokens + zero API cost): vault-create-document + kanban-card-scope-doc + kanban-card-update + kanban-card-criteria × N. Generates lean agent-readable spec (no markdown/diagrams/ASCII art), creates vault doc, links card, adds AC. Card must be in backlog or grooming. Returns draft for review.

**Args:**
- `card_id` (string, required) — Card ID to groom (e.g. 'CD-123
- `hints` (string, optional)

## kanban-board-gc

Garbage collect discarded kanban cards. Permanently deletes all cards in 'discarded' status. Use dry_run=true to preview which cards would be removed without deleting them. Workflow: kanban-card-move status='discarded' → kanban-board-gc.

**Args:**
- `dry_run` (boolean, optional) — If true, list discarded cards without deleting (default false)

## kanban-board-stats

Get Kanban board statistics showing card count per status column. Useful for quick overview without full card details.

**Args:**
- `workspace` (string, optional) — Workspace directory (defaults to current working directory)

## kanban-board-view

Get Kanban board view for agent use. Done cards excluded by default (use include_done=true to show them). Use level param to control density: tiny=TOON tabular (max token savings), low=compact (default), medium=full with emojis. Global density from jarvis.yaml tool-output.level is used when level is omitted.

**Args:**
- `workspace` (string, optional) — Workspace directory (defaults to current working directory)
- `include_done` (boolean, optional) — Include done cards (default: false)
- `level` (enum, optional) — Output density. Default: uses global tool-output.level config (low). tiny=TOON, low=compact, medium=full

## kanban-board-wip

Check WIP (Work In Progress) status: shows active cards in doing/review/blocked with Branch and PR columns, plus WIP limit violations. Empty violations section means all limits OK.

**Args:**
- `workspace` (string, optional) — Workspace directory (defaults to current working directory)

## kanban-card-array-op

Add or remove items in card's ac or gates arrays. Ac+add: append new acceptance criterion (provide value). Ac+remove: remove AC at zero-based index (provide index). Gates+remove: remove gate task at zero-based index (provide index).

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `array` (enum, required) — Target array: ac or gates
- `op` (enum, required) — Operation: add or remove
- `value` (string, optional) — Description text for ac+add
- `index` (number, optional) — Zero-based index for remove ops

## kanban-card-assign

Assign agent to card. Required before moving card to 'doing'. Agent is free-form string identifying worker.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `agent` (string, required) — Agent name to assign (e.g., 'claude-alpha

## kanban-card-assign-epic

Assign card to epic for feature-level grouping. Epic must already exist.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `epic_id` (string, required) — Epic ID (e.g., EP-001)

## kanban-card-assign-sprint

Assign card to sprint. Required before moving card to 'doing'. Sprint must already exist.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `sprint_id` (string, required) — Sprint ID (e.g., SP-001)

## kanban-card-blocked-by

Add or remove a 'blocked by' relationship between cards. Card blocked by another cannot progress until blocker is resolved.

**Args:**
- `card_id` (string, required) — Card ID that is blocked
- `blocker_card_id` (string, required) — Card ID that is the blocker
- `action` (enum, required) — Whether to add or remove the blocker

## kanban-card-brief

Generate full context briefing document for card. Includes card details, acceptance criteria, epic context, and sprint context. Designed for handing off work to another agent in parallel terminal session.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)

## kanban-card-close

Close card in one call: meets ALL pending gate tasks and acceptance criteria, then advances through review → tested → done automatically. REPLACES (saves ~90% tokens): kanban-criteria-meet × N + kanban-gate-meet × 3 + kanban-card-move × 3. Card must be in 'doing', 'review', or 'tested'. Returns compact: 'CD-XXX [done] | +N gates +N AC'.

**Args:**
- `card_id` (string, required) — Card ID to close (e.g. 'CD-123
- `evidence` (string, optional) — Short evidence string applied to all unmet gates (e.g. 'build pass, 755 tests, PR #123 merged

## kanban-card-create

Create new kanban card in backlog status. Cards track executable work items through pipeline.

**Args:**
- `title` (string, required) — Card title (brief work item description)
- `priority` (enum, optional) — Priority level. Default: medium
- `description` (string, optional) — Wikilink para o scope doc no vault (ex: [[CD-XXX-title]]). " + "Spec vive APENAS no vault. NÃO duplicar problema/valor/fronteiras aqui.
- `epic_id` (string, optional) — Epic ID to assign (e.g., EP-001)
- `workspace_id` (string, optional) — Target component workspace ID (e.g., GCP-FINOPS). Associates the card with that workspace for routing.

## kanban-card-criteria

Add acceptance criterion to card. At least 2 criteria are required before card can pass grooming.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `description` (string, required) — Acceptance criterion description
- `type` (enum, optional) — Criterion type: manual | automated | semi-automated
- `verifiable_by` (string, optional) — Who or what verifies this criterion
- `automated` (boolean, optional) — True if criterion is automatically verified

## kanban-card-criteria-meet

Mark acceptance criterion as met on card. Use the 0-based index of criterion.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `index` (number, required) — 0-based index of the acceptance criterion

## kanban-card-delete

Delete kanban card. Only cards in backlog, discarded, or done status can be deleted. To discard card from any other status, use kanban-card-move status='discarded' first, then kanban-board-gc to bulk-delete all discarded cards.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)

## kanban-card-depends-on

Add or remove a 'depends on' relationship between cards. Card that depends on another should not start until dependency is done.

**Args:**
- `card_id` (string, required) — Card ID that has the dependency
- `target_card_id` (string, required) — Card ID being depended upon
- `action` (enum, required) — Whether to add or remove the dependency

## kanban-card-field-get

Read single field from card by path. Up to 10× fewer tokens than kanban-card-get. Scalar paths: priority, title, status, description, epicId, assignedAgent, groomingCompleted. Array paths: ac, gates, dependsOn, blockedBy, statusHistory. Index paths: ac[0], ac[0].met, ac[1].description, gates[0].evidence, gates[0].met.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `key` (string, required) — Field path (e.g., priority, ac[0].met, gates[1].evidence)

## kanban-card-field-set

Atomically write single field without re-emitting full card. Writable paths: priority (high|medium|low|critical), description (string), title (string), ac[N].met=true (mark AC met, irreversible), gates[N].evidence (string, marks gate met with evidence).

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `key` (string, required) — Field path to write (e.g., priority, title, ac[0].met, gates[1].evidence)
- `value` (union, required) — New value for the field

## kanban-card-get

Get detailed information about specific card.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `format` (enum, optional) — Output format: text (default, human-readable) or json (structured)

## kanban-card-git-state

Read or manually update git state of kanban card (branchName, commitSha, prId, prUrl, gitPhase). Use action=get to inspect current state. Use action=set as escape hatch when side-effects did not fire automatically.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `action` (enum, required) — get: read current git state; set: manually update fields
- `branch_name` (string, optional) — Branch name to set (action=set only)
- `commit_sha` (string, optional) — Last commit SHA to set (action=set only)
- `pr_id` (number, optional) — Pull request ID to set (action=set only)
- `pr_url` (string, optional) — Pull request URL to set (action=set only)
- `git_phase` (enum, optional) — Git phase to set (action=set only)

## kanban-card-list

List kanban cards. G-10: at least one filter (status, epic_id, sprint_id, agent) is required. Returns compact one-line summaries. Use kanban-card-get for full details.

**Args:**
- `status` (enum, optional) — Filter by status
- `epic_id` (string, optional) — Filter by epic ID
- `sprint_id` (string, optional) — Filter by sprint ID
- `agent` (string, optional) — Filter by assigned agent
- `limit` (number, optional) — Max results (default 50)
- `offset` (number, optional) — Pagination offset (default 0)

## kanban-card-move

Move card to new status. Enforces state machine, WIP limits, and grooming validation. Valid statuses: backlog, grooming, ready, doing, review, blocked, tested, done, discarded.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `status` (enum, required) — Target status
- `justification` (string, optional) — Justification to bypass pipeline validation " + "(required if moving to tested/done with non-completed pipeline)

## kanban-card-scope-doc

Link scope document path to card. Required for grooming validation. Path should be relative to vault root (e.g., '12-Scope-Docs/CD-001-feature.md').

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `path` (string, required) — Vault-relative path to the scope doc " + "(e.g., '12-Scope-Docs/CD-001-my-feature.md

## kanban-card-transpile

Project kanban card through lens optimised for calling agent's context. Lenses by token cost: status (~15) id+title+status+epic+sprint+agent; start (~80) +AC+deps+scope excerpt; review (~120) +gates+review_iterations+formal spec; handoff (~150) +epic title+deps+scope excerpt; full-json — raw card JSON + resolved refs. Add interpret=true to any lens for LLM oneLineSummary/nextAction/riskFlags block (requires Ollama).

**Args:**
- `card_id` (string, required) — Card ID (e.g. CD-362)
- `lens` (enum, required) — Projection lens — status|start|review|handoff|full-json
- `interpret` (boolean, required) — Enrich output with LLM interpretation via Ollama gpt-oss
- `format` (enum, required) — Output format — text (compact) or json (structured)

## kanban-card-unblock

Unblock card that is currently in 'blocked' status. Moves it back to 'doing' (default) or 'backlog' if work must restart. Use this when blocker has been resolved.

**Args:**
- `card_id` (string, required) — Card ID to unblock (e.g., CD-001)
- `target` (enum, optional)

## kanban-card-update

Update card's description or priority after creation. Only fields provided will be changed.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-001)
- `description` (string, optional) — Novo description — deve ser wikilink [[CD-XXX-title]]. " + "Spec vive no vault scope doc, não aqui.
- `priority` (enum, optional) — New priority level
- `target_workspace_id` (string, optional) — Set or clear the target component workspace ID. Pass null or empty string to clear.

## kanban-dep-add

Add a dependency (card_id depends on target_id) without loading full card. Both cards must exist and card cannot depend on itself. Returns refreshed { total, done, blocking } summary.

**Args:**
- `card_id` (string, required) — Dependent card ID (e.g., CD-001)
- `target_id` (string, required) — Card ID that card_id will depend on (e.g., CD-002)

## kanban-dep-list

List card's dependencies with each dependency's current status, without loading full card. Returns JSON array of { id, status, blocking } — blocking is true while dependency is neither done nor discarded.

**Args:**
- `card_id` (string, required) — Card ID whose dependencies to list (e.g., CD-001)

## kanban-dep-remove

Remove a dependency (card_id no longer depends on target_id) without loading full card. Returns refreshed { total, done, blocking } summary.

**Args:**
- `card_id` (string, required) — Dependent card ID (e.g., CD-001)
- `target_id` (string, required) — Dependency card ID to remove (e.g., CD-002)

## kanban-dep-status

Summarize card's dependencies in single call: { total, done, blocking }. Total = dependency count, done = dependencies that reached done, blocking = dependencies that still hold this card back (neither done nor discarded).

**Args:**
- `card_id` (string, required) — Card ID whose dependencies to summarize (e.g., CD-001)

## kanban-epic-approve

HUMAN-ONLY: Finalize epic in pending_approval status. Moves it to done, recording closing commit/PR for traceability. This tool requires explicit user action — agents must NOT call this autonomously (G-5).

**Args:**
- `epic_id` (string, required) — Epic ID to approve (e.g., 'EP-001
- `closing_commit` (string, optional) — Git commit SHA or ref that closed this epic
- `closing_pr` (string, optional) — Pull request ID or URL that merged this epic

## kanban-epic-complete

Request completion of epic. Moves it to pending_approval — does NOT finalize. Blocked if any cards are still open (G-7). User must run kanban-epic-approve to finalize. Agents must NOT call kanban-epic-approve autonomously.

**Args:**
- `epic_id` (string, required) — Epic ID to complete (e.g., 'EP-001

## kanban-epic-create

Create new epic. Epics group related cards under feature or initiative. Every card must be assigned to epic before it can leave grooming.

**Args:**
- `title` (string, required) — Epic title (brief feature name)
- `description` (string, optional) — Detailed description of the epic scope
- `priority` (enum, optional) — Epic priority (default: medium)
- `owner` (string, optional) — Agent or person responsible for this epic
- `release_tag` (string, optional) — Release version tag (e.g. 'v1.7.0

## kanban-epic-delete

Permanently delete epic. Blocked if any cards are still active (not done/discarded). Cleans up associated sync mappings via onEpicDeleted callback.

**Args:**
- `epic_id` (string, required) — Epic ID to delete (e.g., 'EP-001

## kanban-epic-get

Get full details of specific epic by ID.

**Args:**
- `epic_id` (string, required) — Epic ID (e.g., 'EP-001

## kanban-epic-list

List all epics for current workspace. Returns compact one-line summaries. Pass group_by_release=true to group by release_tag. Use kanban-epic-get for full details.

**Args:**
- `group_by_release` (boolean, optional) — Group epics by release_tag (default: false)

## kanban-epic-start

Mark epic as in-progress (started). Blocked if another epic is already in_progress (G-1). Use when active development begins on epic's cards.

**Args:**
- `epic_id` (string, required) — Epic ID to start (e.g., 'EP-001

## kanban-epic-update

Update epic's description, owner, priority, or release_tag. Only fields provided will be changed.

**Args:**
- `epic_id` (string, required) — Epic ID to update (e.g., 'EP-001
- `description` (string, optional) — New description
- `owner` (string, optional) — New owner
- `priority` (enum, optional) — New priority
- `release_tag` (string, optional) — New release version tag (e.g. 'v1.8.0

## kanban-fast-track

Create + groom card in one call via Ollama gpt-oss:20b. REPLACES (saves ~85% tokens + zero API cost): kanban-card-create + kanban-auto-groom. Creates card, generates agent-readable scope doc (no markdown/diagrams), links vault doc, adds AC. Returns draft for review. USE THIS instead of kanban-card-create when you also need grooming.

**Args:**
- `title` (string, required) — Card title
- `epic_id` (string, optional) — Epic ID (e.g. 'EP-010
- `priority` (enum, optional) — Card priority (default: medium)
- `hints` (string, optional) — Optional context for Ollama: domain, constraints, related cards

## kanban-gate-get

Get single quality gate task by name (its description). Returns gate's met status and evidence in one call without loading full card. Use kanban-gate-list to discover gate names.

**Args:**
- `card_id` (string, required) — Card ID with the gate task (e.g. 'CARD-123
- `gate_name` (string, required) — Exact gate description to retrieve (see kanban-gate-list)

## kanban-gate-list

List all quality gate tasks for card. Shows which gates are required, which are met, and what evidence was provided.

**Args:**
- `card_id` (string, required) — Card ID to list gate tasks for (e.g. 'CARD-123

## kanban-gate-meet

Mark quality gate task as met by providing evidence. Use kanban-gate-list to see gate index numbers.

**Args:**
- `card_id` (string, required) — Card ID with the gate task (e.g. 'CARD-123
- `gate_index` (number, required) — Zero-based index of the gate task to meet
- `evidence` (string, required) — Evidence that the gate is met (e.g. 'All tests passing', 'PR #123 approved

## kanban-scope-get

Resolve card's scope doc and return its path, title and section list in ONE call — no need to load full card first. Then use kanban-scope-section to read specific section.

**Args:**
- `card_id` (string, required) — Card ID whose scope doc to inspect (e.g. 'CD-389

## kanban-scope-section

Read one section of card's scope doc in ONE call — doc path is resolved from card_id automatically (no kanban-card-get needed). Section_name matches a heading (e.g. 'Acceptance Criteria', 'Objetivo', 'Arquivos afetados', 'Fora do escopo').

**Args:**
- `card_id` (string, required) — Card ID whose scope doc to read (e.g. 'CD-389
- `section_name` (string, required) — Heading of the section to read (e.g. 'Acceptance Criteria

## kanban-sprint-activate

Activate sprint, moving it from planning to active status. Records start date. Cards can only be assigned to active sprints.

**Args:**
- `sprint_id` (string, required) — Sprint ID to activate

## kanban-sprint-backlog

Generate prioritized sprint backlog recommendation from roadmap. Lists active epics with their pending card count, sorted by priority, and recommends highest-priority epic to focus on next sprint.

**Args:**
- `roadmap_id` (string, required) — Roadmap ID to generate the backlog from
- `max_items` (number, optional) — Maximum number of epics to include (default: 10)

## kanban-sprint-cancel

Cancel sprint. Use only when sprint must be abandoned before completion (e.g., scope change, team emergency).

**Args:**
- `sprint_id` (string, required) — Sprint ID to cancel

## kanban-sprint-close

Close active sprint. Records end date and actual velocity. Use this when sprint time-box ends.

**Args:**
- `sprint_id` (string, required) — Sprint ID to close
- `velocity_actual` (number, optional) — Actual velocity delivered in story points
- `roadmap_id` (string, optional) — Roadmap ID to generate sprint summary against

## kanban-sprint-create

Create new sprint in planning status. Sprints group cards for fixed time-box and track team velocity. Must be activated before cards can be moved to doing.

**Args:**
- `name` (string, required) — Sprint name (e.g., 'Sprint 3' or 'Feb 2026
- `goal` (string, optional) — Sprint goal — what the team aims to deliver
- `velocity_planned` (number, optional) — Planned velocity in story points

## kanban-sprint-get

Get details of specific sprint by ID.

**Args:**
- `sprint_id` (string, required) — Sprint ID (e.g., 'SP-001

## kanban-sprint-list

List all sprints for current workspace.
