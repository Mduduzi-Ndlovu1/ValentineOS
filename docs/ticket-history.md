# Ticket History

All tickets completed in order:

## TICKET-001: Project Scaffolding & Types
- Manually set up Next.js 14 (create-next-app rejected the directory name `ValentineOS` due to npm capital letter restriction)
- Installed: jotai, framer-motion, gsap, lucide-react, daisyui, autoprefixer
- Created `src/types/os.ts` with all type definitions
- Created `src/config/appRegistry.tsx` with 3 dummy apps

## TICKET-002: The Viewport & Wallpaper Engine
- Created `Desktop` component with `100dvh` lock
- `globals.css` locks `html, body` to fixed position with `overflow: hidden`
- Jotai `wallpaperAtom` with Valentine Unsplash image, gradient fallback on error
- Jotai `Provider` wrapper in `src/store/provider.tsx`
- Root layout wraps app in `JotaiProvider`, sets `data-theme="valentine"`

## TICKET-003: The Dock (Visuals & Motion)
- `Dock` component: glassmorphism bar fixed at bottom center
- `DockIcon` component: `useTransform` + `useSpring` magnification wave effect
- Shared `mouseX` MotionValue pattern (set to `Infinity` on mouse leave)
- Active app indicator dot below icon

## TICKET-004: Draggable Desktop Icons
- `DesktopIcon` component with Framer Motion `drag` + `dragMomentum={false}`
- Positions persist in `desktopIconsAtom` (updated on `onDragEnd`)
- Icons initialized in vertical grid (40px from left, 100px spacing)
- Double-click opens app via `openWindowAtom`

## TICKET-005: The Window System (Core)
- `WindowFrame`: absolute-positioned div with pointer-event drag and 8 resize handles
- `WindowTitleBar`: traffic light buttons + pointer-capture drag
- `WindowManager`: reads `openWindowsAtom`, renders non-minimized windows
- Z-index stacking via monotonic counter (starts at 100)
- Maximize stores `preMaximizeRect`, restores on un-maximize
- Minimum window size enforced at 300x200

## TICKET-006: App Integration
- Dock clicks connected to window system (open/minimize/restore/focus)
- Desktop icon double-click opens apps
- macOS-style dock behavior fully implemented

## TICKET-007: File System & Finder
- Created `src/types/fs.ts` with `ItemType`, `FileSystemItem`, `FileSystemState`
- Created `src/config/initialFileSystem.ts` — normalized mock database with root → home → desktop/documents/downloads/pictures, populated with text files and Unsplash images
- Created `src/store/atoms/filesystem.ts` — `fileSystemAtom` + 3 derived read-only atoms (`folderContentsAtom`, `fileSystemItemAtom`, `breadcrumbAtom`)
- Created `src/components/apps/finder/Finder.tsx` — full Finder with sidebar, back/forward navigation (history stack), breadcrumbs, icon grid, single-click select, double-click navigate/open
- Updated `src/config/appRegistry.tsx` — replaced Finder placeholder with real `Finder` component

## TICKET-008: Window Animations & Boot Sequence
- Wrapped `WindowManager` rendering in `<AnimatePresence>` for exit animation support
- Converted `WindowFrame` outer `<div>` to `motion.div` with spring-based entry/exit animations (scale 0.95 + y: 20 → full size; exit with blur(10px))
- `layout={false}` prevents Framer Motion from animating position/size changes during drag/resize
- Added `BootScreen` component inside `Desktop.tsx` — black overlay with animated pink heart logo + "ValentineOS" text, auto-dismisses after 1.5s
- Boot overlay fades out via `AnimatePresence` exit animation (0.6s ease-in-out)
- Desktop icons and Dock slide up from `y: 100` with staggered spring animations after boot completes
- Icons stagger by `i * 0.05s` delay for a cascading reveal effect

## TICKET-009: Preview Engine & File Associations
- `WindowInstance` has `props` field for passing data to apps
- Created `TextEditor.tsx` — monospace text display with glassmorphism
- Created `ImageViewer.tsx` — centered image with dark background
- Updated `appRegistry.tsx` with text-editor and image-viewer entries
- Created `fileActions.ts` — `openFileAtom` dispatcher
- Finder double-click wired to open appropriate app based on file type

