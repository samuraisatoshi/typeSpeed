# TOML Manager Tools

Token-efficient, structure-aware operations on TOML files.
Works with `pyproject.toml`, `Cargo.toml`, `mise.toml`, `wrangler.toml`, and any TOML config file.

## Recommended workflow

Always explore structure before reading values:

```
toml-schema file="pyproject.toml"          # 1. understand structure
toml-list-keys file="pyproject.toml" path="project"  # 2. find the path
toml-get file="pyproject.toml" path="project.version" # 3. read only what you need
```

**Never use `bash cat pyproject.toml`** — blocked by governance. Use these tools instead.

---

## toml-schema

Describe the structure of a TOML file: section names, key types, nesting depth.
Token-efficient: no values exposed.

```
toml-schema file="pyproject.toml"
```

Output: total keys, max depth, type distribution, top-level sections.

## toml-list-keys

List keys at a given path without loading values.

```
toml-list-keys file="pyproject.toml" path="project"
toml-list-keys file="pyproject.toml" depth=1          # top-level only
```

## toml-search

Find keys matching a pattern across the entire document.

```
toml-search file="pyproject.toml" pattern="version"
toml-search file="Cargo.toml" pattern="depend"
```

Returns matching key paths with their current values.

## toml-get

Read a value by dot-notation path.

```
toml-get file="pyproject.toml" path="project.version"
toml-get file="pyproject.toml" path="tool.uv.required-version"
toml-get file="Cargo.toml" path="package.name"
```

Omit `path` to return the entire document.

## toml-set

Write or update a value by dot-notation path. Creates key and parent sections if absent.

```
toml-set file="pyproject.toml" path="project.version" value='"0.2.0"'
toml-set file="pyproject.toml" path="project.requires-python" value='">=3.12"'
```

**Value parsing:** JSON values are parsed automatically (`"42"` → number, `"true"` → boolean, `'["a","b"]'` → array). Plain strings must be quoted: `value='"my-string"'`.

Note: existing comments may not be preserved after write (js-yaml limitation).

## toml-delete-key

Remove a key by dot-notation path.

```
toml-delete-key file="pyproject.toml" path="project.optional-dependencies"
```

Use `toml-get` first to confirm the key exists.

---

## TOML path notation

TOML sections map directly to dot-notation:

```toml
[project]
name = "my-app"
version = "0.1.0"
dependencies = ["httpx>=0.27"]

[tool.uv]
required-version = ">=0.6"
```

Paths:
- `project.name` → `"my-app"`
- `project.version` → `"0.1.0"`
- `project.dependencies` → `["httpx>=0.27"]`
- `tool.uv.required-version` → `">=0.6"`

---

## Common files

| File | Key paths |
|---|---|
| `pyproject.toml` | `project.version`, `project.dependencies`, `project.name`, `build-system.requires` |
| `Cargo.toml` | `package.version`, `package.name`, `dependencies` |
| `mise.toml` / `.mise.toml` | `tools.python`, `tools.node`, `env` |
| `wrangler.toml` | `name`, `vars`, `compatibility_date` |
| `.cargo/config.toml` | `build.target`, `target` |
