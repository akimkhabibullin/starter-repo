# Mobile starter implementation log

Status: **PARTIALLY IMPLEMENTED — BLOCKED_PREREQUISITES**

The implementation follows `MOBILE_STARTER_IMPLEMENTATION_SPEC.md` phase by phase. No application scaffold may be created until Phase 0 passes.

## Phase 0 — Preflight and evidence log

Access time for official documentation: 2026-08-08 13:29 PDT.

### Official documentation evidence

| Official URL                                                           | Heading used                                                                                      | Selected command or configuration pattern                                                                                                                                       | Result / deviation                                                                                                      |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| https://docs.expo.dev/versions/latest/                                 | `Each Expo SDK version depends on a React Native version`; `Support for Android and iOS versions` | SDK 57 requires React Native 0.86, React 19.2.3, Node 22.13.x minimum, Android compile/target SDK 36, iOS 16.4+, and Xcode 26.4+                                                | Read successfully; no conflict with the specification.                                                                  |
| https://docs.expo.dev/more/create-expo/                                | `Create a new project`; `--template`                                                              | `npx create-expo-app@latest --template default@sdk-57`; repository-target form remains `npx create-expo-app@latest . --template default@sdk-57`                                 | Read successfully. SDK 57 is the current stable development-build baseline. Command not run because Phase 0 is blocked. |
| https://docs.expo.dev/workflow/ios-simulator/                          | `Setup Xcode and Watchman`; `Try it out`                                                          | Install Xcode/Command Line Tools and an iOS runtime; launch through `npx expo start` and press `I`                                                                              | Read successfully. Available simulator inventory exists, but no iOS simulator was booted.                               |
| https://docs.expo.dev/workflow/android-studio-emulator/                | `Install JDK`; `Set up Android Studio`                                                            | JDK 17; Android Studio with Android SDK Platform 36, Build Tools, and Android Emulator                                                                                          | Read successfully. `adb` was not installed at the standard SDK path or available on `PATH`.                             |
| https://supabase.com/docs/guides/local-development/cli/getting-started | `Installing the Supabase CLI`; `Running a local Supabase project`                                 | `npm install supabase --save-dev`, then `npx supabase init` and `npx supabase start`; Node 20+ and Docker-compatible runtime required                                           | Read successfully. No container runtime is installed or available. No commands run.                                     |
| https://docs.expo.dev/guides/environment-variables/                    | `Reading environment variables from .env files`; `How to read from environment variables`         | `EXPO_PUBLIC_` values are bundled and must use static dot notation such as `process.env.EXPO_PUBLIC_API_URL`; secrets must not use this prefix; `.env*.local` should be ignored | Read successfully. Required variable names were checked without printing values; all are absent.                        |

All pages were loaded from vendor-controlled HTTPS domains. No community source or remembered installation instruction was used.

### Read-only machine and repository evidence

| Check                | Result                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Host                 | macOS 26.5.2, arm64                                                                                                                    |
| Node.js              | `v22.17.0` — passes SDK 57 minimum                                                                                                     |
| npm                  | `10.9.2`                                                                                                                               |
| Git                  | `2.50.1`; author name and email configured                                                                                             |
| Branch               | Created required `implementation/mobile-starter` branch after preflight                                                                |
| Xcode                | 26.5 — passes SDK 57 minimum                                                                                                           |
| iOS targets          | iOS 18.5 and 26.5 simulator runtimes/devices are installed; none was booted during preflight                                           |
| Android              | `adb` unavailable on `PATH` and missing at `~/Library/Android/sdk/platform-tools/adb`                                                  |
| Java                 | Java 25.0.1 present; official Android guide specifies JDK 17, so compatibility is not accepted without the required setup              |
| Container runtime    | Docker Desktop and OrbStack Docker entry points absent; `docker` unavailable on `PATH`                                                 |
| Maestro              | unavailable on `PATH` and missing at `~/.maestro/bin/maestro`                                                                          |
| Network              | Official Expo and Supabase documentation loaded successfully                                                                           |
| Repository           | Clean before preflight; contains only the committed specification, so it is not literally empty as described by the human prerequisite |
| Environment contract | Every required name in section 7 was absent; optional PostHog names were also absent                                                   |
| Secret ignore rules  | Initially absent; `.gitignore` was added before any environment or secret value was written                                            |

