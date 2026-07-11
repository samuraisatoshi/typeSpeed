Generate and persist a structured handoff document using the MCP engine.

## Steps

1. Call `context-checkpoint` to save the current session state before handing off.

2. Call `handoff-generate` (MCP tool). It will:
   - Collect board state (done, doing, blocked, ready cards)
   - Collect active sessions
   - Write `09-Dashboards/handoff-latest.md` and `handoff-latest.json` to the vault
   - Return a 5-section summary

3. Print the summary returned by `handoff-generate`.

## Notes

- Pass `workspace_id` if the workspace differs from the current context.
- Pass `done_card_limit` (1–50) to control how many resolved cards appear (default 10).
- The vault files are the source of truth — the summary is for immediate reading.
