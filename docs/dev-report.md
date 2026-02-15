# ValentineOS — Senior Developer Report
**Project Nebula | v1.0.3 | February 16, 2026**
**Author:** Senior Full-Stack Developer (AI-Assisted)
**Repository:** https://github.com/Mduduzi-Ndlovu1/ValentineOS

---

## Executive Summary

ValentineOS is a production-grade, macOS-inspired Web Operating System built as a single-page app with a Valentine-themed romantic aesthetic. The project simulates a full desktop environment in the browser — complete with draggable/resizable windows, a magnifying dock, a virtual file system, rich text editing, real-time collaboration, and Spotify integration. It is fully responsive across desktop and mobile devices.

**Current Version:** 1.0.3
**Total Commits:** 14
**Codebase:** ~4,300 lines of TypeScript/TSX across 50 source files
**Status:** Production-deployed on Vercel with active feature development

---

## Technical Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 14.2 |
| Language | TypeScript (strict) | 5.5 |
| UI | React | 18.3 |
| State | Jotai (atomic) | 2.6 |
| Styling | Tailwind CSS + DaisyUI (`valentine` theme) | 3.4 / 4.12 |
| Animation | Framer Motion + GSAP | 11.0 / 3.12 |
| Icons | Lucide React | 0.400 |
| Rich Text | Tiptap | 3.19 |
| Database | Supabase (Postgres + Realtime) | 2.95 |
| External API | Spotify Web API (OAuth 2.0) | — |
| Deployment | Vercel | — |

---

## Architecture Overview

### Rendering Flow

```
page.tsx → <Desktop>
  ├── Wallpaper (Unsplash / gradient fallback)
  ├── DesktopIcon[] (flex grid on mobile, absolute on desktop)
  ├── WindowManager → WindowFrame[] → App components from APP_REGISTRY
  ├── MenuBar (top bar, notification bell, version button)
  ├── NotificationCenter (slide-in panel)
  ├── Toast (top-right stack, max 3)
  ├── Dock (glassmorphism bar, magnification on desktop)
  └── BootScreen (1.5s animated overlay on initial load)
```

### State Management

All global state lives in **Jotai atoms** across 8 files — zero React Context providers. This ensures fine-grained reactivity with no unnecessary re-renders.

| Atom File | Responsibility |
|-----------|---------------|
| `windows.ts` | Window instances, z-index counter, open/close/focus/minimize/maximize/move/resize actions |
| `desktop.ts` | Wallpaper URL, fallback gradient, desktop icon positions |
| `filesystem.ts` | Normalized file tree + derived query atoms (folder contents, breadcrumbs) |
| `letters.ts` | Love Letters data from Supabase |
| `settings.ts` | Relationship date, wallpaper gallery, uptime calculator |
| `soulSync.ts` | Spotify playback data, loading/error state, fetch action |
| `ui.ts` | Notifications (active toasts, history, notification center state) |
| `user.ts` | Current user context (Mduduzi / Neo) |

**Key pattern:** Derived atoms return **functions** for parameterized queries (e.g., `folderContentsAtom` returns `(folderId) => items[]`), not plain values.

### File System

Normalized **flat map** (`Record<string, FileSystemItem>`) — not a nested tree. O(1) lookup by ID. Items have `parentId` for tree-walking and `children` arrays on folders. This prevents N+1 query issues and simplifies navigation.

---

## Registered Applications (8)

| App | Icon | Size | Description |
|-----|------|------|-------------|
| **Finder** | FolderOpen | 800×500 | Full file browser: sidebar, breadcrumbs, back/forward navigation, grid view, single-click select, double-click open |
| **Settings** | Settings | 650×500 | 3-tab System Preferences: relationship uptime counter, wallpaper gallery picker, easter egg system specs |
| **Browser** | Globe | 900×600 | Placeholder (stub) |
| **Text Editor** | FileText | 500×600 | Read-only monospace text/code viewer |
| **Preview** | Eye | 600×500 | Image viewer with dark background |
| **Love Letters** | Heart | 900×650 | Tiptap rich text editor, Supabase CRUD, real-time sync, debounced auto-save, wax seal, lined paper texture |
| **Patch Notes** | Sparkles | 550×600 | Version changelog (v1.0.0 → v1.0.3) |
| **Soul Sync** | Music | 700×450 | Spotify OAuth, dual-user now-playing, resonance detection, animated sync heart |

Apps are **config-driven** via `APP_REGISTRY` — adding a new app requires only: (1) add `AppID` to the union type, (2) create the component, (3) add a registry entry. Dock, desktop icons, and window system auto-integrate.

---

## Feature Deep Dives

### Window System

