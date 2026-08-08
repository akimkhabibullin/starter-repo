# Mobile starter agent rules

`MOBILE_STARTER_IMPLEMENTATION_SPEC.md` is authoritative. Implement its phases in order and treat every acceptance criterion as a hard gate.

## Documentation gate

Before each phase, open every official page named by that phase. Confirm vendor ownership and locate the relevant installation command, configuration fields, platform caveats, and verification steps. Record the URL, access time, heading, selected command or configuration pattern, and deviations in `docs/implementation-log.md` before making changes.

If required official documentation is unreadable, incomplete, access-controlled, or contradictory, try the vendor's official Markdown page, repository README, or another official vendor page. If that does not resolve the issue, record all attempts, mark the phase `BLOCKED_DOCUMENTATION`, and stop. Never substitute remembered APIs or community instructions.

## Dependencies and commands

- Use npm and commit `package-lock.json`.
- Use `npx expo install` for Expo SDK/native packages unless current official documentation explicitly says otherwise.
- Use local CLIs through `npx`; never install deprecated global `expo-cli`.
- Do not use `--force`, `--legacy-peer-deps`, `--ignore-scripts`, guessed pins, or manual version overrides to force dependency resolution.
- Direct dependencies are limited to choices in section 3 of the specification or packages explicitly required by an opened official guide. Document any exception in `docs/adr/` first.
- Do not add Firebase, Convex, Axios, Redux, Zustand, NativeWind, RevenueCat, OneSignal, an ORM, GraphQL, a general-purpose date library, a second crash reporter, or a second formatter/linter.
- Do not commit generated `ios/` or `android/` directories under the Continuous Native Generation model.

## Git protocol

- Begin each phase with a clean worktree.
- Never use `git add .`; stage explicit paths and inspect staged changes.
- Never amend, squash, rebase, reset, or force-push implementation history.
- Keep official CLI output, dependency installation, handwritten implementation, generated database types, and verification logs in separate commits.
- CLI commit bodies must include the exact non-secret command, official URL, generated paths, and verification status.
- Secret scans are required before every configuration-related commit.

## Quality gates

Run the phase-specific checks and, once available, the full baseline:

```bash
npm run fmt:check
npm run lint
npm run typecheck
npm test -- --runInBand
npx expo-doctor
npx supabase start
npx supabase db reset
npx supabase db lint
npx supabase test db
npm run db:types:check
```

Do not describe a subsystem as working unless its behavioral acceptance test passed. Record platform, device, command, result, and evidence identifier for device and external-service checks.

## Architecture boundaries

- Route components compose features; feature UI calls hooks; hooks call typed query and mutation modules.
- Only `src/lib/supabase` may create or import the raw Supabase client.
- Only the monitoring adapter imports Sentry in feature-neutral code.
- Only the analytics adapter imports PostHog.
- Generated database types are never edited manually.
- Native configuration belongs in `app.config.ts` and `eas.json`.
- Validate environments, forms, geometry, Edge Function inputs, provider-derived fields, and external data with Zod.
- Realtime events only invalidate the narrowest TanStack Query key. They must never maintain a second canonical cache.
- Use React state/context outside server cache unless an ADR authorizes another choice.

## Secrets and privacy

- Treat every `EXPO_PUBLIC_` value as public.
- Never expose Supabase secret/service-role keys, database passwords, access tokens, Sentry auth tokens, Expo tokens, Apple private keys, provider tokens, authorization codes, or passwords in client code, app config `extra`, tracked files, logs, monitoring, analytics, or command output.
- Keep `.env`, `.env.*`, `secrets/`, `.p8`, `.plist`, and Google service JSON files ignored. `.env.example` contains names and safe placeholders only.
- Never send coordinates, map bounds, free-text user content, form values, or credentials to Sentry or PostHog.
- Do not collect background location or upload current-device location unless the user explicitly saves a feature.
