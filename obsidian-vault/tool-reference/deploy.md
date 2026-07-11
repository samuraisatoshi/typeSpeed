# Tool Reference — Deploy

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## deploy-cloudrun-spec

Generate Cloud Run Job YAML spec (cloudrunjob.yaml) for GCP project.Validates image digest (sha256:...), secret versions (numeric only), SA email format,and VPC connector requirement for non-dev environments.Also produces SA Role Envelope comment block for deploy-preflight validation.

**Args:**
- `output_dir` (string, required)
- `job_name` (string, required) — Cloud Run Job name
- `project_id` (string, required) — GCP project ID
- `region` (string, required) — GCP region (e.g., us-central1)
- `image_digest` (string, required) — Container image digest — must be sha256:[a-f0-9]{64}
- `service_account_email` (string, required) — SA email (name@project.iam.gserviceaccount.com)
- `environment` (enum, required) — Deployment environment
- `secrets` (array, required)
- `vpc_connector` (string, optional) — VPC connector name — required for staging/production

## deploy-container-generate

Generate Dockerfile (multi-stage, pinned digests from iac/base-images.yaml), entrypoint.sh (static; Cloud Run Job env-var injection), and.dockerignore (security blocklist) for JARVIS remote deploy executor container. Runs shellcheck on entrypoint.sh before writing. Emits SHA-256 digest of entrypoint.sh for audit. Throws on any validation, shellcheck, or security-pattern failure.

**Args:**
- `output_dir` (string, required) — Directory where Dockerfile, entrypoint.sh, .dockerignore will be written.
- `service_name` (string, optional) — Cloud Run service name to validate (ServiceName allowlist).
- `bucket_name` (string, optional) — GCS state bucket name to validate (BucketName allowlist).

## deploy-container-run

Trigger GCP Cloud Run Job execution with safety gates: concurrent-guard (aborts if a run is already active), four-eyes approval for production environments, immutable-digest enforcement (sha256 only — no mutable tags), pre-trigger preview (imageDigest, jobSpecHash, secret refs, masked env vars), polling until SUCCEEDED or FAILED, and audit trail note. Returns executionId, final status, durationSec, and auditRecord.

