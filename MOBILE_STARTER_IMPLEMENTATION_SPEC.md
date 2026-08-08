# Production Expo + Supabase Map Starter

## Implementation specification for an autonomous coding agent

**Specification version:** 1.0  
**Verified against official documentation:** 2026-08-08  
**Target baseline at verification time:** Expo SDK 57, React Native 0.86, React 19.2.3, Node.js 22.13 or newer  
**Package manager:** npm, with `package-lock.json` committed  
**Native project model:** Expo Continuous Native Generation; do not commit generated `ios/` or `android/` directories unless an official integration explicitly requires that change and this specification is amended first

---

## 1. Purpose

This document is the authoritative implementation plan for a production-grade, reusable mobile application starter. It is intentionally generic. It must not contain product-specific branding, domain rules, or business copy.

The completed starter must provide:

- Expo and React Native with TypeScript and Expo Router.
- Development builds for iOS and Android.
- Supabase Postgres, Auth, Realtime, Edge Functions, migrations, generated database types, Row Level Security, and PostGIS.
- Email/password, Google, and Apple authentication.
- Email confirmation, password reset, sign-out, protected navigation, and in-app account deletion.
- Apple authorization revocation during account deletion.
- A generic collaborative map showing database-backed points and polygons.
- Realtime invalidation of shared map data.
- TanStack Query for server state.
- React Hook Form and Zod for forms and boundary validation.
- Oxlint, type-aware linting, Oxfmt, and strict TypeScript.
- Sentry crash reporting and source maps for EAS Build and EAS Update.
- EAS Build, EAS Update, separate preview and production channels, and safe runtime-version handling.
- Jest, React Native Testing Library, Supabase database/RLS tests, and Maestro end-to-end smoke tests.
- Optional PostHog product analytics, disabled unless its public environment values are supplied.
- Baseline user-generated-content safeguards: reporting, blocking, content status, support contact, privacy policy, terms, and an acceptable-use acknowledgement.
- Reproducible verification on both an iOS Simulator and Android Emulator after every native or architectural milestone.

The result is a starter repository, not a finished product. Demo screens and seed records exist only to prove that every subsystem works.

---

## 2. Normative language

The words **MUST**, **MUST NOT**, **REQUIRED**, **SHOULD**, **SHOULD NOT**, and **MAY** are normative.

If this specification conflicts with current official documentation, the coding agent MUST stop the affected phase, record the conflict, and follow the escalation procedure in section 5. It MUST NOT silently choose one interpretation.

---

## 3. Fixed technical decisions

| Concern | Required choice | Notes |
| --- | --- | --- |
| Application framework | Expo SDK 57 stable | Re-check the current Expo project-creation page before execution. Do not use beta or canary releases. |
| UI runtime | React Native + TypeScript | Strict TypeScript; no `any` at application boundaries. |
| Navigation | Expo Router | Use route groups for public and authenticated areas. |
| Backend | Supabase | No custom long-running backend service. Supabase Edge Functions are allowed for privileged operations. |
| Database | Supabase Postgres + PostGIS | All schema changes are migrations committed to Git. |
| Authentication | Supabase Auth | Email/password, native Google, native Apple. No SMS login. |
| Server state | TanStack Query | Supabase reads and mutations are wrapped in query/mutation functions. Realtime events invalidate Query keys. |
| Forms | React Hook Form + `@hookform/resolvers` + Zod 4 | Zod schemas are also used for environment and external-data validation. |
| Map | `react-native-maps` | Use Apple Maps on iOS and Google Maps on Android. Do not use alpha `expo-maps` for this baseline. |
| Location | `expo-location` | Ask only when the user invokes “use my location.” The map must work when permission is denied. |
| Point clustering | `supercluster` | Use only after a non-clustered database-backed map works. |
| Linting | Oxlint + `oxlint-tsgolint` | Keep a separate `tsc --noEmit` check even if type-aware Oxlint can report TypeScript errors. Independent checks reduce tooling risk. |
| Formatting | Oxfmt | Remove ESLint and Prettier after the scaffold is committed. |
| Error monitoring | Sentry | Mandatory. Include EAS Build and EAS Update source-map verification. |
| Analytics | PostHog | Optional and privacy-minimal. No session replay, touch autocapture, form values, coordinates, descriptions, or error tracking in the baseline. Sentry owns error tracking. |
| OTA updates | EAS Update | Use `preview` and `production` channels. Use the current officially recommended `appVersion` runtime policy. |
| Unit/component tests | Jest + `jest-expo` + React Native Testing Library | Test observable behavior, not implementation details. |
| End-to-end tests | Maestro | Run critical smoke flows on both platforms where the environment supports them. |
| Local backend | Supabase CLI + Docker | Database and RLS tests must run locally and reproducibly. |
| CI/CD | EAS Workflows plus a repository quality workflow | CI must run formatting, linting, type checking, tests, Expo Doctor, and database tests. |
| State outside server cache | React state/context only initially | Do not add Zustand, Redux, MMKV, or another state library without an ADR. |
| Styling | React Native `StyleSheet` | Do not add NativeWind or a UI framework to the generic starter. |

### 3.1 Explicitly excluded

The agent MUST NOT add Firebase, Convex, Axios, Redux, Zustand, NativeWind, RevenueCat, OneSignal, an ORM, GraphQL, a general-purpose date library, a second crash reporter, or a second formatter/linter.

The agent MUST NOT install a package merely because it is familiar. Every direct dependency must be listed in section 3 or introduced by an official tool required by this specification. Transitive dependencies are allowed.

---

## 4. Official source registry

These are the initial authoritative sources. The agent MUST open the relevant page immediately before executing its phase. A GitHub repository counts as official only when it is owned by the package or service maintainer.

### Expo

- Create a project: https://docs.expo.dev/more/create-expo/
- Expo SDK compatibility table: https://docs.expo.dev/versions/latest/
- Expo Router: https://docs.expo.dev/router/introduction/
- Development builds: https://docs.expo.dev/develop/development-builds/introduction/
- Use development builds: https://docs.expo.dev/develop/development-builds/use-development-builds/
- Local app compilation: https://docs.expo.dev/guides/local-app-development/
- iOS Simulator: https://docs.expo.dev/workflow/ios-simulator/
- Android Emulator: https://docs.expo.dev/workflow/android-studio-emulator/
- EAS Build: https://docs.expo.dev/build/introduction/
- `eas.json`: https://docs.expo.dev/build/eas-json/
- EAS environment variables: https://docs.expo.dev/eas/environment-variables/
- Manage EAS environment variables: https://docs.expo.dev/eas/environment-variables/manage/
- EAS Update setup: https://docs.expo.dev/eas-update/getting-started/
- Runtime versions: https://docs.expo.dev/eas-update/runtime-versions/
- Update deployment: https://docs.expo.dev/eas-update/deployment/
- Updates SDK: https://docs.expo.dev/versions/latest/sdk/updates/
- App version management: https://docs.expo.dev/build-reference/app-versions/
- `react-native-maps`: https://docs.expo.dev/versions/latest/sdk/map-view/
- Location: https://docs.expo.dev/versions/latest/sdk/location/
- SecureStore: https://docs.expo.dev/versions/latest/sdk/securestore/
- Apple Authentication: https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- Permissions: https://docs.expo.dev/guides/permissions/
- Environment variables: https://docs.expo.dev/guides/environment-variables/
- Privacy manifests: https://docs.expo.dev/guides/apple-privacy/
- Sentry: https://docs.expo.dev/guides/using-sentry/
- PostHog: https://docs.expo.dev/guides/using-posthog/
- Jest: https://docs.expo.dev/develop/unit-testing/
- Maestro with EAS Workflows: https://docs.expo.dev/eas/workflows/examples/e2e-tests/
- Agent-driven device operation, when supported: https://docs.expo.dev/agents/agent-device/

