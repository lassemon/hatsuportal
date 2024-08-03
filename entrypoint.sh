#!/bin/sh

# Disable automatic opening of the browser
export BROWSER=none

# Start the backend watch
npm run watch


# Keep the container running
tail -f /dev/null