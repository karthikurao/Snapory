#!/usr/bin/env bash

# Configure local environment file for Snapory.
# - Creates .env from .env.example when missing
# - Ensures required variables are present
# - Generates a development JWT secret when using placeholder value

set -euo pipefail

NON_INTERACTIVE=false
if [[ "${1:-}" == "--non-interactive" ]]; then
  NON_INTERACTIVE=true
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
ENV_EXAMPLE="${ROOT_DIR}/.env.example"

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$ENV_EXAMPLE" "$ENV_FILE"
  echo "✅ Created .env from .env.example"
fi

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "❌ Required command '$1' not found"
    exit 1
  fi
}

require_command python

set_env_value() {
  local key="$1"
  local value="$2"

  python - "$ENV_FILE" "$key" "$value" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = path.read_text().splitlines()
updated = False
for i, line in enumerate(lines):
    if line.startswith(f"{key}="):
        lines[i] = f"{key}={value}"
        updated = True
        break

if not updated:
    lines.append(f"{key}={value}")

path.write_text("\n".join(lines) + "\n")
PY
}

get_env_value() {
  local key="$1"
  python - "$ENV_FILE" "$key" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
key = sys.argv[2]
value = ""
for line in path.read_text().splitlines():
    if line.startswith(f"{key}="):
        value = line.split("=", 1)[1]
        break
print(value)
PY
}

JWT_SECRET_VAL="$(get_env_value "JWT_SECRET")"
if [[ -z "$JWT_SECRET_VAL" || "$JWT_SECRET_VAL" == "change_this_to_a_secure_random_string_in_production" ]]; then
  NEW_SECRET="$(python - <<'PY'
import secrets
print(secrets.token_urlsafe(48))
PY
)"
  set_env_value "JWT_SECRET" "$NEW_SECRET"
  echo "✅ Generated a secure development JWT_SECRET"
fi

S3_ACCESS="$(get_env_value "S3_ACCESS_KEY")"
S3_SECRET="$(get_env_value "S3_SECRET_KEY")"

if [[ "$S3_ACCESS" == "your_access_key_here" || "$S3_ACCESS" == "your-ovh-access-key" ]]; then
  echo "⚠️  S3_ACCESS_KEY is still placeholder."
fi
if [[ "$S3_SECRET" == "your_secret_key_here" || "$S3_SECRET" == "your-ovh-secret-key" ]]; then
  echo "⚠️  S3_SECRET_KEY is still placeholder."
fi

if [[ "$NON_INTERACTIVE" == false ]]; then
  echo
  echo "Environment configuration complete."
  echo "Edit .env if you want to switch to MinIO/local credentials."
fi
