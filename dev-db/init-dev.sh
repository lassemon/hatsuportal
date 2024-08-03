#!/bin/bash
set -e

for sql_file in /migrations/*.sql; do
  echo "Applying migration: $(basename "$sql_file")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

echo "Seeding development data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /seed.sql