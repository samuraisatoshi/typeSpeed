# Azure Events & Polling Tools

Tools for background polling of Azure DevOps changes and processing comment intents.

These tools are covered in azure-sync.md. This file provides a focused reference for the event-driven workflow.

---

## Polling Workflow

```
1. azure-poll-start                         # begin background polling
2. azure-poll-status                        # verify it's running
3. azure-events-list                        # check detected events
   workspace="JARVIS-OPENCODE-CLEAN"
   event_type="comment_added"
   acknowledged=false
4. azure-process-comment                    # process a comment event via LLM
   event_id="evt-abc123"
   org="mc1global"
   project="MyProject"
   workspace="JARVIS-OPENCODE-CLEAN"
5. azure-poll-stop                          # stop when done
```

---

## azure-poll-start

Start background polling for Azure DevOps work item changes. No-op if already running.

No parameters.

---

## azure-poll-stop

Stop background polling. No-op if not running. Detected events remain in storage.

No parameters.

---

## azure-poll-status

Check if polling is running, poll count, and last poll timestamp.

No parameters.

---

## azure-events-list

List detected sync events with optional filtering.

**Parameters:** `workspace` (required), `work_item_id` (optional), `event_type` (optional) — `field_change` | `state_change` | `comment_added` | `revision_bump` | `all`, `acknowledged` (optional boolean), `limit` (optional)

```
azure-events-list
  workspace="JARVIS-OPENCODE-CLEAN"
  event_type="comment_added"
  acknowledged=false
  limit=10
```

---

## azure-process-comment

Process a `comment_added` event via LLM intent classification. Classifies intent, executes the kanban action, and posts a reply back to Azure DevOps.

**Supported intents:** `create-card` | `move-card` | `add-ac` | `add-note` | `reply-plan` | `unknown`

**Parameters:** `event_id` (required), `org` (required), `project` (required), `workspace` (required)

```
azure-process-comment
  event_id="evt-abc123"
  org="mc1global"
  project="MyProject"
  workspace="JARVIS-OPENCODE-CLEAN"
```