## TICKET-011: Supabase Integration
- Created `src/lib/supabase.ts` — Supabase client with graceful fallback if env vars missing
- Created `src/types/letters.ts` — `LoveLetter` interface matching SQL table
- Created `src/services/letterService.ts` — CRUD functions: fetchLetters, createLetter, updateLetter, sealLetter
- Created `src/store/atoms/letters.ts` — Jotai atoms: lettersAtom, loadLettersAtom

## TICKET-012: Love Letters App UI
- Created `src/components/apps/LoveLetters/LoveLetters.tsx` — Main container with sidebar + wood desk background
- Created `src/components/apps/LoveLetters/LetterSidebar.tsx` — Glassmorphism sidebar listing letters by date
- Created `src/components/apps/LoveLetters/Stationery.tsx` — Paper component with lined texture and wax seal
- Added Dancing Script font to `src/app/layout.tsx`
- Updated `AppID` type to include "love-letters"
- Updated appRegistry with Love Letters entry

## TICKET-013: Tiptap Editor Integration
- Installed Tiptap packages: @tiptap/react, @tiptap/starter-kit, @tiptap/extension-placeholder, @tiptap/extension-typography
- Created `src/components/apps/LoveLetters/LetterEditor.tsx` — Headless Tiptap editor
- Added `.tiptap-editor` styles in `globals.css` with Dancing Script font
- Fixed SSR hydration error with `immediatelyRender: false`
- Added debounce auto-save (2s for content, 500ms for title/author)
- Added "Saving..." / "Draft saved" indicators
- Added "New Letter" button (+ in sidebar)
- Added "Save" button (saves + seals) and "Seal" button
- Updated wax seal to use Heart icon
- Fixed input lag with proper debouncing and local state

## MR-001: Mobile Viewport & Grid Stability
- Created `src/hooks/useIsMobile.ts` — SSR-safe matchMedia hook at 768px breakpoint, exports `MOBILE_BREAKPOINT`
- Updated `src/app/layout.tsx` — Added `export const viewport: Viewport` with `maximumScale: 1, userScalable: false`
- Updated `src/app/globals.css` — Added `overscroll-behavior: none` and `touch-action: manipulation` to body
- Updated `Desktop.tsx` — Mobile icons rendered in flex-wrap grid (`flex flex-wrap gap-4 p-4 pt-10 content-start`) instead of absolute positioning
- Updated `DesktopIcon.tsx` — Accepts `isMobile` prop; mobile: no drag, single-tap to open (`onClick` instead of `onDoubleClick`)

## MR-002: Modal Window Manager
- Updated `WindowFrame.tsx` — Mobile: `fixed inset-0 rounded-none` full-screen modal, slide-up animation (`y: "100%"`), resize handles hidden
- Updated `WindowTitleBar.tsx` — Mobile: only close button (w-5 h-5), hide minimize/maximize, `h-10 px-4` title bar, drag disabled

## MR-003: Touch-Friendly Dock
- Updated `Dock.tsx` — Mobile: full-width bar at `z-[200]`, no mouse tracking, `justify-evenly`
- Updated `DockIcon.tsx` — Mobile: static 48px icons (no magnification), `useTransform`/`useSpring` still called but overridden by static style, active dot hidden

## MR-004: Responsive App Layouts
- Updated `Finder.tsx` — Removed `order-2 md:order-1` / `order-1 md:order-2` swap so sidebar stays on top on mobile
- Updated `LoveLetters.tsx` — Mobile list/detail navigation: shows either LetterSidebar or Back+Stationery, with `handleBackToList()` setting `selectedLetterId` to null
- Updated `LetterSidebar.tsx` — Delete button always visible on mobile: `opacity-60 md:opacity-0 md:group-hover:opacity-100`

