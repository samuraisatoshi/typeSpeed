#!/bin/bash

# Hook to auto-format code on save using Prettier (if available)
# Runs after Write operations on source files

# Read hook context from stdin
HOOK_DATA=$(cat)

# Extract file path and tool
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.file_path // .path // ""')
TOOL=$(echo "$HOOK_DATA" | jq -r '.tool // ""')

# Only run on Write tool
if [[ "$TOOL" != "Write" ]]; then
  exit 0
fi

# Only format TypeScript/JavaScript files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Check if prettier is available
if ! command -v npx &> /dev/null; then
  exit 0
fi

# Check if prettier is installed
if [[ -f "package.json" ]] && grep -q "prettier" package.json 2>/dev/null; then
  # Format the file silently
  npx prettier --write "$FILE_PATH" 2>/dev/null

  if [[ $? -eq 0 ]]; then
    echo "✨ Auto-formatted: $(basename $FILE_PATH)"
  fi
fi

exit 0