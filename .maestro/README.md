# Maestro E2E setup

These flows are platform-neutral and intentionally use `${MAESTRO_APP_ID}` instead of inventing the iOS bundle identifier or Android package deferred in ADR 0001.

Prerequisites:

1. Complete the non-deferred native identity and EAS setup described in `docs/prerequisite-setup-guide.md`.
2. Build and install a release-like Android APK or iOS simulator app connected to an isolated test Supabase project.
3. Create two email/password users in that test project:
   - a reusable user for `MAESTRO_TEST_EMAIL` and `MAESTRO_TEST_PASSWORD`;
   - a disposable user for `MAESTRO_DELETE_EMAIL` and `MAESTRO_DELETE_PASSWORD`.
4. Reset/seed the backend before the suite. The map/moderation flows expect the synthetic records from `supabase/seed.sql` and must never target production.
5. Export variable values in the shell or inject them through the EAS `preview` environment. Never commit their values.

Required variable names:

```text
MAESTRO_APP_ID
MAESTRO_TEST_EMAIL
MAESTRO_TEST_PASSWORD
MAESTRO_DELETE_EMAIL
MAESTRO_DELETE_PASSWORD
```

Run all top-level flows after installing the app:

```bash
MAESTRO_CLI_NO_ANALYTICS=1 maestro test .maestro
```

The helper directory is excluded by `.maestro/config.yaml`. Account deletion is destructive and must use only the disposable user. Google and Apple credentials are deliberately absent from YAML.
