# Dependency and Expo upgrade policy

Dependency automation opens pull requests only. This repository has no auto-merge workflow. Every dependency change requires human review and the complete relevant quality gates.

## Native dependency changes

Treat Expo, React, React Native, Expo modules, config plugins, native storage/maps/monitoring packages, and their transitive native changes as native-impacting. Never auto-merge them. Require:

1. current official installation or migration documentation logged before the change;
2. Expo compatibility checks and a reviewed lockfile diff;
3. clean native builds and release-like tests on both iOS and Android;
4. auth, storage, permissions, map, monitoring, OTA, and Maestro regression checks as applicable;
5. a version/build increment and new binary whenever the native runtime changes.

## Expo SDK upgrades

Upgrade Expo SDKs one major version at a time using Expo's current official incremental upgrade guide. Run the current official dependency-alignment command, inspect config-plugin/native diffs, regenerate native projects only through the documented workflow, and create fresh preview binaries. An SDK upgrade is not accepted from JavaScript tests or Expo Doctor alone; both platforms must build and pass smoke tests before merge.

Major dependency updates remain separate Dependabot pull requests. Patch/minor updates are grouped into native and non-native review sets. Security fixes may require breaking changes and receive the same review rather than a forced install or automatic merge.
