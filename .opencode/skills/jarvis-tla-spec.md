---
description: JARVIS formal specification workflow with TLA+ (analyze, validate, report)
---

Use for cards with non-trivial state transitions, concurrency risks, or strict invariants.

**1. Analyze:** `formal-spec-analyze card_id="CD-XXX"` — decides if spec is required.
**2. Validate:** `formal-spec-validate spec_path="...spec.tla" config_path="...spec.cfg"` — runs TLC model checker.
**3. Report:** `formal-spec-report card_id="CD-XXX" summary="..." valid=true duration_ms=N` — generates review artifacts.

**Tech-lead review order:** scope doc → report.md → diagram.mermaid → spec.tla (if needed).
**Go:** validation PASS + invariants align. **No-Go:** FAIL, missing artifacts, or ambiguous invariants.

Requires Java runtime + `vendor/tla2tools.jar`. Skip for trivial cards with rationale.
