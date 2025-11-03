---
name: security-audit
description: >
  Performs comprehensive security audits on TypeScript/JavaScript applications.
  Detects common vulnerabilities like XSS, injection attacks, path traversal,
  authentication issues, and insecure dependencies. PROACTIVELY scans code
  during development to prevent security issues from reaching production.
allowed-tools: Read, Grep, Glob, Bash
---

# Security Audit Skill

## When to Use This Skill
- Before committing code changes
- During code review processes
- When implementing authentication/authorization
- When handling user input or file operations
- Before deploying to production
- When using external dependencies

## Security Checks Performed

### 1. Input Validation
Detect missing or inadequate input validation:
- SQL injection vulnerabilities
- Command injection risks
- Path traversal attacks
- XSS vulnerabilities
- NoSQL injection

### 2. Authentication & Authorization
- Missing authentication checks
- Weak password policies
- Insecure session management
- JWT vulnerabilities
- CORS misconfigurations

### 3. Data Protection
- Sensitive data in logs
- Hardcoded credentials
- Unencrypted sensitive data
- Insecure random number generation
- Missing HTTPS enforcement

### 4. Dependencies
- Known vulnerable packages (using npm audit)
- Outdated dependencies
- Unnecessary permissions
- Supply chain risks

### 5. Code Patterns
```typescript
// Vulnerable patterns to detect:

// XSS - innerHTML with user input
element.innerHTML = userInput; // ❌

// Path traversal
const path = `/files/${req.params.filename}`; // ❌

// SQL injection
db.query(`SELECT * FROM users WHERE id = ${userId}`); // ❌

// Command injection
exec(`ls ${userPath}`); // ❌

// Missing rate limiting
app.post('/api/login', handler); // ❌
```

## Security Audit Process

### Phase 1: Static Analysis
1. Scan for vulnerable patterns using regex
2. Check for missing security headers
3. Validate CORS configuration
4. Review authentication middleware
5. Check error handling (no stack traces in production)

### Phase 2: Dependency Audit
```bash
# Check for vulnerabilities
npm audit

# Check outdated packages
npm outdated

# Review package permissions
npm ls --depth=0
```

### Phase 3: Configuration Review
1. Environment variables properly used
2. Secrets not in code repository
3. Security headers configured (Helmet.js)
4. Rate limiting implemented
5. Input size limits set

### Phase 4: OWASP Top 10 Check
- A01: Broken Access Control
- A02: Cryptographic Failures
- A03: Injection
- A04: Insecure Design
- A05: Security Misconfiguration
- A06: Vulnerable Components
- A07: Identification Failures
- A08: Data Integrity Failures
- A09: Security Logging Failures
- A10: Server-Side Request Forgery

## Security Best Practices

### Input Validation
```typescript
// Good: Validate and sanitize
import { body, validationResult } from 'express-validator';

app.post('/api/user',
  body('email').isEmail().normalizeEmail(),
  body('age').isInt({ min: 0, max: 120 }),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  }
);
```

### XSS Prevention
```typescript
// Good: Use textContent or escape HTML
element.textContent = userInput; // ✓

// Or escape HTML entities
function escapeHtml(text: string): string {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

### Path Validation
```typescript
// Good: Validate paths
import path from 'path';

function validatePath(userPath: string, baseDir: string): boolean {
  const resolved = path.resolve(baseDir, userPath);
  return resolved.startsWith(path.resolve(baseDir));
}
```

### Rate Limiting
```typescript
// Good: Implement rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests
});

app.use('/api/', limiter);
```

## Security Headers
```typescript
// Good: Use Helmet for security headers
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

## Automated Security Checks

### Pre-commit Hook
```bash
#!/bin/bash
# Run security audit before commit

# Check for sensitive data
if grep -r "password\|secret\|key\|token" --include="*.ts" --include="*.js" .; then
  echo "Warning: Possible sensitive data found"
  exit 1
fi

# Run npm audit
npm audit --audit-level=high

# Check for console.logs in production code
if grep -r "console.log" --include="*.ts" src/; then
  echo "Warning: console.log found in source"
fi
```

## Security Checklist

### Before Deployment
- [ ] All inputs validated and sanitized
- [ ] Authentication required on sensitive endpoints
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Security headers enabled (Helmet)
- [ ] HTTPS enforced
- [ ] Environment variables used for secrets
- [ ] Error messages don't leak sensitive info
- [ ] Logging configured (but no sensitive data)
- [ ] Dependencies updated and audited
- [ ] XSS prevention implemented
- [ ] CSRF protection enabled
- [ ] SQL injection prevented
- [ ] Path traversal blocked
- [ ] File upload restrictions

## Remediation Templates

### Fix XSS Vulnerability
```typescript
// Before (Vulnerable)
div.innerHTML = userData;

// After (Secure)
div.textContent = userData;
// OR
div.innerHTML = DOMPurify.sanitize(userData);
```

### Fix SQL Injection
```typescript
// Before (Vulnerable)
db.query(`SELECT * FROM users WHERE id = ${userId}`);

// After (Secure)
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

### Fix Path Traversal
```typescript
// Before (Vulnerable)
const file = fs.readFile(`/uploads/${req.params.file}`);

// After (Secure)
const safePath = path.join('/uploads', path.basename(req.params.file));
if (!safePath.startsWith('/uploads')) {
  throw new Error('Invalid path');
}
const file = fs.readFile(safePath);
```

## Reporting

Generate security audit report:
```markdown
# Security Audit Report
Date: {{date}}
Project: {{project}}

## Summary
- Critical: {{critical_count}}
- High: {{high_count}}
- Medium: {{medium_count}}
- Low: {{low_count}}

## Findings
{{detailed_findings}}

## Recommendations
{{recommendations}}
```

## Integration

This skill integrates with:
- Pre-commit hooks for automatic checking
- CI/CD pipelines for deployment validation
- Code review processes
- IDE extensions for real-time feedback