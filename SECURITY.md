# Security Policy

We take the security of the Bogie Flow monitoring system seriously. Because this application evaluates critical rail infrastructure telemetry, maintaining credential hygiene and event-loop isolation is a high priority.

## Supported Versions

Only the current main version of this repository is actively maintained and supported.

| Version | Supported |
| ------- | --------- |
| 1.6.0   | :white_check_mark: |
| < 1.6.0 | :x: |

## Reporting a Vulnerability

**Do not report security vulnerabilities through public GitHub issues.**

If you discover a security vulnerability, please report it privately:
1. Open a **Private Security Advisory** directly on the GitHub repository page under the "Security" tab.
2. Alternatively, email the maintainer directly at **stormylalala2233@gmail.com**.

We will acknowledge your report within 48 hours and work with you to coordinate a security patch.

## Sensitive Credentials & Environment Configs

1. **No Secrets in the Repository**: Never commit API keys (such as `GUIDE_AI_API_KEY`), tokens, or passwords to Git. The `.env` file is explicitly ignored in our [.gitignore](.gitignore).
2. **Environment Variable Configuration**: Set all credentials via environment variables (see [.env.example](.env.example)).
3. **CORS Security**: Restrict origin access by configuring the `ALLOWED_ORIGINS` environment variable in production. Do not leave it open to `*` in production environments.
