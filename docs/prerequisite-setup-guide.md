# Mobile starter prerequisite setup guide

Use this guide before asking the coding agent to continue Phase 1 of `MOBILE_STARTER_IMPLEMENTATION_SPEC.md`.

Do not paste credentials or private keys into chat. Put them only in the ignored files described below. Never commit `.env.local`, `secrets/`, provider credentials, tokens, passwords, or Apple `.p8` files.

## 1. Decide the permanent application identity

Choose these values before creating OAuth clients because changing them later invalidates provider configuration and usually requires a new native build.

| Decision              | Example                          | Rule                                                                |
| --------------------- | -------------------------------- | ------------------------------------------------------------------- |
| Display name          | `Map Starter`                    | Generic user-facing app name.                                       |
| Expo slug             | `map-starter`                    | Lowercase URL-safe project slug.                                    |
| URL scheme            | `mapstarter`                     | Lowercase scheme with no `://`; used for deep links.                |
| iOS bundle identifier | `com.yourcompany.mapstarter`     | Unique reverse-domain identifier; do not use the example literally. |
| Android package       | `com.yourcompany.mapstarter`     | Normally match the iOS identifier.                                  |
| Support email         | `support@yourdomain.com`         | A monitored inbox.                                                  |
| Privacy URL           | `https://yourdomain.com/privacy` | Must be a real public HTTPS page before release.                    |
| Terms/AUP URL         | `https://yourdomain.com/terms`   | Must cover terms and acceptable use for shared content.             |
| Support URL           | `https://yourdomain.com/support` | Must be a real public HTTPS support page.                           |

Record the final values somewhere secure. Use exactly the same identifiers in Expo, Apple, Google, Supabase redirect settings, and the environment file.

## 2. Create the required accounts and projects

### 2.1 Expo and EAS — required

