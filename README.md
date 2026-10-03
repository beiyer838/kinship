# Kinship

An AI roleplay and storytelling app for iPhone, built with Expo (SDK 57) and Expo Router.

Chat one-on-one with characters, pull several into a group story, play as your own personas, and steer the plot: swipe for another reply, edit any message, pin memories, branch the story or rewind it.

## Run it

```bash
npm install
cp .env.example .env        # then add your GEMINI_API_KEY
npx expo start              # press i for the iOS simulator, or scan the QR code with Expo Go
```

`npx expo start --web` runs it in a browser, which is the quickest way to try it.

The key stays on the server: replies come from the `/api/chat` route (`src/app/api/chat+api.ts`), which runs on the dev server or your deployed server and calls Gemini. The app never sees the key.

## Ship it

1. Deploy the API route, for example with EAS Hosting: `npx expo export --platform web && npx eas-cli@latest deploy`. Set `GEMINI_API_KEY` as a secret on the deployment.
2. Set `EXPO_PUBLIC_API_URL` to that deployment's URL for release builds, so the iOS app knows where `/api/chat` lives.
3. Build and submit: `npx eas-cli@latest build -p ios` then `npx eas-cli@latest submit -p ios`. Update `ios.bundleIdentifier` in `app.json` first.

## What's in the app

| Area | Where |
| --- | --- |
| Onboarding: interests, 18+ confirmation, first persona | `src/app/welcome.tsx`, `src/app/onboarding/` |
| Discover, search by genre / mood / role, character profiles | `src/app/(tabs)/index.tsx`, `src/app/search.tsx`, `src/app/character/[id].tsx` |
| Chat: swipe replies, continue, rewrite, edit, pin, branch, rewind, copy, report, delete | `src/app/chat/[id]/index.tsx` |
| Group stories: presets, pick a cast, who replies next, add characters mid-story | `src/app/group/new.tsx`, chat screen |
| Story info: pinned memories, persona per chat, story paths, reply length | `src/app/chat/[id]/info.tsx` |
| Create characters: image, definition, opening message, tags, SFW / 18+, visibility | `src/app/(tabs)/create.tsx` |
| Personas, profile, gems (daily check-in, rewarded ad), settings and Safety Center | `src/app/personas/`, `src/app/(tabs)/profile.tsx`, `src/app/gems.tsx`, `src/app/settings.tsx` |
| Themes: Classic, Midnight, Indigo | `src/theme/tokens.ts` |

State lives on the device (Zustand persisted to AsyncStorage, `src/store/useStore.ts`). Gem costs and prices are in `src/lib/economy.ts`.

## Not connected yet

- **Accounts and a shared catalog.** Characters you publish are saved on your device only. Sharing them with other people needs a backend with accounts.
- **In-app purchases.** Gem packs and Lite / Pro show an explanation instead of buying. Wire them to StoreKit, for example through RevenueCat.
- **Rewarded ads.** The ad sheet is a placeholder with a 5-second timer. Connect an ads SDK such as Google Mobile Ads.
- **Moderation.** Reports are stored locally. Crisis resources appear when a message matches a keyword check (`src/lib/ai.ts`) and the model is told to step out of the story if someone seems at risk; a production app should add server-side classification.

## Assets

Character portraits and the landing-page images and video come from `scripts/generate_assets.py` (Gemini image model and Veo), saved to `public/assets`. Run `npm run assets` to regenerate anything missing.

## Checks

```bash
npm run typecheck
npx expo lint
```
