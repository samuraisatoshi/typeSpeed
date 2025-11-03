# Security Policy

## 🔒 TypeSpeed Security

TypeSpeed is designed with privacy and security as top priorities. As a client-side application that runs entirely in the browser with no server components, the attack surface is minimal. However, we take all security concerns seriously.

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Features

TypeSpeed implements several security measures by design:

### 🛡️ Privacy Protection
- **No Data Collection**: TypeSpeed never collects, transmits, or stores user data on external servers
- **100% Offline**: Operates entirely within your browser without internet connectivity
- **Local Storage Only**: Statistics are stored locally using browser localStorage
- **No Analytics**: Zero tracking, telemetry, or third-party scripts

### 🔐 Input Security
- **Path Validation**: All file paths are validated to prevent directory traversal attacks
- **Content Sanitization**: User input and file content are properly sanitized before display
- **XSS Prevention**: All dynamic content is escaped to prevent cross-site scripting
- **No Eval**: The application never uses `eval()` or similar dangerous functions

### 🚫 What TypeSpeed Does NOT Do
- Never uploads files to any server
- Never executes user code
- Never makes network requests
- Never stores sensitive information
- Never accesses files outside selected directories

## Reporting a Vulnerability

We appreciate the security research community's efforts in helping keep TypeSpeed secure. If you discover a security vulnerability, please follow these steps:

### 📮 How to Report

1. **DO NOT** create a public GitHub issue for security vulnerabilities
2. **Email** your findings to: [Insert your security email here]
3. **Include** the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if any)

### 📋 What to Expect

- **Acknowledgment**: We'll acknowledge receipt within 48 hours
- **Communication**: We'll keep you informed about our progress
- **Fix Timeline**: We aim to fix critical issues within 7 days
- **Credit**: We'll credit you in the fix announcement (unless you prefer anonymity)

### ✅ Responsible Disclosure

We kindly ask that you:
- Give us reasonable time to fix the issue before public disclosure
- Not exploit the vulnerability beyond what's necessary for verification
- Not access or modify other users' data (though TypeSpeed stores no server-side data)

## Security Best Practices for Users

To ensure maximum security when using TypeSpeed:

### 🏃 Running TypeSpeed

1. **Download from Official Source**: Only download TypeSpeed from the official GitHub repository
2. **Verify File Integrity**: Check that files haven't been tampered with
3. **Use HTTPS**: If hosting on a server, always use HTTPS
4. **Keep Updated**: Always use the latest version for security patches

### 📁 File Selection

1. **Trusted Folders Only**: Only select folders you trust
2. **No Sensitive Data**: Avoid selecting folders containing passwords, keys, or sensitive information
3. **Local Files**: TypeSpeed is designed for local files only

### 🌐 Browser Security

1. **Updated Browser**: Use an up-to-date modern browser
2. **Private Browsing**: Use private/incognito mode if on a shared computer
3. **Clear Data**: Clear localStorage if you want to remove all TypeSpeed data

## Known Security Considerations

### Browser File Access Dialog
When selecting folders, browsers show a security dialog about "uploading" files. This is misleading - TypeSpeed reads files locally and never uploads anything. This is standard browser behavior for the File API.

### localStorage Limitations
- Statistics are stored in browser localStorage
- Anyone with access to your computer can view these statistics
- Use private browsing mode on shared computers
- Clear browser data to remove all stored information

### Cross-Origin Restrictions
When opened directly as a file (`file://`), some browser security features may restrict functionality. For full features, serve TypeSpeed from a local web server.

## Security Updates

Security updates are announced through:
- GitHub Security Advisories
- Release notes
- Repository README updates

## Security Hall of Fame

We thank the following security researchers for responsibly disclosing vulnerabilities:

*[This section will be updated as vulnerabilities are reported and fixed]*

## Contact

- **Security Issues**: [Your security email]
- **General Issues**: Use GitHub Issues
- **Author**: SamuraiSatoshi

## Commitment

We are committed to:
- Responding quickly to security issues
- Being transparent about security concerns
- Maintaining TypeSpeed as a secure, privacy-respecting tool
- Never adding features that compromise user privacy

## License

This security policy is part of the TypeSpeed project, licensed under MIT.

---

*Last updated: November 2024*

*If you have any questions about this security policy, please open a discussion in the GitHub repository.*