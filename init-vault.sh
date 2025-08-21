# #!/bin/bash
set -euo pipefail

VAULT_CONTAINER_NAME="${VAULT_CONTAINER_NAME:-vault}"
ENV_FILE="${ENV_FILE:-.env}"

echo "[init-vault] Loading env from ${ENV_FILE} (if present)"
if [ -f "$ENV_FILE" ]; then
  set -a
  # charge uniquement les lignes KEY=VALUE sans commentaires
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$ENV_FILE" > /tmp/.init-vault.env || true
  . /tmp/.init-vault.env
  set +a
fi

# Sanity checks
for v in VAULT_ADDR VAULT_TOKEN JWT_SECRET WS_SECRET TOTP_PEPPER; do
  if [ -z "${!v:-}" ]; then
    echo "[init-vault] ERROR: $v is empty. Check your .env"
    exit 1
  fi
done

echo "[init-vault] Waiting for Vault container to be ready..."
sleep 7

if ! docker ps --format '{{.Names}}' | grep -qx "$VAULT_CONTAINER_NAME"; then
  echo "[init-vault] Error: container '$VAULT_CONTAINER_NAME' not running."
  exit 1
fi

echo "[init-vault] Writing secrets to Vault (${VAULT_ADDR})"

docker exec \
  -e VAULT_ADDR="$VAULT_ADDR" \
  -e VAULT_TOKEN="$VAULT_TOKEN" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e WS_SECRET="$WS_SECRET" \
  -e TOTP_PEPPER="$TOTP_PEPPER" \
  "$VAULT_CONTAINER_NAME" /bin/sh -lc '
set -e
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "[vault] KV already enabled"

vault kv put secret/jwt      secret="$JWT_SECRET"
vault kv put secret/ws       wt_secret="$WS_SECRET"
# on stocke le pepper sous la clé "totp_secret" (comme avant)
vault kv put secret/security totp_secret="$TOTP_PEPPER"

echo "[vault] Secrets stored"
'

echo "[init-vault] Done."