### Supabase

- Expo React Native quickstart: https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- Expo social auth tutorial: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
- React Native auth quickstart: https://supabase.com/docs/guides/auth/quickstarts/react-native
- Password auth: https://supabase.com/docs/guides/auth/passwords
- Google auth: https://supabase.com/docs/guides/auth/social-login/auth-google
- Apple auth: https://supabase.com/docs/guides/auth/social-login/auth-apple
- Native deep linking: https://supabase.com/docs/guides/auth/native-mobile-deep-linking
- Sessions: https://supabase.com/docs/guides/auth/sessions
- API keys: https://supabase.com/docs/guides/getting-started/api-keys
- Supabase CLI: https://supabase.com/docs/guides/local-development/cli/getting-started
- CLI reference: https://supabase.com/docs/reference/cli/introduction
- Local workflow: https://supabase.com/docs/guides/local-development/cli-workflows
- Migrations: https://supabase.com/docs/guides/local-development/database-migrations
- Seed data: https://supabase.com/docs/guides/local-development/seeding-your-database
- Generated TypeScript types: https://supabase.com/docs/guides/api/rest/generating-types
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Database testing and pgTAP: https://supabase.com/docs/guides/local-development/testing/overview
- PostGIS: https://supabase.com/docs/guides/database/extensions/postgis
- Realtime Postgres Changes: https://supabase.com/docs/guides/realtime/postgres-changes
- Edge Functions quickstart: https://supabase.com/docs/guides/functions/quickstart
- Secure Edge Functions: https://supabase.com/docs/guides/functions/auth
- Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Edge Function deployment: https://supabase.com/docs/guides/functions/deploy
- Delete a user: https://supabase.com/docs/reference/javascript/auth-admin-deleteuser

### Apple review and Sign in with Apple

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Account deletion guidance: https://developer.apple.com/support/offering-account-deletion-in-your-app/
- Account deletion and Apple token revocation, TN3194: https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple
- Sign in with Apple REST API: https://developer.apple.com/documentation/signinwithapplerestapi
- Token validation: https://developer.apple.com/documentation/signinwithapplerestapi/generate-and-validate-tokens
- Token revocation: https://developer.apple.com/documentation/signinwithapplerestapi/revoke-tokens
- Sign in with Apple human-interface guidance: https://developer.apple.com/design/human-interface-guidelines/sign-in-with-apple

### Other maintainers

- `react-native-maps`: https://github.com/react-native-maps/react-native-maps
- Supercluster: https://github.com/mapbox/supercluster
- TanStack Query installation: https://tanstack.com/query/latest/docs/framework/react/installation
- TanStack Query React Native integration: https://tanstack.com/query/latest/docs/framework/react/react-native
- React Hook Form: https://react-hook-form.com/get-started
- React Hook Form resolvers: https://github.com/react-hook-form/resolvers
- Zod 4: https://zod.dev/
- Oxlint: https://oxc.rs/docs/guide/usage/linter
- Oxlint type-aware mode: https://oxc.rs/docs/guide/usage/linter/type-aware.html
- Oxfmt quickstart: https://oxc.rs/docs/guide/usage/formatter/quickstart.html
- Oxfmt configuration: https://oxc.rs/docs/guide/usage/formatter/config.html
- Sentry for Expo: https://docs.sentry.io/platforms/react-native/guides/expo/
- Sentry Expo source maps: https://docs.sentry.io/platforms/react-native/guides/expo/sourcemaps/uploading/expo/
- PostHog React Native: https://posthog.com/docs/libraries/react-native
- React Native testing overview: https://reactnative.dev/docs/testing-overview
- React Native Testing Library: https://callstack.github.io/react-native-testing-library/docs/start/quick-start
- Maestro: https://docs.maestro.dev/getting-started/installing-maestro

---

## 5. Anti-hallucination and documentation protocol

This section overrides normal coding-agent habits.

### 5.1 Documentation gate

Before each phase, the agent MUST:

1. Open every official page named by that phase.
2. Confirm that the page is controlled by the project or vendor named in section 4.
3. Locate the relevant installation command, configuration fields, platform caveats, and verification instructions on the page itself.
4. Record the following in `docs/implementation-log.md`:
   - URL;
   - date and time accessed;
   - documentation heading used;
   - exact command or configuration pattern selected;
   - any deviation from this specification and why.
5. Only then execute the command or edit code.

Search-result snippets, remembered APIs, generated summaries, Stack Overflow, Reddit, personal blogs, and package-name guesses are not sufficient evidence.

### 5.2 Unreadable or incomplete documentation

If a required official page cannot be loaded, is access-controlled, returns an unsupported format, omits a required step, or contradicts another required official page, the agent MUST:

1. Try the vendor's official Markdown/LLM version, official repository README, or another official page from the same vendor.
2. Record all attempted official URLs and the exact failure.
3. Make no package installation and no implementation change for that phase.
4. Mark the phase `BLOCKED_DOCUMENTATION` in `docs/implementation-log.md`.
5. Stop. Do not substitute community instructions.

For example, Apple documentation sometimes requires JavaScript rendering. If the agent cannot read the normative token-exchange and revocation parameters, it MUST stop the account-deletion phase rather than reconstruct the request from memory.

### 5.3 Command fidelity

- Use the package manager and command form shown by the current official page.
- For Expo SDK native packages, use `npx expo install`, not `npm install`, unless the official page explicitly says otherwise.
- Use the local Expo CLI through `npx expo`; never install the deprecated global `expo-cli`.
- Do not add `--force`, `--legacy-peer-deps`, `--ignore-scripts`, or version overrides to make installation succeed.
- If dependency resolution fails, run `npx expo-doctor`, preserve its output in the log, and stop that phase.
- Do not change package versions manually after an official CLI has resolved them unless an official compatibility page directs the change.
- Never run copied commands that contain placeholders until every placeholder has been replaced and validated.

### 5.4 Package allowlist

Before and after each install, compare `package.json` direct dependencies against the choices in section 3 and packages explicitly required by an opened official guide. Unexpected direct dependencies require an ADR in `docs/adr/` before they can remain.

### 5.5 No fake verification