- **Drag:** Manual pointer events + `setPointerCapture` in title bar (not Framer Motion drag). Traffic light buttons excluded via `data-traffic-light` attribute.
- **Resize:** 8 invisible edge/corner handles. Direction-aware expansion. Minimum 300×200.
- **Z-index:** Monotonically increasing counter (starts at 100, above dock's z-50). No collisions.
- **Animations:** Spring-based entry (scale 0.95 + y:20 → full), exit with gaussian blur. `layout={false}` prevents Framer interference with manual positioning.
- **Mobile:** Full-screen modals (`fixed inset-0`), slide-up animation, close button only.

### Dock Magnification

- Shared `mouseX` MotionValue → `useTransform` → `useSpring` — **zero React re-renders**
- 48px base → 80px peak, 150px radius
- macOS click behavior: no window → open; minimized → restore; focused → minimize; unfocused → focus
- Mobile: static 48px icons, full-width bar at z-200, no hover effects

### Soul Sync (Spotify Integration)

**Architecture:** First feature using server-side API routes. Both users authenticate via OAuth — no hardcoded tokens.

| Route | Purpose |
|-------|---------|
| `GET /api/auth/spotify/login?user=admin\|neo` | Redirects to Spotify with CSRF state in httpOnly cookie |
| `GET /api/auth/spotify/callback` | Exchanges code for tokens, upserts refresh_token to Supabase |
| `GET /api/auth/spotify/status` | Returns `{ configured }` for env var validation |
| `GET /api/soul-sync` | Fetches both users' playback in parallel, computes resonance |

**Resonance Detection:** When both users play the same track (matching `trackUri`), the widget triggers glowing card borders, a pulsing sync heart with ripple reverberations, and a one-time notification.

**SyncHeart States:**
- Neither connected: faint outline
- Admin only: left half filled red (CSS `clipPath`)
- Neo only: right half filled red
- Both connected: full red fill + scale pulse (1 → 1.15 → 1) + 3 staggered ripple outlines expanding outward

**Token Security:** Refresh tokens stored server-side in Supabase. Automatic token rotation handled (if Spotify issues new refresh token during refresh, it's upserted back).

### Love Letters (Real-Time Collaboration)

- Tiptap rich text editor with `immediatelyRender: false` (SSR-safe)
- Debounced auto-save: 2s for content, 500ms for title/author
- Supabase real-time subscription for multi-user sync
- Session-based deduplication prevents self-notifications
- Polling fallback every 8s if WebSocket disconnects
- Mobile: list/detail navigation with Back button

### Mobile Responsiveness

All components branch on `useIsMobile()` (SSR-safe `matchMedia` at 768px):

| Component | Desktop | Mobile |
|-----------|---------|--------|
| Windows | Draggable/resizable, absolute positioned | Full-screen modal, slide-up animation, close only |
| Desktop Icons | Absolute positioned, drag + double-click | Flex grid, single-tap to open |
| Dock | Centered bar, magnification effect | Full-width bar, static 48px icons, z-200 |
| Love Letters | Side-by-side sidebar + editor | List/detail navigation with Back button |
| Settings | Left sidebar tabs | Horizontal pill tab bar |

Boot screen (1.5s) covers any SSR→client hydration flash.

---

## API Routes

| Endpoint | Method | Auth | Cache | Description |
|----------|--------|------|-------|-------------|
| `/api/auth/spotify/login` | GET | None | Dynamic | OAuth redirect with CSRF state cookie |
| `/api/auth/spotify/callback` | GET | Spotify code | Dynamic | Token exchange + Supabase upsert |
| `/api/auth/spotify/status` | GET | None | Dynamic | Env var configuration check |
| `/api/soul-sync` | GET | None | `no-store` | Dual Spotify playback aggregation |

All routes create fresh Supabase clients (not the potentially-null client singleton) for reliability.

---

## Database Schema

### `love_letters`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| title | TEXT | Letter title |
| content | TEXT | Tiptap HTML content |
| author | TEXT | "Mduduzi" or "Neo" |
| is_sealed | BOOLEAN | Sealed letters are read-only |
| theme | TEXT | 'classic' / 'valentine' / 'dark' |
| created_at | TIMESTAMPTZ | Auto-generated |

### `spotify_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| user_alias | TEXT (UNIQUE) | 'admin' or 'neo' |
| refresh_token | TEXT | Spotify OAuth refresh token |
| updated_at | TIMESTAMPTZ | Last token refresh |

Both tables use open RLS policies (personal two-user project).

---

## Environment Variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Supabase anonymous key |
| `SPOTIFY_CLIENT_ID` | Server only | Spotify app client ID |
| `SPOTIFY_CLIENT_SECRET` | Server only | Spotify app secret |
| `NEXT_PUBLIC_BASE_URL` | Client + Server | App base URL (for OAuth redirect) |

---

## Commit History (14 commits)

| Hash | Description |
|------|-------------|
| `b2967c2` | docs: update patch notes to v1.0.3, update all reference docs with Soul Sync |
| `1d03702` | feat: dynamic sync heart with half-fill and ripple effects |
| `ee5f175` | feat: add Neo to Soul Sync — dual playback + resonance effect |
| `a278f89` | fix: clean up Spotify status route |
| `110675e` | debug: add console logs to Spotify OAuth flow |
| `d9f2768` | fix: add missing Spotify config check in SoulSync |
| `33b2a8f` | feat: add Spotify Soul Sync app with OAuth, error boundary, and bug fixes |
| `eab5ae3` | feat: add Patch Notes app with version button in MenuBar |
| `1c57656` | feat: mobile responsiveness sprint — full-screen apps, touch dock, flex icons |
| `db38c4a` | feat: add delete feature, mobile responsiveness, and notifications |
| `fa6bdd0` | feat: add realtime sync and notifications for Love Letters |
| `26728a8` | feat: add Tiptap editor and Love Letters app features |
| `43284d4` | feat: add Supabase integration and Love Letters app |
| `366656a` | feat: implement core OS features — window system, Finder, file system, boot sequence |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **1.0.3** | Feb 16, 2026 | Neo dual playback, resonance detection, dynamic sync heart with ripple reverberations |
| **1.0.2** | Feb 16, 2026 | Soul Sync Spotify integration, OAuth flow, server-side API routes, config check screen |
| **1.0.1** | Feb 15, 2026 | Settings app (uptime, wallpapers, specs), full mobile responsiveness sprint |
| **1.0.0** | Feb 15, 2026 | Initial release: window system, Finder, Love Letters, dock, boot sequence, notifications |

---

## Design Tokens

| Token | Value |
|-------|-------|
| Glassmorphism | `backdrop-blur-2xl bg-white/10 border border-white/20` |
| Window bg | `bg-white/80 backdrop-blur-xl border border-white/30` |
| Traffic lights | Red `#ff5f57`, Yellow `#febc2e`, Green `#28c840` |
| Window corners | `rounded-lg` (8px) |
| Shadows | Windows `shadow-2xl`, Dock `shadow-lg` |
| Soul Sync bg | `bg-gradient-to-br from-[#1a0a2e] to-[#2d1b4e]` |
| Resonance glow | `ring-2 ring-pink-400 shadow-[0_0_25px_rgba(244,114,182,0.4)]` |
| Mobile breakpoint | 768px (`useIsMobile` hook) |

---

## Known Gotchas

1. Directory name `ValentineOS` has capitals — `create-next-app` rejects it; project was set up manually
2. `appRegistry.tsx` must be `.tsx` (not `.ts`) — placeholder components contain JSX
3. Next.js 14 + Tailwind requires `autoprefixer` as explicit dev dependency
4. Tiptap: always set `immediatelyRender: false` in `useEditor` for SSR compatibility
5. Never call Supabase on every keystroke — debounce all writes
6. JSX comments `{/* */}` at start of ternary branches cause build errors — use `//` instead
7. Framer Motion hooks (`useTransform`/`useSpring`) must always be called (React rules) — override output with static style on mobile
8. Mobile dock must be `z-[200]` (above full-screen windows at z-100+)
9. CSS `background` shorthand resets `backgroundSize` — use `backgroundImage` separately for wallpapers
10. Next.js 14 viewport must be `export const viewport: Viewport` (not inside `metadata`)
11. Stale `.next` cache causes "Cannot find module" errors — fix with `rm -rf .next`

---

## Quality Assessment

### Strengths
- **Architecture:** Clean separation of concerns with atomic state, config-driven apps, and normalized data structures
- **Type Safety:** Strict TypeScript throughout, no `any` usage, all props and atoms typed
- **Animations:** Production-quality animations with zero-rerender dock magnification and spring-based window transitions
- **Responsive:** Full mobile support without breaking desktop experience
- **Security:** OAuth CSRF protection, server-side token handling, httpOnly cookies
- **Documentation:** Comprehensive docs (CLAUDE.md, reference.md, implementation-details.md, ticket-history.md)
- **Error Handling:** Graceful Supabase fallback, safe defaults in services, config check screens

### Recommendations for Future Sprints
1. **Testing:** Add Vitest + React Testing Library for component and integration tests
2. **Error Telemetry:** Integrate Sentry or similar for production error tracking
3. **Rate Limiting:** Add rate limits to API routes (especially `/api/soul-sync`)
4. **Image Optimization:** Use `next/image` for album art and wallpaper thumbnails
5. **PWA:** Add service worker + manifest for installable web app experience
6. **Browser App:** Replace placeholder with embedded iframe or custom web view
7. **`.env.example`:** Create example env file documenting required variables

---

*Report generated from codebase analysis at commit `b2967c2` on branch `master`.*
