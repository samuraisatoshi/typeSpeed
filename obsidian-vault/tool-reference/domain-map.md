# Tool Reference — Domain-map

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## domain-map-analyze

Analyze TypeScript project for Domain-Driven Design structure using ts-morph AST analysis. Produces bounded contexts, health metrics, independence scores, hotspots (git churn), import cycles, cross-context imports, layer violations and LOC violations. Persists snapshot to SQLite for use by domain-map-query, domain-map-gate-check and domain-map-card-context. Requires tsconfig.json in target directory (or supply tsconfig_path). For flat-layout workspaces (src/domains/{context}/ with no layer subdirs) pass layout=flat and context_root=src/domains.

**Args:**
- `directory` (string, required)
- `tsconfig_path` (string, optional)
- `loc_limit` (number, optional) — LOC limit for violation detection (default 530).
- `hotspots_window_days` (number, optional)
- `layout` (enum, optional)
- `context_root` (string, optional) — Override root folder for context detection (e.g. \"src/domains\
- `layers` (array, optional)
- `composition_layers` (array, optional)

## domain-map-baseline-report

Generate Markdown baseline report combining violations, independence scores and refactor candidates grouped by context. Use this output to seed EP-021 refactor backlog before hard gates flip on.

## domain-map-card-context

Resolve Domain Map context most likely affected by kanban card. Returns context_id, confidence, strategy that matched, and health + hot_spots + ports for that context. Run `domain-map-snapshot` first to populate snapshot repository.

**Args:**
- `card_title` (string, required) — Card title (required — primary signal for keyword match).
- `card_description` (string, optional) — Card description body (often a wikilink to the scope doc).
- `scope_doc_body` (string, optional)

## domain-map-conformance-check

Validates registered canonical contracts against actual component workspace snapshots. For each canonical contract, checks whether declared symbol exists in component's domain-map. Reports CONFORMANT / NON-CONFORMANT / UNREGISTERED.

**Args:**
- `workspace_id` (string, optional) — Orchestrator workspace ID (defaults to current workspace)

## domain-map-context-brief

Generate rich briefing for bounded context from latest Domain Map snapshot. Returns entities, inter-context dependencies, and layer violations in one call — optimized for agent context restoration after reset. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `context` (string, required) — Bounded context name (partial match, case-insensitive). Must resolve to exactly one context.
- `max_entities` (number, optional) — Maximum number of entities to include in the briefing (default 20, max 50).

## domain-map-contract-list

List all registered canonical contracts with authoritative flag per entry. Optionally filter by source_workspace_id and/or context_id.

**Args:**
- `source_workspace_id` (string, optional) — Filter by workspace ID
- `context_id` (string, optional) — Filter by context ID (requires source_workspace_id)

## domain-map-contract-register

Register canonical contract — declares that specific symbol in component workspace's bounded context is part of stable cross-workspace API surface. Idempotent: re-registering the same (workspace, context, symbol) updates record. Returns registered_with_authority_warning if source workspace is not declared authority for target context.

**Args:**
- `source_workspace_id` (string, required) — ID of the component workspace that owns the contract
- `context_id` (string, required) — Bounded context ID within that workspace (e.g. 'kanban
- `symbol_name` (string, required) — Exported symbol name (class, interface, function, etc.)
- `kind` (enum, required) — Contract kind: exported-type, exported-value, or port
- `description` (string, optional) — Optional human-readable description

## domain-map-cross-impact

Analyse cross-workspace change impact: for file in provider workspace, queries all registered consumers (workspaces-depending-on-me) and runs domain-map impact analysis on each consumer snapshot. Returns per-consumer affectedContexts, symbolsAtRisk, and riskScore. Consumers without snapshot appear with status='no-snapshot' and warning. Run `domain-map-snapshot` in each consumer workspace first.

**Args:**
- `file` (string, required)
- `workspace_id` (string, optional) — Provider workspace ID (defaults to current workspace)

## domain-map-entity-enrich

Enrich entities in latest Domain Map snapshot with LLM-generated descriptions. Reads each entity source snippet via SourceRange and calls Claude Haiku for a ≤20-word description. Idempotent — skips already-enriched entities. Filter by context_id or entity_ids to target subset. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `context_id` (string, optional) — Restrict to entities in this bounded context (exact context_id).
- `entity_ids` (array, optional) — Explicit list of entity_ids to enrich.

## domain-map-entity-list

List entities (classes, interfaces, enums, functions, types) from latest Domain Map snapshot. Filter by bounded context name, file path, or entity kind. Supports pagination via limit/offset. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `context` (string, optional) — Filter by bounded context name (partial match, case-insensitive).
- `file` (string, optional) — Filter by file path (partial match, case-insensitive).
- `kind` (enum, optional) — Filter by entity kind: class | interface | enum | function | type.
- `limit` (number, optional) — Maximum results to return (default 50, max 200).
- `offset` (number, optional) — Pagination offset (default 0).

## domain-map-federate

Consolidated view of all component workspace domain-map snapshots. Shows health, context count, violation count, and declared dependency edges for each component registered under this orchestrator workspace. Run domain-map-analyze in each component workspace first to generate snapshots.

**Args:**
- `workspace_id` (string, optional) — Orchestrator workspace ID (defaults to current workspace)
- `propagate_contracts` (boolean, optional)

## domain-map-gate-check

Validate latest persisted Domain Map v2 snapshot against gate rules. Returns pass/fail + list of violations grouped by kind. Default rule is strict (no cycles, no cross-context, no layer violations, no env leaks, no LOC violations). Use overrides to relax during baseline.

**Args:**
- `allow_cycles` (boolean, optional)
- `allow_cross_context` (boolean, optional)
- `allow_layer_violations` (boolean, optional)
- `allow_env_leaks` (boolean, optional)
- `max_loc_violations` (number, optional)

## domain-map-impact

Analyse structured change impact for file in latest Domain Map snapshot. Returns affected files grouped by context, contracts/ports at risk, concrete classes that implement those contracts, and numeric risk score. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `file` (string, required) — File path to analyse (partial match, case-insensitive). Must resolve to exactly one file.

## domain-map-implementors

Find all classes or types that implement or extend given interface, abstract class, or port in latest Domain Map snapshot. Returns entity details and edge kind (implements/extends). Run `domain-map-snapshot` first to populate repository.

**Args:**
- `symbol` (string, required) — Interface or class name to look up (partial match, case-insensitive). Must resolve to exactly one entity.
- `context` (string, optional) — Filter implementors to a specific bounded context (partial match, case-insensitive).

## domain-map-query

Query latest persisted Domain Map v2 snapshot. Supports 9 query types for context discovery, blast radius, violations, ports, drift diff, call graph, and dead code. Dead_entities caveat: limited to direct identifier calls — class methods via this.method() not covered until CD-040/CD-041. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `query` (enum, required) — Query type to run against the latest snapshot.
- `name` (string, optional) — Context name (used by query=context_by_name).
- `file_id` (string, optional) — Stable file ID (used by query=blast_radius).
- `file_path` (string, optional) — File path (used by query=blast_radius as alternative to file_id).
- `context_id` (string, optional) — Stable context ID (used by query=ports_for_context).
- `entity_id` (string, optional) — Entity ID (used by query=call_graph).
- `direction` (enum, optional) — Call graph direction — callers or callees (used by query=call_graph, default: callees).

## domain-map-rag-search

Semantic code search auto-scoped to bounded context most likely affected by kanban card. Resolves card_title (and optional scope_doc_body) against latest Domain Map snapshot, then calls rag-search with domain_filter pre-set to resolved context name.

**Args:**
- `query` (string, required) — Semantic search query.
- `card_title` (string, required) — Card title (drives context resolution).
- `card_description` (string, optional) — Card description body.
- `scope_doc_body` (string, optional) — Full text of the scope doc (drives wikilink-based resolution).
- `top_k` (number, optional) — Number of results (default 5).
- `workspace` (string, optional) — Workspace name (auto-detected if omitted).

## domain-map-reset

Clear all domain-map snapshot history for specific workspace. Deletes all rows from dm_snapshots, dm_files, dm_edges, and dm_contexts for given workspace_name without affecting other workspaces, kanban, or RAG data. Use before regenerating fresh baseline to remove stale mapping data.

**Args:**
- `workspace_name` (string, required) — Name of the workspace whose snapshot history should be cleared.
- `confirm_orchestrator` (string, optional) — Set to true to confirm intent when the target workspace has role=orchestrator.

## domain-map-snapshot

Generate Domain Map v2 canonical snapshot from any project. Supports TypeScript (ts-morph) and polyglot projects (Kotlin, Swift, Dart, Go, Python via tree-sitter). Bounded contexts are detected automatically from project folder structure using ConventionDetector — no configuration required. Explicit layout/layers/context_root act as overrides when auto-detection is insufficient. Supports layer-first (src/{layer}/{context}/), context-first (src/{context}/{layer}/), and flat (src/domains/{context}/) layouts. Returns JSON conforming to DomainMapSnapshotV1Schema.

**Args:**
- `directory` (string, required)
- `source_dir` (string, optional)
- `tsconfig_path` (string, optional)
- `loc_limit` (number, optional) — LOC limit for violation detection (default 530).
- `hotspots_window_days` (number, optional)
- `layout` (enum, optional)
- `layers` (array, optional)
- `context_root` (string, optional) — Override root folder for context detection. Supports multi-segment paths (e.g. \"src/domains\
- `clear_history` (boolean, optional)
- `exclude` (array, optional)
- `include` (enum, optional)
- `confirm_orchestrator` (string, optional) — Set to true to confirm intent when the target workspace has role=orchestrator.

## domain-map-view

View latest persisted Domain Map snapshot as markdown report. Reads from SQLite snapshot repository populated by domain-map-analyze or domain-map-snapshot. Returns message when no snapshot has been persisted yet.

**Args:**
- `directory` (string, optional)

## domain-map-views

Render latest persisted Domain Map v2 snapshot as Mermaid context graph, Markdown violations report, or Markdown independence-score ranking. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `view` (enum, required) — Which view to render.

## domain-map-where-is

Locate a symbol (class, interface, enum, function, type, or export) by name in latest Domain Map snapshot. Returns file path, line numbers, and bounded context — no file reads required. Supports partial, case-insensitive matching. Run `domain-map-snapshot` first to populate repository.

**Args:**
- `name` (string, required) — Symbol name to locate (substring match, case-insensitive).
- `context` (string, optional) — Filter by bounded context name (partial match).
- `kind` (enum, optional)
