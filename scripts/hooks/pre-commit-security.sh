#!/bin/bash

# Pre-commit security audit hook for TypeSpeed
# Runs security checks before allowing commit

echo "🔒 Running pre-commit security audit..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Check for hardcoded secrets or sensitive data
echo "Checking for sensitive data..."
SENSITIVE_PATTERNS="password|secret|api[_-]?key|token|credential|private[_-]?key"

# Exclude common safe patterns
SAFE_PATTERNS="passwordValidator|passwordStrength|secretLength|tokenExpiry"

if git diff --cached --name-only | xargs grep -E "$SENSITIVE_PATTERNS" 2>/dev/null | grep -vE "$SAFE_PATTERNS" | grep -v "^#" | grep -v "//" > /dev/null; then
    echo -e "${RED}❌ Possible sensitive data found in staged files:${NC}"
    git diff --cached --name-only | xargs grep -nH -E "$SENSITIVE_PATTERNS" 2>/dev/null | grep -vE "$SAFE_PATTERNS" | grep -v "^#" | grep -v "//"
    ERRORS=$((ERRORS + 1))
fi

# 2. Check for console.log statements in production code
echo "Checking for console.log statements..."
if git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -n "console\.log" 2>/dev/null | grep -v "^#" | grep -v "//" > /dev/null; then
    echo -e "${YELLOW}⚠️  console.log statements found:${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -nH "console\.log" 2>/dev/null | grep -v "^#" | grep -v "//"
    WARNINGS=$((WARNINGS + 1))
fi

# 3. Check for eval() usage (security risk)
echo "Checking for eval() usage..."
if git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -n "eval\s*(" 2>/dev/null > /dev/null; then
    echo -e "${RED}❌ Dangerous eval() usage found:${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -nH "eval\s*(" 2>/dev/null
    ERRORS=$((ERRORS + 1))
fi

# 4. Check for innerHTML usage (XSS risk)
echo "Checking for innerHTML usage..."
if git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -n "\.innerHTML\s*=" 2>/dev/null > /dev/null; then
    echo -e "${YELLOW}⚠️  innerHTML usage found (potential XSS risk):${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -nH "\.innerHTML\s*=" 2>/dev/null
    echo "Consider using textContent or a sanitization library"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Check for SQL injection patterns
echo "Checking for SQL injection risks..."
SQL_PATTERNS="query.*\+|query.*\$\{|execute.*\+|execute.*\$\{"
if git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -E "$SQL_PATTERNS" 2>/dev/null > /dev/null; then
    echo -e "${RED}❌ Possible SQL injection vulnerability:${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -nH -E "$SQL_PATTERNS" 2>/dev/null
    echo "Use parameterized queries instead"
    ERRORS=$((ERRORS + 1))
fi

# 6. Check for command injection patterns
echo "Checking for command injection risks..."
CMD_PATTERNS="exec\s*\(.*\+|spawn\s*\(.*\+|execSync\s*\(.*\+"
if git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -E "$CMD_PATTERNS" 2>/dev/null > /dev/null; then
    echo -e "${RED}❌ Possible command injection vulnerability:${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "\.(ts|js)$" | xargs grep -nH -E "$CMD_PATTERNS" 2>/dev/null
    echo "Avoid string concatenation in exec/spawn commands"
    ERRORS=$((ERRORS + 1))
fi

# 7. Check for missing input validation
echo "Checking for missing input validation..."
if git diff --cached --name-only --diff-filter=ACM | grep -E "server\.ts$" | xargs grep -n "req\.body\|req\.params\|req\.query" 2>/dev/null | grep -v "validate\|sanitize" > /dev/null; then
    echo -e "${YELLOW}⚠️  Potential missing input validation:${NC}"
    git diff --cached --name-only --diff-filter=ACM | grep -E "server\.ts$" | xargs grep -nH "req\.body\|req\.params\|req\.query" 2>/dev/null | grep -v "validate\|sanitize" | head -5
    WARNINGS=$((WARNINGS + 1))
fi

# 8. Run npm audit (if package.json is modified)
if git diff --cached --name-only | grep -q "package\.json"; then
    echo "Running npm audit..."
    npm audit --audit-level=high 2>/dev/null
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ npm audit found high severity vulnerabilities${NC}"
        ERRORS=$((ERRORS + 1))
    fi
fi

# 9. Check file permissions (sensitive files shouldn't be world-readable)
echo "Checking file permissions..."
for file in $(git diff --cached --name-only); do
    if [ -f "$file" ]; then
        perms=$(stat -f "%A" "$file" 2>/dev/null || stat -c "%a" "$file" 2>/dev/null)
        if [ "$perms" = "777" ] || [ "$perms" = "666" ]; then
            echo -e "${YELLOW}⚠️  File has overly permissive permissions: $file ($perms)${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
done

# 10. Check for TODO security items
echo "Checking for security TODOs..."
if git diff --cached --name-only --diff-filter=ACM | xargs grep -i "TODO.*security\|FIXME.*security\|XXX.*security" 2>/dev/null > /dev/null; then
    echo -e "${YELLOW}⚠️  Unresolved security TODOs found:${NC}"
    git diff --cached --name-only --diff-filter=ACM | xargs grep -nHi "TODO.*security\|FIXME.*security\|XXX.*security" 2>/dev/null
    WARNINGS=$((WARNINGS + 1))
fi

# Summary
echo ""
echo "=============================="
echo "Security Audit Complete"
echo "=============================="

if [ $ERRORS -gt 0 ]; then
    echo -e "${RED}❌ Errors: $ERRORS${NC}"
fi

if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
fi

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ No security issues detected${NC}"
fi

# Block commit if errors found
if [ $ERRORS -gt 0 ]; then
    echo ""
    echo -e "${RED}Commit blocked due to security errors.${NC}"
    echo "Please fix the issues above and try again."
    exit 1
fi

# Warn but allow commit if only warnings
if [ $WARNINGS -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}Security warnings detected. Consider fixing them.${NC}"
    echo "Proceeding with commit..."
fi

exit 0