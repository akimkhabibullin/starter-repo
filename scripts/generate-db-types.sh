#!/bin/sh
set -eu

target='src/types/database.generated.ts'
temporary_file="$(mktemp)"
trap 'rm -f "$temporary_file"' EXIT HUP INT TERM

npx supabase gen types typescript --local > "$temporary_file"

if ! grep -q 'export type Database' "$temporary_file"; then
  echo 'Generated database types did not contain the expected Database export.' >&2
  exit 1
fi

mv "$temporary_file" "$target"
trap - EXIT HUP INT TERM
