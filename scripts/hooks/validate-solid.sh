#!/bin/bash

# Hook to validate SOLID principles compliance
# Checks for common violations in TypeScript/JavaScript code

# Read hook context from stdin
HOOK_DATA=$(cat)

# Extract file path and tool
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.file_path // .path // ""')
TOOL=$(echo "$HOOK_DATA" | jq -r '.tool // ""')

# Only check on Write and Edit tools for TypeScript/JavaScript files
if [[ "$TOOL" != "Write" ]] && [[ "$TOOL" != "Edit" ]]; then
  exit 0
fi

if [[ ! "$FILE_PATH" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Skip test and config files
if [[ "$FILE_PATH" =~ (test|spec|config|\.config)\. ]]; then
  exit 0
fi

if [[ -f "$FILE_PATH" ]]; then
  WARNINGS=""

  # Check for Single Responsibility violations (too many public methods)
  PUBLIC_METHODS=$(grep -c "^\s*public\s\+\w\+\s*(" "$FILE_PATH" 2>/dev/null || echo 0)
  if [[ $PUBLIC_METHODS -gt 7 ]]; then
    WARNINGS="${WARNINGS}⚠️  SRP: Class has $PUBLIC_METHODS public methods (consider splitting)\n"
  fi

  # Check for Interface Segregation violations (fat interfaces)
  INTERFACE_METHODS=$(grep -A 50 "^export interface" "$FILE_PATH" 2>/dev/null | grep -c "^\s*\w\+\s*[:(]" || echo 0)
  if [[ $INTERFACE_METHODS -gt 5 ]]; then
    WARNINGS="${WARNINGS}⚠️  ISP: Interface might be too large ($INTERFACE_METHODS members)\n"
  fi

  # Check for Dependency Inversion violations (direct instantiation)
  NEW_INSTANCES=$(grep -c "new \w\+(" "$FILE_PATH" 2>/dev/null || echo 0)
  if [[ $NEW_INSTANCES -gt 3 ]]; then
    WARNINGS="${WARNINGS}⚠️  DIP: Found $NEW_INSTANCES direct instantiations (consider dependency injection)\n"
  fi

  # Check for God Object anti-pattern (too many dependencies)
  IMPORTS=$(grep -c "^import" "$FILE_PATH" 2>/dev/null || echo 0)
  if [[ $IMPORTS -gt 10 ]]; then
    WARNINGS="${WARNINGS}⚠️  God Object: Too many imports ($IMPORTS) - consider refactoring\n"
  fi

  # Output warnings if any
  if [[ -n "$WARNINGS" ]]; then
    echo "📋 SOLID Principles Review for $(basename $FILE_PATH):"
    echo -e "$WARNINGS"
    echo "💡 Consider refactoring to improve architecture"
  fi
fi

# Don't block, just warn
exit 0