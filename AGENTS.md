# MatchUp Agent Notes

## Expo / Runtime

- This is Expo SDK 56 (`expo ~56.0.8`, React Native 0.85.3) with Expo Router entrypoint `expo-router/entry`; read `https://docs.expo.dev/versions/v56.0.0/` before changing Expo, Router, EAS, native config, assets, fonts, splash, or platform APIs.
- Development target is an Android development build via `expo-dev-client`, not Expo Go.
- Android package is `com.mano_mb.MatchUp` in `app.json`; changing it breaks already installed dev builds unless a new build is installed.

## Commands

- Install first: `npm install`.
- Typecheck: `npx --no-install tsc --noEmit`. Avoid `npx tsc --noEmit` before deps are installed; it may fetch the wrong `tsc` package.
- Start Metro for dev client: `npx expo start --dev-client`.
- Start/open Android dev client: `npx expo start --dev-client --android`.
- USB Android often needs `adb reverse tcp:8081 tcp:8081` before starting Metro.
- Build Android dev client: `npx eas build --platform android --profile development`.

## Structure

- Route groups matter: auth screens are under `src/app/(auth)`, protected tabs under `src/app/(protected)/(tabs)`.
- `@/*` maps to `src/*`; TypeScript strict mode is enabled in `tsconfig.json`.
- Shared tokens live in `src/constants/theme.ts`; keep colors aligned with the Pencil/`kg-*` palette instead of inventing new values.

## Design Source

- Visual screens should match the Pencil file `C:/Users/mateu/Desktop/MatchUp_Design/MatchUp.pen`; inspect it with Pencil MCP before changing UI.
- Current logo/illustration PNG assets in `assets/images` were exported from Pencil nodes and should be reused for matching the design.
