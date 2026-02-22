# Implementation Details

Detailed implementation notes for each subsystem.

---

## Dock Magnification Effect (`DockIcon.tsx`)
- Each icon receives a shared `mouseX` MotionValue from the parent `Dock`
- `useTransform` maps distance from mouse to icon center → icon size (48px base → 80px peak, 150px radius)
- `useSpring` smooths the transform with `{ mass: 0.1, stiffness: 150, damping: 12 }`
- Zero-rerender animation — all animation happens via MotionValues, not React state

## Window Drag (`WindowTitleBar.tsx`)
- Uses manual pointer events (`onPointerDown` / `onPointerMove` / `onPointerUp`)
- `setPointerCapture` ensures drag continues even if pointer leaves the element
- Only the title bar area is draggable (traffic light buttons are excluded via `data-traffic-light` attribute)
- Drag is disabled when window is maximized

## Window Resize (`WindowFrame.tsx`)
- 8 invisible resize handles positioned on edges (4px strips) and corners (12px squares)
- Pointer capture on `onPointerDown`, delta calculation on `onPointerMove`
- Direction-aware: east/south expand, west/north expand + shift position
- Enforces `MIN_WINDOW_WIDTH` (300) and `MIN_WINDOW_HEIGHT` (200)
- Resize handles hidden when window is maximized

