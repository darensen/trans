#!/bin/bash

# Wait for Vault to be ready
sleep 5

# Set Vault address
export VAULT_ADDR='http://localhost:8200'
export VAULT_TOKEN='myroot'

# Enable secrets engine
vault secrets enable -path=secret kv-v2

# Store JWT secret
vault kv put secret/jwt secret="your-super-secure-jwt-secret-key-change-in-production"

echo "Vault initialized with JWT secret"
