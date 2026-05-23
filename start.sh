#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

start_service() {
  local service_name="$1"
  local service_dir="$2"
  local install_command="$3"

  shift 3

  if [ ! -d "$service_dir/node_modules" ]; then
    echo "Installing dependencies for $service_name..." >&2
    (cd "$service_dir" && eval "$install_command")
  fi

  echo "Starting $service_name..." >&2
  (cd "$service_dir" && "$@") &
  printf '%s\n' "$!"
}

BACKEND_PID="$(start_service "backend" "$BACKEND_DIR" "npm install" npm start)"
FRONTEND_PID="$(start_service "frontend" "$FRONTEND_DIR" "npm install" npm run dev)"

cleanup() {
  echo "Stopping services..."
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM EXIT

wait -n "$BACKEND_PID" "$FRONTEND_PID"