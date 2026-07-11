# Tool Reference — Rag

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## context-rag-reindex

Bulk reindex all context memory (notes + sessions) for current workspace. Drops and rebuilds Vectra index. Use after migration or when index is stale.

## context-rag-search

Semantic search over context memory (notes, sessions, checkpoints) using Ollama embeddings. Returns results ranked by similarity. Supports date range, source type, and tag filters.

**Args:**
- `query` (string, required) — Natural language query (e.g. 'decisions about authentication
- `limit` (number, optional) — Max results (default 10)
- `min_similarity` (number, optional) — Min similarity score (default 0.6)
- `from_date` (string, optional) — ISO date lower bound (e.g. '2026-01-01
- `to_date` (string, optional) — ISO date upper bound
- `source_types` (array, optional) — Filter by source type
- `tags` (array, optional) — Filter by tags (any match)

## rag-delete

Remove file from workspace RAG index. Deletes all chunks associated with specified file.

**Args:**
- `file_path` (string, required) — Absolute path to the file to remove from index
- `workspace` (string, optional) — Workspace name (auto-detected if omitted)

## rag-index

Index workspace files into RAG for semantic search. Discovers files with smart project detection,.ragignore support. Creates Vectra vector store with Ollama embeddings.

**Args:**
- `workspace` (string, optional) — Workspace name (auto-detected if omitted)
- `data_dir` (string, optional) — Directory to index (defaults to workspace root)
- `clear` (string, optional) — Clear existing index before re-indexing
- `domain_map` (string, optional) — Re-analyze domain-map first, force clear, then index with fresh snapshot. Incompatible with clear=false.
- `confirm_orchestrator` (string, optional) — Set to true to confirm intent when the target workspace has role=orchestrator.
- `metadata_only` (string, optional) — When true: update sub-project/platform/entity metadata without re-embedding.

## rag-infra-topology-index

Index infrastructure topology chunks (service manifests, network edges, endpoints, pubsub bindings, IAM bindings, env-groups, domain entities) into workspace RAG namespace with domain=infra-topology. When workspace_id is given, all operations run in that workspace's directory. Query with: rag-search workspace=\"<id>\" domain_filter=\"infra-topology\".

**Args:**
- `workspace_id` (string, optional) — Registered workspace ID (e.g. chatcpg). Defaults to current session workspace.
- `force_reindex` (boolean, required) — When true, clears existing infra-topology chunks before re-indexing

## rag-metadata-search

Filter RAG index chunks by env var name or cloud service reference without semantic query. Requires index built with enableCloudMetadata (jarvis rag index --clear). Returns all matching chunks with source, content, envVars, and cloudServices metadata.

**Args:**
- `env_var` (string, optional) — Exact env var name to find (e.g. REDIS_URI)
- `cloud` (string, optional) — Cloud provider to filter by: gcp | aws | azure | generic
- `service` (string, optional) — Cloud service name to filter by (e.g. secret-manager, firestore, s3)
- `top_k` (number, optional) — Maximum number of results to return (default: 20)

## rag-oracle-index

Index ORACLE tool usage guide for semantic search. Indexes markdown files from specified directory (tool-reference/, governance/, workflows/, etc.). Splits by headers to preserve heading context.

**Args:**
- `directory` (string, required) — Directory containing ORACLE markdown files to index
- `clear` (boolean, optional) — Clear existing ORACLE index first

## rag-oracle-search

Search ORACLE tool usage guide via semantic search. Use this to find which tool to use for task, parameter syntax, and usage examples. Supports domain filtering: tools (syntax + examples), governance (policies), workflows (step-by-step flows), patterns (architecture), quick_reference (checklists).

**Args:**
- `query` (string, required) — Tool usage or workflow search query
- `top_k` (number, optional) — Number of results (default 5)
- `domain` (enum, optional) — Filter by ORACLE domain

## rag-search

Semantic code search in workspace RAG index. Uses Vectra + Ollama embeddings to find relevant code by meaning. Supports filtering by domain (e.g. 'kanban', 'governance') and chunk type. Pass workspace='*' for cross-workspace lookup (CD-280).

**Args:**
- `query` (string, required) — Semantic search query
- `top_k` (number, optional) — Number of results (default 5)
- `workspace` (string, optional) — Workspace name (auto-detected if omitted). Use '*' for cross-workspace search.
- `domain_filter` (string, optional) — Filter by DDD domain
- `type_filter` (string, optional) — Filter by chunk type (semantic, e.g. 'secret_ref', 'domain', 'tfvars_entry
- `sub_project_filter` (string, optional) — Filter by sub-project (mono-repo first path segment, e.g. 'menu-ocr-lib-android
- `platform_filter` (string, optional) — Filter by mobile platform: 'ios' | 'android' | 'flutter'

## rag-snippet

Retrieve code snippets with surrounding file context. Like rag-search but returns fuller code context with line numbers.

**Args:**
- `query` (string, required) — Search query for code snippets
- `top_k` (number, optional) — Number of snippets (default 5)
- `workspace` (string, optional) — Workspace name (auto-detected if omitted)
- `context_lines` (number, optional) — Lines of context (default 50)

## rag-status

Show RAG index status for workspace. Reports document count, embedding model, and vector store info.

**Args:**
- `workspace` (string, optional) — Workspace name (auto-detected if omitted)
- `include_oracle` (boolean, optional) — Also show ORACLE index status

## rag-update

Re-index single file in workspace RAG index. Removes old chunks and creates new ones from current file content.

**Args:**
- `file_path` (string, required) — Absolute path to the file to re-index
- `workspace` (string, optional) — Workspace name (auto-detected if omitted)
