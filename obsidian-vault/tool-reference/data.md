# Tool Reference — Data

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## data-csv-query

Query rows from CSV file. Returns all rows or filtered subset. Use this instead of reading CSV files directly (blocked by governance). Filter syntax: 'column operator value' where operator is one of: ==,!=, >, >=, <, <=, contains. Examples: 'status == active', 'amount > 1000', 'name contains alice'.

**Args:**
- `file` (string, required) — Absolute path to the CSV file
- `filter` (string, optional) — Optional filter condition (e.g., 'status == active', 'amount > 1000
- `columns` (array, optional)
- `limit` (number, optional) — Maximum number of rows to return (default: 100)

## data-json-get

Read value from JSON file using dot-notation path. Supports nested keys and array indexing (e.g., 'users[0].name'). Omit path to return entire document.

**Args:**
- `file` (string, required) — Absolute path to the JSON file
- `path` (string, optional) — Dot-notation path to the value (e.g., 'config.timeout', 'results[0]

## data-json-set

Write or update value in JSON file using dot-notation path. Creates file and any missing directories if they do not exist. Use path '' or '.' to merge object at root. Value is parsed as JSON if it looks like JSON, otherwise treated as string.

**Args:**
- `file` (string, required) — Path to the JSON file
- `path` (string, required) — Dot-notation key path (e.g., 'database.host
- `value` (string, required) — Value to set. JSON-parseable strings are decoded (e.g., '42', 'true', '{\"a\":1}
- `indent` (number, optional) — JSON indentation spaces (default: 2)

## data-yaml-get

Read value from YAML file using dot-notation path. Supports nested keys and array indexing (e.g., 'items[0]'). Use this instead of reading YAML files directly (blocked by governance).

**Args:**
- `file` (string, required) — Absolute path to the YAML file (e.g., '/project/config.yaml
- `path` (string, optional) — Dot-notation path to the value (e.g., 'database.host', 'items[0].name

## data-yaml-set

Write or update value in YAML file using dot-notation path. Creates file and any missing directories if they do not exist. Use path '' or '.' to merge object at root. Value is parsed as JSON if it looks like JSON, otherwise treated as string.

**Args:**
- `file` (string, required) — Path to the YAML file
- `path` (string, required) — Dot-notation key path (e.g., 'server.port
- `value` (string, required) — Value to set. JSON-parseable strings are decoded (e.g., '42', 'true', '[1,2]

## formal-spec-analyze

Analyze card complexity and decide if formal specification is required before implementation.

**Args:**
- `card_id` (string, required) — Kanban card ID (e.g., CD-004)
- `scope_doc_content` (string, optional) — Optional scope content override for analysis

## formal-spec-report

Generate formal-spec report and Mermaid diagram artifacts under vault 13-Formal-Specs/<card_id>/.

**Args:**
- `card_id` (string, required) — Kanban card ID (e.g., CD-004)
- `summary` (string, required) — Human-readable summary of what the spec validates
- `valid` (boolean, required) — Validation result flag
- `duration_ms` (number, required) — Validation duration in milliseconds
- `errors` (array, optional) — Validation errors
- `warnings` (array, optional) — Validation warnings
- `states_found` (number, optional) — Total states generated
- `distinct_states` (number, optional) — Distinct states found
- `depth` (number, optional) — Search depth

## formal-spec-validate

Run TLA+ validation using bundled tla2tools.jar and return structured model-check results.

**Args:**
- `spec_path` (string, required) — Absolute path to the .tla spec file
- `config_path` (string, optional) — Optional absolute path to TLC .cfg file

## gradle-get

Read known Android build config value from build.gradle file using regex extraction. Supported keys: version, compileSdk, minSdk, targetSdk, applicationId, namespace, versionCode, versionName, jvmTarget, kotlinVersion.

**Args:**
- `file` (string, required) — Path to the build.gradle file
- `key` (enum, required) — Config key to read

## gradle-list-deps

List all dependency declarations in build.gradle file. Extracts implementation, api, testImplementation, kapt, ksp, etc. Returns scope, notation, and parsed group:artifact:version.

**Args:**
- `file` (string, required) — Path to the build.gradle file
- `scope` (string, optional) — Filter by scope: implementation, testImplementation, api, etc.

## gradle-schema

Describe structure of build.gradle or build.gradle.kts file: file type (.gradle vs .kts), top-level blocks, known Android config values, dependency and plugin counts. Token-efficient: no full file loaded.

**Args:**
- `file` (string, required) — Path to the build.gradle or build.gradle.kts file

## gradle-search

Search for text pattern in build.gradle file with context lines. Useful for finding specific configurations not covered by gradle-get.

**Args:**
- `file` (string, required) — Path to the build.gradle file
- `pattern` (string, required) — Text or regex pattern to search for (case-insensitive)
- `context_lines` (number, optional) — Lines of context around each match (default: 2)

## gradle-set

Update known Android build config value in build.gradle file using regex replace. Supported keys: version, compileSdk, minSdk, targetSdk, versionCode, versionName. Only replaces pattern in-place — never rewrites full file structure.

**Args:**
- `file` (string, required) — Path to the build.gradle file
- `key` (enum, required) — Config key to update
- `value` (string, required) — New value to set

## json-array-push

Append value to JSON array at given path. Value is parsed as JSON if it looks like JSON, otherwise treated as string. Example: append '@mc1global/new-plugin' to 'plugin' array in opencode.json.

**Args:**
- `file` (string, required) — Path to the JSON file
- `path` (string, required) — Dot-notation path to the array. Example: 'plugin'
- `value` (string, required) — Value to append (JSON or plain string)
- `indent` (number, optional) — JSON indentation (default: 2)

## json-delete-key

Delete key from JSON file using dot-notation path. File is updated in-place with same indentation. Use data-json-get first to confirm key exists.

**Args:**
- `file` (string, required) — Path to the JSON file
- `path` (string, required) — Dot-notation path to delete. Example: 'devDependencies.jest'
- `indent` (number, optional) — JSON indentation spaces (default: 2)

## json-list-keys

List keys at given path in JSON file without loading values. Token-efficient: shows only structure (key names and types), not content. Use path='' or omit to list all keys. Use depth=1 for top-level keys only.

**Args:**
- `file` (string, required) — Path to the JSON file
- `path` (string, optional) — Dot-notation path to inspect (empty = root). Example: 'dependencies'
- `depth` (number, optional) — Max depth to show (default: unlimited)

## json-schema

Describe structure of JSON file: top-level keys, types, nesting depth. Token-efficient: tells agent what file contains without loading values. Use before json-list-keys or data-json-get to understand file layout.

**Args:**
- `file` (string, required) — Path to the JSON file

## plist-delete-key

Remove key from plist file using dot-notation path. Uses plutil -remove. Use plist-get first to confirm key exists.

**Args:**
- `file` (string, required) — Path to the plist file
- `path` (string, required) — Dot-notation key path to remove

## plist-get

Read value from plist file using dot-notation key path. Uses plutil to extract value as JSON. Example paths: 'CFBundleVersion', 'NSAppTransportSecurity.NSAllowsArbitraryLoads'

**Args:**
- `file` (string, required) — Path to the plist file
- `path` (string, optional) — Dot-notation key path. Omit to return the entire plist as JSON.

## plist-list-keys

List keys at given path in plist file without loading values. Use path='' or omit to list all top-level keys. Use depth=1 for immediate children only.

**Args:**
- `file` (string, required) — Path to the plist file
- `path` (string, optional) — Dot-notation path (empty = root). Example: 'UIBackgroundModes'
- `depth` (number, optional) — Max depth to show (default: unlimited)

## plist-schema

Describe structure of plist file: key names, types, and nesting depth. Token-efficient: no values exposed. Works with both XML and binary plist formats (macOS only — uses plutil). Use this before plist-list-keys or plist-get to understand file layout. Common files: Info.plist, JarvisVoicePanel.entitlements, GoogleService-Info.plist.

**Args:**
- `file` (string, required) — Absolute or relative path to the plist file

## plist-search

Search for keys matching pattern in plist file. Returns matching key paths and their current values.

**Args:**
- `file` (string, required) — Path to the plist file
- `pattern` (string, required) — Regex or plain string to match against key names or paths

## plist-set

Write or update value in plist file using dot-notation key path. Uses plutil -replace for existing keys, -insert for new keys. Supported types: string, integer, float, bool. For complex types (dict, array) use plist-get to inspect first.

**Args:**
- `file` (string, required) — Path to the plist file
- `path` (string, required) — Dot-notation key path. Example: 'CFBundleVersion'
- `value` (string, required) — Value to set as a string (numbers/booleans parsed automatically)

## sdd-code-scaffold

Generate TypeScript domain skeleton from validated TLA+ spec. Reads spec.tla from 13-Formal-Specs/<card_id>/, calls gpt-oss to generate domain layer files (value-objects, ports, use-cases), runs tsc with 1 feedback loop.

**Args:**
- `card_id` (string, required) — Kanban card ID (e.g., CD-115)

## sdd-spec-scaffold

Generate TLA+ spec from kanban card's scope document using reasoning LLM. Reads scope doc, calls gpt-oss to generate spec.tla + spec.cfg, validates syntax, and writes artifacts to obsidian-vault/13-Formal-Specs/<card_id>/.

**Args:**
- `card_id` (string, required) — Kanban card ID (e.g., CD-115)

## sdd-test-scaffold

Generate Jest unit test skeleton from card's TLA+ spec and acceptance criteria. Each AC and TLA+ invariant gets traced test case (// AC-N or // INV-N). Tests import only from domain layer — zero infrastructure mocks.

**Args:**
- `card_id` (string, required) — Kanban card ID (e.g., CD-115)

## token-agent-report

Generate usage reports for agents. Returns list of agents with their total tokens, cost, and operation breakdown. Can optionally filter by specific agent or sprint.

**Args:**
- `workspace` (string, required) — Workspace identifier to generate report for
- `agent` (string, optional) — Optional agent identifier to filter by
- `sprintId` (string, optional) — Optional sprint ID to scope the report to

## token-card-report

Generate usage reports for kanban cards. Returns list of cards with their total tokens, cost, and agent breakdown. Can optionally filter by specific card.

**Args:**
- `workspace` (string, required) — Workspace identifier to generate report for
- `cardId` (string, optional) — Optional card ID to filter by

## token-history

Get usage history for workspace with optional filters. Returns recent usage records with pagination support.

**Args:**
- `workspace` (string, required) — Workspace identifier to query history for
- `agent` (string, optional) — Optional filter by agent identifier
- `cardId` (string, optional) — Optional filter by kanban card ID
- `sprintId` (string, optional) — Optional filter by sprint ID
- `operation` (string, optional) — Optional filter by operation type
- `limit` (number, optional) — Optional limit on number of records (default: 50, max: 500)

## token-record

Record token usage event for tracking and cost analysis. Captures input/output tokens, model, agent, operation type, and optional context (card, sprint, session). Valid operations: grooming, implementation, review, fix, documentation, research, planning.

**Args:**
- `workspace` (string, required) — Workspace identifier (e.g., 'jarvis-opencode
- `toolName` (string, required) — Tool or command name that used tokens
- `agent` (string, required) — Agent identifier (e.g., 'dev-agent', 'review-agent
- `inputTokens` (number, required) — Number of input tokens consumed
- `outputTokens` (number, required) — Number of output tokens generated
- `model` (string, required) — Model identifier (e.g., 'gpt-4', 'claude-3-opus
- `operation` (string, optional) — Optional operation type (grooming, implementation, review, fix, documentation, research, planning)
- `cardId` (string, optional) — Optional kanban card ID this usage is associated with
- `sprintId` (string, optional) — Optional sprint ID this usage is associated with
- `sessionId` (string, optional) — Optional session ID for grouping related operations
- `metadata` (record, optional) — Optional metadata as key-value pairs

## token-sprint-report

Generate usage reports for sprints. Returns list of sprints with their total tokens, cost, budget status, and breakdowns. Can optionally filter by specific sprint.

**Args:**
- `workspace` (string, required) — Workspace identifier to generate report for
- `sprintId` (string, optional) — Optional sprint ID to filter by

## token-summary

Get high-level usage summary for workspace. Shows overall statistics, top agents, operation breakdown, and cost recommendations.

**Args:**
- `workspace` (string, required) — Workspace identifier to generate summary for

## toml-delete-key

Delete key from TOML file using dot-notation path. File is updated in-place. Use toml-get first to confirm key exists.

**Args:**
- `file` (string, required) — Path to the TOML file
- `path` (string, required) — Dot-notation path to delete. Example: 'project.optional-dependencies'

## toml-get

Read value from TOML file using dot-notation path. Supports nested keys (e.g. 'project.version', 'tool.uv.required-version'). Omit path to return entire document.

**Args:**
- `file` (string, required) — Path to the TOML file
- `path` (string, optional) — Dot-notation path to read. Example: 'project.version' or 'dependencies'

## toml-list-keys

List keys at given path in TOML file without loading values. Token-efficient: shows only structure (key names and types), not content. Use path='' or omit to list all keys. Use path='project' to list [project] section keys. Use depth=1 for top-level keys only.

**Args:**
- `file` (string, required) — Path to the TOML file
- `path` (string, optional) — Dot-notation path to inspect (empty = root). Example: 'project' or 'dependencies'
- `depth` (number, optional) — Max depth relative to path (default: unlimited)

## toml-schema

Describe structure of TOML file: section names, key types, nesting depth. Token-efficient: tells agent what file contains without loading values. Use this before toml-list-keys or toml-get to understand file layout. Works with pyproject.toml, Cargo.toml, mise.toml, and any TOML config file.

**Args:**
- `file` (string, required) — Absolute or relative path to the TOML file

## toml-search

Search for keys matching pattern in TOML file. Finds keys by name without loading entire document into context. Returns matching key paths and their current values.

**Args:**
- `file` (string, required) — Path to the TOML file
- `pattern` (string, required) — Regex or plain string to match against key names or full dot-paths

## toml-set

Write or update value in TOML file using dot-notation path. Creates the key (and any parent sections) if they do not exist. Value is parsed as JSON if it looks like JSON, otherwise treated as string. Note: existing comments may not be preserved after write.

**Args:**
- `file` (string, required) — Path to the TOML file
- `path` (string, required) — Dot-notation path to set. Example: 'project.version'
- `value` (string, required) — Value to set. Parsed as JSON if applicable (numbers, booleans, arrays). " + "Example: '\"0.2.0\"' for a string, '42' for a number, 'true' for boolean

## workspace-bash

Execute shell command or claude-code prompt in PTY session. Streams sanitized output via broker SSE when stream_to_broker=true. Supports interactive auto-confirmation for y/n prompts via auto_confirm. Cloud env vars (GOOGLE_CLOUD_PROJECT, CLOUDSDK_ACTIVE_CONFIG_NAME) are injected when workspace_id + env resolve registered cloud project. Returns exit code, output SHA-256 (never raw output), and duration ms. Audit entry (no raw output) is written to stderr.

**Args:**
- `workspace_id` (string, optional) — Workspace ID for cloud env resolution
- `mode` (enum, required) — shell: run a bash command; claude-code: run a claude --print prompt
- `command` (string, optional) — Shell command to execute (required when mode=shell)
- `prompt` (string, optional) — Claude prompt (required when mode=claude-code)
- `env` (string, optional) — Environment label for cloud project routing (e.g. 'dev', 'staging
- `workdir` (string, optional) — Working directory for the spawned process
- `timeout_ms` (number, optional) — Timeout in milliseconds (default 300000)
- `auto_confirm` (boolean, optional) — Auto-respond 'yes' to interactive y/n prompts
- `stream_to_broker` (boolean, required) — Stream sanitized output chunks to broker SSE channel
- `capture_output` (boolean, optional) — Return captured stdout/stderr in MCP response (up to 50000 chars). Default false.
- `agent_id` (string, optional) — Agent ID for SSE channel routing (channel: pty-<agent_id>)

## workspace-cloud-project-add

Add or update cloud project entry on workspace. Entries are identified by (id, env) — calling with same pair is idempotent upsert. Setting is_default=true clears any prior default in this workspace (max 1 default allowed). Used by IaC and deploy tools to resolve active cloud project per environment without per-call configuration.

**Args:**
- `workspace_id` (string, required) — Workspace ID owning this cloud project (e.g., 'BACK-END
- `id` (string, required)
- `provider` (enum, required) — Cloud provider: gcp, azure, or aws
- `env` (string, required) — Environment label (e.g., 'dev', 'staging', 'prod
- `is_default` (boolean, optional)

## workspace-cloud-project-remove

Remove cloud project entry from workspace, matched by (id, env). Tolerant: returns success with removed=false when no matching entry is found, rather than erroring. If removed entry's env was workspace's activeEnv and no other entry shares that env, activeEnv is cleared automatically.

**Args:**
- `workspace_id` (string, required) — Workspace ID owning the cloud project
- `id` (string, required) — Cloud project identifier to remove
- `env` (string, required) — Environment label that identifies the entry together with id

## workspace-deploy-health

Aggregate deploy health checks across all services into scored report. Input: array of service check results from deploy-preflight, deploy-infra-check, deploy-manifest-audit. Output: WorkspaceHealthReport with 0-100 score per service and overall, fix instructions, and quick fixes with MCP tool references.

**Args:**
- `services` (array, required)
- `service` (string, required) — Service name
- `manifest` (string, required) — Manifest path
- `checks` (array, required)
- `category` (enum, required)
- `severity` (enum, required)
- `message` (string, required)
- `fix` (string, optional)
- `tool` (string, optional)
- `args` (record, optional) — Check results for this service

## workspace-get-context

Get active component workspace bound to current session. Returns component workspace ID and directory so agents can construct absolute paths for file operations. Also returns component's cloudProjects, activeEnv, and resolved activeProjectId (CD-347) when registry repository is wired and component is set. Returns a 'no component set' message when no component is set.

## workspace-health-specs

Generate production health page specification from workspace health data. Produces spec doc with API contracts (/health, /metrics, /health/zabbix, /health/stream SSE), Mermaid component tree, TypeScript interfaces, and monitoring integration guide. Target audience: BoC/Infra team for post-deploy monitoring.

**Args:**
- `workspace` (string, required) — Workspace name
- `stack` (enum, required) — Detected workspace stack for recommendations
- `services` (array, required)
- `service` (string, required)
- `manifest` (string, required)
- `checks` (array, required)
- `category` (enum, required)
- `severity` (enum, required)
- `message` (string, required)
- `fix` (string, optional)
- `tool` (string, optional)
- `args` (record, optional) — Service health data from /workspace-health

## workspace-info

Get detailed information about specific workspace by ID or directory path. Returns workspace metadata, tech stack, dependencies, and formatted summary.

**Args:**
- `identifier` (string, required) — Workspace ID (e.g., 'api-service
- `by_directory` (boolean, optional) — Set to true if identifier is a directory path (default: false)

## workspace-link

Manage workspace dependencies. Add, remove, or list dependency links between workspaces. Supports various dependency types: api-consumer, api-provider, shared-lib, monorepo-package, data-source, deployment-target, SYSTEM-MODULE, SYSTEM-MODULE-INDEPENDENT-REPO, other.

**Args:**
- `action` (enum, required) — Dependency operation: add, remove, or list
- `source_id` (string, optional) — Source workspace ID (required for add/remove)
- `target_id` (string, optional) — Target workspace ID (required for add/remove)
- `dependency_type` (enum, optional) — Type of dependency (required for add)
- `description` (string, optional) — Optional description of the dependency relationship
- `workspace_id` (string, optional) — Workspace ID to list dependencies for (required for list)

## workspace-list

List all registered workspaces in ecosystem. Optionally filter by status (active, archived, template).

**Args:**
- `status` (enum, optional) — Filter workspaces by status

## workspace-rename

Atomically rename workspace ID. All dependency rows where source_id or target_id equals oldId are updated to newId within single SQLite transaction. Fails if oldId is not registered or newId already exists.

**Args:**
- `old_id` (string, required) — Existing workspace ID to rename
- `new_id` (string, required) — New workspace ID. Must not already exist.

## workspace-set-context

Set active component workspace for current session. Agents operating from orchestrator workspace (MAIN-NO-REPO) call this once to declare which component workspace (MODULE-INDEPENDENT-REPO) they are targeting. Binding is persisted in active session so tools that accept optional 'workspace' param resolve it automatically. Component must have SYSTEM-MODULE relationship with orchestrator.

**Args:**
- `component_id` (string, required) — ID of the component workspace to activate (e.g. 'GCP-FINOPS

## workspace-set-env

Bind workspace's activeEnv to specific environment label (e.g., 'dev', 'staging', 'prod'). Env MUST match env on at least one of workspace's cloud project entries — otherwise tool returns error listing available envs. When gcloud isolation is enabled, also creates/updates matching gcloud config and writes jarvis-managed `.envrc` so each terminal can scope its CLOUDSDK_ACTIVE_CONFIG_NAME independently.

**Args:**
- `workspace_id` (string, required) — Workspace ID whose activeEnv is being bound
- `env` (string, required) — Env label to activate (must match a registered cloud project env)

## workspace-unset-env

Remove isolated gcloud configuration created for workspace's current activeEnv and delete jarvis-managed `.envrc`. Only `.envrc` files whose first line matches canonical jarvis header are removed — operator-authored files are left untouched.

**Args:**
- `workspace_id` (string, required) — Workspace ID whose isolated gcloud config should be removed

## workspace-update

Update workspace metadata, status, tech stack, or dependencies. Supports multiple update operations: description, language, tech stack, status changes, metadata key-value pairs, and dependency links.

**Args:**
- `id` (string, required) — Workspace ID to update
- `description` (string, optional) — New description text
- `primary_language` (string, optional) — Primary programming language (e.g., 'typescript', 'python
- `tech_stack` (array, optional) — Complete tech stack array (replaces existing)
- `add_tech` (string, optional) — Add a single technology to the stack
- `remove_tech` (string, optional) — Remove a single technology from the stack
- `status` (enum, optional) — Change workspace status
- `set_metadata_key` (string, optional) — Metadata key to set
- `set_metadata_value` (string, optional) — Metadata value (required if set_metadata_key is provided)
- `remove_metadata_key` (string, optional) — Metadata key to remove
- `deploy_target` (enum, optional) — Cloud deploy target (e.g. gcp-cloud-run, aws-ecs, docker-registry, none)
- `repo_type` (enum, optional) — Workspace repository topology role (e.g. MAIN-MONO-REPO, MODULE-INDEPENDENT-REPO)
- `contracts_authority` (array, optional) — Authoritative bounded contexts owned by this workspace (CD-326). Replaces the existing array.

## workspaces-depending-on-me

List all workspaces that depend on this workspace (incoming dependents). Returns structured [{id, name, directory, dependencyType, description}] for programmatic use.

**Args:**
- `workspace_id` (string, required) — Workspace ID to query (e.g., 'BACK-END

## workspaces-i-depend-on

List all workspaces this workspace depends on (outgoing dependencies). Returns structured [{id, name, directory, dependencyType, description}] for programmatic use.

**Args:**
- `workspace_id` (string, required) — Workspace ID to query (e.g., 'BACK-END

## xml-delete-key

Remove element from XML file using dot-notation path. Use xml-get first to confirm element exists.

**Args:**
- `file` (string, required) — Path to the XML file
- `path` (string, required) — Dot-notation path to the element to delete

## xml-get

Read element value or attribute from XML file using dot-notation path. Attributes use @_ prefix (e.g. 'manifest.@_package'). Array elements use [N] suffix (e.g. 'dependencies.dependency[0].groupId'). Omit path to return entire document as JSON.

**Args:**
- `file` (string, required) — Path to the XML file
- `path` (string, optional) — Dot-notation path. Examples: 'project.version', 'manifest.@_package', 'dependencies.dependency[0].artifactId'

## xml-list-keys

List child elements at given path in XML file without loading values. Token-efficient: shows only element names and types. Use path='' or omit to list all top-level elements. Use depth=1 for immediate children only.

**Args:**
- `file` (string, required) — Path to the XML file
- `path` (string, optional) — Dot-notation path to inspect. Examples: 'project', 'manifest.application'
- `depth` (number, optional) — Max depth (default: unlimited)

## xml-schema

Describe structure of XML file: root element, top-level elements, attributes, depth, and total element count. Token-efficient: no values exposed. Use this before xml-list-keys or xml-get to understand file layout. Works with pom.xml, AndroidManifest.xml,.csproj, web.xml, and any XML file.

**Args:**
- `file` (string, required) — Absolute or relative path to the XML file

## xml-search

Search for elements matching pattern in XML file. Finds elements by tag name or full dot-path pattern without loading all values.

**Args:**
- `file` (string, required) — Path to the XML file
- `pattern` (string, required) — Regex or plain string to match against element names or paths

## xml-set

Update element value in XML file using dot-notation path. Rebuilds XML preserving structure. Value is parsed as JSON if it looks like JSON, otherwise treated as string. Note: rebuilding may reformat whitespace.

**Args:**
- `file` (string, required) — Path to the XML file
- `path` (string, required) — Dot-notation path to the element to update
- `value` (string, required) — New value (string or JSON)

## yaml-add-comment

Add comment line above key in YAML file. Finds key by name in raw text and inserts '# <comment>' above it. Note: js-yaml does not preserve existing comments — use with care on files that were created with comments, as prior yaml-set may have stripped them.

**Args:**
- `file` (string, required) — Path to the YAML file
- `key` (string, required) — Key name to add the comment above (last segment, not dot-path)
- `comment` (string, required) — Comment text (without # prefix)

## yaml-delete-key

Delete key from YAML file using dot-notation path. File is updated in-place. Use data-yaml-get first to confirm key exists.

**Args:**
- `file` (string, required) — Absolute or relative path to the YAML file
- `path` (string, required) — Dot-notation path to the key to delete. Example: 'azure-sync.pollEnabled'

## yaml-list-keys

List keys at given path in YAML file without loading values. Token-efficient: shows only structure (key names and types), not content. Use path='' or omit to list all keys recursively. Use path='section' to list only keys under that section.

**Args:**
- `file` (string, required) — Absolute or relative path to the YAML file
- `path` (string, optional) — Dot-notation path to inspect (empty = root). Example: 'azure-sync'
- `depth` (number, optional) — Max depth to show (default: unlimited). Use depth=1 for top-level keys only.

## yaml-schema

Describe structure of YAML file: section names, key types, nesting depth. Token-efficient: tells agent what file contains without loading values. Use this before yaml-list-keys or data-yaml-get to understand file layout.

**Args:**
- `file` (string, required) — Path to the YAML file

## yaml-search

Search for keys matching pattern in YAML file. Finds keys by name without loading entire document into context. Returns matching key paths and their current values.

**Args:**
- `file` (string, required) — Absolute or relative path to the YAML file
- `pattern` (string, required) — Regex or plain string to match against key names or full dot-paths
