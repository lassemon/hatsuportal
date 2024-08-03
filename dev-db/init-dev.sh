#!/bin/bash
set -e

for sql_file in /migrations/*.sql; do
  echo "Applying migration: $(basename "$sql_file")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$sql_file"
done

for seed_file in /seeds/*.sql; do
  echo "Applying productionseed: $(basename "$seed_file")"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f "$seed_file"
done

echo "Seeding development data..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /test-data-seed.sql