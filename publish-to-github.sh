#!/bin/bash

# TypeSpeed GitHub Publisher Script
# Author: SamuraiSatoshi
# This script helps publish TypeSpeed to GitHub

echo "🚀 TypeSpeed GitHub Publisher"
echo "=============================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME
if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required"
    exit 1
fi

echo ""
echo "📋 Starting publication process..."
echo ""

# Initialize git repository if not already initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
else
    echo "✅ Git repository already initialized"
fi

# Add .gitignore if it doesn't exist
if [ ! -f .gitignore ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
package-lock.json

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Environment
.env
.env.local

# Build
dist/
build/

# Temporary files
*.tmp
*.bak
*~
EOF
    echo "✅ .gitignore created"
else
    echo "✅ .gitignore already exists"
fi

# Stage all files
echo "📦 Staging all files..."
git add -A

# Create commit
echo "💾 Creating commit..."
git commit -m "Initial commit: TypeSpeed - Code Typing Practice for Programmers

Features:
- Practice typing with real code from your projects
- Support for 25+ programming languages
- Smart code selection algorithm
- Real-time WPM and accuracy tracking
- Session statistics and history
- 100% offline, privacy-focused
- Beautiful dark theme UI
- Domain-Driven Design architecture

Author: SamuraiSatoshi
License: MIT"

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "🔄 Updating remote origin..."
    git remote set-url origin https://github.com/$GITHUB_USERNAME/typespeed.git
else
    echo "🔗 Adding remote origin..."
    git remote add origin https://github.com/$GITHUB_USERNAME/typespeed.git
fi

echo ""
echo "📤 Ready to push to GitHub!"
echo "Repository URL: https://github.com/$GITHUB_USERNAME/typespeed"
echo ""
echo "⚠️  IMPORTANT: Before pushing, make sure you have:"
echo "   1. Created the repository on GitHub (https://github.com/new)"
echo "   2. Set it as PUBLIC repository"
echo "   3. Named it 'typespeed' (lowercase)"
echo ""
read -p "Have you created the repository on GitHub? (y/n): " REPO_CREATED

if [ "$REPO_CREATED" != "y" ]; then
    echo ""
    echo "📝 Please create the repository first:"
    echo "   1. Go to https://github.com/new"
    echo "   2. Repository name: typespeed"
    echo "   3. Description: Code typing practice for programmers"
    echo "   4. Make it PUBLIC"
    echo "   5. DO NOT initialize with README, license, or .gitignore"
    echo "   6. Click 'Create repository'"
    echo ""
    echo "Then run this script again!"
    exit 0
fi

# Push to GitHub
echo ""
echo "🚀 Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully published to GitHub!"
    echo ""
    echo "🎉 Your repository is now live at:"
    echo "   https://github.com/$GITHUB_USERNAME/typespeed"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Add repository topics: typing, practice, programming, developer-tools"
    echo "   2. Update the repository description"
    echo "   3. Consider enabling GitHub Pages for live demo"
    echo "   4. Star your own repository! ⭐"
    echo ""
    echo "📢 Share your repository:"
    echo "   Twitter: Check out TypeSpeed - practice typing with real code! https://github.com/$GITHUB_USERNAME/typespeed"
    echo ""
    echo "Thank you for using TypeSpeed! 🚀"
else
    echo ""
    echo "❌ Push failed. Possible issues:"
    echo "   1. Repository doesn't exist on GitHub"
    echo "   2. Authentication issues (you may need to set up a personal access token)"
    echo "   3. Network connection problems"
    echo ""
    echo "For authentication, you may need to:"
    echo "   1. Create a personal access token at https://github.com/settings/tokens"
    echo "   2. Use the token as your password when prompted"
fi