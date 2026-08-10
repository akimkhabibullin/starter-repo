# Mobile release checklist

Every checkbox requires evidence linked from the implementation log or release record. Deferred ADR 0001 items remain unchecked until intentionally resumed.

## Identity, builds, and stores

- [ ] Final app name, Expo owner/project, public scheme, iOS bundle identifier, and Android package are approved and consistent.
- [ ] App Store Connect and Play Console records, signing, icons/screenshots, descriptions, categories, age/content ratings, and reviewer contact details are complete.
- [ ] Version/build numbers are unique; clean preview and production binaries build from the release commit on both platforms.
- [ ] Reviewer credentials use isolated non-production-capable accounts and include steps for map, report/block, and deletion review.

## Legal and privacy

- [ ] Published privacy policy, terms, and support/contact destinations are reviewed, HTTPS-valid, environment-correct, and present in store metadata/app UI where required.
- [ ] iOS privacy manifest/reasons and App Privacy labels match every SDK and actual data flow.
- [ ] Play Data safety answers match actual collection, sharing, deletion, encryption, location, diagnostics, and analytics behavior.
- [ ] Location permission strings are accurate; denial is usable; no background or automatic location upload exists.
- [ ] Sentry and optional analytics settings match consent/retention policy; replay, touch autocapture, and duplicate error tracking remain disabled.

## Authentication and account lifecycle

- [ ] Email sign-up, confirmation, sign-in, reset, persistence, rate limits, and sign-out pass on both platforms.
- [ ] Google console/Supabase client ordering, redirect URIs, package/bundle IDs, and signing fingerprints pass native checks.
- [ ] Apple capability/provider/signing setup passes on iOS; Apple token revocation succeeds before account deletion.
- [ ] Account deletion is discoverable, typed-confirmed, server-authorized, idempotently recoverable, and verified for every enabled provider.

## Shared content and safety

- [ ] Point, polygon, viewport bounds/limits, list alternative, CRUD, updates, location denial, and cross-session Realtime pass with two accounts.
- [ ] Report, block, unblock, removed-content disappearance, report privacy, human moderation process, and published contact path pass.
- [ ] Database reset, migration lint, pgTAP/RLS suite, and generated-type drift pass from a clean checkout.

## Monitoring, OTA, and automation

- [ ] Production Sentry receives a symbolicated native-build error and a symbolicated OTA error; redaction inspection finds no sensitive fields.
- [ ] Preview/production EAS channels and environments are isolated; runtime policy is compatible; preview update is verified before production.
- [ ] Maestro smoke/critical journeys pass on Android and iOS release-like artifacts; failures retain secret-free artifacts.
- [ ] CI and dependency review are required branch checks; database CI is enabled; Dependabot alerts/security updates are enabled in repository settings.
- [ ] Dependency changes followed `docs/dependency-policy.md`; native changes received fresh binaries and both-platform tests.
- [ ] Secret scan of tracked files and relevant Git history passes; `git status --short` is empty; rollback owner and procedure are recorded.
