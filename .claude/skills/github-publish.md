# GitHub TypeSpeed Publisher

This skill helps you publish the TypeSpeed repository to GitHub and create pull requests.

## Steps to Publish TypeSpeed to GitHub

### 1. Create GitHub Repository
First, create a new repository on GitHub:
```bash
# Using GitHub CLI (if installed)
gh repo create typespeed --public --description "Code typing practice for programmers. Like MonkeyType but for developers! Practice with real code from your projects."

# Or create manually at https://github.com/new
```

### 2. Initialize Git Repository (if not already done)
```bash
# Initialize git if needed
git init

# Add all files
git add -A

# Create initial commit
git commit -m "Initial commit: TypeSpeed - Code Typing Practice for Programmers"
```

### 3. Add Remote Origin
Replace `YOUR_USERNAME` with your GitHub username:
```bash
# Add your GitHub repository as origin
git remote add origin https://github.com/YOUR_USERNAME/typespeed.git

# Verify remote
git remote -v
```

### 4. Push to GitHub
```bash
# Push the main/master branch
git push -u origin main

# If your branch is named differently (like splitted-version), rename it first:
git branch -M main
git push -u origin main
```

### 5. Create Pull Request (if working with branches)
```bash
# Create a new feature branch
git checkout -b feature/add-new-feature

# Make your changes, then commit
git add .
git commit -m "feat: Add new feature description"

# Push the feature branch
git push origin feature/add-new-feature

# Create PR using GitHub CLI
gh pr create --title "Add new feature" --body "Description of changes"

# Or create PR manually on GitHub website
```

## Quick Publish Commands

For quick publishing of the current TypeSpeed project:

```bash
# One-liner to add, commit, and push all changes
git add -A && git commit -m "feat: Update TypeSpeed with latest improvements" && git push

# Create and push a new tag for releases
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## GitHub Pages Deployment (Optional)

To host TypeSpeed on GitHub Pages:

```bash
# Create gh-pages branch
git checkout -b gh-pages

# Push to GitHub Pages
git push origin gh-pages

# Access at: https://YOUR_USERNAME.github.io/typespeed/
```

## Repository Settings Recommendations

After publishing, configure these settings on GitHub:

1. **About Section**:
   - Description: "Code typing practice for programmers"
   - Website: Link to GitHub Pages
   - Topics: `typing`, `practice`, `programming`, `developer-tools`, `offline`, `privacy`

2. **Default Branch**: Set to `main`

3. **GitHub Pages**: Enable from Settings > Pages > Source: gh-pages branch

4. **Security**: Enable Dependabot alerts

## Creating Releases

```bash
# Create a release with GitHub CLI
gh release create v1.0.0 --title "TypeSpeed v1.0.0" --notes "Initial release of TypeSpeed - Code Typing Practice for Programmers"

# Upload the standalone HTML as an asset
gh release upload v1.0.0 index.html
```

## Pull Request Template

When creating PRs, use this template:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Performance improvement
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Works in Chrome/Firefox/Safari
- [ ] No console errors

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows DDD architecture
- [ ] SOLID principles maintained
- [ ] Files under 550 lines
- [ ] Original author attribution kept
```

## Troubleshooting

### Permission Denied
```bash
# Set up SSH keys
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add SSH key to GitHub account
```

### Branch Name Issues
```bash
# Rename branch to main
git branch -M main
```

### Large Files
```bash
# Remove large files from history if needed
git filter-branch --tree-filter 'rm -rf large_file' HEAD
```

## Final Checklist

Before publishing:
- [ ] README.md is complete
- [ ] LICENSE file exists
- [ ] Author attribution to SamuraiSatoshi
- [ ] Donation addresses are correct
- [ ] No sensitive data in code
- [ ] .gitignore configured properly
- [ ] All features tested

## Success! 🎉

Once published, your repository will be available at:
`https://github.com/YOUR_USERNAME/typespeed`

Share it with the developer community and start getting contributions!