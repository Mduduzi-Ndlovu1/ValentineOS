# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Detailed reference docs** (auto-imported):
- @docs/reference.md — directory structure, type system tables, Jotai atom tables, app registry table, mock file system tree, design tokens
- @docs/implementation-details.md — subsystem internals (dock magnification, window drag/resize, animations, boot sequence, Finder, wallpaper, gotchas)
- @docs/ticket-history.md — completed ticket log (TICKET-001 through TICKET-013)

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (also type-checks)
npm run lint     # ESLint (next/core-web-vitals)
npm start        # Serve production build
```

No test framework is configured.

## Project Overview

ValentineOS ("Project Nebula") is a macOS-inspired Web OS — a single-page app simulating a desktop environment in the browser with a Valentine pink/red romantic theme.

**Stack:** Next.js 14 (App Router), Jotai, Tailwind CSS + DaisyUI (`valentine` theme), Framer Motion + GSAP, Lucide React, Tiptap (rich text), Supabase, TypeScript (strict).

## Core Rules

- **Atomic state only** — Every piece of state is a Jotai atom. Never use React Context providers.
- **No body scrolling** — `<body>` is fixed (`overflow: hidden`). Scrolling only inside app windows.
- **Apps are config-driven** — Pluggable via `APP_REGISTRY` in `src/config/appRegistry.tsx`. Never hardcode app references in layouts.
- **Strict TypeScript** — No `any`. All props and atoms are typed.
- **`appRegistry.tsx` must be `.tsx`** — Placeholder app components contain JSX.
- **Tiptap SSR** — Always set `immediatelyRender: false` in `useEditor` to avoid hydration mismatches.
- **Database writes** — Always debounce. Never call Supabase on every keystroke.

## Architecture

### Rendering Flow

`page.tsx` → `<Desktop>` → wallpaper + `<DesktopIcon>`s + `<Dock>` + `<WindowManager>`.
`WindowManager` reads `openWindowsAtom`, renders a `<WindowFrame>` for each non-minimized window.
Each `WindowFrame` renders the app component looked up from `APP_REGISTRY`.

### State Management (`src/store/atoms/`)

All global state lives in Jotai atoms across four files: `windows.ts` (window instances, z-index counter, action atoms for open/close/focus/minimize/maximize/move/resize), `desktop.ts` (wallpaper, icon positions), `filesystem.ts` (file tree), `letters.ts` (Love Letters from Supabase).

**Key pattern:** Derived atoms in `filesystem.ts` return **functions** for parameterized queries (e.g., `folderContentsAtom` returns `(folderId) => items[]`), not plain values.

### File System

Normalized **flat map** (`Record<string, FileSystemItem>`) — not a nested tree. Items have `parentId` for tree-walking and `children` (array of IDs) on folders. File open actions in `src/store/actions/fileActions.ts` map file types to app windows.

### Window System

- **Drag:** Manual pointer events + `setPointerCapture` in `WindowTitleBar.tsx` (not Framer Motion drag). Traffic light buttons excluded via `data-traffic-light` attribute.
- **Resize:** 8 invisible edge/corner handles in `WindowFrame.tsx`. Minimum size: 300×200.
- **Z-index:** Monotonically increasing counter starting at 100 (above dock's z-50). Each focus bumps the counter.
- **Animations:** `AnimatePresence` in `WindowManager`; `layout={false}` on `WindowFrame` to prevent Framer Motion from interfering with manual drag/resize positioning.

### Dock

Magnification uses shared `mouseX` MotionValue → `useTransform` → `useSpring` (zero React re-renders). Click behavior follows macOS: no window → open; minimized → restore; focused → minimize; unfocused → focus.

### Supabase

Client in `src/lib/supabase.ts` with graceful fallback when env vars are missing (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). CRUD for Love Letters in `src/services/letterService.ts`.

## Adding a New App

1. Add the `AppID` to the union type in `src/types/os.ts`
2. Create the component in `src/components/apps/`
3. Add an entry to `APP_REGISTRY` in `src/config/appRegistry.tsx` (icon, default size/position, component)
4. It auto-appears in dock and desktop icons — nothing else needed

## Gotchas

- `ValentineOS` directory has capitals — `create-next-app` rejects this for npm naming. Project was set up manually.
- Next.js 14 + Tailwind requires `autoprefixer` as an explicit dev dependency.
- Leftover files from plain TS setup (e.g., `src/index.ts`) will break builds. Clean up stale files.
