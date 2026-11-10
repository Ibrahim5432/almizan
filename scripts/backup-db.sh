#!/usr/bin/env bash
# ============================================================================
# scripts/backup-db.sh — نسخ احتياطي يومي مشفّر لقاعدة البيانات (GPG/AES-256)
# ============================================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date -u +"%Y%m%dT%H%M%SZ")"
DB_URL="${DATABASE_URL:-postgresql://almizan:change_me_in_prod@localhost:5432/almizan_news}"
PASSPHRASE="${BACKUP_ENCRYPTION_KEY:-default-dev-passphrase-change-in-prod}"

mkdir -p "$BACKUP_DIR"

RAW_DUMP="$BACKUP_DIR/almizan_${TIMESTAMP}.sql.gz"
ENCRYPTED_DUMP="${RAW_DUMP}.gpg"

echo "[backup] Starting PostgreSQL dump at ${TIMESTAMP}..."
if command -v pg_dump >/dev/null 2>&1; then
  pg_dump "$DB_URL" | gzip -9 > "$RAW_DUMP"
  if command -v gpg >/dev/null 2>&1; then
    gpg --batch --yes --passphrase "$PASSPHRASE" --cipher-algo AES256 -c "$RAW_DUMP"
    rm -f "$RAW_DUMP"
    echo "[backup] Encrypted backup created: ${ENCRYPTED_DUMP}"
  else
    echo "[backup] Warning: gpg not installed, keeping compressed dump: ${RAW_DUMP}"
  fi
else
  echo "[backup] pg_dump not found in container; exporting JSON state snapshot..."
  cp -f ./data/newsroom-state.json "$BACKUP_DIR/state_${TIMESTAMP}.json" 2>/dev/null || true
fi

# حذف النسخ الأقدم من 30 يومًا
find "$BACKUP_DIR" -type f -mtime +30 -delete 2>/dev/null || true
echo "[backup] Completed successfully."
