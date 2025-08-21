#!/bin/sh
set -e

echo "[init-vault] Starting Vault initialization..."

# Vérifier que les variables d'environnement sont définies
if [ -z "$VAULT_ADDR" ]; then
    echo "[init-vault] ERROR: VAULT_ADDR is not set"
    exit 1
fi

if [ -z "$VAULT_TOKEN" ]; then
    echo "[init-vault] ERROR: VAULT_TOKEN is not set"
    exit 1
fi

echo "[init-vault] Waiting for Vault to be ready..."
# Attendre que Vault soit prêt
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if vault status > /dev/null 2>&1; then
        echo "[init-vault] Vault is ready!"
        break
    fi
    echo "[init-vault] Waiting for Vault... (attempt $((attempt + 1))/$max_attempts)"
    sleep 2
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "[init-vault] ERROR: Vault did not become ready in time"
    exit 1
fi

echo "[init-vault] Enabling KV secrets engine..."
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "[init-vault] KV already enabled"

echo "[init-vault] Writing secrets to Vault..."

# Générer des secrets par défaut si pas fournis
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"
WS_SECRET="${WS_SECRET:-$(openssl rand -hex 32)}"
TOTP_PEPPER="${TOTP_PEPPER:-$(openssl rand -hex 32)}"

# Stocker les secrets
vault kv put secret/jwt secret="$JWT_SECRET"
vault kv put secret/ws wt_secret="$WS_SECRET"
vault kv put secret/security totp_secret="$TOTP_PEPPER"

echo "[init-vault] Secrets stored successfully!"
echo "[init-vault] Done."