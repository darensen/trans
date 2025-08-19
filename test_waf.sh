#!/usr/bin/env bash
# Test Nginx + ModSecurity (CRS) + WSS
set -u

# ---------- Config ----------
HOST="${HOST:-localhost}"
PORT="${PORT:-8443}"
HTTP_PORT="${HTTP_PORT:-8080}"        # port HTTP publié (pour la redirection)
BASE="https://${HOST}:${PORT}"
NGINX_CONTAINER="${NGINX_CONTAINER:-nginx}"
UPLOAD_URL="${UPLOAD_URL:-$BASE/avatars/upload}"
SKIP_UPLOAD="${SKIP_UPLOAD:-0}"
INSECURE_TLS="${INSECURE_TLS:-1}"   # 1=accepte cert auto-signé en dev
WS_CLIENT="${WS_CLIENT:-curl}"      # curl | wscat | websocat
WS_PONG_PATH="${WS_PONG_PATH:-/ws/pong}"
WS_TOURN_PATH="${WS_TOURN_PATH:-/ws/tournament}"

# ---------- UI ----------
GREEN="$(printf '\033[32m')"; RED="$(printf '\033[31m')"; YELLOW="$(printf '\033[33m')"; NC="$(printf '\033[0m')"
pass(){ echo -e "${GREEN}✅ $*${NC}"; }
fail(){ echo -e "${RED}❌ $*${NC}"; }
warn(){ echo -e "${YELLOW}⚠️  $*${NC}"; }
sep(){ echo -e "\n—— $* ——"; }

# ---------- Helpers ----------
has_docker(){ docker exec "$NGINX_CONTAINER" true >/dev/null 2>&1; }
has_cmd(){ command -v "$1" >/dev/null 2>&1; }
nginx_t(){ if has_docker; then docker exec -it "$NGINX_CONTAINER" nginx -t; else warn "Docker non dispo : skip nginx -t"; fi; }
audit_tail(){
  if has_docker; then docker exec -it "$NGINX_CONTAINER" sh -c "tail -n 120 /var/log/modsecurity/audit.log" || true
  else warn "Docker non dispo : skip audit.log"; fi
}
http_status(){ curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' "$1"; }
head_status(){ curl -kIs -o /dev/null -w '%{http_code}' "$1"; }

ws_handshake_curl(){
  local url="$1" ; local line
  line=$(curl ${INSECURE_TLS:+-k} --max-time 5 -i -N \
    -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Host: ${HOST}:${PORT}" \
    -H "Origin: https://${HOST}:${PORT}" \
    -H "Sec-WebSocket-Version: 13" \
    -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    "$url" 2>/dev/null | head -n 1)
  [[ "$line" =~ 101 ]] && echo "101" || echo "$line"
}

ws_test(){
  local path="$1"
  local url="${BASE}${path}"

  # 1) Handshake via curl (non-bloquant)
  local line
  line=$(curl ${INSECURE_TLS:+-k} --max-time 5 -i -N \
    -H "Connection: Upgrade" \
    -H "Upgrade: websocket" \
    -H "Host: ${HOST}:${PORT}" \
    -H "Origin: https://${HOST}:${PORT}" \
    -H "Sec-WebSocket-Version: 13" \
    -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
    "$url" 2>/dev/null | head -n 1)
  if echo "$line" | grep -q " 101 "; then echo "101"; return 0; fi

  # 2) Optionnel : wscat
  if [[ "$WS_CLIENT" == "wscat" ]] && has_cmd npx; then
    if [[ "$INSECURE_TLS" == "1" ]]; then
      out=$(NODE_TLS_REJECT_UNAUTHORIZED=0 npx --yes wscat -c "$url" -n -x 'ping' 2>&1 | head -n 2)
    else
      out=$(npx --yes wscat -c "$url" -n -x 'ping' 2>&1 | head -n 2)
    fi
    echo "$out" | grep -qi "connected" && echo "101" && return 0
  fi

  # 3) websocat
  if [[ "$WS_CLIENT" == "websocat" ]] && has_cmd websocat; then
    if [[ "$INSECURE_TLS" == "1" ]]; then
      out=$(timeout 3 websocat -n --insecure --tls-server-name "$HOST" "$url" 2>&1 || true)
    else
      out=$(timeout 3 websocat -n --tls-server-name "$HOST" "$url" 2>&1 || true)
    fi
    if ! echo "$out" | grep -qiE "error|refused|bad|fail"; then echo "101" && return 0; fi
  fi

  echo "${line:-<no 101>}"
}

# ---- Attaques génériques (expects 403, sauf noted) ----
attack_query(){ # $1 label, $2 path, $3.. "name=value" (bruts)
  local label="$1"; shift
  local path="$1"; shift
  local args=()
  for p in "$@"; do
    args+=( --data-urlencode "$p" )   # <-- chaque param devient un ARG séparé
  done
  local code
  code=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -G "${BASE}${path}" "${args[@]}")
  if [[ "$code" == "403" ]]; then
    pass "$label -> 403 (bloqué)"
  else
    fail "$label -> HTTP $code (non bloqué)"
  fi
}

attack_path(){ # $1 label, $2 encoded path (commence par /)
  local label="$1"; local ep="$2"
  local code; code=$(http_status "${BASE}${ep}")
  # Beaucoup d’apps retournent 400 (bad request) plutôt que 403 sur path traversal
  if [[ "$code" == "403" || "$code" == "400" ]]; then
    pass "$label -> $code (bloqué)"
  else
    fail "$label -> HTTP $code (non bloqué)"
  fi
}

