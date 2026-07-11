# Tool Reference — Vault

_Auto-generated from src/tools/*.ts and src/infrastructure/*/ — do not edit manually._

## vault-add-table-row

Append new row to markdown table in vault document.

**Args:**
- `path` (string, required) — Document path
- `values` (array, required) — Array of cell values for the new row
- `heading` (string, optional) — Section heading containing the table
- `table_index` (number, optional) — Table index within section (default: 0)

## vault-compress-folder

Batch compress all vault.md files in folder recursively using Ollama llama3.2. Applies VaultDocCompressUseCase to each file; preserves code blocks, URLs, headings byte-for-byte. Failures are isolated per-file — batch continues even if Ollama is unavailable for one file. Returns report with counts and per-file details.

**Args:**
- `folder` (string, required)
- `dry_run` (boolean, optional) — If true, list files that would be processed without modifying any.
- `level` (enum, optional) — Compression level (default: full).

## vault-create-document

Create new document in vault. Can use template or create from frontmatter and body content.

**Args:**
- `path` (string, required) — New document path (e.g., 'notes/new-doc.md
- `frontmatter` (union, optional) — Frontmatter fields — accepts an object, a JSON string, or a YAML string " + "(e.g. 'title: My Doc\\nstatus: draft
- `body` (string, optional) — Document body content
- `template` (string, optional) — Template document path to use
- `template_vars` (string, optional) — JSON string of template variables

## vault-inspect

Smart inspection of vault structure. Without arguments, returns overview of all folders and documents. With path argument, returns detailed information about specific document or folder. For documents, shows frontmatter, section structure, and content summary.

**Args:**
- `target` (string, optional) — Optional path to inspect. Can be a folder path, document path (.md), " + "or omitted to inspect the entire vault.

## vault-list-documents

List all documents in vault folder. Returns document summaries with metadata.

**Args:**
- `folder` (string, optional) — Folder path to list (default: root)

## vault-manage

Vault document management with block navigation. Reading a.md file without section= returns headings and navigation tip — never full document. Supply section= to read specific section. Pass summary=true to get AI-generated summary alongside nav block. For writes: supply content= (and optionally section=, mode=, frontmatter=).

**Args:**
- `path` (string, required) — Document path to manage (relative to vault root)
- `section` (string, optional) — Section heading for read/write operations
- `content` (string, optional) — Content to write to section
- `mode` (enum, optional) — Write mode for section content (default: replace)
- `frontmatter` (string, optional) — JSON string of frontmatter updates
- `operation` (enum, optional) — Operation type: read (default), write, or update
- `summary` (boolean, optional) — Generate an AI summary via Ollama alongside the navigation block (best-effort, read-only ops)

## vault-read-frontmatter

Read YAML frontmatter from vault document. Returns all frontmatter key-value pairs.

**Args:**
- `path` (string, required) — Document path

## vault-read-section

Read specific section from vault document by heading path. Returns section content with all subsections.

**Args:**
- `path` (string, required) — Document path (e.g., 'projects/my-doc.md
- `heading_path` (string, required) — Section heading path (e.g., 'Overview > Details

## vault-read-table

Read markdown table from vault document. Can specify section heading and table index.

**Args:**
- `path` (string, required) — Document path
- `heading` (string, optional) — Section heading containing the table
- `table_index` (number, optional) — Table index within section (default: 0, first table)

## vault-search

Search vault documents for text patterns. Returns matching lines with file paths and line numbers.

**Args:**
- `query` (string, required) — Search query (plain text or regex pattern)
- `folder` (string, optional) — Folder to search in (default: all documents)

## vault-update-table-row

Update specific row in markdown table by matching column value.

**Args:**
- `path` (string, required) — Document path
- `match_column` (string, required) — Column name to match against (e.g., 'ID', 'Name
- `match_value` (string, required) — Value to match in the column
- `updates` (string, required) — JSON object of column updates (e.g., '{\"Status\": \"Done\"}
- `heading` (string, optional) — Section heading containing the table
- `table_index` (number, optional) — Table index within section (default: 0)

## vault-write-frontmatter

Update YAML frontmatter in vault document. Merges provided updates with existing frontmatter.

**Args:**
- `path` (string, required) — Document path
- `updates` (string, required) — JSON string of frontmatter updates (e.g., '{\"tags\": [\"note\"]}

## vault-write-section

Write or update section in vault document. Can replace existing content or append to it.

**Args:**
- `path` (string, required) — Document path
- `heading` (string, required) — Section heading (without # prefix)
- `content` (string, required) — New section content
- `mode` (enum, optional) — Write mode: replace or append (default: replace)
