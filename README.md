# transcendence

## Secrets with HashiCorp Vault

This project uses Vault (dev mode) to hold runtime secrets:

- secret/jwt.secret: JWT signing key for the backend
- secret/ws.wt_secret: shared token for WebSocket servers to call backend
- secret/security.totp_secret: pepper used to encrypt TOTP secrets at rest

Docker Compose starts a Vault dev container. The script `init-vault.sh` seeds default dev secrets.

Override via environment variables if desired:

- Backend: JWT_SECRET, WS_SHARED_SECRET/WT_SECRET, TOTP_SECRET
- WS servers: WS_SHARED_SECRET/WT_SECRET

If env vars are missing, services query Vault using VAULT_ADDR/VAULT_TOKEN and paths:

- VAULT_JWT_PATH (default v1/secret/data/jwt)
- VAULT_WS_PATH (default v1/secret/data/ws)
- VAULT_SECURITY_PATH (default v1/secret/data/security)

In dev, the backend accepts unauthenticated /api/matches calls if the WS shared secret is not set.
