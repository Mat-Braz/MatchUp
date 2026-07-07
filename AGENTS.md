# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code that touches Expo, React Native, Expo Router, EAS, app config, native behavior, navigation, assets, fonts, splash screen, build profiles, or platform-specific APIs.

## Project Context

- MatchUp is an Expo SDK 56 / React Native app using Expo Router and `expo-dev-client`.
- The app is designed to run primarily through an Android development build, not Expo Go.
- The current package name is `com.mano_mb.MatchUp` in `app.json`; keep it aligned with installed development builds.
- TypeScript strict mode is enabled and `@/*` resolves to `src/*`.

## Development Rules

- Keep changes minimal and aligned with the existing structure under `src/app`, `src/components`, `src/constants`, and `src/features`.
- Preserve the established theme from `src/constants/theme.ts` instead of introducing ad-hoc colors or typography.
- Use Expo Router route groups consistently: auth screens live in `src/app/(auth)` and protected screens in `src/app/(protected)`.
- Prefer shared UI primitives from `src/components/ui` before creating new screen-local UI patterns.
- Do not assume Expo API behavior from memory; verify against the SDK 56 docs first.

## Useful Commands

```sh
npm install
npx expo start --dev-client
npx expo start --dev-client --android
npx eas build --platform android --profile development
```