The agent MUST NOT report a subsystem as working based only on successful compilation. It must complete that subsystem's acceptance test. If external authentication presents MFA, CAPTCHA, a consent screen, or another interactive requirement that the prepared simulators cannot satisfy, report the exact external blocker. Do not bypass it and do not claim success.

---

## 6. Human prerequisites

All prerequisites in this section must be completed before the autonomous implementation begins. The agent's first phase verifies them without revealing secret values.

### 6.1 Local machine

Provide a macOS machine if local iOS verification is required. It must have:

- Git.
- Node.js 22.13.x or a newer version supported by Expo SDK 57. The official SDK table currently lists 22.13.x as the minimum.
- npm.
- Xcode and an iOS Simulator compatible with Expo SDK 57. At the time of this specification, Expo lists Xcode 26.4 and iOS 16.4 or newer.
- Android Studio, Android SDK Platform 36, Build Tools, Platform Tools, and an Android Emulator.
- Docker Desktop or another Docker-compatible runtime with at least 7 GB allocated for local Supabase.
- Two bootable test targets: one iOS Simulator and one Android Emulator.
- Maestro CLI, installed from Maestro's official instructions, or permission for the agent to install it from those instructions.

The human should boot each simulator once, accept platform licenses, and confirm `xcrun simctl list devices` and `adb devices` can see them.

### 6.2 Empty repository

Create an empty Git repository whose working directory is also a valid Expo application name. The repository must:

- be on a new implementation branch;
- have no uncommitted changes;
- contain no existing application files;
- have a configured Git author;
- permit the coding agent to create local commits but not rewrite or force-push history.

Do not create a README with a hosting-provider checkbox if it prevents `create-expo-app` from targeting `.`.

### 6.3 Stable application identity

Decide and supply:

- display name;
- Expo slug;
- URL scheme;
- iOS bundle identifier, for example `com.example.mapstarter`;
- Android application ID, normally the same reverse-domain value;
- Apple Developer Team ID;
- support email;
- HTTPS privacy-policy URL;
- HTTPS terms/acceptable-use URL;
- HTTPS support URL.

These values are native configuration. Changing identifiers later requires new provider credentials and often a new native build.

### 6.4 Accounts and projects

Create:

1. An Expo account and EAS project owner account.
2. A Supabase organization and project for each intended remote environment. A minimum setup may use one development project initially, but production must be a separate project before release.
3. A Sentry organization and React Native project.
4. A Google Cloud project with OAuth consent configuration.
5. An Apple Developer account with the app identifier and Sign in with Apple capability.
6. Optional: a PostHog project and a deliberate choice of US or EU data residency.

### 6.5 Supabase dashboard setup

The human must:

- Copy the project URL and the new publishable key (`sb_publishable_...`) from the Connect dialog. Do not use a secret key in the app.
- Keep the project reference and database password available to the CLI.
- Enable email/password auth.
- Decide whether email confirmation is required. The production default is **required**.
- Configure Site URL and mobile redirect allow-list entries for the selected URL scheme.
- Configure the Google provider according to Supabase's official Google page.
- Configure the Apple provider according to Supabase's official Apple page.
- Ensure no secret or legacy `service_role` key is placed in an `EXPO_PUBLIC_` value.

### 6.6 Google setup

Follow the Google section in Supabase's current Expo social-auth tutorial and Google provider documentation. Supply the exact client identifiers and files those pages require for:

- Web OAuth client, used as the server client ID where required;
- iOS OAuth client;
- Android OAuth client with the correct package name and SHA certificate fingerprints;
- `GoogleService-Info.plist` if required by the current integration;
- `google-services.json` if required by the current integration.

Enable Maps SDK for Android and create a restricted Android map API key limited to the correct package name and signing-certificate fingerprints. The generic starter uses Apple Maps on iOS, so it does not require a Google Maps iOS key.

### 6.7 Apple setup

Create and retain:

- Apple app ID with Sign in with Apple enabled;
- Apple Team ID;
- Sign in with Apple key ID;
- `.p8` private key used to create the client secret required by the Apple token REST API;
- bundle identifier/client identifier;
- any Services ID and redirect configuration required by Supabase's current official provider setup.

The `.p8` contents MUST be provided only as a server-side Supabase Edge Function secret. It must never be placed in `EXPO_PUBLIC_`, the app config `extra` object, a committed file, Sentry context, or logs.

### 6.8 Sentry setup

Supply:

- public DSN;
- organization slug;
- project slug;
- organization auth token scoped according to Expo's official Sentry guide for release creation and source-map upload.

The auth token is an EAS sensitive variable and a local non-public variable. It is never bundled into the application.

### 6.9 Test identities and simulator state

Prepare:

- a unique email inbox the agent may use for email confirmation and password reset testing;
- a second email user for RLS and blocking tests;
- a Google test account already allowed by the OAuth consent-screen configuration;
- an iOS Simulator signed into an Apple test account when permitted by the organization;
- an Android Emulator on which the Google test account can complete the system sign-in flow.

Do not put Apple or Google account passwords in the repository or environment file. If the system requires interactive reauthentication, that is an external test blocker and must be recorded honestly.

---

## 7. Environment contract

### 7.1 Files

The human creates `.env.local` from the following example. `.env.local`, `.env`, `.env.*.local`, `secrets/`, `.p8`, `.plist`, and local Google service JSON files MUST be ignored by Git before any tool runs.

The agent commits `.env.example` containing names and safe placeholder values only. It also creates `src/config/env.ts`, which validates every client-visible value with Zod and fails at startup with a clear configuration error in development.

### 7.2 `.env.local` example

```dotenv
# Generic app identity: public and included in the application bundle.
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_NAME=Map Starter
EXPO_PUBLIC_APP_SCHEME=mapstarter
EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER=com.example.mapstarter
EXPO_PUBLIC_ANDROID_PACKAGE=com.example.mapstarter
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://example.com/privacy
EXPO_PUBLIC_TERMS_URL=https://example.com/terms
EXPO_PUBLIC_SUPPORT_URL=https://example.com/support
EXPO_PUBLIC_SUPPORT_EMAIL=support@example.com

# Supabase client values. Publishable keys are designed to be public; RLS is mandatory.
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME

# Native authentication client configuration required by the current official Supabase guide.
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com

# Android map key. It is shipped in the native app and must be restricted in Google Cloud.
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=REPLACE_ME

# Crash reporting DSN is public. Source-map upload credentials below are private.
EXPO_PUBLIC_SENTRY_DSN=https://PUBLIC_DSN@sentry.io/PROJECT_ID

# Optional product analytics. Leave both blank to disable PostHog completely.
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=

# CLI/build variables: never read from client code and never copied into Expo config `extra`.
EXPO_OWNER=REPLACE_ME
EXPO_PROJECT_ID=REPLACE_ME_AFTER_EAS_INIT
EXPO_TOKEN=REPLACE_ME_FOR_NONINTERACTIVE_CI
SUPABASE_PROJECT_REF=REPLACE_ME
SUPABASE_ACCESS_TOKEN=REPLACE_ME
SUPABASE_DB_PASSWORD=REPLACE_ME
SENTRY_AUTH_TOKEN=REPLACE_ME
SENTRY_ORG=REPLACE_ME
SENTRY_PROJECT=REPLACE_ME

# File paths used only while evaluating app.config.ts locally.
GOOGLE_SERVICES_JSON=./secrets/google-services.json
GOOGLE_SERVICE_INFO_PLIST=./secrets/GoogleService-Info.plist

# Server-only Apple token-revocation values. Sync these to Supabase Function secrets.
APPLE_TEAM_ID=REPLACE_ME
APPLE_KEY_ID=REPLACE_ME
APPLE_CLIENT_ID=com.example.mapstarter
APPLE_PRIVATE_KEY_BASE64=REPLACE_WITH_BASE64_P8_CONTENT
```

