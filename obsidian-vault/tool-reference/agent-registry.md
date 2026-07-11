# Agent Tools

Tools for registering agent profiles, spawning sessions, and inter-agent communication.

---

## agent-register

Register a new agent profile with a role, system prompt, and tool access list.

**Parameters:** `id` (required), `display_name` (required), `role` (required), `system_prompt` (required), `allowed_tools` (optional array), `capabilities` (optional array), `model_primary` (optional), `model_fallbacks` (optional array)

```
agent-register
  id="code-reviewer"
  display_name="Code Reviewer"
  role="reviewer"
  system_prompt="You are a strict code reviewer. Focus on SOLID principles, test coverage, and security."
  model_primary="anthropic/claude-sonnet-4-6"
```

---

## agent-profile

Get detailed information about a registered agent.

**Parameters:** `id` (required)

```
agent-profile id="code-reviewer"
```

---

## agent-list

List all registered agent profiles, optionally filtered.

**Parameters:** `role` (optional), `status` (optional) — `active` | `inactive` | `draft`

---

## agent-spawn

Spawn a new OpenCode session configured with a registered agent's system prompt.

**Parameters:** `agent_id` (required), `message` (optional — initial message to send)

```
agent-spawn agent_id="code-reviewer" message="Review the changes in CD-007"
```

---

## agent-send

Send a message to another agent session.

**Parameters:** `target_session` (required), `message` (required), `context` (optional)

```
agent-send
  target_session="session-abc123"
  message="CD-007 implementation complete, please review policies.ts"
```

---

## agent-handoff

Hand off a work item to another agent. Transfers ownership.

**Parameters:** `work_item_id` (required), `target_agent` (required), `instructions` (optional)

```
agent-handoff work_item_id="CD-009" target_agent="code-reviewer" instructions="Review oracle doc quality"
```

---

## agent-status

Check the status of work items assigned to or delegated by this agent.

**Parameters:** `work_item_id` (optional)
