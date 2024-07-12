#!/bin/sh

# Disable automatic opening of the browser
export BROWSER=none

# Start the backend watch
(cd backend && npm run watch) &

# Start the frontend watch
(cd frontend && npm run watch:docker)

# Keep the container running
tail -f /dev/null