# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

1. **DO NOT** open a public issue
2. Email security concerns to: stefan@stefangasser.com
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## Security Best Practices

When using DiffShot:

### API Keys
- Configure your API key using `diffshot-ai config set apiKey`
- Keys are stored securely in your home directory config
- Never share your config file or commit API keys to version control

### Authentication Scripts
- Store authentication scripts in `.diffshot/auth/` 
- Add `.diffshot/auth/` to your `.gitignore`
- Never hardcode credentials in your codebase

### Screenshots
- Be aware that screenshots may contain sensitive data
- Add `.diffshot/screenshots/` to `.gitignore` if needed
- Review screenshots before sharing publicly

## Security Features

- No data is sent to external services except Claude AI API
- Authentication scripts are executed locally
- Screenshots are stored locally only
- No telemetry or usage tracking

## Dependencies

We regularly update dependencies to patch known vulnerabilities. Run `npm audit` to check for issues.