### 7.3 Secret rules

- Every `EXPO_PUBLIC_` value is public by definition.
- `SUPABASE_ACCESS_TOKEN`, database passwords, Supabase secret/service-role keys, Sentry auth tokens, Expo tokens, and Apple private keys MUST NOT appear in client source or compiled app configuration.
- The agent MUST run a secret scan before every commit that touches configuration. At minimum search tracked files for the literal values of each private variable without printing those values to terminal output.
- EAS must receive public values in the appropriate `development`, `preview`, and `production` environments. Sensitive and file values must use EAS's documented visibility/file mechanisms.
- Supabase Edge Function secrets must be synchronized using the current official Supabase secrets command. The command and key names, but never values, must be logged.

---

## 8. Git and commit protocol

### 8.1 General rules

1. Start each phase with a clean working tree.
2. Never use `git add .`. Stage explicit paths or review `git diff --staged` before committing.
3. Never amend, squash, rebase, reset, or force-push during implementation.
4. Never mix CLI-generated changes with handwritten changes in the same commit.
5. Never mix installation lockfile changes with source implementation in the same commit.
6. Commit generated database types separately from schema and application code.
7. Commit a failing intermediate state only when the state is purely a CLI-generated checkpoint that the next commit intentionally completes. The commit body must say so.
8. Secrets and local environment files are never committed.

### 8.2 CLI-generated commit format

Immediately after a mutating CLI command:

1. Run `git status --short` and inspect every changed path.
2. Make no manual edits.
3. Commit only the files produced by the command.

Use:

```text
chore(<scope>): apply official CLI setup

Command: <the exact command as executed>
Official docs: <URL>
Generated changes: <brief exact list>
Verification: <command and result, or "deferred to follow-up manual configuration commit">
```

Example invocation:

```bash
git commit -m "chore(expo): scaffold Expo SDK 57 application" \
  -m "Command: npx create-expo-app@latest . --template default@sdk-57" \
  -m "Official docs: https://docs.expo.dev/more/create-expo/" \
  -m "Generated changes: Expo Router TypeScript scaffold and package lock" \
  -m "Verification: npm run typecheck; npx expo-doctor"
```

The `Command:` line must exactly match shell history, excluding environment-variable values and credentials. If a command contained a secret argument, replace only the value with `<redacted>` and state that redaction occurred.

### 8.3 Handwritten commit format

```text
feat(<scope>): <behavior added>

Manual changes: <files and behavior>
Official docs: <one or more URLs>
Verification: <exact commands and outcomes>
```

### 8.4 Non-mutating commands

Commands that do not change tracked files, such as simulator launches, builds, deploys, tests, or dashboard verification, are recorded in `docs/implementation-log.md`. Commit that log update separately using `docs(verification): record <phase> verification`.

---

## 9. Required repository structure

The final structure should be recognizably close to this. The agent may adapt filenames to current Expo Router conventions only when the official Router documentation requires it.

```text
.
├── .eas/workflows/
├── .github/workflows/
├── .maestro/
├── .vscode/
├── docs/
│   ├── adr/
│   ├── implementation-log.md
│   ├── operations.md
│   └── release-checklist.md
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   ├── (authenticated)/
│   │   ├── _layout.tsx
│   │   └── +not-found.tsx
│   ├── components/
│   ├── config/
│   ├── features/
│   │   ├── auth/
│   │   ├── map/
│   │   ├── moderation/
│   │   └── settings/
│   ├── lib/
│   │   ├── analytics/
│   │   ├── monitoring/
│   │   ├── query/
│   │   └── supabase/
│   ├── test/
│   └── types/
├── supabase/
│   ├── functions/
│   ├── migrations/
│   ├── tests/
│   ├── config.toml
│   └── seed.sql
├── .env.example
├── .gitignore
├── .oxfmtrc.json
├── .oxlintrc.json
├── AGENTS.md
├── app.config.ts
├── eas.json
├── jest.config.js
├── metro.config.js
├── package.json
├── package-lock.json
└── tsconfig.json
```

The default Expo `app/` directory may be moved to `src/app/` only using Expo Router's documented source-directory convention and only after baseline routing works.

---

## 10. Implementation phases

Each phase is a hard gate. Do not begin the next phase until all acceptance criteria pass and the working tree is clean.

### Phase 0 — Preflight and evidence log

**Official sources:** Expo SDK table, create-project page, simulator/emulator pages, Supabase CLI page, Expo environment-variable page.

1. Confirm the repository is empty and clean.
2. Confirm Node and npm meet the current Expo SDK requirement.
3. Confirm Xcode/iOS Simulator, Android SDK/emulator, Docker, Git, and network access.
4. Validate that every required environment variable name exists without printing values.
5. Validate all HTTPS URLs syntactically.
6. Validate bundle identifiers, package names, URL scheme, Supabase URL, publishable-key prefix, Sentry DSN shape, and Google client-ID shape.
7. Confirm ignored secret paths before any value is written.
8. Create `docs/implementation-log.md`, `docs/adr/README.md`, and the initial `AGENTS.md` manually.

`AGENTS.md` MUST restate the documentation gate, dependency allowlist, commit rules, quality commands, architectural boundaries, secret rules, and the rule that Realtime only invalidates TanStack Query—it does not maintain a second canonical cache.

**Acceptance:** no missing prerequisites, both simulators visible, Docker running, no secret tracked, clean tree after the documentation commit.

### Phase 1 — Official Expo scaffold

**Official source:** https://docs.expo.dev/more/create-expo/

At the verified date, the official command is:

```bash
npx create-expo-app@latest . --template default@sdk-57
```

Before running it, verify that the official page still selects SDK 57 as the current stable non-Expo-Go baseline. If the current stable version changed, stop and create an ADR describing the proposed version change; do not silently substitute it.

Commit the untouched generated output immediately. Then make a separate manual commit to:

- preserve or merge the generated agent guidance;
- set npm scripts `start`, `android`, `ios`, and `web` only as generated by Expo;
- set the app name, slug, scheme, bundle identifier, and Android package in `app.config.ts` without embedding secrets;
- remove demo code only after the generated app has been launched successfully.

**Verification:**

```bash
npx expo-doctor
npx expo start
```

