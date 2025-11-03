# Security Implementation - TypeSpeed Application

## Overview

This document describes the comprehensive security measures implemented in the TypeSpeed application to protect against common web vulnerabilities and attacks.

## Security Features Implemented

### 1. Path Traversal Protection

**Vulnerability**: Users could scan ANY directory on the system (e.g., `/etc/passwd`, system files)

**Solution**: Implemented `PathValidator` value object in the domain layer
- **Location**: `/src/domain/shared/PathValidator.ts`
- **Features**:
  - Validates paths against directory traversal patterns (`../`, `..\\`)
  - Ensures paths are within allowed base directories
  - Normalizes paths to prevent bypass attempts
  - Checks for null bytes and other malicious patterns
  - Verifies path existence

**Usage in API**:
```typescript
const securedPath = PathValidator.create(
  userInputPath,
  securityConfig.getAllowedScanPaths()
);
```

### 2. CORS Configuration

**Vulnerability**: Application allowed requests from ANY origin (`*`)

**Solution**: Implemented whitelist-based CORS policy
- **Location**: `/src/infrastructure/security/SecurityMiddleware.ts`
- **Features**:
  - Only allows requests from trusted origins
  - Configurable via environment variables
  - Default allowed origins: `http://localhost:3000`, `http://127.0.0.1:3000`
  - Supports credentials
  - Appropriate HTTP methods and headers

**Configuration**:
```bash
# Set trusted origins via environment variable
TRUSTED_ORIGINS=http://localhost:3000,https://mydomain.com
```

### 3. Rate Limiting

**Vulnerability**: No protection against DoS attacks or brute force attempts

**Solution**: Implemented tiered rate limiting
- **Location**: `/src/infrastructure/security/SecurityMiddleware.ts`
- **Features**:
  - General rate limiter: 60 requests per minute (configurable)
  - Strict rate limiter for expensive operations (e.g., `/api/scan`): 10 requests per minute
  - Returns proper HTTP 429 status with retry-after headers
  - IP-based tracking

**Configuration**:
```bash
# Set max requests per minute via environment variable
MAX_REQUESTS_PER_MINUTE=60
```

### 4. Input Validation

**Vulnerability**: Missing validation on user inputs, especially character input and session IDs

**Solution**: Implemented `InputValidator` service in domain layer
- **Location**: `/src/domain/shared/InputValidator.ts`
- **Validates**:
  - Single character input (must be exactly 1 char)
  - Session IDs (alphanumeric with hyphens, 8-64 chars)
  - User IDs (alphanumeric with underscores, 3-64 chars)
  - Language names (letters, numbers, common separators)
  - Number ranges and integers
  - Non-empty strings
  - Required object properties

**All API endpoints now validate inputs**:
- `/api/scan` - Validates folder path and options
- `/api/session/start` - Validates language and user ID
- `/api/session/:sessionId/input` - Validates session ID and character
- `/api/session/:sessionId/complete` - Validates session ID and user ID
- `/api/statistics/:userId` - Validates user ID
- `/api/leaderboard` - Validates limit parameter

### 5. XSS Prevention

**Vulnerability**: Server data injected into `innerHTML` without escaping (line 308 in app.js)

**Solution**: Replaced `innerHTML` with safe DOM methods
- **Location**: `/public/js/app.js` - `showResults()` method
- **Changes**:
  - Uses `document.createElement()` instead of template strings
  - Sets text content via `textContent` property
  - Prevents script injection in metric values

### 6. Security Headers (Helmet)

**Solution**: Implemented Helmet middleware for security headers
- **Location**: `/src/infrastructure/security/SecurityMiddleware.ts`
- **Headers Set**:
  - Content Security Policy (CSP)
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Strict-Transport-Security
  - And more...

### 7. Additional Security Measures

#### Request Size Validation
- Limits request body to 100KB
- Prevents memory exhaustion attacks
- Returns HTTP 413 for oversized requests

#### Security Logging
- Logs all non-GET requests
- Logs scan operations
- Includes timestamp, method, path, and IP address

#### Parameter Pollution Prevention
- Prevents array-based parameter pollution
- Normalizes query parameters

#### Security Configuration
- Centralized security settings via `SecurityConfig` value object
- Immutable configuration
- Validates all security settings
- Default safe values

## Architecture

The security implementation follows SOLID principles and Domain-Driven Design:

### Domain Layer (`/src/domain/shared/`)
- **PathValidator**: Value object for path validation
- **SecurityConfig**: Value object for security configuration
- **InputValidator**: Domain service for input validation

### Infrastructure Layer (`/src/infrastructure/security/`)
- **SecurityMiddleware**: Infrastructure service for Express middleware

### Separation of Concerns
- Domain layer handles business rules and validation logic
- Infrastructure layer handles technical implementation (HTTP, middleware)
- Clear boundaries between layers

## Default Allowed Scan Paths

By default, the application only allows scanning within these directories in the user's home folder:
- `~/Documents`
- `~/Projects`
- `~/Development`
- `~/dev`
- `~/workspace`
- `~/repos`
- `~/code`
- `~/src`

Users attempting to scan paths outside these directories will receive a 403 Forbidden response.

## Configuration

### Environment Variables

```bash
# Trusted CORS origins (comma-separated)
TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Maximum requests per minute for rate limiting
MAX_REQUESTS_PER_MINUTE=60

# Server port
PORT=3000
```

## Testing Security

### Test Path Traversal Protection
```bash
# This should be rejected
curl -X POST http://localhost:3000/api/scan \
  -H "Content-Type: application/json" \
  -d '{"folderPath": "/etc/passwd"}'

# Expected response: 403 Forbidden
```

### Test Rate Limiting
```bash
# Send many requests quickly
for i in {1..70}; do
  curl http://localhost:3000/api/health
done

# Expected: Some requests will receive 429 Too Many Requests
```

### Test Input Validation
```bash
# Invalid character input (multiple chars)
curl -X POST http://localhost:3000/api/session/test123/input \
  -H "Content-Type: application/json" \
  -d '{"character": "abc"}'

# Expected response: 400 Bad Request with validation error
```

## Security Best Practices for Developers

1. **Never trust user input** - Always validate and sanitize
2. **Use domain validation** - Leverage PathValidator and InputValidator
3. **Follow the principle of least privilege** - Only allow what's necessary
4. **Log security events** - Monitor for suspicious activity
5. **Keep dependencies updated** - Regularly update npm packages
6. **Review security config** - Ensure SecurityConfig is properly configured
7. **Test security features** - Include security tests in your test suite

## Reported Vulnerabilities - FIXED

### Critical
- ✅ **Path Traversal** - Fixed with PathValidator
- ✅ **XSS in Results Modal** - Fixed with safe DOM methods

### High
- ✅ **CORS Misconfiguration** - Fixed with whitelist
- ✅ **Missing Rate Limiting** - Fixed with tiered rate limiting

### Medium
- ✅ **Missing Input Validation** - Fixed with InputValidator

## Future Security Enhancements

Consider implementing:
1. Authentication and authorization
2. CSRF protection for state-changing operations
3. Database encryption for stored statistics
4. Audit logging for all security events
5. Intrusion detection system (IDS)
6. Regular security audits and penetration testing
7. Security headers testing in CI/CD pipeline

## Contact

For security concerns or to report vulnerabilities, please contact the development team.

---

**Last Updated**: 2025-11-02
**Version**: 3.1.0
