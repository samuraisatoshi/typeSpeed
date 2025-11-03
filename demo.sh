#!/bin/bash

# TypeSpeed Demo Script
echo "======================================="
echo "TypeSpeed - Code Typing Practice Demo"
echo "======================================="
echo ""

# Check if server is running
echo "Checking server status..."
HEALTH=$(curl -s http://localhost:3000/api/health)

if [ -z "$HEALTH" ]; then
  echo "Server is not running. Please start it with: npm run dev"
  exit 1
fi

echo "✓ Server is healthy"
echo ""

# Show supported languages
echo "Supported languages:"
curl -s http://localhost:3000/api/languages | jq -r '.[].name' | sed 's/^/  - /'
echo ""

# Scan the project folder
echo "Scanning TypeSpeed source code..."
SCAN_RESULT=$(curl -s -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/Users/jfoc/Documents/DevLabs/node/typespeed/src"}')

FILES_FOUND=$(echo $SCAN_RESULT | jq -r '.filesFound')
echo "✓ Found $FILES_FOUND TypeScript files"
echo ""

# Start a typing session
echo "Starting a typing session with TypeScript code..."
SESSION=$(curl -s -X POST http://localhost:3000/api/session/start \
  -H "Content-Type: application/json" \
  -d '{"language": "TypeScript", "userId": "demo_user"}')

if [ -z "$SESSION" ]; then
  echo "Failed to start session"
  exit 1
fi

SESSION_ID=$(echo $SESSION | jq -r '.sessionId')
LANGUAGE=$(echo $SESSION | jq -r '.language')
DIFFICULTY=$(echo $SESSION | jq -r '.difficulty')

echo "✓ Session started!"
echo "  - Session ID: $SESSION_ID"
echo "  - Language: $LANGUAGE"
echo "  - Difficulty: $DIFFICULTY"
echo ""

echo "======================================="
echo "Demo complete!"
echo ""
echo "To use TypeSpeed:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Enter a project folder path"
echo "3. Click 'Scan Folder'"
echo "4. Click 'Start Typing' to practice"
echo ""
echo "Happy typing! 🚀"
echo "======================================="