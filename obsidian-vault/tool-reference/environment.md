# Environment Tools

Tools for managing isolated development environments with their own git worktree branches.

---

## env-init

Analyze a project directory and suggest environment configuration (base image, setup commands).

**Parameters:** `directory` (required)

```
env-init directory="/path/to/project"
```

---

## env-create

Create a new isolated development environment.

**Parameters:** `name` (required), `purpose` (required) — `feature` | `bugfix` | `experiment` | `refactor` | `spike` | `hotfix`, `description` (required), `cardId` (optional), `baseImage` (optional), `installCommands` (optional array), `setupCommands` (optional array), `envVars` (optional object), `mergeStrategy` (optional) — `merge-commit` | `squash` | `rebase`

```
env-create
  name="feat-cd-009-rag"
  purpose="feature"
  description="CD-009: RAG reindex and ORACLE rewrite"
  cardId="CD-009"
```

---

## env-list

List environments for the workspace.

**Parameters:** `filter` (optional) — `all` | `active`

---

## env-status

Get or update environment status.

**Parameters:** `envId` (required), `action` (optional) — `info` | `activate` | `fail` | `complete-merge` | `revert-merge` | `link-card` | `unlink-card`, `cardId` (optional), `commitSha` (optional), `reason` (optional)

```
env-status envId="env-abc123" action="info"
env-status envId="env-abc123" action="activate"
env-status envId="env-abc123" action="link-card" cardId="CD-009"
```

---

## env-merge

Merge environment changes back to main branch.

**Parameters:** `envId` (required), `targetBranch` (optional, default `main`)

```
env-merge envId="env-abc123" targetBranch="master"
```

After git merge completes: `env-status envId="..." action="complete-merge"`

---

## env-delete

Delete an environment.

**Parameters:** `envId` (required)

---

## container-use tools

For direct container operations within an environment, use `container-use_environment_*` tools:

- `container-use_environment_run_cmd` — run a command inside the container
- `container-use_environment_file_read` / `_write` / `_edit` / `_delete` — file operations
- `container-use_environment_file_list` — list directory
- `container-use_environment_create` / `_open` / `_checkpoint` — lifecycle
- `container-use_environment_config` — update base image or setup commands
- `container-use_environment_add_service` — add a service (e.g. database)

```
container-use_environment_run_cmd
  environment_source="/path/to/repo"
  environment_id="env-abc123"
  command="npm test"
  explanation="Run test suite in isolated environment"
```