## SETTINGS-001: Settings App ("The Heartbeat")
- Created `src/store/atoms/settings.ts` — `RELATIONSHIP_START_DATE`, `WALLPAPER_GALLERY` (6 Unsplash images), `selectedWallpaperIdAtom`, `calculateUptime()`, `Uptime` interface
- Created `src/hooks/useUptime.ts` — Ticking 1s interval hook using `calculateUptime()`
- Created `src/components/apps/Settings.tsx` — Full Settings app with 3 tabs:
  - "The Heart" (About): Pulsing heart + live uptime counter from relationship start date
  - "Wallpapers" (Display): 2x3 grid picker, writes to `wallpaperAtom`, checkmark on active
  - "System Specs": Easter egg specs (Heartbeat 5.0GHz, Infinite Memories, etc.)
- Responsive: sidebar (w-44) on desktop, horizontal pill tab bar on mobile
- Updated `appRegistry.tsx` — Replaced placeholder with real `SettingsApp` import, bumped size to 650x500

## SETTINGS-002: Wallpaper Fit & Date Config
- Changed `RELATIONSHIP_START_DATE` to `"2025-08-28"`
- Fixed `Desktop.tsx` wallpaper rendering: uses `backgroundImage` (not `background` shorthand) to prevent CSS shorthand from resetting `backgroundSize: "cover"`

## PATCH-NOTES: Patch Notes App
- Created `src/components/apps/PatchNotes.tsx` — Version changelog display
- Added `"patch-notes"` to `AppID` union in `src/types/os.ts`
- Registered in `appRegistry.tsx` with `Sparkles` icon (550x600)
- Added to `MenuBar.tsx` for quick access

## SOUL-SYNC-001: Spotify OAuth & Aggregation API
- Created `src/types/spotify.ts` — `SpotifyToken`, `SpotifyTrack`, `UserPlaybackStatus`, `SoulSyncResponse`
- Created `src/app/api/auth/spotify/login/route.ts` — OAuth redirect with `?user=admin|neo`, CSRF state + user alias in httpOnly cookies
- Created `src/app/api/auth/spotify/callback/route.ts` — Token exchange, upsert refresh_token to `spotify_tokens` table
- Created `src/app/api/auth/spotify/status/route.ts` — Returns `{ configured }` for env var check
- Created `src/app/api/soul-sync/route.ts` — Aggregation API fetching both users' Spotify status in parallel, computes resonance
- Handles Spotify token rotation (new refresh token upserted back to Supabase)
- Added `"soul-sync"` to `AppID` union in `src/types/os.ts`

## SOUL-SYNC-002: Soul Sync Widget
- Created `src/store/atoms/soulSync.ts` — data/loading/error atoms + fetch action
- Created `src/components/apps/SoulSync/SoulSync.tsx` — Dual-playback widget with:
  - Dark cosmic gradient UI, two PlayerCards side-by-side (stacked on mobile)
  - Config check screen when Spotify env vars missing
  - "Connect Spotify" button per user when disconnected
  - Album art, track name, artist, progress bar, status indicators
  - Resonance glow effect on both cards when playing same track
  - 10-second polling via setInterval + Jotai action atom
  - Notification on resonance start
- Registered in `appRegistry.tsx` with `Music` icon (700x450)
- Updated `Desktop.tsx` to handle `?connected=true` / `?spotify_error=*` query params

## SOUL-SYNC-003: Dynamic Sync Heart
- Added `SyncHeart` component with 4 visual states:
  - Neither connected: faint outline heart
  - Admin only: left half filled red (CSS clipPath)
  - Neo only: right half filled red (CSS clipPath)
  - Both connected: full red fill + pulsing scale + 3 staggered ripple reverberations
- AnimatePresence for smooth fill transitions

## PATCH-NOTES-002: Version Bump to 1.0.3
- Updated PatchNotes with 3 new versions (1.0.1, 1.0.2, 1.0.3) — newest on top
- v1.0.3: Soul Sync dual playback & resonance
- v1.0.2: Soul Sync Spotify integration
- v1.0.1: Settings & mobile responsiveness
- Changed `RELATIONSHIP_START_DATE` to `"2025-08-27"`

