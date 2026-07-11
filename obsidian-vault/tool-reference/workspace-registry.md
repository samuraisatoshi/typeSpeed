# Workspace Tools
Tools for registering and managing workspaces and their inter-dependencies.

---

## workspace-info

Get detailed information about a workspace by ID or directory path.

**Parameters:** `identifier` (required), `by_directory` (optional boolean)

Returns summary including language, deploy target, `repoType`, dependencies, and dependents.

```
workspace-info identifier="MENU-OCR"
workspace-info identifier="/path/to/project" by_directory=true
```

---

## workspace-list

List all registered workspaces.

**Parameters:** `status` (optional) — `active` | `archived` | `template`

Shows `primaryLanguage` and `repoType` for each workspace.

---

## workspace-update

Update workspace metadata, status, tech stack, deploy target, and repository topology.

**Parameters:** `id` (required), plus any of:
- `description`
- `primary_language`
- `tech_stack` (array)
- `add_tech`
- `remove_tech`
- `status`
- `set_metadata_key` + `set_metadata_value`
- `remove_metadata_key`
- `deploy_target`
- `repo_type`

`repo_type` valid values:
- `MAIN-MONO-REPO`
- `MAIN-NO-REPO`
- `MAIN-INDEPENDENT-REPO`
- `MODULE-MONO-REPO`
- `MODULE-INDEPENDENT-REPO`
- `MODULE-NO-REPO`

```
workspace-update id="MENU-OCR" repo_type="MAIN-NO-REPO"
workspace-update id="CLIENT-PORTAL" repo_type="MODULE-INDEPENDENT-REPO"
```
# Update description
workspace-update id="JARVIS-OPENCODE-CLEAN" description="JARVIS OpenCode plugin v2"

# Add tech stack entry
workspace-update id="JARVIS-OPENCODE-CLEAN" add_tech="Dagger"

# Store a governance rule
workspace-update
  id="JARVIS-OPENCODE-CLEAN"
  set_metadata_key="governance_rule_publish"
  set_metadata_value="NEVER publish npm without explicit user approval"
```

---

## workspace-link
Manage dependencies between workspaces.

**Parameters:**
- `action` (required) — `add` | `remove` | `list`
- `workspace_id` (for list)
- `source_id` + `target_id` (for add/remove)
- `dependency_type` (for add)
- `description` (optional)

`dependency_type` valid values:
- `api-consumer`
- `api-provider`
- `shared-lib`
- `monorepo-package`
- `data-source`
- `deployment-target`
- `SYSTEM-MODULE`
- `SYSTEM-MODULE-INDEPENDENT-REPO`
- `other`

Rules:
- Use `SYSTEM-MODULE` when parent and child modules live in the same mono-repo.
- Use `SYSTEM-MODULE-INDEPENDENT-REPO` when parent references child modules in separate repositories.
- Use `api-consumer` from consumer workspace to provider workspace for runtime API contracts.

```
workspace-link action="add" source_id="MENU-OCR" target_id="CLIENT-PORTAL" dependency_type="SYSTEM-MODULE-INDEPENDENT-REPO"
workspace-link action="add" source_id="CLIENT-PORTAL" target_id="BACK-END" dependency_type="api-consumer"
workspace-link action="list" workspace_id="BACK-END"
```

## workspace-set-context


Bind a component workspace to the current session. Call once per session when operating from an orchestrator workspace (`MAIN-NO-REPO`). Persists `componentWorkspaceId` in the active session so tools that accept an optional `workspace` param resolve it automatically via cascade.

**Parameters:** `component_id` (required) — registered workspace ID with a `SYSTEM-MODULE` or `SYSTEM-MODULE-INDEPENDENT-REPO` relationship to the orchestrator.

```
workspace-set-context component_id="BACK-END"
workspace-set-context component_id="CLIENT-PORTAL"
```

**Cascade order** — after binding, participating tools resolve workspace as:
1. Explicit `workspace` param on the tool call
2. Session `componentWorkspaceId` (set by this tool)
3. `process.cwd()` fallback

**Tools that participate in cascade:**
`kanban-board-view`, `kanban-board-stats`, `kanban-board-wip`,
`rag-search`, `rag-snippet`, `rag-index`, `rag-update`,
`domain-map-analyze`, `domain-map-view`, `domain-map-*`

**Tools outside the cascade** (require absolute path — see `workspace-get-context`):
`file-read`, `file-edit-lines`, `file-write-section`, `file-search`, `azure-git-*`

> Tip: `/start-card CD-XXX` auto-calls this tool when `card.targetWorkspaceId` is set (CD-124 behaviour).

## workspace-get-context


Read the component workspace currently bound to the session via `workspace-set-context`.

**Parameters:** none

Returns `componentWorkspaceId` and its registered `directory` (absolute filesystem path). Primary use: build absolute paths for file tools that are **outside** the cascade.

```
workspace-get-context
→ { componentWorkspaceId: "BACK-END",
    directory: "/Users/jfoc/Documents/DevLabs/mixed/menu-ocr/web/back-end" }
```

Returns empty when no component is bound — call `workspace-set-context` first.

> See workflow: [[orchestrator-workspace]] for the full recipe including file tool path construction.