No secret values were printed, written, or committed.

### Blocking prerequisites

Phase 0 cannot meet acceptance until all of the following are supplied or installed:

1. Stable app identity and legal/support values: app name, slug/owner, scheme, bundle/package identifiers, Apple Team ID, support email, and HTTPS privacy, terms, and support URLs.
2. Expo/EAS, Supabase, Sentry, Google, and Apple project configuration named in sections 6 and 7, provided through an ignored `.env.local` and ignored provider files where applicable.
3. A booted iOS Simulator and a bootable Android Emulator visible through `adb devices`.
4. Android SDK Platform 36/tooling and the officially documented JDK setup.
5. A running Docker-compatible container runtime with sufficient resources for local Supabase.
6. Maestro CLI installed through its official instructions, or explicit permission to install it during Phase 16.
7. Test identities and interactive provider-account state needed for behavioral auth/RLS/deletion verification.

Result: `BLOCKED_PREREQUISITES`. Per sections 6, 10 Phase 0, 12, and 13 of the specification, Phase 1 scaffolding and later phases were not started and the starter must not be represented as complete.

## Prerequisite setup guide evidence

Accessed 2026-08-08 13:36 PDT before writing `docs/prerequisite-setup-guide.md`:

| Official URL                                                                         | Heading/pattern used                                              | Purpose                                                                                    |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| https://docs.expo.dev/eas/environment-variables/                                     | `Available environments`; `Variable types`; `Visibility settings` | Development/preview/production separation and public/sensitive/secret/file classification. |
| https://docs.expo.dev/eas/environment-variables/manage/                              | `Create environment variables`; `Secrets and file variables`      | EAS dashboard/CLI placement and Google service file handling.                              |
| https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native       | `Get API details`                                                 | Project URL and publishable key from the Connect dialog.                                   |
| https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth | Current Expo social-auth configuration                            | Native provider prerequisites and app configuration.                                       |
| https://supabase.com/docs/guides/auth/social-login/auth-google                       | Google provider configuration                                     | Web/iOS/Android client-ID ordering and server-side client secret.                          |
| https://supabase.com/docs/guides/auth/social-login/auth-apple                        | `Secret Key Rotation Required`; Services ID/signing key setup     | Apple App ID, Services ID, `.p8`, provider configuration, and rotation.                    |
| https://developer.apple.com/help/account/membership/program-enrollment/              | `Enrollment`; `Contract developers`                               | Correct account ownership and organization enrollment.                                     |
| https://developers.google.com/identity/protocols/oauth2/native-app                   | `Create authorization credentials`                                | Platform-specific OAuth client creation.                                                   |
| https://developers.google.com/maps/documentation/android-sdk/get-api-key             | Maps SDK Android setup checklist                                  | Cloud project, billing/API enablement, and Android map key.                                |
| https://developers.google.com/maps/api-security-best-practices                       | `Restrict your API keys`                                          | Application and API restrictions.                                                          |
| https://docs.expo.dev/guides/using-sentry/                                           | `Usage with EAS Build`; `Usage with EAS Update`                   | Public DSN versus sensitive source-map auth token.                                         |

No account was created and no external dashboard or secret was modified. The guide contains placeholders only.

### Phase 0 prerequisite recheck — 2026-08-08 14:47 PDT

The user indicated prerequisite setup was complete, so the gate was rerun without printing values.