Open the generated app on both the iOS Simulator and Android Emulator. Capture screenshots or device logs, record the device names and OS versions, and confirm there are no red-screen exceptions.

**Acceptance:** scaffold renders on both platforms; `npx expo-doctor` passes; no uncommitted changes.

### Phase 2 — OXC quality baseline and strict TypeScript

**Official sources:** Oxlint, type-aware Oxlint, Oxfmt quickstart/configuration, Expo TypeScript conventions.

Run the exact npm commands from the current official pages. At verification time:

```bash
npm add -D oxlint oxlint-tsgolint oxfmt
```

Commit installation output only. If the Expo scaffold contains ESLint or Prettier dependencies, remove them in a separate package-manager command and commit that package change separately.

Then manually add:

- root `.oxlintrc.json` with React, import, promise-safety, correctness, and type-aware rules;
- root `.oxfmtrc.json` generated with `npx oxfmt --init`, with that generated file committed before manual policy edits;
- `.vscode/extensions.json` recommending `oxc.oxc-vscode`;
- `.vscode/settings.json` enabling OXC formatting and fixes on save;
- strict `tsconfig.json` settings compatible with the Expo-generated base config;
- scripts:
  - `fmt`: `oxfmt`
  - `fmt:check`: `oxfmt --check`
  - `lint`: `oxlint --type-aware`
  - `lint:fix`: `oxlint --type-aware --fix`
  - `typecheck`: `tsc --noEmit`
  - `quality`: format check, lint, typecheck, tests, and Expo Doctor without mutation.

Do not enable experimental OXC features unless the current official page marks them stable. Keep `tsc --noEmit` even if `typeCheck` is available in Oxlint.

**Verification:** `npm run fmt`, then `npm run fmt:check`, `npm run lint`, `npm run typecheck`, and `npx expo-doctor` all pass.

### Phase 3 — Environment validation and generic app shell

**Official sources:** Expo environment variables, Zod, Expo Router.

Install Zod from its official instructions and commit lockfile/package changes separately. Then implement:

- `.env.example` from section 7 without real values;
- `src/config/env.ts` with one Zod schema;
- static `process.env.EXPO_PUBLIC_NAME` property accesses, never bracket access or environment destructuring, because Expo's official inlining only supports dot notation;
- a configuration error screen in development;
- production behavior that reports a sanitized configuration failure to Sentry once Sentry exists and otherwise shows a generic unavailable screen;
- a root error boundary and loading state;
- public and authenticated route groups with temporary placeholder screens.

Do not expose private CLI or server variables through `env.ts`.

**Verification:** start with a deliberately missing public variable and confirm a clear local error without showing secret values; restore it; launch on both platforms.

### Phase 4 — EAS project, development client, and build profiles

**Official sources:** development builds, EAS Build, `eas.json`, EAS environment variables, simulator build instructions.

Follow the current official EAS CLI installation/invocation form. Prefer a versioned `npx eas-cli@latest` invocation for reproducible agent execution when the official page permits it.

Execute and separately commit every mutating command, expected to include:

```bash
npx expo install expo-dev-client
npx eas-cli@latest init
npx eas-cli@latest build:configure
```

Do not edit generated files between these commands and their commits.

In a separate manual commit, configure these build profiles:

- `development`: development client, internal distribution;
- `development-simulator`: development client, internal distribution, `ios.simulator: true`;
- `preview`: internal distribution, preview environment and preview channel;
- `production`: store distribution, production environment, production channel, auto-incremented remote build versions.

Use `cli.appVersionSource: "remote"` and production `autoIncrement: true` if still recommended by Expo's app-version page.

Synchronize EAS environments according to official instructions. File variables must be used for Google service files. Private variables must use sensitive/secret visibility as appropriate. Public Supabase and Sentry client values may be plain because they are bundled anyway.

**Verification:**

- local `npx expo run:ios` and `npx expo run:android`, or official EAS development builds when local native compilation is unavailable;
- install and launch development clients on both simulators;
- record build IDs/URLs without putting signed artifact URLs in source;
- run the placeholder app on both platforms.

### Phase 5 — Supabase local project and migration discipline

**Official sources:** Supabase CLI getting started, local workflow, migrations, seed data, API keys.

Install the Supabase CLI as a development dependency using its official npm instructions:

```bash
npm install supabase --save-dev
```

Commit installation only. Then run and commit the output of:

```bash
npx supabase init
```

Link the remote project using the official CLI command and environment-supplied project reference. Never put the database password in shell history or a commit message. Record a redacted command in the implementation log.

All database changes from this point forward MUST originate in migrations. Do not create schema objects manually in the remote Dashboard.

Create migration files with one CLI commit followed by one SQL implementation commit:

```bash
npx supabase migration new initial_map_starter_schema
```

The migration must:

1. Enable PostGIS using the exact schema placement recommended by the current Supabase PostGIS guide.
2. Create `profiles`, keyed to `auth.users` with `on delete cascade`.
3. Create generic `map_items` capable of point and polygon geometry using PostGIS types and SRID 4326.
4. Constrain geometry to the supported types and valid SRID.
5. Create an appropriate GiST spatial index.
6. Create `map_updates`, representing collaborative text updates associated with a map item.
7. Create `content_reports` for authenticated reports.
8. Create `user_blocks`, unique by blocker/blocked pair.
9. Add a moderation status to user-generated content with a safe default such as `visible`; clients must not be able to grant themselves moderator status.
10. Create a profile-on-signup trigger using the official Supabase pattern.
11. Enable RLS on every application table.
12. Grant only the minimum table privileges required by the policies.
13. Add authenticated read policies for visible shared map content.
14. Add owner/author insert, update, and delete policies using `(select auth.uid())` patterns recommended by Supabase.
15. Ensure blocked-user content is omitted by a tested query path or security-invoker view. Do not create a security-definer view that bypasses RLS accidentally.
16. Permit users to create reports but not enumerate all reports.
17. Permit users to manage only block rows where they are the blocker.
18. Add map tables to the `supabase_realtime` publication using the official SQL form.
19. Cascade or explicitly clean all user-owned data during account deletion.

Seed data must contain only synthetic records and must be inserted only through `supabase/seed.sql`. Schema DDL does not belong in seed files.

**Verification:**

```bash
npx supabase start
npx supabase db reset
npx supabase db lint
npx supabase migration list
```

Inspect the local database and confirm PostGIS, constraints, indexes, publication membership, grants, and RLS.

### Phase 6 — Database and RLS tests, then generated types

**Official sources:** Supabase database testing, pgTAP, CLI type generation.

Create test files with the current official CLI form, committing generated empty test files before writing tests.

Tests must prove at minimum:

- unauthenticated users cannot read or mutate protected data;
- authenticated users can read visible shared items;
- authenticated users cannot insert rows for another user;
- owners can update/delete their own map items;
- non-owners cannot update/delete them;
- authors can manage their own updates only;
- reports cannot be enumerated by ordinary users;
- blocking is private to the blocker;
- blocked content is omitted from the application query path;
- hidden/rejected content is not returned to ordinary users;
- geometry type/SRID constraints reject invalid input;
- user deletion cascades application data as designed.