## BOOKSTORE-001: Bookstore App Scaffolding
- Created `src/types/books.ts` — Book, BestsellerItem, YouTubeVideo, NYTReview, EnrichedBookData interfaces
- Created API routes:
  - `/api/books/bestsellers` — NYT Bestsellers + Open Library cover backfill
  - `/api/books/search` — Google Books search with descriptions
  - `/api/books/enrich` — YouTube + NYT article enrichment
  - `/api/books/favorites` — Supabase CRUD for favorites
- Created `src/store/atoms/books.ts` — All book-related atoms and actions

## BOOKSTORE-002: Bookstore UI Components
- Created `src/components/apps/Bookstore/Bookstore.tsx` — Main container with search, trending, favorites
- Created `src/components/apps/Bookstore/BookCard.tsx` — Reusable book card component
- Created `src/components/apps/Bookstore/BookDetail.tsx` — Full-screen modal with cover, about, media hub
- Created `src/components/apps/Bookstore/TrendingSection.tsx` — Horizontal scroll for NYT Bestsellers
- Created `src/components/apps/Bookstore/FavoritesSection.tsx` — Grid of saved favorites
- Added custom colors to `tailwind.config.ts`: reader-cream (#F8F4E9), reader-beige (#E8DCCA), reader-brown (#3C2F2F)
- Added Montserrat + Libre Caslon Text fonts to `layout.tsx`
- Registered "bookstore" in appRegistry.tsx

## BOOKSTORE-003: Read Sample iFrame & Favorites
- Updated BookDetail with "Read Sample" button that opens Google Books preview in full-screen iframe
- Heart button saves book to favorites (Supabase)
- Favorites persist across sessions

## BOOKSTORE-004: Book Request Notifications (Neo → Admin)
- Created `/api/books/request` — POST/GET/PATCH for book requests
- Created `book_requests` table in Supabase
- Created `src/hooks/useBookRequests.ts` — Realtime subscription + OS notifications
- When Neo favorites a book: saves request to DB
- Admin loads app: fetches unread requests, shows notification, marks as read
- Shows toast + OS-level notification

## PREFERENCES-001: User Preferences Persistence
- Created `user_preferences` table in Supabase (wallpaper_url, preferences JSONB)
- Created `/api/user/preferences` — GET/POST for preferences
- Created `src/config/version.ts` — Single source of truth for version (reads from package.json)
- Updated `src/store/atoms/desktop.ts` with loadPreferencesAtom, savePreferenceAtom
- Desktop.tsx loads preferences on boot
- Settings.tsx saves wallpaper on change

## PATCH-NOTES-003: Version Bump to 1.1.0
- Version bumped to "1.1.0" in package.json
- Updated PatchNotes with v1.1.0 "The Reader's Nook" entry (story-bible noir style)
- Added NEW badge for unread patch notes:
  - Tracks last_read_version in user preferences
  - Shows pulsing "NEW" badge in MenuBar when unread
  - Marks as read when PatchNotes opens
- Updated story-bible.md with Chapter 5: "The Reader's Nook"

## CMP-001: Data Models
- Updated `src/types/os.ts` to include `"compass"` AppID.
- Created `src/types/compass.ts` with strict types: `CompassStatus`, `CompassCategory`, `CompassEvent`, `CompassState`.

## CMP-002: State Management
- Implemented `src/store/atoms/compass.ts` using Jotai.
- Created atoms for `compassEventsAtom`, loading, error, and filters.
- Implemented write-only actions (`fetch`, `add`, `update`, `delete`) with optimistic UI updates and error rollback.
- Integrated direct Supabase client.

## CMP-003: Sidebar Navigation
- Created `src/components/apps/Compass/CompassSidebar.tsx`.
- Implemented vertical navigation with Glassmorphism.
- Added `compassViewAtom` ("upcoming", "memories", "bucket-list", "map") to filter events.
- Integrated Lucide icons (Compass, History, Flag, Map) with active glow states.

## CMP-004: Event Cards & Grid
- Created `src/components/apps/Compass/EventCard.tsx` with "Noir" theme (dark glass).
- Created `src/components/apps/Compass/EventGrid.tsx` with responsive layout (`grid-cols-2` to `4`).
- Implemented loading skeletons and empty states ("No adventures found").

## CMP-006: Add Event Modal
- Created `src/components/apps/Compass/AddEventModal.tsx`.
- Implemented form with Title, Status, Category, Date, Location, Image URL.
- Used `framer-motion` for smooth modal transitions.

## CMP-007: App Shell Integration
- Created `src/components/apps/Compass/Compass.tsx` main shell.
- Integrated Sidebar, EventGrid, and Modal.
- Registered Compass in `src/config/appRegistry.tsx` (AppID: "compass", Icon: Compass).

## CMP-008: Splash Screen
- Created `src/components/apps/Compass/CompassSplash.tsx` with GSAP animations.
- Implemented spinning compass calibration effect on app launch.
- Integrated splash screen with `AnimatePresence` in `Compass.tsx`.

## CMP-009: Theme & Mobile Navigation
- Added `compassThemeAtom` ("light" | "dark") to state.
- Created `src/components/apps/Compass/CompassMobileNav.tsx` (fixed bottom bar).
- Updated Sidebar to hide on mobile.
- Implemented theme toggle (Sun/Moon) in header.

## CMP-010: Mobile First Refactor
- Refactored `Compass.tsx` to support `flex-col` (mobile) vs `flex-row` (desktop).
- Updated styling to support dynamic theme backgrounds (`bg-reader-cream` vs `bg-slate-900`).

## CMP-011: UI Redesign (WeShare Style)
- Redesigned `EventCard` to be landscape (aspect-video image + content below).
- Added floating date badge and avatar stack (Admin + Neo).
- Updated `EventGrid` to stagger animations using `framer-motion`.

## CMP-012: Explore Feed Backend
- Created `/api/compass/explore` API route.
- Integrated Ticketmaster Discovery API (proxy).
- Added `exploreEventsAtom` and `exploreSearchAtom` to store.

## CMP-013: Explore View
- Created `src/components/apps/Compass/ExploreView.tsx` with Search + City inputs.
- Integrated `searchExploreEventsAtom` to fetch real events.
- Added "Add to Compass" functionality for explored events.

## CMP-014: Event Detail Modal
- Created `src/components/apps/Compass/EventDetailModal.tsx` with large cover image and metadata grid.
- Integrated into Compass shell (opens on card click).

## CMP-015: Pricing & Geolocation
- Updated API to fetch `priceRanges`.
- Added price badges to Event Cards.
- Updated Explore View to auto-fetch events near user's geolocation on mount.

## UI-001: Mobile Dock Drawer
- Refactored `Dock.tsx` for mobile: Hidden by default, swipe up to reveal.
- Added "Drawer" animation with Framer Motion drag gestures.
- Implemented click-away to close.

## UI-002: Water Gel Theme (macOS Style)
- Updated `DesktopIcon.tsx` and `DockIcon.tsx` with "Water Gel" shader.
- Used complex Tailwind shadows (`inset`, `drop-shadow`) and gradients.
- Increased `backdrop-blur` for premium glass feel.

## REBRAND-001: Heartbeat
- Renamed "Soul Sync" to "Heartbeat" in registry and UI.
- Updated all apps to use transparent backgrounds (relying on WindowFrame glass).
- Refactored `WindowFrame` to use consistent `bg-white/10` + `backdrop-blur-xl`.

## PATCH-NOTES-004: Version Bump to 1.2.0
- Version bumped to "1.2.0" in package.json
- Updated PatchNotes with v1.2.0 "The Compass & The Canvas" entry
- Documented major UI overhaul and Compass app integration
- Updated dev-report.md with new version stats

## CMP-016: Modal Redesign
- Refactored AddEventModal and EventDetailModal with grid layouts.
- Increased padding for desktop, centered alignment.
- Compact header sizes and proper spacing.
- Added aspect ratios for cinematic image viewing.

## UI-003: Docs & Story Bible Update
- Updated story-bible.md with Chapter 6: "The Compass & The Canvas".
- Added new lore terms: The Compass, The Horizon, The Feed, The Gel, The Drawer.
- Updated ticket-history.md with all recent tickets.