| Check                     | Result                                                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch/worktree           | `implementation/mobile-starter`; clean before logging this result.                                                                                                        |
| Node/npm/Xcode            | Node 22.17.0, npm 10.9.2, Xcode 26.5 — pass SDK 57 minimums.                                                                                                              |
| Environment names/formats | Failed: app name, scheme, bundle/package identifiers, legal/support URLs, Expo project/token, and Apple server values remain missing or contain setup-guide placeholders. |
| Provider files            | Referenced Google service files are absent; whether each is required will be confirmed at the native social-auth documentation gate.                                      |
| iOS Simulator             | Installed devices exist, but none is booted.                                                                                                                              |
| Android                   | `adb` remains unavailable; no emulator can be verified.                                                                                                                   |
| Container runtime         | Docker-compatible CLI/runtime remains unavailable.                                                                                                                        |
| Maestro                   | CLI remains unavailable.                                                                                                                                                  |
| Java                      | Java 25.0.1 is active; the current Expo Android setup page specifies JDK 17.                                                                                              |
| Secret handling           | `.env.local` and provider-secret paths are ignored; no values were printed or committed.                                                                                  |

Result remains `BLOCKED_PREREQUISITES`. Phase 1 was not started.

### Explicit scope amendment — 2026-08-08

The user directed the implementation to continue while skipping Apple setup, the custom app scheme, iOS bundle identifier, Android package identifier, and privacy/terms/support configuration. ADR 0001 records the deviation and its consequences.

Status changed from `BLOCKED_PREREQUISITES` to `PARTIALLY_IMPLEMENTED_SCOPE_AMENDMENT`. This permits development scaffolding to proceed but does not make the original Phase 0 acceptance pass. Apple auth/revocation, deep-link verification, stable native builds, store/legal compliance, and final release-like acceptance remain incomplete until the decision is reversed.

## Phase 1 — Official Expo scaffold

Documentation gate accessed 2026-08-08 14:54 PDT:

| Official URL                            | Heading used                                                                                      | Selected command/pattern                                           | Result                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| https://docs.expo.dev/more/create-expo/ | `Create a new project`; `--template`; `npm`                                                       | `npx create-expo-app@latest . --template default@sdk-57`           | SDK 57 remains the documented non-Expo-Go development baseline; command pending. |
| https://docs.expo.dev/versions/latest/  | `Each Expo SDK version depends on a React Native version`; `Support for Android and iOS versions` | Expo SDK 57, React Native 0.86, React 19.2.3, Node 22.13.x minimum | Current Node 22.17.0 passes; SDK baseline unchanged.                             |

The repository is no longer empty because the specification, Phase 0 evidence, prerequisite guide, and ADR are tracked. The official target-directory command will be attempted without deleting or overwriting those user/project records. Any scaffold conflict will be recorded before choosing a recoverable integration path.

### Phase 1 execution and verification

