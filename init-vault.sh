#!/bin/bash

# Wait for Vault to be ready
echo "Waiting for Vault container to be ready..."
sleep 7

# Check if vault container is running
if ! docker ps | grep -q "vault"; then
    echo "Error: Vault container is not running. Please run 'make' or 'docker-compose up -d' first."
    exit 1
fi

echo "Initializing Vault secrets..."

# Run vault commands inside the container
docker exec vault /bin/sh -c "
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='myroot'

# Enable secrets engine (ignore error if already enabled)
vault secrets enable -path=secret kv-v2 2>/dev/null || echo 'Secret engine already enabled'

# Store JWT secret
vault kv put secret/jwt secret='your-super-secure-jwt-secret-key-change-in-production'

# Store WebSocket shared secret (for ws->backend calls)
vault kv put secret/ws wt_secret='dev-ws-shared-token-change'

# Store security secrets (e.g., TOTP pepper)
vault kv put secret/security totp_secret='dev-totp-pepper-change'

echo 'All secrets stored successfully'
"

echo "Vault initialized with JWT secret"