Run the official database test command and require all tests to pass.

Then generate TypeScript database types with the official CLI command. Redirecting output into `src/types/database.generated.ts` is permitted only if the current official type-generation page shows that pattern. Commit the generated file alone with the exact command in the commit body.

Add `db:types` and `db:types:check` scripts. `db:types:check` regenerates into a temporary path and fails on drift without overwriting the committed file.

### Phase 7 — Supabase client and TanStack Query foundation

**Official sources:** Supabase Expo quickstart, social-auth tutorial, SecureStore, TanStack installation and React Native integration.

Use the exact current Expo/Supabase install command. Install only the storage/polyfill packages the current official Expo social-auth guide requires. If the generic Expo Supabase quickstart and social-auth tutorial prescribe different session storage adapters, prefer the social-auth tutorial because this starter includes native social authentication, and record the choice in an ADR.

Requirements:

- one typed Supabase client;
- session persistence using the official mobile adapter;
- `persistSession`, `autoRefreshToken`, and session URL detection configured exactly as the current React Native guide specifies;
- foreground/background token refresh registered once and cleaned up correctly;
- no secret key in the client;
- client configuration parsed by Zod;
- network errors normalized into typed application errors without leaking tokens.

Install TanStack Query from its official page and the official Expo network package used by TanStack's React Native guide. Implement:

- one `QueryClient` instance;
- application root provider;
- `onlineManager` wired to the official Expo network API;
- `focusManager` wired to React Native `AppState`;
- centralized Query key factories;
- conservative retry rules: do not retry authorization/validation errors; limit transient retries;
- query/mutation modules independent of screen components.

**Verification:** unit-test Query initialization and session-refresh lifecycle; launch both simulators; confirm no duplicate auth listeners or refresh loops.

### Phase 8 — Forms and complete authentication

**Official sources:** Supabase social-auth tutorial, React Native auth quickstart, password auth, Google auth, Apple auth, deep linking, Expo Apple Authentication, React Hook Form, resolvers, Zod.

Install React Hook Form and the official resolvers package together with Zod 4 according to their current official pages. If Zod/resolver type compatibility fails, stop and report it; do not pin guessed versions or cast to `any`.

Implement these screens and states:

- sign in with email/password;
- sign up with email/password;
- email-confirmation pending and resend action;
- forgot password;
- deep-linked password-reset form;
- Google sign in;
- Apple sign in on supported Apple platforms;
- loading/restoring session;
- authenticated home/map area;
- sign out;
- understandable offline, cancelled-provider, invalid-credential, and rate-limit errors.

Rules:

- Use React Hook Form for all credential forms.
- Validate with shared Zod schemas.
- Never log passwords, provider tokens, authorization codes, email links, access tokens, or refresh tokens.
- Use Supabase's official protected-navigation pattern for Expo Router.
- The Apple button must use Apple's official component and styling rules.
- Capture the Apple full name on the first native authorization result and persist it using the current Supabase Apple-auth guidance; Apple will not return it later.
- Google and Apple cancellation are normal user outcomes, not Sentry errors.
- The app must prevent duplicate submissions.
- Acceptable-use/terms acknowledgement is required during sign-up because the starter enables user-generated shared content.

**Verification on both platforms:**

1. Cold launch signed out.
2. Email sign-up.
3. Email confirmation deep link.
4. Sign out and email sign-in.
5. Wrong-password error.
6. Forgot-password link and password reset.
7. Session survives force-close/relaunch.
8. Sign out clears protected UI.
9. Google flow reaches Supabase and creates/restores a session.
10. Apple flow reaches Supabase and creates/restores a session on iOS.

Use unique test users and clean them only through the application deletion path once that path exists.

After this major phase, relaunch both native apps from a cold state and run the quality suite.

### Phase 9 — App-review baseline and account deletion

**Official sources:** Apple App Review Guidelines sections 1.2 and 5.1.1, Apple account deletion page, TN3194, Apple REST token validation/revocation, Supabase Edge Functions, secure functions, secrets, and admin delete-user reference.

#### 9.1 Settings and legal UI

Create an authenticated Settings screen containing:

- profile summary;
- privacy policy link;
- terms/acceptable-use link;
- support link and support email;
- blocked-user management;
- sign out;
- app version/build/update identifiers;
- a clearly visible `Delete account` action.

Account deletion cannot be merely a web link, email request, deactivation, or delayed support ticket. It must be initiated and completed in the app except where Apple explicitly permits regulated exceptions, which do not apply to this generic starter.

#### 9.2 Edge Function generation

Generate the function using the official Supabase CLI form, expected to be:

```bash
npx supabase functions new delete-account
```

Commit generated output before manual code.

#### 9.3 Deletion security contract

The function MUST:

1. Accept POST only.
2. Validate the caller's Supabase access token using the current official Edge Function authentication pattern.
3. Derive the user ID from the validated token, never from a request body.
4. Use a server-only Supabase secret/service-role credential for `auth.admin.deleteUser`.
5. Determine whether the user has an Apple identity.
6. If Apple is linked, require a fresh Apple authorization code obtained through an in-app Apple reauthentication immediately before deletion.
7. Generate the Apple client secret and exchange the authorization code only according to Apple's currently readable official REST documentation.
8. Revoke the resulting Apple access or refresh token before deleting the Supabase user.
9. If Apple exchange or revocation fails, do not delete the Supabase user. Return a generic retryable error and report a sanitized operational error to Sentry.
10. Delete the Supabase Auth user only after required provider revocation succeeds.
11. Rely on tested foreign-key cascades for application data; verify deletion afterward.
12. Be idempotent where possible and return success if the authenticated user's deletion completed even if the client loses the response.
13. Never log request authorization, Apple codes/tokens, generated client secrets, private keys, or raw provider responses.

The baseline should obtain a fresh Apple code at deletion time instead of storing Apple refresh tokens per user. This minimizes long-lived provider-secret storage. If current Apple documentation does not permit that flow, stop and request an architectural decision; do not invent a token-storage design.

Sync `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_CLIENT_ID`, and the private key to Supabase Function secrets using the official CLI. Do not include values in logs.

#### 9.4 Client deletion UX

- Show a destructive confirmation explaining that deletion is permanent and shared content may disappear.
- Require explicit confirmation, not a single accidental tap.
- If Apple identity is linked, request fresh Apple authorization and send only the short-lived authorization code to the function.
- Invoke the function with the current Supabase session.
- On success, clear Query cache, analytics identity, SecureStore/session state, and route to the public entry screen.
- On failure, keep the account/session intact and offer retry/support.

#### 9.5 Verification

Test separate email, Google, and Apple-created users. Confirm each is removed from `auth.users`, profile/application rows are removed, local tokens are cleared, and the user cannot access protected routes. For Apple, verify the revocation path reached Apple's successful response before deletion.

### Phase 10 — Collaborative map, PostGIS, and Realtime

