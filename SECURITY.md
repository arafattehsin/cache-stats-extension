# Security

## Reporting a vulnerability

Please report vulnerabilities through this repository's private GitHub security
advisory flow. Do not include session-store contents, access tokens, or personal
paths in a public issue.

## Data boundary

Cache Stats reads the local Copilot session database in read-only mode and
serves its UI on an ephemeral loopback port. It does not intentionally transmit
session data or load remote UI assets.
