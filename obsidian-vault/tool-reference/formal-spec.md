# Formal Specification Tools

## Purpose
These tools add a formal verification lane to the delivery flow. They are designed for agent-driven implementation with human tech-lead review.

## When to Use
- Use for cards with lifecycle/state-machine logic, concurrency risk, or strict invariants.
- Skip for simple config/text/style cards.
- Decision is heuristic-driven by `formal-spec-analyze`.

## Tool: `formal-spec-analyze`
Analyzes a card and returns score, complexity level, and whether formal spec is required.

Example:
```bash
formal-spec-analyze card_id="CD-042"
```

Expected output fields:
- score
- level (`none|low|medium|high`)
- needs formal spec (`yes|no`)
- matched signals (keywords and weights)

## Tool: `formal-spec-validate`
Runs TLA+ validation with TLC via bundled `vendor/tla2tools.jar`.

Example:
```bash
formal-spec-validate spec_path="/repo/obsidian-vault/13-Formal-Specs/CD-042/spec.tla" config_path="/repo/obsidian-vault/13-Formal-Specs/CD-042/spec.cfg"
```

Expected output fields:
- valid (`PASS|FAIL`)
- duration ms
- states generated
- distinct states
- depth
- errors / warnings

## Tool: `formal-spec-report`
Writes human-readable artifacts in vault:
- `13-Formal-Specs/CD-XXX/report.md`
- `13-Formal-Specs/CD-XXX/diagram.mermaid`

Example:
```bash
formal-spec-report card_id="CD-042" summary="State transitions preserve invariants" valid=true duration_ms=820 errors=[] warnings=[] states_found=172 distinct_states=61 depth=9
```

## Review Guidance for Tech Leads
- Confirm the model maps to real business states (not implementation class names).
- Check invariants in report are business-valid and non-trivial.
- If `valid=false`, block move to `ready` until spec is corrected.
- If `valid=true`, use report + Mermaid as design contract for code generation.
