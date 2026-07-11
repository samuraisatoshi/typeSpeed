# Bootstrap & Config Tools

Tools for initializing JARVIS, diagnosing environment health, managing configuration, and getting terminal commands.

---

## bootstrap

Initialize JARVIS project structure: creates AGENTS.md, `.jarvis/` directory, `config/jarvis.yaml`, and vault skeleton.

**Parameters:** `force` (optional boolean — overwrite existing files)

```
bootstrap
bootstrap force=true   # overwrite existing AGENTS.md
```

---

## healthcheck

Diagnose JARVIS environment readiness: checks Ollama, SQLite, config, MCP server, Dagger.

No parameters required.

```
healthcheck
```

Returns status of each component with fix guidance for failures.

---

## terminal-commands

Get copy-paste terminal commands for long-running operations.

**Parameters:** `commandId` (optional) — omit to list all available commands

```
terminal-commands                        # list all available commands
terminal-commands commandId="rag-index"  # RAG indexing command
terminal-commands commandId="azpush-setup"  # Azure DevOps git push helper setup
```

---

## config-read

Read current effective JARVIS configuration. Shows defaults merged with user overrides.

**Parameters:** `section` (optional) — omit for all sections, or specify one: `rag` | `azure-sync` | `kanban` | `mcp-server` | `pipeline` | `token-metrics`

```
config-read                    # all sections
config-read section="rag"      # RAG config only
config-read section="azure-sync"
```

---

## config-write

Update JARVIS configuration for a section. Only changed values are persisted to `config/jarvis.yaml`.

**Parameters:** `section` (required), `values` (required — JSON object)

```
config-write section="rag" values='{"embeddingModel":"embeddinggemma","topK":10}'
config-write section="azure-sync" values='{"org":"mc1global","project":"MyProject"}'
```

---

## config-reset

Reset a configuration section back to built-in defaults.

**Parameters:** `section` (required)

```
config-reset section="rag"
```