attack_header(){ # $1 label, $2 path, $3 headerName, $4 headerVal
  local label="$1"; local path="$2"; local h="$3"; local v="$4"
  local code; code=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -H "$h: $v" "${BASE}${path}")
  if [[ "$code" == "403" ]]; then pass "$label -> 403 (bloqué)"
  else fail "$label -> HTTP $code (non bloqué)"; fi
}

# ---------- 0) Sanity ----------
sep "0) Validation de configuration"
nginx_t || true

sep "1) Redirection ${HOST}:${HTTP_PORT} -> HTTPS (port ${PORT})"
loc=$(curl -sI "http://${HOST}:${HTTP_PORT}/" | awk '/^[Ll]ocation:/{print $2}' | tr -d '\r')
if echo "$loc" | grep -q "https://${HOST}:${PORT}/"; then
  pass "Redirection OK -> $loc"
else
  fail "Redirection inattendue: ${loc:-<vide>}"
fi

sep "1.2) Accueil HTTPS (HEAD/GET)"
s1=$(head_status "${BASE}/")
[[ "$s1" =~ ^2|3|4 ]] && pass "HEAD ${BASE}/ -> HTTP $s1" || fail "HEAD ${BASE}/ -> HTTP $s1"

# ---------- 2) WAF : attaques (PL1) ----------
sep "2) WAF : blocage d'attaques communes (PL1)"

# SQLi (942xxx) + XSS (941xxx)
attack_query "SQLi tautology" "/" $'id=\' OR \'1\'=\'1\''
attack_query "XSS basique" "/" 'q=<script>alert(1)</script>'

# LFI / Path Traversal (930xxx)
attack_query "LFI param ../../etc/passwd" "/" 'file=../../../../etc/passwd'
attack_path  "LFI via chemin encodé" "/..%2f..%2f..%2fetc%2fpasswd"

# RFI (931xxx)
attack_query "RFI URL externe" "/" 'url=http://127.0.0.1/shell.txt'

# RCE / Command Injection (932xxx)
# attack_query "RCE ; id" "/" 'cmd=; id'
# attack_query "RCE $(id) littéral" "/" 'cmd=$(id)'

# PHP Injection (933xxx)
attack_query "PHP Injection" "/" $'p=<?php system(\'id\'); ?>'

# NoSQL / Mongo
attack_query "NoSQL \$ne" "/" 'user[$ne]='

# Recon / Scanner (913xxx) - User-Agent
attack_header "Recon UA sqlmap" "/" "User-Agent" "sqlmap/1.6"

sep "Extrait audit.log (si dispo)"
audit_tail

# ---------- 3) Exclusion /api/health ----------
sep "3) /api/health en DetectionOnly (≠ 403)"
health=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -G "${BASE}/api/health" --data-urlencode "q=<script>alert(1)</script>")
[[ "$health" == "403" ]] && fail "/api/health -> 403 (devrait passer)" || pass "/api/health -> HTTP ${health}"

# ---------- 4) Limites upload (200 kio) ----------
if [[ "$SKIP_UPLOAD" == "1" ]]; then
  warn "4) Upload : SKIP (exporte SKIP_UPLOAD=0 pour tester)"
else
  sep "4) Upload limite 200 kio vers ${UPLOAD_URL}"
  tmpok="$(mktemp)"; tmpko="$(mktemp)"; trap 'rm -f "$tmpok" "$tmpko"' EXIT
  dd if=/dev/zero of="$tmpok" bs=1024 count=150 status=none
  dd if=/dev/zero of="$tmpko" bs=1024 count=250 status=none

  st_small=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -F "file=@${tmpok}" "$UPLOAD_URL")
  if [[ "$st_small" != "413" && "$st_small" != "403" ]]; then
    pass "Upload 150k -> HTTP $st_small (accepté)"
  else
    warn "Upload 150k -> HTTP $st_small (vérifie l'endpoint)"
  fi

  st_big=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -F "file=@${tmpko}" "$UPLOAD_URL")
  if [[ "$st_big" == "413" || "$st_big" == "403" ]]; then
    pass "Upload 250k rejeté comme attendu ($st_big)"
  else
    fail "Upload 250k NON rejeté (HTTP $st_big)"
  fi
fi

# ---------- 5) WebSocket (WSS via Nginx) ----------
sep "5) Handshake WSS ${WS_PONG_PATH} (client: ${WS_CLIENT})"
l1=$(ws_test "${WS_PONG_PATH}")
[[ "$l1" == "101" ]] && pass "WS ${WS_PONG_PATH} -> 101 Switching Protocols" || fail "WS ${WS_PONG_PATH} -> ${l1}"

sep "5.2) Handshake WSS ${WS_TOURN_PATH} (client: ${WS_CLIENT})"
l2=$(ws_test "${WS_TOURN_PATH}")
[[ "$l2" == "101" ]] && pass "WS ${WS_TOURN_PATH} -> 101 Switching Protocols" || fail "WS ${WS_TOURN_PATH} -> ${l2}"

# ---------- 6) Méthodes HTTP ----------
sep "6) Méthodes HTTP (TRACE doit être 405)"
trace_code=$(curl -ks ${INSECURE_TLS:+-k} -o /dev/null -w '%{http_code}' -X TRACE "${BASE}/")
[[ "$trace_code" == "405" ]] && pass "TRACE -> 405" || fail "TRACE -> HTTP $trace_code (attendu 405)"

# ---------- 7) Résumé ----------
sep "7) Résumé"
echo "BASE: ${BASE} (HTTP_PORT=${HTTP_PORT})"
echo "Container Nginx: ${NGINX_CONTAINER}"
echo "Upload URL: ${UPLOAD_URL} (SKIP_UPLOAD=${SKIP_UPLOAD})"
echo "WS client: ${WS_CLIENT} (INSECURE_TLS=${INSECURE_TLS})"
echo "Terminé."