**Official sources:** Expo `react-native-maps`, maintainer README, Expo Location, Supabase PostGIS, Supabase Realtime, TanStack Query React Native.

Install native packages with Expo:

```bash
npx expo install react-native-maps expo-location
```

Commit installation only. Configure the Android Maps API key through `app.config.ts` exactly as the Expo map page specifies. Never request background location.

Implement a map screen that:

- renders a stable default region without location permission;
- reads visible point and polygon records through typed Query functions;
- renders `Marker` and `Polygon` children using the API shown by the official `react-native-maps` repository;
- opens a generic detail sheet for a selected item;
- displays associated updates;
- allows authenticated users to create a point at a selected coordinate;
- allows authenticated users to create a simple polygon with at least three vertices;
- validates coordinates, longitude/latitude bounds, polygon cardinality, title length, and description length with Zod;
- never stores current-device location unless the user explicitly saves a feature;
- asks for foreground location only when `Use my location` is tapped;
- handles denial and restricted permission without losing map functionality;
- uses PostGIS-backed server queries appropriate for viewport/bounding-box loading rather than downloading an unlimited world table.

After non-clustered points and polygons work, install `supercluster` and its TypeScript definitions using the exact official maintainer commands. Commit package changes separately. Add clustering as a pure selector over fetched point GeoJSON. Polygons are not clustered.

Realtime implementation:

- subscribe only while the authenticated map area is mounted;
- subscribe to the map item/update tables enabled in the publication;
- on INSERT/UPDATE/DELETE, invalidate the narrowest relevant TanStack Query key;
- do not mutate a second custom cache;
- unsubscribe on unmount, sign-out, and account deletion;
- debounce/coalesce bursts of invalidations;
- report unexpected channel errors without sending row contents to Sentry.

**Verification with two sessions:** create/update/delete a point, polygon, and text update in session A and observe session B refresh without manual reload. Test denied location permission. Pan across a viewport and verify bounded queries. Test enough seeded points to trigger clustering. Cold-launch both simulators afterward.

### Phase 11 — User-generated-content safeguards

**Official source:** Apple App Review Guidelines section 1.2.

Because shared map items and updates are user-generated content, implement:

- a visible `Report` action on every user-generated item/update;
- report reasons and optional bounded explanation validated by Zod;
- a `Block user` action that hides the blocked user's content from the blocker;
- blocked-user management in Settings;
- content status handling so removed content disappears promptly;
- a support/contact path;
- acceptable-use acknowledgement during account creation;
- an operations runbook explaining how an authorized human reviews reports and marks content hidden/rejected without granting moderator rights to ordinary clients.

Do not ship a fake automated moderation claim. This starter provides reporting/blocking and operational hooks; each product owner remains responsible for timely human moderation.

Test cross-user report visibility and blocking with two users. Ordinary users must not see reporter identities or all reports.

### Phase 12 — Sentry

**Official sources:** Expo Sentry guide and Sentry's Expo/source-map pages.

Run the official wizard exactly as documented:

```bash
npx @sentry/wizard@latest -i reactNative
```

The wizard is allowed to modify several files. Commit its untouched output immediately with the exact command. Then make a separate manual hardening commit:

- initialize Sentry before application rendering;
- keep DSN public but auth token private;
- attach Expo update ID, embedded-update state, channel, app version, and build version using the official Expo example;
- set only the opaque Supabase user ID after authentication; clear it on sign-out/deletion;
- redact request authorization, passwords, email links, tokens, authorization codes, precise coordinates, descriptions, form values, and environment values in `beforeSend`/breadcrumb processing;
- do not treat expected auth cancellation, validation failures, or offline state as errors;
- add an application error boundary with a generic fallback;
- add a development-only diagnostics action that throws a known error, guarded from production UI.

Set `SENTRY_AUTH_TOKEN` in every required EAS build/update environment with sensitive visibility.

Verification requires a release-like build, not only development mode:

1. Trigger a known JS error.
2. Confirm it appears in the correct Sentry project.
3. Confirm the stack trace resolves to the original TypeScript source and line.
4. Confirm sensitive test fields and exact coordinates are absent.
5. Repeat after an EAS Update and upload the update source maps using the exact current Expo command, presently `npx sentry-expo-upload-sourcemaps dist` after `eas update`.

Remove or permanently guard the diagnostic trigger after verification.

### Phase 13 — EAS Update

**Official sources:** EAS Update setup, EAS Build channels, runtime versions, deployment, Sentry source maps.

Run and commit the untouched output of:

```bash
npx eas-cli@latest update:configure
```

Then manually verify:

- preview builds use the `preview` channel;
- production builds use the `production` channel;
- EAS environments align with the build/update environment;
- `runtimeVersion` uses `{ "policy": "appVersion" }` while that remains Expo's official recommendation;
- any native dependency or native configuration change requires a new binary before publishing an update;
- production updates are never published as the first test target.

Do not use the `fingerprint` runtime policy while Expo documentation describes it as experimental. Revisit this decision only through an ADR after Expo recommends it broadly.

Create scripts or EAS workflows that publish preview and production updates one platform at a time as required for reliable source-map upload. The production workflow must require an explicit protected/manual approval.

**OTA verification:**

1. Install a preview native build on each simulator.
2. Record embedded update ID/runtime/channel.
3. Make a harmless JS-only visible change.
4. Publish it to preview using the official command and selected EAS environment.
5. Upload Sentry source maps.
6. Cold-restart each installed app according to Expo's update behavior.
7. Confirm both receive the preview update and record the new update ID.
8. Confirm a production-channel build does not receive the preview update.
9. Restore generic copy if the test change should not remain.

### Phase 14 — Optional PostHog analytics

**Official sources:** Expo PostHog guide and PostHog React Native documentation.

This phase is enabled only when both `EXPO_PUBLIC_POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` are nonempty. Otherwise, commit a no-op typed analytics interface and skip SDK installation.

If enabled, install using the exact official Expo command. At verification time the PostHog page shows:

