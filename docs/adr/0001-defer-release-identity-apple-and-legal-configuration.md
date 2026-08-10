# ADR 0001: Defer release identity, Apple integration, and legal destinations

- Status: Accepted by explicit user instruction
- Date: 2026-08-08

## Context

`MOBILE_STARTER_IMPLEMENTATION_SPEC.md` requires stable native identifiers, a custom URL scheme, public privacy/terms/support destinations, and complete Sign in with Apple plus Apple authorization revocation during account deletion before implementation begins.

On 2026-08-08, the user explicitly instructed the implementation to skip Apple setup, `EXPO_PUBLIC_APP_SCHEME`, iOS bundle identifier, Android package identifier, privacy policy URL, terms URL, and support configuration, and to continue.

## Decision

Continue as a development starter with these capabilities explicitly deferred:

- native Sign in with Apple;
- Apple-linked account deletion and token revocation;
- custom-scheme authentication and password-recovery deep links;
- stable iOS/Android application identity;
- App Store/Play Store provider credentials tied to those identifiers;
- production privacy, terms/acceptable-use, and support destinations.

Use generic development copy and avoid inventing organization-specific identifiers or URLs. Do not represent placeholders as production configuration. Email/password and Google-oriented interfaces may be implemented where their independent prerequisites allow.

## Consequences

- Final status must remain `PARTIALLY IMPLEMENTED` until this ADR is superseded.
- Original specification Phases 0, 4, 8, 9, 11, 16, and 18 cannot fully pass.
- EAS/native builds, provider deep links, store submission, Apple review compliance, and release-like verification remain blocked.
- Account deletion may cover non-Apple users only; UI and documentation must state that limitation without claiming Apple compliance.
- No fake privacy, terms, or support URL may be shipped as though it were operational.

## Verification and rollback

To supersede this ADR, supply the deferred identifiers, HTTPS destinations, Apple Developer configuration/secrets, and test identity. Then restore the full environment schema and execute every deferred native, authentication, deletion, legal, and release acceptance test on both platforms.
