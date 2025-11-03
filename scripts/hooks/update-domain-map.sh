#!/bin/bash

# Hook to remind about updating map_domain.json after code changes
# This runs after Write/Edit operations on domain files

# Read hook context from stdin
HOOK_DATA=$(cat)

# Extract file path and tool
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.file_path // .path // ""')
TOOL=$(echo "$HOOK_DATA" | jq -r '.tool // ""')

# Only trigger on Write and Edit tools
if [[ "$TOOL" != "Write" ]] && [[ "$TOOL" != "Edit" ]]; then
  exit 0
fi

# Check if file is in domain directories
if [[ "$FILE_PATH" =~ /domain/ ]] || [[ "$FILE_PATH" =~ /application/ ]] || [[ "$FILE_PATH" =~ /infrastructure/ ]]; then
  # Check if file is a TypeScript/JavaScript source file
  if [[ "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
    echo "📝 Domain file modified: $FILE_PATH"
    echo "⚠️  Remember to update map_domain.json with any new classes or methods"

    # Extract potential class/interface names from the file
    if [[ -f "$FILE_PATH" ]]; then
      CLASSES=$(grep -E "^(export )?(class|interface|enum) \w+" "$FILE_PATH" | sed -E 's/.*(class|interface|enum) (\w+).*/\2/' | tr '\n' ', ' | sed 's/,$//')

      if [[ -n "$CLASSES" ]]; then
        echo "🔍 Detected entities: $CLASSES"
        echo "💡 Ensure these are reflected in map_domain.json"
      fi
    fi
  fi
fi

exit 0