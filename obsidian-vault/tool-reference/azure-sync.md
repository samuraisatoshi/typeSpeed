# Azure Sync Tools

Tools for syncing kanban cards, epics, and sprints with Azure DevOps Boards, and managing PRs.

---

## azure-discover

Discover Azure DevOps project configuration: process template, work item types, iterations. Run before first sync.

**Parameters:** `org` (required), `project` (required)

```
azure-discover org="mc1global" project="MyProject"
```

---

## azure-push

Push local kanban entities to Azure DevOps. Creates or updates work items.

**Parameters:** `workspace` (required), `org` (required), `project` (required), `entity_type` (required) — `card` | `epic` | `sprint` | `task`, `entity_id` (optional — omit to push all), `dry_run` (optional boolean)

```
# Push all cards
azure-push workspace="JARVIS-OPENCODE-CLEAN" org="mc1global" project="MyProject" entity_type="card"

# Push a single card
azure-push workspace="JARVIS-OPENCODE-CLEAN" org="mc1global" project="MyProject" entity_type="card" entity_id="CD-009"

# Preview without committing
azure-push workspace="JARVIS-OPENCODE-CLEAN" org="mc1global" project="MyProject" entity_type="card" dry_run=true
```

---

## azure-pull

Pull Azure DevOps work items into the local kanban workspace.

**Parameters:** `workspace` (required), `org` (required), `project` (required), `entity_type` (required), `entity_id` (optional — Azure work item ID number), `dry_run` (optional)

---

## azure-sync

Bidirectional sync: push then pull. Equivalent to azure-push + azure-pull.

**Parameters:** `workspace` (required), `org` (required), `project` (required), `dry_run` (optional)

```
azure-sync workspace="JARVIS-OPENCODE-CLEAN" org="mc1global" project="MyProject"
```

---

## azure-status

Show sync mapping: which local entities are mapped to Azure work items, sync timestamps.

**Parameters:** `workspace` (required), `org` (required), `project` (required)

---

## azure-pr-create

Create a Pull Request in Azure Repos.

**Parameters:** `org` (required), `project` (required), `repository` (required), `title` (required), `description` (required), `source_branch` (required), `target_branch` (optional, default `main`), `reviewers` (optional array), `work_item_ids` (optional array of numbers)

```
azure-pr-create
  org="mc1global"
  project="MyProject"
  repository="jarvis-opencode"
  title="Add .md read guardrail (CD-007)"
  description="Adds file.warn-md-direct-read governance policy"
  source_branch="feat/cd-007"
  work_item_ids=[284]
```

---

## azure-pr-list

List PRs or get a single PR by ID.

**Parameters:** `org` (required), `project` (required), `repository` (required), `status` (optional) — `active` | `completed` | `abandoned`, `pull_request_id` (optional number), `top` (optional number)

---

## azure-comment

Add a structured comment to an Azure DevOps work item.

**Parameters:** `org` (required), `project` (required), `work_item_id` (required number), `comment_type` (required) — `push-summary` | `pr-link` | `custom`, `custom_text` (for custom type), `pr_url`, `pr_title`

---

## azure-poll-start / azure-poll-stop / azure-poll-status

Start, stop, or check background polling for Azure DevOps changes. No parameters needed.

```
azure-poll-start    # begin watching for work item changes
azure-poll-status   # check if polling is running
azure-poll-stop     # stop background polling
```

---

## azure-events-list

List detected Azure sync events (field changes, state transitions, comments).

**Parameters:** `workspace` (required), `work_item_id` (optional), `event_type` (optional) — `field_change` | `state_change` | `comment_added` | `revision_bump` | `all`, `acknowledged` (optional boolean), `limit` (optional)

```
azure-events-list workspace="JARVIS-OPENCODE-CLEAN" event_type="comment_added" acknowledged=false
```

---

## azure-process-comment

Process a comment_added event via LLM intent classification. Classifies intent and executes the corresponding kanban action.

**Parameters:** `event_id` (required), `org` (required), `project` (required), `workspace` (required)
