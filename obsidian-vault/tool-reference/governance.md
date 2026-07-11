# Tool Reference — Governance

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## governance-next-step

Workflow oracle: query governance FSM for next required action. Given card ID and optional intent (modify-code, commit, create-pr, etc.), returns whether action is allowed and exact next tool+args to call. Without intent, suggests logical next step based on current card status. Use BEFORE any card lifecycle action to ensure governance compliance.

**Args:**
- `card_id` (string, required) — Card ID (e.g., CD-111)
- `intent` (string, optional)

## governance-policies

List all active governance policies. Shows rules that are enforced on tool invocations.

## governance-validate

Validate tool invocation against governance policies. Use this to pre-check if operation is allowed before executing it.

**Args:**
- `tool_name` (string, required) — Name of the tool to validate
- `tool_args` (string, required) — JSON string of the tool arguments

## recovery-mode-activate

Activate recovery mode for current session. Temporarily suspends blockBashFileRead governance policy, allowing bash cat/head/tail on.ts,.md,.yaml,.py and other managed files. Use this ONLY when specialized reading tools (file-read, rag-snippet, vault-manage) are unavailable or broken. Recovery mode auto-expires after specified duration. All other governance policies remain active.

**Args:**
- `duration_minutes` (number, optional) — How long to keep recovery mode active in minutes (default: 15, max: 60)

## recovery-mode-deactivate

Deactivate recovery mode immediately for current session. Restores blockBashFileRead governance policy. Call this when you have finished emergency diagnosis.

## recovery-mode-status

Check whether recovery mode is currently active for current session. Returns active/inactive status and time remaining if active.