```bash
npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

Do not enable PostHog error tracking because Sentry already owns it. Do not enable session replay or touch autocapture in the generic starter.

Create a small typed analytics interface. Allowed baseline events are coarse lifecycle outcomes such as sign-in method success, account-deletion success, map screen viewed, map item created by kind, and report submitted. Forbidden properties include email, name, tokens, authorization codes, free text, coordinates, map bounds, IP-like identifiers added by application code, passwords, and provider payloads.

Identify with opaque Supabase user ID only after sign-in. Reset on sign-out and deletion. Disable development event transmission by default.

Verify one synthetic event in the selected PostHog region and then remove the temporary trigger.

### Phase 15 — Jest and React Native Testing Library

**Official sources:** Expo Jest page, React Native testing overview, React Native Testing Library quickstart.

Install the exact dependency set and compatible versions from Expo's current page using `npx expo install` where instructed. Do not guess `react-test-renderer` versions; they must match the React version selected by Expo.

Configure `jest-expo`, React Native Testing Library, and deterministic mocks for native modules according to their official docs.

Required tests include:

- environment-schema success/failure;
- auth form validation and disabled duplicate submission;
- auth state/protected-routing decisions;
- sign-out cleanup;
- deletion confirmation and failure-preserves-session behavior;
- Query key factories and error normalization;
- Realtime invalidation and unsubscribe behavior;
- coordinate and polygon schemas;
- map loading/empty/error states with the native map mocked only at the platform boundary;
- report and block flows;
- analytics redaction/no-op behavior;
- Sentry redaction helpers.

Avoid snapshot-heavy tests. Prefer accessible roles, labels, visible text, and behavior. Every interactive element used by Maestro must have a stable accessibility label or test ID.

### Phase 16 — Maestro end-to-end tests

**Official sources:** Maestro installation and Expo EAS Maestro workflow.

Install the Maestro CLI only through its official instructions. Because it is a machine tool rather than a repository dependency, record the exact command/version in the implementation log.

Create platform-neutral flows for:

- unauthenticated launch;
- email sign-in with a pre-seeded test user;
- map renders markers and a polygon;
- create a point and observe it in the list/map;
- submit an update;
- report content;
- block/unblock another user;
- sign out;
- account deletion with a disposable email user.

Do not automate real Apple/Google credentials in YAML. Provider flows are separate native integration checks using prepared simulator accounts.

Run flows locally on both iOS and Android. Then configure the current official EAS Workflow example so E2E tests run against built artifacts. If the service supports only one platform in the chosen plan, local verification on the other platform remains required and the limitation must be documented.

### Phase 17 — CI, dependency controls, and operations

Use official GitHub and EAS Workflow documentation only.

On every pull request and protected-branch push, CI must run from a clean checkout:

```bash
npm ci
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

Use exact current command names from official pages if they changed. Stop on first failure. Upload test artifacts/logs without secrets.

Add:

- dependency-review/update automation configured to open reviewable PRs, never auto-merge native dependency changes;
- `docs/operations.md` for local start, database reset, provider rotation, Sentry source maps, preview updates, report moderation, and account-deletion troubleshooting;
- `docs/release-checklist.md` covering App Store/Play Console metadata, privacy policy, privacy manifests, permission strings, data safety/privacy labels, provider configuration, reviewer credentials, account deletion, report/block actions, production Sentry, and OTA channels;
- an ADR template;
- a rule that every Expo SDK upgrade follows Expo's official incremental upgrade guide and receives fresh builds/tests on both platforms.

### Phase 18 — Final release-like verification

The starter is not complete until all of the following pass from a clean checkout:

1. `npm ci` and the full quality suite.
2. Local Supabase reset, migrations, pgTAP/RLS tests, and generated-type drift check.
3. Clean EAS preview builds for iOS Simulator and Android Emulator.
4. Cold launch on both platforms.
5. Email sign-up/sign-in/reset/session persistence/sign-out.
6. Google auth on Android and iOS where configured.
7. Apple auth and Apple-compliant deletion on iOS.
8. CRUD and cross-session Realtime for point, polygon, and update content.
9. Report/block/unblock behavior.
10. Denied location permission behavior.
11. Sentry symbolicated build error with redaction verified.
12. Preview OTA received by preview builds only, with Sentry OTA source maps uploaded.
13. Maestro smoke suite on both platforms.
14. Secret scan of tracked files and Git history created during this implementation.
15. `git status --short` empty.

Create a final `docs(verification): record starter acceptance results` commit. The log must list command, platform/device, result, and evidence identifier for every check. It must also list any unavoidable external/manual checks as incomplete; those prevent claiming full completion.

---

## 11. Architecture and code-quality rules

### 11.1 Dependency direction

- Route components compose features; they do not contain SQL-shaped queries or provider setup.
- Feature UI calls feature hooks.
- Feature hooks call typed query/mutation functions.
- Only `src/lib/supabase` creates or imports the raw Supabase client.
- Only the monitoring adapter imports Sentry in feature-neutral code.
- Only the analytics adapter imports PostHog.
- Generated database types are never edited manually.
- Native configuration is centralized in `app.config.ts` and `eas.json`.

### 11.2 Boundary validation

Validate with Zod at:

- environment loading;
- form submission;
- map coordinate/geometry construction;
- Edge Function request bodies;
- provider-derived optional profile fields;
- any data not already guaranteed by generated Supabase types.

Do not parse the same trusted object repeatedly in render loops.

### 11.3 Error handling

Define typed, user-safe error categories: validation, unauthenticated, forbidden, not found, conflict, rate limited, offline, provider cancelled, transient server, and unexpected. User messages must not expose SQL, provider payloads, stack traces, IDs other than safe support correlation IDs, or tokens.

Expected errors are displayed and tested. Unexpected errors are sanitized and sent to Sentry.

### 11.4 Accessibility

Every screen must support dynamic text where practical, meaningful labels, minimum touch targets, logical focus order, and non-color-only status. Map content must have a list alternative so essential shared data is not available only through visual map markers.

### 11.5 Privacy

- Do not collect background location.
- Do not upload device location automatically.
- Do not put coordinates or free-text user content into Sentry or PostHog.
- Do not enable analytics until configured.
- Do not use session replay in this generic starter.
- Keep privacy/terms/support destinations environment-specific and validated.

### 11.6 Performance

- Bound spatial queries to the viewport and impose server limits.
- Cluster points only after data is typed and fetched.
- Do not render unbounded polygon sets.
- Memoize expensive GeoJSON-to-map transformations.
- Coalesce Realtime invalidations.
- Avoid premature client-side offline persistence; it requires a separate consistency design.

---

## 12. Definition of done

The implementation is done only when:

- every phase is completed in order;
- every required official page was read and logged;
- no phase relied on remembered package setup;
- commit history clearly separates CLI generation, installation, manual implementation, generated types, and verification;
- every mutating CLI commit contains the exact command and official URL;
- both platforms were verified after each major native/architectural change;
- all auth methods work, including recovery and deletion;
- Apple token revocation succeeds before Apple-linked account deletion;
- RLS and database behavior are tested, not assumed;
- map points, polygons, viewport queries, location denial, clustering, and Realtime work;
- reporting and blocking exist for shared content;
- Sentry build and OTA source maps are symbolicated and sanitized;
- preview OTA isolation works;
- all quality/CI gates pass;
- no secrets exist in tracked files or implementation commits;
- documentation allows a new developer or coding agent to reproduce the starter.

If any required item is blocked, the final status is **PARTIALLY IMPLEMENTED**, not complete.

---

## 13. First command for the coding agent

The agent begins with read-only preflight. It must not scaffold immediately.

Its first response or log entry should be equivalent to:

```text
I will implement MOBILE_STARTER_IMPLEMENTATION_SPEC.md phase by phase. Before changing files, I will verify the clean repository, required environment-variable names, local toolchain, both simulator targets, Docker, and every official documentation page required by Phase 0. I will stop rather than infer missing instructions or credentials.
```

Only after Phase 0 passes may it execute the Expo scaffold command.
