# Mobile starter operations

This runbook covers the implemented starter. Items deferred in ADR 0001 remain release blockers and must not be treated as configured.

## Local start

1. Install the Node version used by CI (Node 22) and run `npm ci`.
2. Copy `.env.example` to ignored `.env.local`; fill only values for the environment you intend to use. Follow `docs/prerequisite-setup-guide.md` and never paste values into logs or commits.
3. Run `npm run quality`, then `npm start`. Use a development build for native modules; Expo Go is not an acceptance target.
4. For local backend work, start the Docker-compatible runtime before starting Expo.

## Database reset and types

Run, in order:

```bash
npx supabase start
npx supabase db reset
npx supabase db lint
npx supabase test db
npm run db:types
npm run db:types:check
```

Review the generated `src/types/database.generated.ts` before committing it. Do not hand-edit it. Enable repository variable `ENABLE_DATABASE_CI=true` only after that baseline is committed. Stop the stack with `npx supabase stop` when finished.

## Provider credential rotation

- Supabase: create the replacement credential with least privilege, update ignored local/EAS values, verify a preview build, then revoke the old credential. A publishable client key is not a substitute for RLS.
- Google OAuth/Maps: rotate in the provider consoles, retain package/signing restrictions, update Supabase/EAS values, verify email and Google sessions on both configured platforms, then retire old credentials.
- Sentry: replace the upload token in EAS sensitive variables, verify one symbolicated preview event and redaction, then revoke the old token. The public DSN may remain client-visible.
- Apple: setup and rotation are deferred by ADR 0001. Before enabling Apple auth, follow current Apple/Supabase documentation and implement revocation-before-deletion acceptance.

Never rotate by committing a credential or by printing it for comparison. Use names-only configured/missing checks.

## Sentry source maps

For EAS Build, keep `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in the appropriate sensitive EAS environment. Confirm the build upload in Sentry. For EAS Update, publish to preview first and use the current Expo/Sentry upload path (the implementation gate selected `npx sentry-expo-upload-sourcemaps dist` after update export). Verify the received event belongs to the expected release/update and resolves to TypeScript without email, tokens, free text, or coordinates.

## Preview updates

EAS project linking and channels are currently blocked. Once configured, build preview binaries before publishing updates, specify the EAS `preview` environment explicitly, keep preview and production channels separate, upload OTA source maps, cold-restart the preview app, and verify the update ID/channel in Settings. Never promote an update across an incompatible runtime or publish production from an unreviewed branch.

## Moderation

Follow `docs/moderation-operations.md`. Only authorized humans may inspect reports or change content status. Confirm RLS visibility with separate accounts and preserve the minimum necessary audit evidence outside analytics/monitoring payloads.

## Account deletion troubleshooting

1. Reproduce only with a disposable test account and record a safe correlation time—not tokens, email, provider payload, or content.
2. A failed function call must preserve the local session. Inspect sanitized Function/Sentry status and confirm the request was authenticated and POST-only.
3. HTTP 409 for an Apple-linked identity is intentional while revocation setup is deferred; do not delete that user manually as a workaround.
4. For non-Apple identities, safely retry a verified transient failure. After success, confirm owned content cascade behavior, auth-user removal, local sign-out, and inability to sign in again.
5. Escalate unexpected partial deletion before retrying administrative actions. Never use a service-role credential in the client.

## Incident and recovery rules

Pause deployments on suspected credential exposure, rotate the affected value, invalidate impacted sessions where appropriate, remove leaked workflow logs/artifacts, and audit tracked files plus implementation history. Database recovery must use tested backups and a documented recovery point; never test destructive recovery against production first.
