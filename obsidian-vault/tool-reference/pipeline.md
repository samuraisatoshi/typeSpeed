# Pipeline & Gate Tools

Tools for CI/CD pipeline management via Dagger.

**Scopes:** `branch` (CI: analyze/lint/test/build) | `release` (CD: full pipeline including tag/publish/deploy)
**Stacks:** `typescript-lib` `typescript-app` `python-lib` `python-app` `swift-ios` `csharp-app` `kotlin-android` `generic`

---

## pipeline-init

Create a new pipeline from a stack template. Starts in `draft` status.

**Parameters:** `workspace` (required), `stack` (required), `scope` (required) — `branch` | `release`, `version` (required), `cardId` (optional)

```
pipeline-init
  workspace="JARVIS-OPENCODE-CLEAN"
  stack="typescript-app"
  scope="branch"
  version="0.14.5"
  cardId="CD-009"
```

---

## pipeline-activate

Activate a draft pipeline, making it runnable.

**Parameters:** `pipelineId` (required)

```
pipeline-activate pipelineId="PL-001"
```

---

## pipeline-cancel

Cancel a draft or active pipeline.

**Parameters:** `pipelineId` (required)

---

## pipeline-retry

Retry a failed pipeline. Resets to active and retries the failed gate.

**Parameters:** `pipelineId` (required)

---

## pipeline-query

Query pipelines and templates.

**Parameters:** `query` (required) — `get-pipeline` | `list-pipelines` | `list-templates`, `pipelineId` (for get-pipeline), `workspace` (for list-pipelines), `status` (optional filter), `scope` (optional filter)

```
pipeline-query query="list-pipelines" workspace="JARVIS-OPENCODE-CLEAN" status="active"
pipeline-query query="list-templates"
pipeline-query query="get-pipeline" pipelineId="PL-001"
```

---

## gate-run

Execute a gate via Dagger. Automatically passes or fails the gate.

**Parameters:** `pipelineId` (required), `gateId` (required), `moduleDir` (required — path to Dagger module), `args` (optional array), `timeoutMs` (optional)

```
gate-run pipelineId="PL-001" gateId="lint" moduleDir="./dagger"
gate-run pipelineId="PL-001" gateId="test" moduleDir="./dagger" timeoutMs=120000
```

---

## gate-pass

Manually pass a gate.

**Parameters:** `pipelineId` (required), `gateId` (required), `output` (optional — evidence)

```
gate-pass pipelineId="PL-001" gateId="manual-review" output="Reviewed by lead engineer"
```

---

## gate-fail

Manually fail a gate.

**Parameters:** `pipelineId` (required), `gateId` (required), `reason` (required)

---

## gate-skip

Skip a gate with a reason.

**Parameters:** `pipelineId` (required), `gateId` (required), `reason` (required)

```
gate-skip pipelineId="PL-001" gateId="integration-tests" reason="Docs-only change, no integration impact"
```

---

## Typical Pipeline Workflow

```
1. pipeline-init workspace="..." stack="typescript-app" scope="branch" version="0.14.5" cardId="CD-009"
2. pipeline-activate pipelineId="PL-001"
3. gate-run pipelineId="PL-001" gateId="lint" moduleDir="./dagger"
4. gate-run pipelineId="PL-001" gateId="test" moduleDir="./dagger"
5. gate-run pipelineId="PL-001" gateId="build" moduleDir="./dagger"
   # on failure:
   # pipeline-retry pipelineId="PL-001"
```
