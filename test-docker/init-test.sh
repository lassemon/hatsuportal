#!/bin/bash
set -euo pipefail

# Applies backend/migrations on first container start.
for migration in /migrations/*.sql; do
  echo "Applying migration $(basename "$migration")..."
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$migration"
done
