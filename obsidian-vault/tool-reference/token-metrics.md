# Token Metrics Tools

Tools for tracking and reporting token usage and cost across agents, cards, and sprints.

Token usage is tracked automatically via the `tool.execute.after` hook. Manual recording is only needed for custom attribution or external API calls.

---

## token-record

Record a token usage event manually.

**Parameters:** `workspace` (required), `toolName` (required), `agent` (required), `inputTokens` (required), `outputTokens` (required), `model` (required), `operation` (optional) — `grooming` | `implementation` | `review` | `fix` | `documentation` | `research` | `planning`, `cardId` (optional), `sprintId` (optional), `sessionId` (optional), `metadata` (optional object)

```
token-record
  workspace="JARVIS-OPENCODE-CLEAN"
  toolName="rag-oracle-search"
  agent="claude-sonnet-4-6"
  inputTokens=1200
  outputTokens=450
  model="anthropic/claude-sonnet-4-6"
  operation="research"
  cardId="CD-009"
```

---

## token-summary

High-level usage summary: overall stats, top agents, operation breakdown, cost recommendations.

**Parameters:** `workspace` (required)

```
token-summary workspace="JARVIS-OPENCODE-CLEAN"
```

---

## token-agent-report

Token usage broken down by agent.

**Parameters:** `workspace` (required), `agent` (optional — filter to specific agent), `sprintId` (optional)

```
token-agent-report workspace="JARVIS-OPENCODE-CLEAN"
token-agent-report workspace="JARVIS-OPENCODE-CLEAN" agent="claude-sonnet-4-6"
```

---

## token-card-report

Token usage broken down by kanban card.

**Parameters:** `workspace` (required), `cardId` (optional)

```
token-card-report workspace="JARVIS-OPENCODE-CLEAN"
token-card-report workspace="JARVIS-OPENCODE-CLEAN" cardId="CD-009"
```

---

## token-sprint-report

Token usage and cost broken down by sprint, including budget status.

**Parameters:** `workspace` (required), `sprintId` (optional)

```
token-sprint-report workspace="JARVIS-OPENCODE-CLEAN"
token-sprint-report workspace="JARVIS-OPENCODE-CLEAN" sprintId="SP-001"
```

---

## token-history

Get recent usage records with filtering.

**Parameters:** `workspace` (required), `agent` (optional), `cardId` (optional), `operation` (optional), `sprintId` (optional), `limit` (optional)

```
token-history workspace="JARVIS-OPENCODE-CLEAN" limit=20
token-history workspace="JARVIS-OPENCODE-CLEAN" cardId="CD-009"
```
