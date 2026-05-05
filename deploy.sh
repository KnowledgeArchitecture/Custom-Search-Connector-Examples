#!/bin/bash
set -e

if [ -z "$PROJECT_DIR" ]; then
  echo "ERROR: PROJECT_DIR environment variable is not set." >&2
  exit 1
fi

SCRIPT="$DEPLOYMENT_SOURCE/$PROJECT_DIR/deploy.sh"

if [ ! -f "$SCRIPT" ]; then
  echo "ERROR: No deploy.sh found at $SCRIPT" >&2
  exit 1
fi

bash "$SCRIPT"
