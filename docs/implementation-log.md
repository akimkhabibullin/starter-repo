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