## Z-Index Stacking
- `zIndexCounterAtom` starts at 100 (above dock's z-50)
- Each focus action increments the counter and assigns it to the focused window
- Monotonically increasing — no z-index collisions

## Dock Click Behavior (macOS-style)
1. No window for app → **open** new window
2. Window exists, is minimized → **restore** + focus
3. Window exists, is focused → **minimize**
4. Window exists, not focused → **focus** (bring to front)

## Desktop Icons
- Draggable via Framer Motion `drag` prop with `dragMomentum={false}`
- Constrained to desktop bounds via `dragConstraints={desktopRef}`
- Position synced to `desktopIconsAtom` on `onDragEnd`
- Double-click opens the corresponding app

## Wallpaper
- Default: `url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80)` (Valentine theme)
- Fallback: `linear-gradient(135deg, #f472b6 0%, #e11d48 50%, #be123c 100%)`
- Hidden `<img>` preloads the wallpaper; on error, switches to gradient fallback

## Finder App (`src/components/apps/finder/Finder.tsx`)
- **Sidebar** (w-48): Fixed quick-access links to Desktop, Documents, Downloads, Pictures + disabled Trash
- **Top bar**: Back/Forward navigation buttons (history stack + index), clickable breadcrumbs
- **Grid view**: `grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]` with file type icons
- **Navigation state**: `currentFolderId`, `historyStack[]`, `historyIndex` — all local `useState`
- **Single click** = select (blue ring highlight), **double-click folder** = navigate into, **double-click file** = open via `openFileAtom`
- **Icon colors**: folders = `text-blue-400`, files = `text-gray-400`
- **Empty state**: centered "This folder is empty" message
- Sidebar active item highlighted with `bg-black/10`

## Window Animations (`WindowFrame.tsx` + `WindowManager.tsx`)
- `AnimatePresence` wraps the window list in `WindowManager` — enables exit animations when windows are removed (closed/minimized)
- `motion.div` on `WindowFrame` with `layout={false}` — prevents Framer from interfering with manual drag/resize
- **Entry:** `{ opacity: 0, scale: 0.95, y: 20 }` → `{ opacity: 1, scale: 1, y: 0 }` (spring: stiffness 300, damping 30)
- **Exit:** `{ opacity: 0, scale: 0.95, filter: "blur(10px)" }` — fade + shrink + gaussian blur

## Boot Sequence (`Desktop.tsx`)
- `BootScreen` component: full-screen black overlay at `z-[9999]`, displays animated pink `<Heart>` icon + "ValentineOS" text
- Auto-dismisses after 1.5s via `setTimeout`, wrapped in `AnimatePresence` for smooth exit fade (0.6s)
- Dock and desktop icons use `isBooting` state to delay their slide-up entrance until boot completes
- Icons stagger with `delay: i * 0.05` for cascading reveal

## Mobile Responsiveness (`useIsMobile` hook + component branches)

### `useIsMobile()` (`src/hooks/useIsMobile.ts`)
- SSR-safe: returns `false` on server, hydrates on client via `matchMedia`
- `MOBILE_BREAKPOINT = 768` exported for reuse
- Listens to `change` event on `MediaQueryList` — no polling
- The 1.5s boot screen covers any hydration flash from SSR `false` → client `true`

### Mobile Windows (`WindowFrame.tsx` + `WindowTitleBar.tsx`)
- On mobile: `fixed inset-0 w-full h-full rounded-none` — full-screen modal
- Only `zIndex` passed as inline style (no width/height — CSS handles it)
- Animation: `mobileWindowVariants` — slide up from `y: "100%"` with spring (stiffness 300, damping 30)
- Title bar: only close button (red, `w-5 h-5`), minimize/maximize hidden
- Drag disabled: pointer handlers return early when `isMobile`
- Resize handles hidden with `!isMobile &&` guard
- Title bar height increased: `h-10 px-4` (vs desktop `h-8 px-3`)

### Mobile Desktop Icons (`DesktopIcon.tsx`)
- On mobile: no Framer Motion `drag`, no `dragConstraints`, no `onDragEnd`
- Uses `onClick` (single tap) instead of `onDoubleClick`
- Rendered in flex-wrap container by parent `Desktop.tsx`

### Mobile Dock (`Dock.tsx` + `DockIcon.tsx`)
- On mobile: full-width bar `bottom-0 left-0 right-0`, `z-[200]` (above windows at z-100+)
- No `onMouseMove`/`onMouseLeave` handlers — touch doesn't support hover
- `DockIcon`: `useTransform`/`useSpring` still called (React hooks rules) but overridden by static `{ width: 48, height: 48 }` style
- Active indicator dot hidden on mobile

### Mobile Love Letters (`LoveLetters.tsx`)
- List/detail navigation pattern: `isMobile` + `selectedLetterId`
  - No letter selected → full-height `LetterSidebar`
  - Letter selected → Back button bar + `Stationery` editor
  - `handleBackToList()` sets `selectedLetterId` to `null`
- Desktop layout unchanged (side-by-side)
- `LetterSidebar.tsx`: delete button always visible on mobile (`opacity-60 md:opacity-0 md:group-hover:opacity-100`)

---

## Settings App (`src/components/apps/Settings.tsx`)

### Architecture
- 3 tabs: `"about"` | `"display"` | `"system"` — local `useState` for active tab
- Responsive layout: sidebar (`w-44`) on desktop, horizontal pill tab bar on mobile
- Each tab is a separate function component: `AboutTab`, `DisplayTab`, `SystemTab`

### About Tab ("The Heart")
- Pulsing heart animation: `scale: [1, 1.15, 1]` repeating (Framer Motion)
- Live uptime counter via `useUptime()` hook — ticks every 1 second
- `calculateUptime()` in `settings.ts`: pure function, computes years/days/hours/minutes/seconds from `RELATIONSHIP_START_DATE`
- Uptime units rendered as rose-themed cards with `tabular-nums` for stable digit width

### Display Tab ("Wallpapers")
- Reads `WALLPAPER_GALLERY` (6 Unsplash presets) from `settings.ts`
- On click: sets `selectedWallpaperIdAtom` + writes `url(...)` to `wallpaperAtom`
- Active wallpaper shows rose checkmark badge and glowing border
- Grid: `grid-cols-2 md:grid-cols-3`, aspect-video thumbnails with lazy loading

### System Specs Tab
- Easter egg: "Heartbeat 5.0GHz", "Infinite Memories", "Rose-Tinted Glasses", etc.
- Rose-themed spec cards with Lucide icons

---

## Soul Sync — Spotify Widget (`src/components/apps/SoulSync/SoulSync.tsx`)

### OAuth Flow (First API Routes in the Project)
- **Login:** `/api/auth/spotify/login?user=admin|neo` — redirects to Spotify authorize, stores CSRF `state` + `user_alias` in httpOnly cookies (10min TTL)
- **Callback:** `/api/auth/spotify/callback` — validates CSRF state, exchanges code for tokens, upserts `refresh_token` into `spotify_tokens` table keyed by `user_alias`
- **Status:** `/api/auth/spotify/status` — returns `{ configured: boolean }` (checks env vars)
- Both users connect via the same flow — no hardcoded tokens

### Aggregation API (`/api/soul-sync`)
- `getRefreshToken(userAlias)` — reads from Supabase `spotify_tokens` table
- `refreshAccessToken(refreshToken, userAlias)` — POSTs to Spotify `/api/token`, handles token rotation (if Spotify issues new refresh token, upserts back to Supabase)
- `getSpotifyStatus(refreshToken, userAlias)` — gets access token, fetches `/v1/me/player/currently-playing` with `cache: 'no-store'`
- Both users fetched in parallel via `Promise.all`
- Resonance computed server-side: both `isPlaying` + same `trackUri`
- Response: `{ admin, neo, isResonating }` with `Cache-Control: no-store`

### Widget Component
- Dark cosmic gradient background (`from-[#1a0a2e] to-[#2d1b4e]`)
- Config check on mount via `/api/auth/spotify/status` — shows setup screen if env vars missing
- Polls `/api/soul-sync` every 10 seconds via `setInterval` + `fetchSoulSyncAtom`
- Two `PlayerCard` components: album art (160x160), track name, artist, progress bar, status text
- Disconnected state: "Connect Spotify" button links to `/api/auth/spotify/login?user=<alias>`
- Resonating state: glowing `ring-2 ring-pink-400 shadow-[0_0_25px]` on both cards
- Mobile responsive: cards stack vertically via `useIsMobile`

### SyncHeart Component (Center Heart Indicator)
- **Neither connected:** Faint outline heart (`text-white/15`)
- **Admin only (left):** Left half filled red via `clipPath: "inset(0 50% 0 0)"`
- **Neo only (right):** Right half filled red via `clipPath: "inset(0 0 0 50%)"`
- **Both connected:** Full solid red fill (`fill-rose-500`), pulsing scale animation (`scale: [1, 1.15, 1]`, 1.2s repeat), 3 staggered ripple outlines expanding + fading (`scale: [1, 2.2]`, `opacity: [0.5, 0]`, stagger delay 0.6s each)
- Uses `AnimatePresence` for smooth fill/unfill transitions

### Jotai Atoms (`src/store/atoms/soulSync.ts`)
- `soulSyncDataAtom` — holds `SoulSyncResponse | null`
- `soulSyncLoadingAtom` / `soulSyncErrorAtom` — loading/error state
- `fetchSoulSyncAtom` — write-only action, fetches `/api/soul-sync`

### Supabase Table
```sql
spotify_tokens (id UUID PK, user_alias TEXT UNIQUE, refresh_token TEXT, updated_at TIMESTAMPTZ)
```
- RLS: open policy (personal two-user project)

---

## Wallpaper Rendering Fix (`Desktop.tsx`)
- Uses `backgroundImage` CSS property (not `background` shorthand) for wallpaper URLs
- Prevents CSS shorthand from resetting `backgroundSize`, `backgroundPosition`, `backgroundRepeat`
- Gradient fallback still uses `background` shorthand (no sizing needed)
```tsx
style={
  useFallback
    ? { background: fallback }
    : {
        backgroundImage: wallpaper,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
}
```

---

## Bookstore App — "The Reader's Nook" (`src/components/apps/Bookstore/`)

### Architecture
- Mobile-first design with warm cream (#F8F4E9), beige (#E8DCCA), and brown (#3C2F2F) color palette
- Fonts: Montserrat (headings), Libre Caslon Text (body) — loaded via `next/font/google`
- Three main sections: Search bar, Trending (NYT Bestsellers), Favorites

### API Routes (`src/app/api/books/`)

| Endpoint | Method | Source | Output |
|----------|--------|--------|--------|
| `/api/books/bestsellers` | GET | NYT Books API + Open Library (cover backfill) | `BestsellerItem[]` |
| `/api/books/search` | GET | Google Books API | `Book[]` with descriptions |
| `/api/books/enrich` | GET | YouTube Data API + NYT Reviews API | `{ videos, reviews }` |
| `/api/books/favorites` | GET/POST/DELETE | Supabase `book_favorites` table | Favorites CRUD |
| `/api/books/request` | GET/POST/PATCH | Supabase `book_requests` table | Request notifications |

### Book Detail View (`BookDetail.tsx`)
- Full-screen modal with edge-to-edge book cover (using `object-contain` to prevent stretching)
- "Read Sample" button: Opens Google Books preview in full-screen iframe
- Heart button: Saves to favorites + sends request notification (Neo → Admin)
- Media Hub: YouTube video cards + NYT article links

### State Management (`src/store/atoms/books.ts`)
- `searchQueryAtom`, `bestsellersAtom`, `searchResultsAtom`
- `currentBookAtom`, `enrichmentDataAtom`, `favoritesAtom`
- Actions: `fetchBestsellersAtom`, `fetchSearchAtom`, `fetchEnrichmentAtom`
- Favorites synced with Supabase `book_favorites` table

### Book Request Notifications

#### Flow
1. Neo clicks heart on a book → Saves to favorites + POSTs to `/api/books/request`
2. Request saved to `book_requests` table with `from_user: 'neo'`, `to_user: 'admin'`
3. Admin loads app → Fetches unread requests → Shows notification → Marks as read

#### Real-time (Optional)
- Supabase Realtime subscription to `book_requests` table
- Instant notification when new INSERT happens

#### OS-Level Notifications
- Uses Browser Notification API: `Notification.requestPermission()` + `new Notification(...)`
- Requests permission on hook mount

#### Files
- **API:** `src/app/api/books/request/route.ts`
- **Hook:** `src/hooks/useBookRequests.ts`
- **Table:** `book_requests` (id, from_user, to_user, book_title, book_author, book_cover_url, is_read, created_at)

---

## User Preferences Persistence (`src/store/atoms/desktop.ts`)

### Problem
Wallpaper resets to default on login (stored only in memory).

### Solution
- Created `user_preferences` table in Supabase
- Load preferences on boot via `loadPreferencesAtom(userAlias)`
- Save on change via `savePreferenceAtom({ userAlias, key, value })`

### Database Schema
```sql
user_preferences (
  id UUID PK,
  user_alias TEXT UNIQUE,  -- 'admin' | 'neo'
  wallpaper_url TEXT,
  preferences JSONB,       -- flexible key-value store
  updated_at TIMESTAMPTZ
)
```

### API (`src/app/api/user/preferences/route.ts`)
- `GET ?userAlias=admin|neo` — returns `{ wallpaper_url, preferences }`
- `POST` — upserts preferences (wallpaper_url + JSONB merge)

### Usage
- **Desktop.tsx:** Calls `loadPreferences(userAlias)` after boot when user is known
- **Settings.tsx:** Calls `savePreference({ userAlias, key: 'wallpaper_url', value: ... })` on wallpaper change

---

## Patch Notes Version System

### Single Source of Truth
- Version defined in `package.json` → `"version": "1.1.0"`
- `src/config/version.ts` reads from package.json:
  ```ts
  import packageJson from "../../package.json";
  export const OS_VERSION = packageJson.version;
  ```
- `PatchNotes.tsx` and `MenuBar.tsx` import from `version.ts`

### NEW Badge for Unread Versions
- Tracks `last_read_version` in user preferences (JSONB)
- `hasNewVersionAtom` computed: `lastReadVersion !== OS_VERSION`
- MenuBar shows pulsing "NEW" badge when `hasNewVersionAtom` is true
- Opens PatchNotes → calls `markVersionReadAtom(userAlias)` → saves current version to preferences

### Files
- **Config:** `src/config/version.ts`
- **Atoms:** `src/store/atoms/desktop.ts` (hasNewVersionAtom, markVersionReadAtom)
- **Component:** `src/components/ui/MenuBar.tsx`

---

## Compass (Travel & Events)
- **Goal:** Shared itinerary and event discovery.
- **State:** `src/store/atoms/compass.ts`.
- **Backend:**
  - Supabase `compass_events` table (CRUD).
  - Ticketmaster API via `/api/compass/explore` (proxy).
- **Features:**
  - **Cardinal Navigation:** North (Upcoming), South (Memories), East (Bucket List), West (Explore).
  - **Explore Feed:** Geolocation-based event search (50mi radius).
  - **Pricing:** Extracts min/max price from API.
  - **Themes:** Light/Dark mode support.

## UI Overhaul (v1.2.0)
- **Heartbeat:** Rebranded from Soul Sync. Transparent glass UI.
- **Water Gel Icons:** Desktop and Dock icons now use a complex Tailwind shadow/gradient stack to mimic macOS Big Sur "squircle" icons.
- **Mobile Dock:** Drawer-style interaction (swipe up to reveal).
- **Glassmorphism:** Global `WindowFrame` update (`bg-white/10`, `backdrop-blur-xl`).

---

## Gotchas & Lessons Learned

1. **Directory name** — `ValentineOS` has capitals; `create-next-app` rejects this for npm naming. Used manual Next.js setup instead.
2. **JSX in config** — `appRegistry` has placeholder React components with JSX, so it must be `.tsx` not `.ts`.
3. **autoprefixer** — Next.js 14 with Tailwind requires `autoprefixer` as an explicit dev dependency.
4. **Old files** — When converting from a plain TS project, leftover `src/index.ts` caused build failure. Must clean up.
5. **Tiptap SSR** — Always set `immediatelyRender: false` in useEditor to avoid hydration mismatches in Next.js.
6. **Input lag** — Never call database updates on every keystroke. Use debouncing + local state to prevent UI lag.
7. **JSX comments in ternary** — `{/* */}` at the start of a ternary branch causes `Unexpected token` build errors. Use `//` JS comments instead.
8. **Framer Motion hooks on mobile** — `useTransform`/`useSpring` must always be called (React rules). Override output with static style instead of conditional skipping.
9. **Mobile dock z-index** — Must be `z-[200]`, not `z-50`. Full-screen windows use z-100+, so dock at z-50 gets hidden behind them.
10. **CSS `background` shorthand** — Resets `backgroundSize` to `auto`. Use `backgroundImage` separately when `backgroundSize: "cover"` is needed.
11. **Next.js 14 Viewport export** — Must be a separate `export const viewport: Viewport`, not nested inside `metadata`.