| Command/check                                            | Result                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx create-expo-app@latest . --template default@sdk-57` | First attempt exited without mutation because `.env.local`, `.vscode`, `AGENTS.md`, and the specification conflicted. Those paths were moved to an explicit temporary directory, the exact command was rerun, and the ignored environment plus specification were restored. Expo's generated agent/editor files were committed untouched before manual merging. |
| `npm install` invoked by create-expo-app                 | Installed 594 packages. npm reported 22 audit findings (8 moderate, 14 high). No automatic or forced audit rewrite was run because the specification forbids forced version changes.                                                                                                                                                                            |
| `npx expo-doctor`                                        | PASS, 20/20 checks.                                                                                                                                                                                                                                                                                                                                             |
| `npx expo config --type public`                          | PASS; dynamic `app.config.ts` resolves.                                                                                                                                                                                                                                                                                                                         |
| Secret ignore and tracked-pattern checks                 | PASS after the manual hardening commit restored `.env`, `secrets/`, provider-file, coverage, and log ignores. No credential-like tracked value detected by the baseline pattern scan.                                                                                                                                                                           |
| `npx tsc --noEmit`                                       | FAIL on the untouched scaffold's CSS module and side-effect CSS imports. Phase 2 must add the official TypeScript/OXC baseline before type checking can be accepted.                                                                                                                                                                                            |
| iOS launch                                               | INCOMPLETE: installed simulators exist but none was booted at the Phase 1 checkpoint.                                                                                                                                                                                                                                                                           |
| Android launch                                           | INCOMPLETE: `adb` and an emulator remain unavailable.                                                                                                                                                                                                                                                                                                           |

Commits: `ff154bb` contains only official CLI output; `0132776` contains manual safety/configuration changes. Native identity and scheme are omitted under ADR 0001. Phase 1 is implemented but its two-platform acceptance remains incomplete.

## Phase 2 — OXC quality baseline and strict TypeScript

Documentation gate accessed 2026-08-08 14:59 PDT:

| Official URL                                              | Heading used                                                                        | Selected command/pattern                                                                                                                                                                                                                                                   |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://oxc.rs/docs/guide/usage/linter                    | `Getting started`                                                                   | Install Oxlint as a development dependency and use `oxlint` / `oxlint --fix` scripts.                                                                                                                                                                                      |
| https://oxc.rs/docs/guide/usage/linter/type-aware.html    | `Installation`; `Running type-aware linting`; `TypeScript compatibility`            | `npm add -D oxlint-tsgolint@latest`; run `oxlint --type-aware`; keep separate `tsc --noEmit` per the specification. The page notes TypeScript 7 semantics while the Expo SDK 57 scaffold currently resolves TypeScript 6.0.3; compatibility must be verified, not assumed. |
| https://oxc.rs/docs/guide/usage/formatter/quickstart.html | `Install`; `Create a config file`                                                   | `npm add -D oxfmt`; scripts `oxfmt` and `oxfmt --check`; generate defaults with `oxfmt --init`.                                                                                                                                                                            |
| https://oxc.rs/docs/guide/usage/formatter/config.html     | `Create a config file`; `Configuration file format`                                 | Commit root `.oxfmtrc.json`; use stable JSON fields and ignore patterns only.                                                                                                                                                                                              |
| https://docs.expo.dev/guides/typescript/                  | `Add base configuration with tsconfig.json`; `Type checking project files with tsc` | Extend `expo/tsconfig.base`, enable `strict`, and retain independent TypeScript checking.                                                                                                                                                                                  |

Selected install command: `npm add -D oxlint oxlint-tsgolint@latest oxfmt`. No experimental OXC feature is enabled.

### Phase 2 verification

`npm run fmt`, `npm run fmt:check`, `npm run lint`, `npm run typecheck`, and `npx expo-doctor` all pass. Expo Doctor reports 20/20 checks. Type-aware linting runs successfully with the Expo-resolved TypeScript 6 project, while tsgolint supplies its documented TypeScript 7 semantic engine. No OXC type-check experiment is enabled; `tsc --noEmit` remains independent.

## Phase 3 — Environment validation and generic app shell

Documentation gate accessed 2026-08-08:

| Official URL                                        | Heading used                                                        | Selected command/pattern                                                              |
| --------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| https://docs.expo.dev/guides/environment-variables/ | `How to read from environment variables`; `Security considerations` | Use static dot notation for every `EXPO_PUBLIC_` read; never bundle secrets.          |
| https://zod.dev/                                    | `Installation`; `Requirements`                                      | `npm install zod`; Zod 4 stable with strict TypeScript.                               |
| https://docs.expo.dev/router/introduction/          | `Quick start`; `Key features`                                       | Keep file-based routes under `src/app` and compose public/authenticated route groups. |

ADR 0001 makes native identity, scheme, Apple, and legal/support variables optional/deferred. Required Supabase, Google, Sentry, environment-name, and generic app-name values remain validated. Selected install command: `npm install zod`.

### Phase 3 verification

| Check                                 | Result                                                                                                                                                                                                                                                                                       |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Missing/deferred environment behavior | Development schema treats ADR 0001 fields as optional and rejects missing release fields when `EXPO_PUBLIC_APP_ENV=production`. Invalid required service values produce a generic configuration screen; development displays field names only. No environment values are included in errors. |
| Static Expo variable access           | All client variables are read with explicit `process.env.EXPO_PUBLIC_NAME` dot notation in `src/config/env.ts`. No private CLI/server variables are imported.                                                                                                                                |
| Quality suite                         | `npm run fmt`, `npm run fmt:check`, `npm run lint`, `npm run typecheck`, and `npx expo-doctor` pass; Expo Doctor 20/20.                                                                                                                                                                      |
| Generated scaffold launch             | iPhone 17 Pro, iOS 26.5, Expo Go 57.0.6: PASS before demo removal. Bundle completed in 5766 ms with no red-screen exception. Expo warned that a production scheme is required, as expected under ADR 0001.                                                                                   |
| Generic shell launch                  | iPhone 17 Pro, iOS 26.5: PASS. Public route rendered app name, starter status, and accessible home action. Evidence SHA-256: `a82ca36eb74c21c029a33a86a3018f622e8d123d0b8e7bae09509570db8b0497`.                                                                                             |
| Android launch                        | INCOMPLETE: Android Platform Tools/emulator remain unavailable.                                                                                                                                                                                                                              |

Phase 3 implementation is committed. Two-platform acceptance remains incomplete.

## Phase 4 — Development client and EAS build configuration

Documentation gate accessed 2026-08-08:

| Official URL                                                   | Heading used                                        | Selected command/pattern                                                                                            |
| -------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| https://docs.expo.dev/develop/development-builds/introduction/ | `Add a development client`; `Start the bundler`     | Install with `npx expo install expo-dev-client`; local native runs use `npx expo run:ios` / `npx expo run:android`. |
| https://docs.expo.dev/build/introduction/                      | `Get started`; EAS Build overview                   | EAS Build requires Expo account/project setup and platform build configuration.                                     |
| https://docs.expo.dev/build/eas-json/                          | `Configure EAS Build with eas.json`; build profiles | Generate configuration with `eas build:configure`; development profiles use `developmentClient: true`.              |
| https://docs.expo.dev/eas/environment-variables/               | EAS environment-variable environments               | Keep development, preview, and production values separated in EAS.                                                  |
| https://docs.expo.dev/build-reference/simulators/              | iOS Simulator builds                                | Simulator profiles require `ios.simulator: true` and valid iOS project configuration.                               |

Selected install command: `npx expo install expo-dev-client`.

EAS project initialization, generated `eas.json`, and native development builds are deferred under ADR 0001: the user explicitly omitted the custom scheme, iOS bundle identifier, and Android package identifier, and the local Expo project/token inputs remain placeholders. No hand-written EAS configuration will be substituted for the specification's required CLI-generated output.

### Phase 4 verification

`npx expo install expo-dev-client` installed the SDK 57-compatible module. Formatting, type-aware lint, strict TypeScript, and Expo Doctor pass; Expo Doctor reports 20/20 checks. The first sandboxed Expo Doctor attempt could not resolve the npm registry, so it was repeated with approved network access and passed. EAS initialization and native development-build acceptance remain deferred under ADR 0001.

## Phase 5 — Supabase local project and migration discipline

Documentation gate accessed 2026-08-08:

| Official URL                                                             | Heading used                                 | Selected command/pattern                                                                                                                 |
| ------------------------------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| https://supabase.com/docs/guides/local-development/cli/getting-started   | `Installing the Supabase CLI`; local project | `npm install supabase --save-dev`, then project-scoped commands through `npx supabase`; Node 20+ and Docker-compatible runtime required. |
| https://supabase.com/docs/guides/local-development/cli-workflows         | `The ./supabase directory`; new-project flow | Commit `config.toml`, migrations, and `seed.sql`; keep generated temporary state ignored; start from `supabase init`.                    |
| https://supabase.com/docs/guides/local-development/database-migrations   | Create/apply migrations                      | `npx supabase migration new initial_map_starter_schema`; write schema only in the generated migration.                                   |
| https://supabase.com/docs/guides/local-development/seeding-your-database | `Using seed files`; `Generating seed data`   | Keep synthetic data in the default `supabase/seed.sql`; do not place schema DDL there.                                                   |
| https://supabase.com/docs/guides/getting-started/api-keys                | Publishable and secret API-key guidance      | Client uses only a publishable key; secret/service-role credentials remain server-only.                                                  |
| https://supabase.com/docs/guides/database/extensions/postgis             | PostGIS setup and schema troubleshooting     | Enable with `create extension postgis schema extensions`; store SRID 4326 geometries and add a GiST index.                               |
| https://supabase.com/docs/guides/database/postgres/row-level-security    | Policies, views, and performance             | Target `authenticated`, wrap `auth.uid()` in `select`, index policy columns, and use `security_invoker = true` views.                    |
| https://supabase.com/docs/guides/realtime/postgres-changes               | Enable Postgres replication                  | Add collaborative tables with `alter publication supabase_realtime add table ...`.                                                       |

Selected install command: `npm install supabase --save-dev`. The remote-link command is deferred until the project reference contains a real non-placeholder value; no password or token will be placed in shell history. Local stack verification remains dependent on a Docker-compatible runtime, which was absent at preflight.

### Phase 5 verification

| Command/check                                           | Result                                                                                                                                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx supabase --version`                                | PASS with CLI 2.113.0. The sandboxed first attempt could not write the CLI telemetry cache; the approved retry passed.                                                                                                 |
| `npx supabase init`                                     | PASS; generated `supabase/config.toml` and the local Supabase ignore file, committed without manual edits.                                                                                                             |
| `npx supabase migration new initial_map_starter_schema` | PASS; generated an empty timestamped migration, committed before SQL implementation.                                                                                                                                   |
| Static migration audit                                  | PASS against all 19 Phase 5 requirements: PostGIS, geometry constraints/index, application tables, cascade cleanup, triggers, RLS, minimum grants, block filtering, reports, and Realtime publication are represented. |
| Seed audit                                              | PASS; `supabase/seed.sql` contains synthetic DML only: two placeholder identities, 30 points, one polygon, and two updates. No production or personal data is present.                                                 |
| `npx supabase start`                                    | BLOCKED: neither Docker nor Podman is installed/on `PATH`.                                                                                                                                                             |
| `npx supabase db reset`                                 | BLOCKED: the CLI cannot inspect a running local database service.                                                                                                                                                      |
| `npx supabase db lint`                                  | BLOCKED: connection refused at the local Postgres port because the local stack is not running.                                                                                                                         |
| `npx supabase migration list`                           | BLOCKED: the project is not linked because the supplied project reference remains a placeholder.                                                                                                                       |

