# Context Memory Tools

Tools for sessions, todos, notes, and context search.

---

## context-session-start

Start a work session. One active session per workspace.

**Parameters:** `purpose` (required), `agent_name` (optional)

```
context-session-start purpose="CD-009: RAG reindex and ORACLE rewrite"
```

**Error "active session exists"** → run `context-session-list` then `context-session-finish session_id="..."`.

---

## context-session-finish

Finish the active session with a summary.

**Parameters:** `session_id` (required), `summary` (required)

```
context-session-finish
  session_id="JARVIS-OPENCODE-CLEAN--20260302_092929_212"
  summary="CD-009 complete. RAG reindexed, ORACLE rewritten. 107 tests pass."
```

---

## context-session-list

List all sessions for the workspace ordered by start time. No parameters.

---

## context-todo-add

Add a TODO item. Priority 1 (critical) to 5 (trivial).

**Parameters:** `content` (required), `priority` (optional, default 3), `session_id` (optional), `tags` (optional array)

```
context-todo-add content="Write ORACLE docs for kanban tools" priority=2
```

---

## context-todo-list

List TODOs, optionally filtered by status.

**Parameters:** `status` (optional) — `pending` | `in_progress` | `completed` | `cancelled`

---

## context-todo-complete

Mark a TODO as completed.

**Parameters:** `todo_id` (required)

---

## context-note-add

Add a persistent note (survives across sessions).

**Parameters:** `content` (required), `type` (optional) — `note` | `decision` | `discovery` | `blocker`, `session_id` (optional), `tags` (optional)

```
context-note-add
  type="decision"
  content="ORACLE is a tool usage guide, not general project docs."
```

---

## context-search

Full-text search across all sessions, todos, and notes.

**Parameters:** `query` (required)

```
context-search query="kanban grooming validation errors"
```
