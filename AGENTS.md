# AGENTS.md - ValentineOS Development Guide

This file is the primary instruction manual for agents working on ValentineOS ("Project Nebula").

## 1. Project Overview

ValentineOS is a macOS-inspired Web Operating System built with **Next.js 14 (App Router)**, **Jotai** (atomic state), **Framer Motion** (animations), and **Tailwind CSS + DaisyUI** (styling).
It features a romantic "Valentine" theme, window management, real-time collaboration, and a rich narrative layer.

**Documentation Index:**
- `docs/reference.md`: Type definitions, Atom tables, Directory structure, Design tokens.
- `docs/implementation-details.md`: Subsystem internals (Dock, Windows, Boot, Heartbeat).
- `docs/story-bible.md`: Narrative tone for patch notes (Noir/City persona).
- `docs/ticket-history.md`: Log of completed work.

---

## 2. Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build + Type check
npm start            # Serve production build
```

### Quality Control
```bash
npm run lint         # Run ESLint (next/core-web-vitals)
```
*Note: There are **no test commands** configured. Do not add test frameworks without explicit user approval.*

---

## 3. Core Rules & Conventions

### TypeScript (Strict Mode)
- **NO `any` types** - All props and atoms must be properly typed in `src/types/`.
- **Exports:** Use `export function` for components, not `export const`.
- **Directives:** Use `"use client"` for any component using hooks or atoms.

### Imports
- **Alias:** Use `@/*` for all internal imports (e.g., `@/store/atoms/windows`).
- **Grouping:**
  1. External (React, Jotai, Framer Motion)
  2. Internal (types, config, store)
  3. Local components
- **Syntax:** Use named imports: `import { x } from "module"`.

### State Management (Jotai)
- **Atomic State Only:** No React Context. All global state lives in `src/store/atoms/`.
- **File Structure:**
  - `windows.ts`: Window instances, z-index, focus.
  - `filesystem.ts`: File system map + derived atoms.
  - `desktop.ts`: Wallpaper, icons, user preferences.
  - `letters.ts`: Love Letters data.
  - `soulSync.ts`: Spotify playback state.
  - `books.ts`: Bookstore state.
  - `compass.ts`: Travel and events state.

### Styling (Tailwind + DaisyUI)
- **Theme:** `data-theme="valentine"`.
- **Glassmorphism:** `bg-white/10 border border-white/20 backdrop-blur-2xl`.
- **Window Body:** `bg-white/80 backdrop-blur-xl`.
- **Mobile First:** Use `useIsMobile()` hook (768px breakpoint).
  - *Mobile:* Full-screen windows (`fixed inset-0`), static dock (`z-[200]`).
  - *Desktop:* Draggable windows, magnification dock (`z-50`).

---

## 4. Critical "Gotchas" (Read Carefully)

1.  **No Body Scroll:** `body { overflow: hidden }`. Scroll logic exists only within app windows.
2.  **Config-Driven Apps:** Apps are defined in `src/config/appRegistry.tsx`. This file must be `.tsx` because it contains JSX components.
3.  **Tiptap SSR:** Always set `immediatelyRender: false` in `useEditor` to avoid hydration mismatches.
4.  **Database Writes:** **Debounce all writes.** Never call Supabase on every keystroke.
5.  **Wallpaper CSS:** Use `backgroundImage` (not `background` shorthand) to prevent resetting `backgroundSize: "cover"`.
6.  **JSX Comments:** In ternary expressions, use `//` comments, not `{/* */}` (causes build errors).
7.  **Framer Motion on Mobile:** Hooks like `useTransform` must always be called (Rules of Hooks). Override their output with static styles on mobile, do not conditionally skip the hook.
8.  **Next.js 14 Viewport:** Export `viewport` separately from `metadata`.

---

## 5. Architecture Reference

### File System
- **Structure:** Normalized flat map `Record<string, FileSystemItem>`.
- **Tree:** Folders have `children` (array of IDs). Items have `parentId`.
- **Mock Data:** `src/config/initialFileSystem.ts`.

### Window System
- **Drag:** Manual pointer events in `WindowTitleBar.tsx` (not Framer Motion drag).
- **Resize:** 8 invisible edge/corner handles in `WindowFrame.tsx`.
- **Z-Index:** Monotonically increasing counter (starts at 100).
- **Animations:** `AnimatePresence` in `WindowManager`; `layout={false}` on `WindowFrame`.

### Apps & Features
- **Finder:** Recursive file navigation, breadcrumbs, grid view.
- **Love Letters:** Rich text (Tiptap), distinctive stationery UI, Supabase persistence.
- **Heartbeat:** Spotify widget. Two users (Admin/Neo) connect via OAuth. Server-side API aggregates playback. "Resonance" = same track playing -> Heart pulses.
- **Settings:** Uptime counter (from `RELATIONSHIP_START_DATE`), Wallpaper picker (Unsplash).
- **Bookstore:** NYT Bestsellers, Google Books Search, Favorites (Supabase).
- **Patch Notes:** Displays version history. "New" badge tracks `last_read_version` in user preferences.
- **Compass:** Travel itinerary, Ticketmaster integration, Geolocation.

### Backend (Supabase)
- **Client:** `src/lib/supabase.ts` (Graceful fallback if env vars missing).
- **Tables:**
  - `love_letters`: Sealed/unsealed letters.
  - `spotify_tokens`: OAuth tokens for "Heartbeat".
  - `user_preferences`: Wallpapers, last read version.
  - `book_favorites` / `book_requests`: Bookstore user data.
  - `compass_events`: Travel itinerary and events.

### API Routes
- `/api/compass/explore`: Fetches events and location data.

---

## 6. Narrative & Tone (The "Noir" Persona)

The project has a distinct narrative voice used in Patch Notes and Easter Eggs.
Refer to `docs/story-bible.md` for the full guide.

- **The Narrator:** "The Architect" (Admin). Speaks to "The Signal" (Neo).
- **Tone:** Noir, atmospheric, romantic, "City in the Void".
- **Style:** Short sentences. Feature first, color second. "I built this for you."
- **Key Lore:**
  - *The City:* ValentineOS.
  - *The Harbor:* The Dock.
  - *The Clocktower:* Uptime Counter.
  - *Resonance:* Two users listening to the same song.

---

## 7. Adding New Features

1.  **New App:**
    - Add `AppID` to `src/types/os.ts`.
    - Create Component in `src/components/apps/`.
    - Register in `src/config/appRegistry.tsx`.
2.  **New Atom:** Add to appropriate file in `src/store/atoms/`.
3.  **New API Route:** Create in `src/app/api/`.
