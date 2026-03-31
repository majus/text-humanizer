# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 2.x     | ✅ Active |

## Reporting a Vulnerability

Since this is a client-side application that runs entirely in the browser:

1. **API keys** are stored only in the user's `localStorage` — never on any server
2. **No server-side data storage** — no databases, no user accounts
3. **No authentication system** — nothing to breach
4. **No server-side secrets** — no API keys in code

## Security Features

- All provider API calls use HTTPS
- API keys are masked in the UI
- No third-party tracking or analytics
- CSP-ready (can be deployed with strict Content Security Policy)
- No `eval()` or `innerHTML` with user content
- Input sanitization on all text fields

## Scope

Vulnerabilities in this project would primarily relate to:

- **XSS** in the GitHub Pages static version
- **API key exposure** if keys are accidentally committed
- **Dependency vulnerabilities** in npm packages

If you find a vulnerability, please open a [security advisory](https://github.com/rudra496/StealthHumanizer/security/advisories/new) rather than a public issue.

## Policy

- Do not publicly disclose vulnerabilities before they are fixed
- Provide a clear description of the issue and reproduction steps
- Allow reasonable time for the fix to be merged
