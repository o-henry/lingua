# Daily Lingual Boost

Reference-based listening app (React + Vite).

## Repo scan

- Framework: React 18 + TypeScript + Vite
- Router: React Router (`src/App.tsx`)
- UI: Tailwind + shadcn/ui
- Storage: IndexedDB-first + LocalStorage fallback (`src/storage/db.ts`, `src/lib/storage.ts`)
- YouTube playback: IFrame Player API (`src/components/YouTubePlayer.tsx`)

## Core policy

- No YouTube subtitle/autosubtitle text extraction from network or DOM.
- Only user-provided text is used (paste/upload/manual typing).
- Transcript text persistence is opt-in (default OFF, local-only).
- Saved learning data: SegmentRef + userText + notes.

## Current flow

`청취 -> (자막 기반 구간 선택 | 시간 기반 구간 선택) -> 들은 문장 적기 -> AI에게 묻기 -> SRS`

## Key UX changes

- Onboarding/shadowing/recall flows removed from routes.
- Stats/streak UI removed from navigation and active flows.
- Learn segment input supports `mm:ss` / `h:mm:ss` and normalizes on blur.
- Loop defaults OFF; `endSec` can be unset until loop is enabled.
- Library clip add uses captions status input (`있음/없음/미확인`) and supports later edit.
- Library tries YouTube `oEmbed` to fill title/channel.
- Learn supports transcript line click and `Shift+Click` range selection to set segment.
- Learn/SRS include external AI ask bar:
  - copy prompt
  - open ChatGPT / Gemini
  - open/copy YouTube time link

## Main changed files

- `src/App.tsx`
- `src/components/BottomNav.tsx`
- `src/pages/Home.tsx`
- `src/pages/Library.tsx`
- `src/pages/Learn.tsx`
- `src/pages/Srs.tsx`
- `src/pages/Settings.tsx`
- `src/components/learn/TranscriptPanel.tsx`
- `src/components/ai/ExternalAiAskBar.tsx`
- `src/domain/time.ts`
- `src/domain/transcript.ts`
- `src/domain/aiAsk.ts`
- `src/lib/types.ts`
- `src/lib/youtube.ts`

## Scripts

```bash
npm run dev
npm run test
npm run build
```
