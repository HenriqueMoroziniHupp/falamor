# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Falamor: a Nuxt 4 (SSR) app that turns a couple's photos and a love declaration into a Google Photos "Memories"-style slideshow, with the declaration read aloud by Gemini TTS, background music synthesized live with the Web Audio API, and a "time together" counter. The original product brief is in `falamor-init-prompt.md`, and `README.md` covers the behavior in detail (both in Portuguese).

Before changing behavior, check `docs/decisoes/` (ADRs: why things are the way they are) and `ROADMAP.md` (what phase we're in). If you make a decision someone could question later, add a new ADR. Product and brand guidance is in `docs/produto.md` and `docs/marca.md`.

**This is the pilot phase.** It runs locally with no database, bucket, login or payments. Drafts, photos and generated audio live in the browser's IndexedDB. The only server work is TTS generation plus mock declaration data. The Gemini key exists only server-side, in Nitro `runtimeConfig`.

Code comments, README and commit-style prose are in Portuguese (pt-BR). Keep new comments in Portuguese to match.

## Commands

```bash
npm install                 # .npmrc sets legacy-peer-deps (optional esbuild/vite 8 peer conflict)
npm run dev                 # nuxt dev --host → http://localhost:3000
npm test                    # vitest run (tests/unit/**/*.test.ts, node env, no Nuxt runtime)
npx vitest run tests/unit/timeline.test.ts      # single file
npx vitest run -t "reads the WAV header"        # single test by name
npm run typecheck           # nuxt typecheck (vue-tsc)
npm run build && npm run preview
npm run samples:generate    # pre-generate sample declaration MP3s into public/audio/samples (needs NUXT_GEMINI_API_KEY)
npm run samples:generate -- --force       # regenerate all
npm run samples:generate -- --audition    # voice comparison clips into .data/auditions/
```

`samples:generate` runs the TS script directly with Node's type stripping (`node --env-file=.env scripts/...ts`). That's why `shared/` and `server/services/tts/` import each other with explicit `.ts` extensions and `allowImportingTsExtensions` is enabled. Keep those modules free of Nuxt auto-imports and aliases so the script can still load them.

Without `NUXT_GEMINI_API_KEY` the app still works: `/api/tts` returns 503 on a cache miss, and the preview falls back to music and captions only.

Test routes: `/criar` (wizard), `/d/demo`, `/en/d/demo-en`, `/d/demo-expirada` (410).

## Architecture

### Code layout and auto-imports
- `app/`: Nuxt 4 srcDir. Components are registered **by filename without a folder prefix** (`pathPrefix: false`), so `components/player/DeclarationPlayer.vue` is `<DeclarationPlayer>`. Component filenames must stay globally unique.
- `app/utils/*` (e.g. `idb`, `compressImage`) and `app/composables/*` are auto-imported. `app/lib/*` is **not** auto-imported: import it from `~/lib/...`. It holds pure logic (`timeline.ts`, `player.ts`) and the `RomanticAudioEngine` class.
- `server/utils/*` is auto-imported in server code (`consumeRateLimit`, `useDeclarationRepository`).
- `shared/`: types, sample declarations and text utilities used by the app, the server **and** the Node script. Import it as `#shared/...` from Nuxt code and by relative `.ts` path from the script.

### Voice audio pipeline: cheapest source first
The client (`useDeclarationAudio`) resolves the audio in this order:
1. **Sample text.** `matchSample()` from `shared/samples.ts` checks whether the text exactly matches a built-in sample for that locale and voice. If it does, the static MP3 in `public/audio/samples` is used.
2. **Browser cache.** IndexedDB, under key `tts:<sha256(v1, locale, voice, normalizedText)>`. When the text changes, the draft deletes the old key.
3. **Server.** `POST /api/tts` (`server/api/tts.post.ts`) checks Nitro `useStorage('tts')` (fs driver at `.data/tts`) and returns `X-TTS-Cache: HIT`. On a miss it calls the provider, dedupes identical concurrent requests through an in-flight map, and applies a per-IP in-memory rate limit. Only cache misses count toward the limit.

The server cache key hashes `[model, voiceName, style, locale, normalizedText]`, so changing any of these produces new audio. `normalizeDeclarationText` (in `shared/utils/text.ts`) is used on both sides so extra whitespace doesn't cause a regeneration.

TTS is abstracted behind the `TtsProvider` interface (`server/services/tts/`). `gemini.ts` is the implementation. The delivery style (`voiceStyle.ts`) is sent as metadata, not as spoken text. WAV/PCM responses are converted to MP3 with lamejs (`wavToMp3.ts`).

Pre-generating sample audio depends on sample texts **having no names**. Portuguese samples have male and female variants that differ only in "Obrigado/Obrigada" (the speaker's gender). `revoiceSampleText` swaps these in an unedited custom copy when the voice changes. If you edit a sample text, you must rerun `samples:generate`.

### Playback: one AudioContext as the master clock
- `usePlayback` plays the voice buffer and the `RomanticAudioEngine` music through the **same AudioContext**. Presentation time is `ctx.currentTime - startAt`, so suspending the context pauses slides, captions, voice and music together, without drift. Don't add independent timers or `<audio>` elements for anything that must stay in sync.
- `app/lib/timeline.ts` is pure and unit-tested. It computes how long each slide is shown (3.5–8 s, looping if there are too few photos) and the caption timings (proportional to sentence length) from the voice duration. If no voice is available, `estimateSpeechDuration` supplies the duration.
- The music engine extends the 4 chord progressions from the original brief, adding timbre per style, reverb/echo, crossfade and ducking under the voice.
- The envelope/cover screen exists so a user gesture can unlock audio before `start()`, which autoplay policy requires.
- `DeclarationPlayer` is shared by the wizard preview (`mode: 'preview'`) and the public page `/d/[id]` (`mode: 'public'`). Preview mode adds `PreviewWatermark` and the strict `useCaptureGuard` (blocks print/save shortcuts, blanks the screen on PrintScreen, veils and pauses on blur). OS screen recorders can't be blocked, so the watermark is the real protection. The public page has no watermark.

### Draft / wizard
`useDraft` is a `createSharedComposable` singleton holding a reactive `DraftState`. It autosaves to IndexedDB (`draft:v1`, debounced). Photo blobs are compressed in the browser and stored separately as `photo:<id>`; the draft state only keeps the IDs. Because the wizard depends on IndexedDB, `/criar` renders it inside `<ClientOnly>`. Step validation lives in `CreateWizard.vue` (`blocker`).

### Public declarations and post-pilot swap points
- `GET /api/declarations/[id]` reads through `useDeclarationRepository()` (`server/utils/declarations.ts`). This is the single place to swap the mock `DeclarationRepository` for a real one (D1/Postgres). It returns 404 for unknown declarations and 410 for expired ones.
- `nitro.storage.tts` is meant to become an R2/S3 unstorage driver without changing the code that calls `useStorage('tts')`.
- The rate limiter is in-memory, so it must move to KV/D1 before running multiple workers.
- `/d/**` routes send `X-Robots-Tag: noindex` and render OG meta for WhatsApp previews. `NUXT_PUBLIC_SITE_URL` must be absolute and public (for example a cloudflared tunnel) to test those previews.

### i18n
`@nuxtjs/i18n` with `prefix_except_default`: pt-BR is the default (no prefix) and English lives under `/en`. All UI copy goes in `i18n/locales/{pt-BR,en}.json`. Adding a locale means updating `SUPPORTED_LOCALES` in `shared/types/declaration.ts`, adding sample texts in `shared/samples.ts`, adding a speech language and style in `voiceStyle.ts`, adding a locale JSON file, and rerunning `samples:generate`.

### UI constraints from the brief
The interface stays minimal for non-technical users: light, pink-toned, with slow floating hearts. Don't show technical details such as voice names or style prompts. Users only choose a female or male voice and one of 4 music styles. Styling uses Tailwind v4 through `@tailwindcss/vite` plus `app/assets/css/main.css`. Fonts are Bodoni Moda and Nunito, loaded with `@nuxt/fonts`.