Phase 5 schema and migration discipline are implemented, but database execution, lint, inspection, and remote comparison are not accepted until the Docker-compatible runtime and real remote project reference prerequisites exist.

## Phase 6 — Database/RLS tests and generated types

Documentation gate accessed 2026-08-08:

| Official URL                                                        | Heading used                        | Selected command/pattern                                                                                                           |
| ------------------------------------------------------------------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| https://supabase.com/docs/guides/local-development/testing/overview | Database unit testing with pgTAP    | Generate with `npx supabase test new map_starter_rls.test`; use a transaction, role/JWT switching, pgTAP assertions, and rollback. |
| https://supabase.com/docs/guides/api/rest/generating-types          | Generating types using Supabase CLI | Local output form is `npx supabase gen types typescript --local > database.types.ts`; generation requires an inspectable database. |

Selected generated-test command: `npx supabase test new map_starter_rls.test`. Selected test command: `npx supabase test db`. The committed application type target will be `src/types/database.generated.ts` once CLI generation can run. Because neither the local database nor a real linked remote is available, no handwritten substitute for generated database types is permitted.

### Phase 6 verification

| Command/check                                             | Result                                                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npx supabase test new map_starter_rls.test`              | PASS; CLI 2.113.0 generated `supabase/tests/map_starter_rls.test_test.sql`, committed untouched before implementation.                                        |
| Test coverage audit                                       | PASS; the implemented transaction plans 23 pgTAP assertions and represents every minimum behavior listed in Phase 6.                                          |
| `npx supabase test db`                                    | BLOCKED: connection refused at local Postgres because the Docker-compatible local stack is unavailable. No assertion has been represented as executed.        |
| `npx supabase gen types typescript --local`               | BLOCKED: neither Docker nor Podman is installed/on `PATH`. The command was checked without shell redirection so no empty or misleading type file was created. |
| Generated type and `db:types`/`db:types:check` acceptance | INCOMPLETE: generation and drift scripts remain deferred together so the repository cannot mistake handwritten or empty output for database-generated types.  |

Phase 6 tests are implemented but not executed. Generated database types remain blocked, so Phase 6 is not accepted.

## Phase 7 — Supabase client and TanStack Query foundation

Documentation gate accessed 2026-08-08:

| Official URL                                                                         | Heading used                           | Selected command/pattern                                                                                                                                                          |
| ------------------------------------------------------------------------------------ | -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native       | Install and initialize client          | Quickstart currently uses `@supabase/supabase-js`, `react-native-url-polyfill`, and Expo SQLite-backed local storage.                                                             |
| https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth | Install dependencies; storage adapters | Prefer its `npx expo install @supabase/supabase-js @react-native-async-storage/async-storage expo-secure-store expo-splash-screen` and native SecureStore/web AsyncStorage split. |
| https://supabase.com/docs/guides/auth/quickstarts/react-native                       | Client initialization                  | Retain `processLock`, persistent sessions, disabled URL session detection, and one foreground/background auto-refresh listener.                                                   |
| https://docs.expo.dev/versions/latest/sdk/securestore/                               | Installation and API                   | Use SDK-compatible `expo-secure-store` for native auth storage.                                                                                                                   |
| https://tanstack.com/query/latest/docs/framework/react/installation                  | NPM installation                       | `npm i @tanstack/react-query`.                                                                                                                                                    |
| https://tanstack.com/query/latest/docs/framework/react/react-native                  | Online status and app focus            | Wire `onlineManager` to `expo-network` and `focusManager` to React Native `AppState`, with cleanup.                                                                               |
| https://docs.expo.dev/versions/latest/sdk/network/                                   | Installation                           | `npx expo install expo-network`; SDK 57 recommended version is `~57.0.1`.                                                                                                         |

ADR 0002 records the required social-auth storage choice. `react-native-url-polyfill` remains a direct dependency because both current Supabase client examples import it, even though the social-auth installation snippet omits it.

### Phase 7 verification

| Check                          | Result                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dependency/config verification | Supabase client, native SecureStore, web AsyncStorage, URL polyfill, TanStack Query, Expo Network, and the SecureStore config plugin are installed. Expo Doctor passes 20/20 checks.                                |
| Static quality                 | `npm run fmt`, `npm run fmt:check`, type-aware `npm run lint`, and strict `npm run typecheck` pass.                                                                                                                 |
| Architectural boundary         | PASS: raw `@supabase/supabase-js` imports exist only under `src/lib/supabase`; screens and providers consume the boundary API.                                                                                      |
| Session/query lifecycle        | Implemented: lazy singleton client, platform storage, `processLock`, foreground refresh with cleanup, singleton Query client, network manager, AppState focus manager, key factories, and conservative retry rules. |
| iOS runtime                    | PASS in Expo Go 57.0.6 on iPhone 17 Pro / iOS 26.5; bundle completed in 3694 ms with no red-screen exception. Evidence SHA-256: `b0e8e18f6ce58e7eb1a266de5533a89794be87c47e956c4957439d2cf1faafa5`.                 |
| Expected runtime warning       | Expo warns that production linking requires a scheme; this is the explicit ADR 0001 deferral. Expo also confirms a development build needs native identifiers.                                                      |
| Generated database typing      | INCOMPLETE: the client cannot receive the required generated `Database` generic until Phase 6 generation can run. It is SDK-typed only and is not represented as schema-typed.                                      |
| Unit tests / Android           | INCOMPLETE: lifecycle/Query unit tests await the test-tooling phase; Android tooling/emulator remains unavailable.                                                                                                  |

Phase 7 is implemented except for generated schema typing and acceptance tests blocked by earlier prerequisites/tooling.