1. Create an account at [expo.dev](https://expo.dev/signup).
2. Decide whether the project belongs to your personal Expo account or an Expo organization.
3. Record the account/organization slug as `EXPO_OWNER`.
4. The coding agent will create/link the EAS project during Phase 4 with the official CLI. After `eas init`, replace `EXPO_PROJECT_ID=REPLACE_ME_AFTER_EAS_INIT` with the generated UUID.
5. Create an Expo access token for noninteractive CI and store it as `EXPO_TOKEN`. Treat it as secret.
6. Later, create separate EAS variable sets for `development`, `preview`, and `production`. Client-visible values may be plaintext; credentials and tokens must use sensitive/secret visibility. Google service files must be EAS file variables.

Official references: [EAS environment overview](https://docs.expo.dev/eas/environment-variables/) and [EAS variable management](https://docs.expo.dev/eas/environment-variables/manage/).

### 2.2 Supabase — required

1. Create a [Supabase](https://supabase.com/dashboard) organization.
2. Create one development project now. Create a separate production project before release; production must not share its database or auth users with development.
3. In the project **Connect** dialog, obtain:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`;
   - publishable key beginning with `sb_publishable_` → `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
   - project reference → `SUPABASE_PROJECT_REF`.
4. Retain the database password as `SUPABASE_DB_PASSWORD`. It is secret and server/CLI-only.
5. Create a personal access token from Supabase account settings and store it as `SUPABASE_ACCESS_TOKEN`. It is secret and server/CLI-only.
6. Under Authentication:
   - enable email/password;
   - require email confirmation for production;
   - configure the Site URL;
   - add mobile redirect allow-list entries using the selected app scheme;
   - enable Google and Apple only after completing their sections below.
7. Never use a Supabase secret key or legacy `service_role` key in an `EXPO_PUBLIC_` variable. The application uses only the publishable key, protected by tested Row Level Security.

Official references: [Expo React Native quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native), [social authentication tutorial](https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth), and [API keys](https://supabase.com/docs/guides/getting-started/api-keys).

### 2.3 Google Cloud — required

1. Create or select a [Google Cloud](https://console.cloud.google.com/) project.
2. Configure the OAuth consent screen. Add your Google test account while the consent screen is in testing mode.
3. Create three OAuth clients in the same project:
   - Web client → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`;
   - iOS client using the exact iOS bundle identifier → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`;
   - Android client using the exact Android package plus required SHA certificate fingerprint(s) → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
4. In Supabase's Google provider settings, configure the Google client ID(s) and client secret according to the current Supabase page. If multiple client IDs are accepted, Supabase currently specifies the web client first. A Google client secret belongs only in the Supabase dashboard/server configuration, never in `.env.local` under an `EXPO_PUBLIC_` name.
5. Enable **Maps SDK for Android** and billing as required by Google Maps Platform.
6. Create a separate Android Maps API key → `EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY`.
7. Restrict that map key in both ways:
   - application restriction: Android apps, with the exact package and signing SHA fingerprints;
   - API restriction: Maps SDK for Android only.
8. Download `google-services.json` and `GoogleService-Info.plist` if the current native sign-in integration requires them. Save them only under `secrets/` as described below.
9. Collect debug, EAS preview, and production signing SHA fingerprints before expecting Google sign-in to work in every build profile.

Official references: [Supabase Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google), [Google OAuth installed apps](https://developers.google.com/identity/protocols/oauth2/native-app), [Maps SDK Android setup](https://developers.google.com/maps/documentation/android-sdk/get-api-key), and [API-key restrictions](https://developers.google.com/maps/api-security-best-practices).

### 2.4 Apple Developer — required

1. Enroll the distributing person or legal entity in the [Apple Developer Program](https://developer.apple.com/programs/enroll/). If an organization owns the app, the organization should enroll and add developers to its team.
2. Record the Apple Developer Team ID → `APPLE_TEAM_ID`.
3. Register an explicit App ID matching the iOS bundle identifier and enable **Sign in with Apple**.
4. Create any Services ID and website/redirect configuration required by the current Supabase Apple provider flow. Supabase's hosted callback normally uses `https://PROJECT_REF.supabase.co/auth/v1/callback`; copy the exact callback shown for your project.
5. Create a Sign in with Apple key. Record its key ID → `APPLE_KEY_ID` and download the `.p8` file once.
6. Set `APPLE_CLIENT_ID` to the client identifier required by the implemented native token exchange/revocation flow. For the native baseline this is expected to match the app's bundle identifier; the coding agent will verify this against Apple's readable REST documentation before implementing deletion.
7. Store the `.p8` securely. For local Edge Function secret synchronization, place only a base64 representation in `APPLE_PRIVATE_KEY_BASE64`. This value is server-only.
8. Configure Apple in the Supabase Auth provider dashboard. If using both Services ID OAuth and native Sign in with Apple, follow Supabase's current client-ID ordering exactly.
9. Set a six-month reminder for Apple OAuth client-secret rotation when a Services ID/OAuth setup is used.

Never put the `.p8`, its base64 content, an Apple client secret, or an Apple authorization code in an `EXPO_PUBLIC_` value, app config, source file, log, Sentry event, or chat message.

Official references: [Apple Developer enrollment](https://developer.apple.com/help/account/membership/program-enrollment/), [Supabase Apple provider](https://supabase.com/docs/guides/auth/social-login/auth-apple), and [Apple account-deletion guidance](https://developer.apple.com/support/offering-account-deletion-in-your-app/).

### 2.5 Sentry — required

1. Create a [Sentry](https://sentry.io/signup/) account or join your organization's account.
2. Create/select a Sentry organization and React Native project.
3. Record:
   - public project DSN → `EXPO_PUBLIC_SENTRY_DSN`;
   - organization slug → `SENTRY_ORG`;
   - project slug → `SENTRY_PROJECT`.
4. Create an organization auth token with the permissions required by the current Expo/Sentry source-map guide → `SENTRY_AUTH_TOKEN`.
5. The DSN is bundled and therefore public. The auth token is private and must use sensitive visibility in EAS so source maps can be uploaded for builds and updates.

Official reference: [Sentry with Expo](https://docs.expo.dev/guides/using-sentry/).

### 2.6 PostHog — optional

Create a PostHog project only if analytics is wanted. Select US or EU residency deliberately and record the project API key and regional host. Leaving both PostHog variables blank disables analytics and avoids installing the SDK.

### 2.7 Test identities — required for verification

Prepare without storing passwords in the repository:

- one unique email inbox for confirmation and password-reset tests;
- a second email identity for RLS, Realtime, reporting, and blocking tests;
- a disposable email identity for account-deletion tests;
- one Google account allowed by the OAuth consent screen;
- an Apple test account usable interactively on the iOS Simulator/device.

Provider passwords stay in your password manager and are entered interactively. They do not belong in `.env.local`.

## 3. Create the local secret files

The repository already ignores these paths. Create them locally; do not commit them:

```text
secrets/
├── GoogleService-Info.plist
├── google-services.json
└── AuthKey_KEYID.p8
```

Only add provider files that the current integration requires. Keep the original Apple `.p8` in a secure password manager or secrets vault as well; Apple does not let you download the same key again.

Confirm ignores before adding values:

```bash
git check-ignore .env.local secrets/google-services.json secrets/GoogleService-Info.plist secrets/AuthKey_KEYID.p8
```

Each path must be printed by `git check-ignore`.

## 4. Create `.env.local`

Create `/Users/akimkhabibullin/code/starter-repo/.env.local` with the following names. Replace every `REPLACE_ME` with the real value. `EXPO_PROJECT_ID` may remain at its explicit post-init placeholder until Phase 4. The two PostHog values may remain empty.

```dotenv
# Public app identity — included in the app bundle.
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_APP_NAME=REPLACE_ME
EXPO_PUBLIC_APP_SCHEME=REPLACE_ME
EXPO_PUBLIC_IOS_BUNDLE_IDENTIFIER=com.REPLACE_ME.REPLACE_ME
EXPO_PUBLIC_ANDROID_PACKAGE=com.REPLACE_ME.REPLACE_ME
EXPO_PUBLIC_PRIVACY_POLICY_URL=https://REPLACE_ME/privacy
EXPO_PUBLIC_TERMS_URL=https://REPLACE_ME/terms
EXPO_PUBLIC_SUPPORT_URL=https://REPLACE_ME/support
EXPO_PUBLIC_SUPPORT_EMAIL=REPLACE_ME

# Public Supabase client configuration.
EXPO_PUBLIC_SUPABASE_URL=https://REPLACE_ME.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME

# Public native OAuth client identifiers. These are IDs, not client secrets.
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=REPLACE_ME.apps.googleusercontent.com

# Public but must be restricted in Google Cloud.
EXPO_PUBLIC_GOOGLE_MAPS_ANDROID_API_KEY=REPLACE_ME

# Public monitoring endpoint.
EXPO_PUBLIC_SENTRY_DSN=https://REPLACE_ME@REPLACE_ME.ingest.sentry.io/REPLACE_ME

# Optional public analytics configuration. Leave both blank to disable.
EXPO_PUBLIC_POSTHOG_API_KEY=
EXPO_PUBLIC_POSTHOG_HOST=

# Build/CLI configuration — never imported into client code.
EXPO_OWNER=REPLACE_ME
EXPO_PROJECT_ID=REPLACE_ME_AFTER_EAS_INIT
EXPO_TOKEN=REPLACE_ME
SUPABASE_PROJECT_REF=REPLACE_ME
SUPABASE_ACCESS_TOKEN=REPLACE_ME
SUPABASE_DB_PASSWORD=REPLACE_ME
SENTRY_AUTH_TOKEN=REPLACE_ME
SENTRY_ORG=REPLACE_ME
SENTRY_PROJECT=REPLACE_ME

# Ignored local provider-file paths used only by app.config.ts.
GOOGLE_SERVICES_JSON=./secrets/google-services.json
GOOGLE_SERVICE_INFO_PLIST=./secrets/GoogleService-Info.plist

# Server-only Apple token-revocation values.
APPLE_TEAM_ID=REPLACE_ME
APPLE_KEY_ID=REPLACE_ME
APPLE_CLIENT_ID=com.REPLACE_ME.REPLACE_ME
APPLE_PRIVATE_KEY_BASE64=REPLACE_ME
```

### Variable classification

| Classification           | Variables                                                                               | Where they belong                                                                                                                            |
| ------------------------ | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Public/mobile bundle     | Every `EXPO_PUBLIC_*` variable                                                          | `.env.local`; EAS `development`, `preview`, and `production` as plaintext. Public does not mean unrestricted: restrict the Android Maps key. |
| Non-secret identifiers   | `EXPO_OWNER`, `EXPO_PROJECT_ID`, `SUPABASE_PROJECT_REF`, `SENTRY_ORG`, `SENTRY_PROJECT` | `.env.local`; EAS/CI where needed. Never import into client code.                                                                            |
| Private tokens/passwords | `EXPO_TOKEN`, `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SENTRY_AUTH_TOKEN`      | `.env.local` and approved EAS/CI secret stores only. `SENTRY_AUTH_TOKEN` must be sensitive for source-map tools.                             |
| File paths               | `GOOGLE_SERVICES_JSON`, `GOOGLE_SERVICE_INFO_PLIST`                                     | Local ignored paths; use EAS file variables for cloud builds.                                                                                |
| Apple server secrets     | `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_CLIENT_ID`, `APPLE_PRIVATE_KEY_BASE64`          | `.env.local` only until synchronized to Supabase Edge Function secrets; never client code or EAS public variables.                           |

## 5. Configure cloud environments later

When Phase 4 creates the EAS project, mirror the appropriate values into all three EAS environments:

- `development`: development Supabase/Sentry/provider configuration;
- `preview`: preview/test configuration and preview channel;
- `production`: separate production Supabase/Sentry/provider configuration and production channel.

EAS supports plaintext, sensitive, secret, and file variables. Anything compiled into mobile client code remains observable even if its EAS visibility says secret. Use EAS file variables for Google service files and sensitive/secret visibility for CI credentials.

Apple private-key values for account deletion belong in Supabase Edge Function secrets, not in the mobile app's EAS environment.

## 6. Finish the local machine prerequisites

Before Phase 0 can pass:

1. Install Android Studio, JDK 17, Android SDK Platform 36, Build Tools, Platform Tools, and an Android Emulator using [Expo's Android guide](https://docs.expo.dev/workflow/android-studio-emulator/).
2. Boot the Android Emulator and confirm `adb devices` lists it as `device`.
3. Boot an installed iOS Simulator and confirm `xcrun simctl list devices` shows it as `Booted`.
4. Install and start Docker Desktop or another Docker-compatible runtime with at least 7 GB allocated; confirm `docker info` succeeds.
5. Install Maestro through its [official installation guide](https://docs.maestro.dev/getting-started/installing-maestro), or authorize the coding agent to install it during Phase 16.

## 7. Ready-to-resume checklist

Before telling the coding agent to continue, confirm:

- [ ] Permanent app identity is final and consistent everywhere.
- [ ] Privacy, terms/AUP, and support HTTPS pages are publicly reachable.
- [ ] Expo account/owner and CI token exist.
- [ ] Development Supabase project exists; URL, publishable key, reference, password, and access token are available.
- [ ] Email confirmation and mobile redirects are configured in Supabase.
- [ ] Google consent screen, Web/iOS/Android OAuth clients, and test user are configured.
- [ ] Maps SDK for Android is enabled and its key has Android plus API restrictions.
- [ ] Apple Developer membership, App ID, Sign in with Apple capability, key, and required Services ID are configured.
- [ ] Sentry organization/project, DSN, and source-map auth token exist.
- [ ] `.env.local` contains every variable name above without committing the file.
- [ ] Required provider files exist under ignored `secrets/`.
- [ ] iOS Simulator and Android Emulator are booted and visible to their CLIs.
- [ ] Docker is running.
- [ ] Test identities are ready for interactive verification.

Then say: **Continue the mobile starter implementation from Phase 0.** The coding agent will validate names and formats without printing secret values.
