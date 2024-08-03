#!/bin/sh
set -e # causes the script to abort if migrations fail, preventing a broken server from starting.

#The migrations step here is a secondary safety net.
# The primary migration trigger is the release_command in fly.toml which runs before any new machine starts.
echo "Running database migrations..."
cd /app/backend && ../node_modules/.bin/node-pg-migrate up -m migrations

echo "Starting server..."
exec node /app/backend/build/server.js