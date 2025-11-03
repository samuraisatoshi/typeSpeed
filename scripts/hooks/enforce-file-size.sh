#!/bin/bash

# Hook to enforce 550-line maximum file size for TypeSpeed project
# Exit codes: 0 = success, 2 = block operation

# Read hook context from stdin
HOOK_DATA=$(cat)

# Extract file path from hook data
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.file_path // .path // ""')
TOOL=$(echo "$HOOK_DATA" | jq -r '.tool // ""')

# Only check on Write and Edit tools
if [[ "$TOOL" != "Write" ]] && [[ "$TOOL" != "Edit" ]]; then
  exit 0
fi

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
  exit 0
fi

# Only check TypeScript, JavaScript, and other source files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx|py|swift|c|cpp|h|hpp)$ ]]; then
  exit 0
fi

# Skip test files and config files
if [[ "$FILE_PATH" =~ (test|spec|config|\.config)\. ]]; then
  exit 0
fi

# If file exists, check line count
if [[ -f "$FILE_PATH" ]]; then
  LINE_COUNT=$(wc -l < "$FILE_PATH")

  if [[ $LINE_COUNT -gt 550 ]]; then
    echo "File $FILE_PATH has $LINE_COUNT lines (max: 550)" >&2
    echo "Please split into smaller modules following DDD patterns" >&2
    exit 2
  fi
fi

exit 0