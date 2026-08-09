#!/bin/sh
set -eu

target='src/types/database.generated.ts'
temporary_file="$(mktemp)"
trap 'rm -f "$temporary_file"' EXIT HUP INT TERM

if [ ! -f "$target" ]; then
  echo 'Database type baseline is missing. Start Supabase, run npm run db:types, review it, and commit it before enabling database CI.' >&2
  exit 1
fi

npx supabase gen types typescript --local > "$temporary_file"

if ! grep -q 'export type Database' "$temporary_file"; then
  echo 'Generated database types did not contain the expected Database export.' >&2
  exit 1
fi

if ! diff -u "$target" "$temporary_file"; then
  echo 'Database types have drifted. Run npm run db:types and commit the reviewed output.' >&2
  exit 1
fi
