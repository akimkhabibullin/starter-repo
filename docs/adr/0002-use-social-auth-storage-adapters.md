# ADR 0002: Use the social-auth storage adapters

- Status: accepted
- Date: 2026-08-08

## Context

The current generic Expo Supabase quickstart uses the Expo SQLite `localStorage` polyfill. The current Supabase Expo social-auth tutorial instead prescribes platform-specific session storage: Expo SecureStore on native platforms and AsyncStorage on web. The implementation specification requires native social authentication and explicitly says to prefer the social-auth tutorial if the guides differ.

## Decision

Use an Expo SecureStore adapter on iOS and Android and an AsyncStorage adapter on web. Retain the React Native auth guide's current `processLock`, `persistSession: true`, `autoRefreshToken: true`, and `detectSessionInUrl: false` settings. Register foreground/background token refresh exactly once at the application provider boundary and remove its AppState subscription during cleanup.

## Consequences

- Native session material is kept in platform secure storage rather than SQLite-backed local storage.
- Web session state uses AsyncStorage and guards server-side rendering access.
- The Supabase client remains the only raw client and is created in `src/lib/supabase`.
- The app must not log storage keys, session payloads, access tokens, or refresh tokens.

## Sources

- https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native
- https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth
- https://supabase.com/docs/guides/auth/quickstarts/react-native
- https://docs.expo.dev/versions/latest/sdk/securestore/