**Args:**
- `job_name` (string, required) — Cloud Run Job name (as shown in `gcloud run jobs list
- `image_digest` (string, required)
- `environment` (string, required)
- `triggered_by` (string, required)
- `workspace_dir` (string, optional) — Workspace directory (defaults to current project directory).
- `job_spec_path` (string, optional)
- `poll_interval_ms` (number, optional) — Polling interval in ms (default 5000).
- `timeout_ms` (number, optional) — Total execution timeout in ms (default 300000 = 5 min).

## deploy-infra-check

Check whether cloud/vendor infrastructure resources exist. Accepts list of resources with type, name, and provider. Returns per-resource status (exists/missing/error). Use before deploy to verify all infrastructure dependencies are in place.

**Args:**
- `resources` (array, required)
- `type` (enum, required)
- `name` (string, required) — Resource identifier (bucket name, topic name, etc.)
- `provider` (enum, required) — Cloud provider or vendor (gcp, aws, azure, mongodb-atlas, etc.)
- `config` (record, optional) — Provider-specific config (projectId, groupId, region, etc.)

## deploy-infra-provision

Provision missing cloud/vendor infrastructure resources. Checks existence first, creates only what is missing, then re-verifies. Use dry_run=true to preview without creating. Workflow: check → provision missing → re-check → report.

**Args:**
- `resources` (array, required)
- `type` (enum, required)
- `name` (string, required) — Resource identifier
- `provider` (enum, required)
- `config` (record, optional) — Provider-specific config (projectId, groupId, region, etc.)
- `spec` (object, required)
- `region` (string, optional)
- `options` (record, optional) — Provisioning specification (region, options)
- `mode` (enum, required) — Execution mode: local (run now), delegate (generate handoff for infra team), pipeline (generate Azure Pipelines YAML)
- `environment` (string, optional) — Target environment name (e.g. 'production', 'staging
- `dry_run` (string, optional) — Preview what would be created without actually provisioning. Default: false.

## deploy-infra-verify

Verify that cloud resources declared in deploy.jarvis.yaml exist in the provider (GCP/AWS). Checks secrets, parameters, buckets, queues, and pubsub topics via CLI.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)
- `provider` (string, optional) — Cloud provider: gcp or aws (auto-detected from manifest)
- `project` (string, optional) — Cloud project ID (auto-detected from manifest)

## deploy-log-assess

Assess deploy log using local Ollama llama3.2 — FREE, no cloud API calls. Parses log first (deterministic, zero LLM), then sends only structured report (~500 tokens) to Ollama for analysis. Returns: severity (low/medium/high/critical), root cause explanation, suggested fix, design observations, and steps analysis. Requires Ollama running locally: ollama serve && ollama pull llama3.2

**Args:**
- `path` (string, required) — Absolute or relative path to the deploy-*.log file
- `provider` (enum, optional) — LLM provider — currently only 'local' (Ollama) is supported (default: local)

## deploy-log-list

List all deploy-*.log files in directory with lightweight status summaries. Reads only first and last 30 lines of each log — does not parse full file. Shows: filename, timestamp, steps executed/total, duration, and first error.

**Args:**
- `dir` (string, optional) — Directory to scan for deploy-*.log files (defaults to current workspace)

## deploy-log-parse

Parse deploy log file (Dagger + shell orchestration) into structured report. ZERO LLM calls — purely deterministic regex extraction. Reduces a 30KB raw log (~7,500 tokens) to a ~500-token structured report. Use this BEFORE deploy-log-assess to minimize token usage. Extracts: steps [N/M] with status and duration, errors with line numbers, root cause, exit code, GCP project/region/service/tag, runtime info.

**Args:**
- `path` (string, required) — Absolute or relative path to the deploy-*.log file

## deploy-manifest-audit

Audit deploy.jarvis.yaml for manifest readiness. Scans source code for undeclared env vars, validates ref formats via cloud provider (GCP/AWS/Azure auto-detected from manifest.target), and optionally runs RAG semantic queries to surface implicit dependencies. Returns completeness score (0–100) and copy-paste deploy-manifest-env-add commands pre-filled with real project paths. Supports orchestrator manifests with modules[] for aggregated multi-manifest reports. Delivers results via 3 channels: inline report + context note + vault guide refresh.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory containing deploy.jarvis.yaml. Defaults to plugin workspace.
- `src_dir` (string, optional) — Source directory to scan for env var references. Defaults to workspace_dir.
- `root_workspace_dir` (string, optional)
- `use_rag` (boolean, optional) — Enable RAG semantic queries to find implicit dependencies. Default: true.
- `show_unused` (boolean, optional)

## deploy-manifest-env-add

Add or update environment variable in deploy.jarvis.yaml. Call this immediately when writing code that uses process.env.X, os.environ['X'], or any environment-dependent value. Updates vault/14-Deploy/environment-vars.md atomically. Creates deploy.jarvis.yaml if it does not exist yet.

**Args:**
- `name` (string, required) — Environment variable name (e.g. DATABASE_URL)
- `source` (enum, required) — secret-manager: GCP/Azure secrets | env: plain env var | literal: hardcoded (dev only)
- `secret_ref` (string, optional) — Secret Manager path (e.g. projects/{project}/secrets/{name}/versions/latest)
- `default` (string, optional) — Default value for source=env (e.g. 'localhost:6379
- `required` (boolean, optional) — Whether the variable is required for the app to start (default: true)
- `sensitive` (boolean, optional) — If true, marks the variable as sensitive — blocks literal source and default values
- `card` (string, optional) — Kanban card ID that introduced this dependency (e.g. CD-042)
- `group` (string, optional) — If set, adds the variable to this named group in variable_groups " + "instead of the top-level environment block. " + "Use for shared vars in root manifests (kind: infrastructure).
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-env-remove

Remove environment variable from deploy.jarvis.yaml. Use when variable is no longer needed in codebase. Updates vault/14-Deploy/environment-vars.md atomically.

**Args:**
- `name` (string, required) — Environment variable name to remove
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-flag-add

Declare feature flag that gets set as environment variable on specific service at deploy time. Replaces hardcoded setEnvVar calls in deploy scripts. Example: UPLOAD_DECOMPOSED=true on core-api, OCR_VIA_PUBSUB=true on core-api. Updates vault/14-Deploy/runtime-config.md atomically.

**Args:**
- `name` (string, required) — Feature flag name (e.g. 'UPLOAD_DECOMPOSED
- `env_var` (string, required) — Environment variable key set on the service
- `value` (string, required) — Value to set (always a string, e.g. 'true', '1', 'enabled
- `target_service` (string, required) — Service that receives this env var at deploy time
- `card` (string, optional) — Kanban card that introduced this flag
- `workspace_dir` (string, optional) — Workspace directory

## deploy-manifest-flag-remove

Remove feature flag from deploy.jarvis.yaml. Use when flag is no longer needed and has been removed from codebase.

**Args:**
- `name` (string, required) — Feature flag name to remove
- `workspace_dir` (string, optional) — Workspace directory

## deploy-manifest-group-list

List all variable_groups defined in deploy.jarvis.yaml (root manifests). Shows each group name and how many variables it contains. Use deploy-manifest-group-show to inspect variables in specific group.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-group-show

Show all variables in specific variable_group from deploy.jarvis.yaml. Displays each variable's source, ref, and metadata. Use deploy-manifest-group-list to see all available groups.

**Args:**
- `group` (string, required) — Group name to inspect (e.g. core-backend-secrets, infra-params)
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-network-set

Set network topology (VPC connector, ingress/egress rules) for service. Required when service connects to private resources (Cloud SQL, Redis, internal services). Missing VPC connector is common cause of 'connection refused' errors after deploy. Pipeline reads these specs — it NEVER overwrites them.

**Args:**
- `service` (string, required) — Service name (must already exist in deploy.jarvis.yaml)
- `vpc_connector` (string, optional) — Full VPC connector resource name: projects/{project}/locations/{region}/connectors/{name}
- `vpc_egress` (string, optional) — 'private-ranges-only' (default) or 'all-traffic'
- `ingress` (string, optional) — 'all' | 'internal' | 'internal-and-cloud-load-balancing'
- `port` (number, optional) — Container port (overrides container-level port)
- `workspace_dir` (string, optional) — Workspace directory

## deploy-manifest-service-add

Add or update service dependency in deploy.jarvis.yaml. Call this when adding code that depends on external service. Use depends_on to declare which services must be deployed before this one. Updates vault/14-Deploy/services.md and deploy-order.md atomically.

**Args:**
- `name` (string, required) — Service name (e.g. 'ocr-worker', 'pubsub-infra
- `type` (enum, required) — Service type: cloud-run, cloud-sql, memorystore, pubsub, redis, etc.
- `connection_var` (string, required) — Environment variable that holds the connection string (e.g. DATABASE_URL)
- `depends_on` (string, optional) — Comma-separated list of service names that must deploy before this one. " + "Use 'external:workspace-id' for inter-workspace dependencies. " + "Example: 'pubsub-infra,core-api' or 'external:shared-infra'
- `card` (string, optional) — Kanban card ID (e.g. CD-042)
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-show

Display current deploy.jarvis.yaml manifest for this workspace. Shows all declared environment variables (source, required, card), service dependencies, container config, and deploy target. Run this before starting any deploy-related work to understand current state.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)

## deploy-manifest-sync

Audit and sync deploy.jarvis.yaml with vault docs. Without confirm=true, shows audit report of everything currently in YAML file (env vars, variable_groups, use_groups) so you can review before committing. With confirm=true, regenerates vault/14-Deploy/ docs from current YAML. Use this after manually editing deploy.jarvis.yaml outside of JARVIS tools.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory path (defaults to current project)
- `confirm` (boolean, optional) — Set to true to apply the sync (regenerate vault docs). " + "Omit or set false to run in audit/dry-run mode first.

## deploy-manifest-target-set

Set target runtime configuration in deploy.jarvis.yaml: GCP project, region, container image registry, and tag strategy. Required for cloud targets (gcp-cloud-run, aws-ecs, etc.) before deploy. Pipeline READS these values — it never overwrites them.

**Args:**
- `project` (string, optional) — Cloud project ID (e.g. 'my-gcp-project', AWS account ID)
- `region` (string, optional) — Deploy region (e.g. 'us-central1', 'us-east-1
- `image_registry` (string, optional) — Container image registry prefix (e.g. 'gcr.io/my-project', '123456789.dkr.ecr.us-east-1.amazonaws.com
- `tag_strategy` (enum, optional) — How to derive the container image tag at deploy time
- `workspace_dir` (string, optional) — Workspace directory

## deploy-manifest-use-groups-set

Set use_groups list on module manifest (kind: backend or frontend). This declares which variable_groups from root manifest this module consumes. Variables from each group are merged with module's own environment declarations. Module-level declarations override group definitions for same variable name. Use deploy-manifest-group-list on root manifest to see available groups.

**Args:**
- `groups` (array, required) — List of group names to consume (e.g. [\"core-backend-secrets\", \"gcp-runtime\"]). " + "Pass an empty array to clear use_groups.
- `workspace_dir` (string, optional) — Module workspace directory path (defaults to current project)

## deploy-manifest-validate

Validate deploy.jarvis.yaml: (1) topological sort — determines correct deploy order (producers before consumers); (2) cycle detection — fails if depends_on B depends_on A; (3) undeclared dependencies — services in depends_on not declared in manifest; (4) variable_groups — orphan groups, group-var conflicts; (5) use_groups cross-manifest — when root_workspace_dir is provided, verifies that all group names in use_groups exist in root manifest's variable_groups. For ROOT manifests: pass only workspace_dir. For MODULE manifests (kind: backend|frontend): pass workspace_dir=<module> AND root_workspace_dir=<root>. Generates vault/14-Deploy/deploy-order.md with dependency graph.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory to validate (defaults to current project). " + "For modules, this is the module directory (e.g. 'web/admin-portal
- `root_workspace_dir` (string, optional) — Root manifest directory (kind: infrastructure). " + "Required when validating a module manifest that uses use_groups. " + "Enables cross-manifest group resolution and group-not-found checks.

## deploy-manifest-workload-set

Set workload specs (CPU, memory, scaling) for service in deploy.jarvis.yaml. Call this when you know resource requirements for service. Required for cloud-run, gcp-gke, aws-ecs service types before deploy. Pipeline reads these specs — it NEVER overwrites them.

**Args:**
- `service` (string, required) — Service name (must already exist in deploy.jarvis.yaml)
- `cpu` (string, optional) — vCPU count as string: '0.5', '1', '2'
- `memory` (string, optional) — Memory with unit: '512Mi', '1Gi', '2Gi'
- `min_instances` (number, optional) — Minimum always-on instances (0 = scale to zero)
- `max_instances` (number, optional) — Maximum scale ceiling
- `concurrency` (number, optional) — Max concurrent requests per instance (Cloud Run)
- `timeout_sec` (number, optional) — Request timeout in seconds
- `workspace_dir` (string, optional) — Workspace directory (defaults to current project)

## deploy-migrate-scan

Scan workspace manifest and generate terraform import commands for existing infrastructure. Use BEFORE terraform apply on legacy workspaces. Generates import.sh script.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)

## deploy-port-validate

Validate Dockerfile EXPOSE port against deploy.jarvis.yaml port configuration. Detects mismatches that would cause runtime failures.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)
- `manifest_port` (number, optional) — Expected port from manifest (auto-detected if omitted)

## deploy-preflight

Full pre-flight check: Configuration Health + IBOM reconciliation (code vs manifest) + service dependency graph + port validation. Produces health page + runbook in 14-Deploy/. Pipeline gate: score < 80 or critical items or IBOM FAIL → BLOCKED.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory to check (default: current workspace)
- `root_workspace_dir` (string, optional) — Root orchestrator workspace dir — use when auditing a sub-module
- `use_ai` (string, optional) — Synthesize flight checklist using AI. Default: false.
- `register_ado` (string, optional) — Register result as Azure DevOps GMUD Task. Default: false.
- `probe_dns` (string, optional) — Run live DNS + TLS probes. Default: false.
- `skip_ibom` (string, optional) — Skip IBOM checks (code scan + reconcile). Default: false.

## deploy-reconcile

Reconcile code dependencies vs manifest declarations. Scans source code for env vars, secrets, service URLs, then cross-references with deploy.jarvis.yaml. Reports missing declarations (FAIL) and unused declarations (WARN).

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)

## deploy-service-deps

Analyze cross-service dependencies. Detects service URL env vars (*_URL, *_HOST, *_ENDPOINT) and maps them to declared services. Flags unresolvable dependencies.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)

## env-create

Create new isolated development environment. Environment is tracked with metadata and can be linked to kanban card. Actual container creation is done via container-use MCP tools. Valid purposes: feature, bugfix, experiment, refactor, spike, hotfix. Valid merge strategies: merge-commit, squash, rebase.

**Args:**
- `name` (string, required) — Environment name (alphanumeric, hyphens, underscores, 3-50 chars)
- `purpose` (string, required) — Environment purpose (feature, bugfix, experiment, refactor, spike, hotfix)
- `description` (string, required) — Human-readable description
- `cardId` (string, optional) — Optional kanban card ID to link this environment to
- `baseImage` (string, optional) — Optional base container image (e.g., 'node:20-alpine', 'python:3.12
- `setupCommands` (array, optional) — Optional setup commands to run once on environment creation
- `installCommands` (array, optional) — Optional install commands to run for dependencies (e.g., 'npm install
- `envVars` (record, optional) — Optional environment variables as key-value pairs
- `mergeStrategy` (string, optional) — Optional merge strategy (merge-commit, squash, rebase). Default: merge-commit

## env-delete

Delete container-use environment. Marks environment for deletion and provides instructions to remove actual container via container-use MCP tools.

**Args:**
- `envId` (string, required) — Environment ID to delete

## env-init

Analyze project directory and suggest environment configuration. Scans for languages, frameworks, and dependencies to recommend base image and setup commands.

**Args:**
- `directory` (string, required) — Project directory to analyze (absolute path)

## env-list

List environments for current workspace. Optionally filter by status (active environments only).

**Args:**
- `filter` (enum, optional) — Optional filter: 'all' (default) or 'active' only

## env-merge

Merge environment changes back to main branch. This starts merge process in environment tracking system. Actual git merge is done via git MCP tools. After merge completes, use env-status with complete-merge action to finalize.

**Args:**
- `envId` (string, required) — Environment ID to merge
- `targetBranch` (string, optional) — Target branch to merge into (default: main)

## env-status

Get or update environment status. Supports multiple actions: info (get current status), activate, fail, complete-merge, revert-merge, link-card, unlink-card.

**Args:**
- `envId` (string, required) — Environment ID
- `action` (enum, optional) — Action to perform (default: info)
- `reason` (string, optional) — Reason (required for fail and revert-merge actions)
- `commitSha` (string, optional) — Commit SHA (required for complete-merge action)
- `cardId` (string, optional) — Card ID (required for link-card action)

## gate-fail

Manually fail gate. Use this when gate needs to fail for reasons outside of automated checks.

**Args:**
- `pipelineId` (string, required) — Pipeline ID containing the gate
- `gateId` (string, required) — Gate ID to fail
- `reason` (string, required) — Reason for failing the gate

## gate-pass

Manually pass gate. Use this for gates that require manual approval or when gate was incorrectly failed.

**Args:**
- `pipelineId` (string, required) — Pipeline ID containing the gate
- `gateId` (string, required) — Gate ID to pass
- `output` (string, optional) — Optional output/notes for passing the gate

## gate-run

Execute gate via Dagger. Starts gate, runs Dagger function, and automatically passes or fails gate based on result.

**Args:**
- `pipelineId` (string, required) — Pipeline ID containing the gate
- `gateId` (string, required) — Gate ID to execute
- `moduleDir` (string, required) — Directory containing the Dagger module
- `args` (array, optional) — Optional arguments to pass to the Dagger function
- `timeoutMs` (number, optional) — Optional timeout in milliseconds (default: 300000)

## gate-skip

Skip gate with reason. Use this for gates that are not applicable in current context (e.g., skipping integration tests for a docs change).

**Args:**
- `pipelineId` (string, required) — Pipeline ID containing the gate
- `gateId` (string, required) — Gate ID to skip
- `reason` (string, required) — Reason for skipping the gate

## infra-bill-of-materials

Generate full Infrastructure Bill of Materials (IBOM) report. Maps all code dependencies, manifest declarations, and reconciliation status. Use this before deploy to catch inconsistencies.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)
- `project` (string, optional) — Project name (auto-detected from manifest if omitted)
- `provider` (string, optional) — Cloud provider (auto-detected from manifest if omitted)

## infra-region-advisor

Recommend cloud regions based on optimization mode. Modes: latency (lowest latency), cost (cheapest), balanced (best tradeoff), eu-compliant (GDPR/Schrems II — only EU territory regions). Returns top-3 recommendations with score, latency, cost tier, and EU compliance. Europe-west2 (London) is flagged as NOT EU post-Brexit.

**Args:**
- `provider` (enum, required) — Cloud provider
- `mode` (enum, required) — Optimization mode
- `user_locations` (array, required)
- `region` (string, required) — Geographic location (e.g. 'Brazil', 'Germany', 'Southeast Asia
- `weight` (number, required) — Traffic percentage from this location (0-100)
- `services` (array, optional) — GCP/AWS/Azure services that must be available (e.g. 'cloud-run', 'firestore
- `exclude_regions` (array, optional) — Regions to exclude from recommendations

## infra-terraform-apply

Run terraform apply in workspace's terraform/ directory. USE WITH CAUTION — modifies real infrastructure. Runner is pluggable.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)

## infra-terraform-generate

Generate Terraform.tf files from deploy.jarvis.yaml manifest. Reads manifest, detects provider (GCP/AWS), and produces terraform/ directory.

**Args:**
- `workspace_dir` (string, optional) — Workspace directory containing deploy.jarvis.yaml (default: current workspace)

## infra-terraform-plan

Run terraform plan in workspace's terraform/ directory. Shows planned changes without applying. Runner is pluggable: local (requires terraform CLI), dagger (containerized), dry-run (safe preview).

**Args:**
- `workspace_dir` (string, optional) — Workspace directory (default: current workspace)

## pipeline-activate

Activate draft pipeline, making it runnable. Validates that all gates are properly configured before activation.

**Args:**
- `pipelineId` (string, required) — Pipeline ID to activate

## pipeline-cancel

Cancel draft or active pipeline. This permanently stops pipeline and cannot be undone. Use pipeline-retry for temporary failures.

**Args:**
- `pipelineId` (string, required) — Pipeline ID to cancel

## pipeline-init

Create new pipeline from stack template. Pipeline starts in 'draft' status and must be activated before gates can run. Valid stacks: typescript-lib, typescript-app, python-lib, python-app, swift-ios, csharp-app, kotlin-android, generic. Valid scopes: branch (CI — analyze/lint/test/build), release (CD — full pipeline including tag/publish/deploy).

**Args:**
- `workspace` (string, required) — Workspace identifier (e.g., 'jarvis-opencode
- `stack` (string, required) — Stack template name (typescript-lib, typescript-app, python-lib, python-app, swift-ios, csharp-app, kotlin-android, generic)
- `scope` (enum, required) — Pipeline scope: 'branch' for CI (analyze/lint/test/build) or 'release' for full CD (all gates including tag/publish/deploy)
- `version` (string, required) — Version string for the pipeline (e.g., 'v1.0.0
- `cardId` (string, optional) — Optional kanban card ID to link this pipeline to

## pipeline-query

Query pipelines and templates. Supports various query types: get pipeline by ID, list pipelines by workspace (with optional status/scope filter), list templates.

**Args:**
- `query` (enum, required) — Query type to execute
- `pipelineId` (string, optional) — Pipeline ID (required for get-pipeline)
- `workspace` (string, optional) — Workspace ID (required for list-pipelines)
- `status` (enum, optional) — Optional status filter for list-pipelines
- `scope` (enum, optional) — Optional scope filter for list-pipelines

## pipeline-retry

Retry failed pipeline. Resets pipeline to active status and retries gate that caused failure.

**Args:**
- `pipelineId` (string, required) — Pipeline ID to retry

## pipeline-version-bump

Read current version from project file (package.json, pyproject.toml, or build.gradle), increment it using semantic versioning, and write new version back. Returns old version, new version, and which file was updated. Use bump=patch for bug fixes, bump=minor for new features, bump=major for breaking changes.

**Args:**
- `project_path` (string, required) — Path to the project root directory (where package.json or pyproject.toml lives). " + "Defaults to current working directory.
- `bump` (enum, required) — Which version component to increment: patch (0.0.X), minor (0.X.0), or major (X.0.0)
- `dry_run` (boolean, optional) — Preview the new version without writing to disk (default: false)

## terraform-add-resource

Append new HCL block to a.tf file. Supports any block type: resource, variable, output, locals, module, provider, data. Attributes are provided as JSON object of key→HCL-value pairs. String values must include surrounding quotes: {\"region\": \"\\\"us-central1\\\"\"}. If file does not exist, it will be created.

**Args:**
- `file` (string, required) — Path to the .tf file to append to
- `block_type` (string, required) — HCL block type: resource, variable, output, locals, module, data, provider, terraform
- `labels` (array, optional) — Block labels: 2 for resource/data (type + name), 1 for variable/output/module/provider, 0 for locals/terraform
- `attributes` (any, required) — JSON object of attribute key→raw HCL value pairs, e.g. {\"machine_type\":\"\\\"n1-standard-1\\\"\",\"zone\":\"\\\"us-central1-a\\\"\"}

## terraform-get

Read specific attribute from block in a.tf file using dot-notation reference. Format: block_ref = '<blockType>.<label1>.<label2>.<attrKey>' for resources/data, or '<blockType>.<label>.<attrKey>' for variable/output/module/provider, or '<blockType>.<attrKey>' for terraform/locals. Examples: 'resource.google_compute_instance.my_vm.machine_type', 'variable.project_id.default', 'locals.region'.

**Args:**
- `file` (string, required) — Path to the .tf file
- `block_ref` (string, required) — Dot-notation block reference, e.g. resource.google_compute_instance.my_vm.machine_type

## terraform-list

List all top-level blocks in Terraform.tf file. Token-efficient: shows block type and labels without loading attribute values. Use this before terraform-get to discover what blocks are available. Works with any.tf file: main.tf, variables.tf, outputs.tf, providers.tf.

**Args:**
- `file` (string, required) — Absolute or relative path to a .tf file

## terraform-set

Update existing attribute in a.tf block in-place. Block_ref identifies block and attribute (dot-notation). New_value is raw HCL value (e.g., '\"us-central1\"' for strings, 'true' for booleans, '2' for numbers). Strings must include surrounding quotes. Will error if attribute does not exist.

**Args:**
- `file` (string, required) — Path to the .tf file
- `block_ref` (string, required) — Dot-notation reference including attribute, e.g. resource.google_compute_instance.my_vm.machine_type
- `new_value` (string, required) — New HCL value (raw). Include quotes for strings: '\"n1-standard-2\"'

## terraform-validate

Validate structural HCL syntax of a.tf file. Checks brace balance, top-level block header format, and heredoc boundaries. Does NOT validate provider schemas, resource types, or variable references — use `terraform validate` (CLI) for semantic validation after `terraform init`.

**Args:**
- `file` (string, required) — Path to the .tf file to validate

## terraform-vars-get

Read variable value from Terraform.tfvars file by key. Returns raw HCL value as written in file. Use without key to list all variables in file.

**Args:**
- `file` (string, required) — Path to the .tfvars file
- `key` (string, optional) — Variable key to read. Omit to list all variables.

## terraform-vars-set

Write or update variable in Terraform.tfvars file. If key exists, its value is replaced in-place. If key does not exist, it is appended. String values must include surrounding quotes: '\"my-project\"'.

**Args:**
- `file` (string, required) — Path to the .tfvars file (created if absent)
- `key` (string, required) — Variable key to set
- `value` (string, required) — Raw HCL value. Strings need quotes: '\"my-project\"'. Numbers/booleans: '42', 'true'.
