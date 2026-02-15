# Reference — Types, Atoms, Registry & Design Tokens

Detailed reference for the type system, Jotai atom architecture, app registry, file system tree, and design tokens.

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: Jotai Provider, Dancing Script font, DaisyUI valentine theme
│   ├── page.tsx                # Single page: renders <Desktop />
│   └── globals.css             # Tailwind directives + body overflow lock + Tiptap editor styles
├── components/
│   ├── apps/
│   │   ├── finder/
│   │   │   └── Finder.tsx      # Full Finder app: sidebar, breadcrumbs, grid view, navigation
│   │   ├── TextEditor.tsx      # Read-only text/code viewer (monospace <pre>)
│   │   ├── ImageViewer.tsx     # Image preview (centered <img>, dark bg)
│   │   ├── Settings.tsx        # System Preferences: uptime, wallpaper picker, system specs
│   │   ├── PatchNotes.tsx      # Version changelog display (v1.0.3)
│   │   ├── SoulSync/
│   │   │   └── SoulSync.tsx    # Spotify dual-playback widget with OAuth, resonance, sync heart
│   │   └── LoveLetters/
│   │       ├── LoveLetters.tsx  # Main container with sidebar + desk background
│   │       ├── LetterSidebar.tsx # Glassmorphism sidebar with + button
│   │       ├── LetterEditor.tsx  # Tiptap rich text editor
│   │       └── Stationery.tsx   # Paper component with lined texture
│   ├── desktop/
│   │   ├── Desktop.tsx         # Full-screen container, wallpaper bg, renders icons + dock + window manager
│   │   └── DesktopIcon.tsx     # Individual draggable icon (Framer Motion drag, double-click to open app)
│   ├── dock/
│   │   ├── Dock.tsx            # Glassmorphism bottom bar, shared mouseX MotionValue
│   │   └── DockIcon.tsx        # Magnification wave effect + click-to-open/minimize/restore/focus logic
│   └── window/
│       ├── WindowManager.tsx   # Maps openWindowsAtom → WindowFrame instances (filters out minimized)
│       ├── WindowFrame.tsx     # Draggable/resizable window shell with 8 resize handles
│       └── WindowTitleBar.tsx  # Traffic lights (close/min/max) + pointer-event drag handle
├── config/
│   ├── appRegistry.tsx         # APP_REGISTRY array + APP_REGISTRY_MAP (O(1) lookup) + getAppEntry()
│   └── initialFileSystem.ts     # Normalized mock file system data (folders, files, images)
├── hooks/
│   ├── useIsMobile.ts          # SSR-safe mobile breakpoint hook (768px matchMedia)
│   ├── useUptime.ts            # Ticking relationship uptime counter (1s interval)
│   └── useGlobalRealtime.ts    # Supabase realtime subscription hook
├── app/
│   └── api/
│       ├── auth/spotify/
│       │   ├── login/route.ts      # Spotify OAuth redirect (accepts ?user=admin|neo)
│       │   ├── callback/route.ts   # OAuth callback → upserts refresh_token to Supabase
│       │   └── status/route.ts     # Returns { configured: boolean } for env var check
│       └── soul-sync/route.ts      # Aggregation API: fetches both users' Spotify status
├── lib/
│   └── supabase.ts             # Supabase client with graceful fallback
├── services/
│   └── letterService.ts        # CRUD: fetchLetters, createLetter, updateLetter, sealLetter
├── store/
│   ├── actions/
│   │   └── fileActions.ts      # openFileAtom — maps file types to app windows
│   ├── atoms/
│   │   ├── desktop.ts          # wallpaperAtom, wallpaperFallbackAtom, desktopIconsAtom
│   │   ├── filesystem.ts       # fileSystemAtom, folderContentsAtom, fileSystemItemAtom, breadcrumbAtom
│   │   ├── letters.ts          # lettersAtom, loadLettersAtom
│   │   ├── settings.ts         # RELATIONSHIP_START_DATE, WALLPAPER_GALLERY, selectedWallpaperIdAtom, calculateUptime
│   │   ├── soulSync.ts        # soulSyncDataAtom, soulSyncLoadingAtom, fetchSoulSyncAtom
│   │   └── windows.ts          # openWindowsAtom, focusedWindowAtom, zIndexCounterAtom + 6 action atoms
│   └── provider.tsx            # "use client" Jotai Provider wrapper
└── types/
    ├── spotify.ts              # SpotifyToken, SpotifyTrack, UserPlaybackStatus, SoulSyncResponse
    ├── fs.ts                   # File system types: ItemType, FileSystemItem, FileSystemState
    ├── letters.ts              # LoveLetter interface
    └── os.ts                   # All OS type definitions + window size constants
```

### Config Files (root)

- `package.json` — name: `valentine-os` (lowercase, npm requires this)
- `tsconfig.json` — strict, bundler module resolution, `@/*` path alias
- `next.config.mjs` — empty (default Next.js config)
- `tailwind.config.ts` — DaisyUI plugin with `valentine` theme
- `postcss.config.mjs` — tailwindcss + autoprefixer
- `.eslintrc.json` — extends `next/core-web-vitals`

---

## Type System

### OS Types (`src/types/os.ts`)

```
AppID               = "finder" | "settings" | "browser" | "text-editor" | "image-viewer" | "love-letters" | "patch-notes" | "soul-sync"
WindowPosition      = { x, y }
WindowSize          = { width, height }
WindowAppProps      = { content?, imageUrl? }
AppRegistryEntry    = { id, name, icon, defaultSize, defaultPosition, component: ComponentType<WindowAppProps> }
WindowInstance      = { id, appId, title, position, size, zIndex, isMinimized, isMaximized, preMaximizeRect?, props?: WindowAppProps }
DesktopIconState    = { appId, position }
SystemTheme         = { wallpaper, accentColor, darkMode }
ResizeDirection     = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"
MIN_WINDOW_WIDTH    = 300
MIN_WINDOW_HEIGHT   = 200
```

### File System Types (`src/types/fs.ts`)

```
ItemType            = "folder" | "image" | "text" | "music" | "code"
FileSystemItem      = { id, parentId, name, type, content?, children?, createdAt }
FileSystemState     = { items: Record<string, FileSystemItem>, rootId }
```

### Letter Types (`src/types/letters.ts`)

```
LoveLetter          = { id, created_at, title, content, author, is_sealed, theme: 'classic' | 'valentine' | 'dark' }
```

### Settings Types (`src/store/atoms/settings.ts`)

```
RELATIONSHIP_START_DATE = "2025-08-28"          # Configurable relationship start date
WallpaperOption     = { id, url, label }
WALLPAPER_GALLERY   = WallpaperOption[]          # 6 Unsplash wallpaper presets
Uptime              = { years, days, hours, minutes, seconds }
calculateUptime(startDate: string) => Uptime     # Pure function, no side effects
```

### Spotify Types (`src/types/spotify.ts`)

```
SpotifyToken        = { id, user_alias, refresh_token, updated_at }
SpotifyTrack        = { name, artist, albumArt, trackUri, progressMs, durationMs }
UserPlaybackStatus  = { isPlaying, track: SpotifyTrack | null, status: 'playing' | 'paused' | 'idle' | 'disconnected' }
SoulSyncResponse    = { admin: UserPlaybackStatus, neo: UserPlaybackStatus, isResonating: boolean }
```

- **Normalized flat map** — all items stored in `Record<string, FileSystemItem>` for O(1) lookup by ID
- **`children`** — array of child IDs (only on folders), not nested objects
- **`parentId`** — enables walking up the tree for breadcrumbs
- **`content`** — URL for images, text content for text/code files

---

## Jotai Atom Architecture (`src/store/atoms/`)

### `desktop.ts`
| Atom                    | Type                  | Purpose                                       |
| ----------------------- | --------------------- | --------------------------------------------- |
| `wallpaperAtom`         | `atom<string>`        | CSS background value (Unsplash URL)            |
| `wallpaperFallbackAtom` | `atom<string>`        | Pink-to-red gradient fallback                  |
| `desktopIconsAtom`      | `atom<DesktopIconState[]>` | Icon positions on desktop, initialized in grid |

### `windows.ts`
| Atom                  | Type                         | Purpose                                  |
| --------------------- | ---------------------------- | ---------------------------------------- |
| `openWindowsAtom`     | `atom<WindowInstance[]>`     | All currently open windows               |
| `focusedWindowAtom`   | `atom<string \| null>`       | ID of the frontmost window               |
| `zIndexCounterAtom`   | `atom<number>` (private)     | Monotonically increasing z-index counter |
| `openWindowAtom`      | write-only action            | Creates WindowInstance; accepts `AppID \| { appId, title?, props? }` |
| `closeWindowAtom`     | write-only action            | Removes window by ID, refocuses last     |
| `focusWindowAtom`     | write-only action            | Bumps z-index to top, sets focused       |
| `minimizeWindowAtom`  | write-only action            | Toggles isMinimized                      |
| `maximizeWindowAtom`  | write-only action            | Toggles maximize, stores/restores rect   |
| `moveWindowAtom`      | write-only action            | Updates window position                  |
| `resizeWindowAtom`    | write-only action            | Updates window size + optional position  |

### `filesystem.ts`
| Atom                  | Type                                      | Purpose                                        |
| --------------------- | ----------------------------------------- | ---------------------------------------------- |
| `fileSystemAtom`      | `atom<FileSystemState>`                   | Core file system state (normalized flat map)    |
| `folderContentsAtom`  | derived `(folderId) => FileSystemItem[]`  | Returns children of a folder by ID              |
| `fileSystemItemAtom`  | derived `(itemId) => FileSystemItem?`     | Returns a single item by ID                     |
| `breadcrumbAtom`      | derived `(itemId) => FileSystemItem[]`    | Walks parentId chain to build breadcrumb path   |

### `letters.ts`
| Atom                  | Type                         | Purpose                                        |
| --------------------- | ---------------------------- | ---------------------------------------------- |
| `lettersAtom`        | `atom<LoveLetter[]>`         | Holds array of letters from Supabase            |
| `loadLettersAtom`    | write-only action            | Fetches letters from Supabase and updates state |

### `soulSync.ts`
| Export                    | Type                              | Purpose                                     |
| ------------------------- | --------------------------------- | ------------------------------------------- |
| `soulSyncDataAtom`        | `atom<SoulSyncResponse \| null>`  | Holds latest poll response from `/api/soul-sync` |
| `soulSyncLoadingAtom`     | `atom<boolean>`                   | True while fetching                         |
| `soulSyncErrorAtom`       | `atom<string \| null>`            | Error message on fetch failure              |
| `fetchSoulSyncAtom`       | write-only action                 | Fetches `/api/soul-sync` and updates atoms  |

### `settings.ts`
| Export                      | Type                         | Purpose                                              |
| --------------------------- | ---------------------------- | ---------------------------------------------------- |
| `RELATIONSHIP_START_DATE`   | `string` (constant)          | ISO date string for uptime calculation ("2025-08-28") |
| `WALLPAPER_GALLERY`         | `WallpaperOption[]` (constant) | 6 Unsplash presets with id/url/label               |
| `selectedWallpaperIdAtom`   | `atom<string>`               | Tracks which gallery wallpaper is active              |
| `calculateUptime()`         | `(startDate) => Uptime`      | Pure function: calculates years/days/hrs/mins/secs   |

---

## Hooks (`src/hooks/`)

| Hook                 | File                    | Returns          | Purpose                                                    |
| -------------------- | ----------------------- | ---------------- | ---------------------------------------------------------- |
| `useIsMobile()`      | `useIsMobile.ts`        | `boolean`        | SSR-safe matchMedia listener at 768px; defaults `false`    |
| `useUptime()`        | `useUptime.ts`          | `Uptime`         | Ticking 1s interval counter from `RELATIONSHIP_START_DATE` |
| `useGlobalRealtime()`| `useGlobalRealtime.ts`  | `void`           | Supabase realtime subscription for Love Letters sync       |

---

## App Registry (`src/config/appRegistry.tsx`)

Eight registered apps (+ 1 placeholder):

| AppID          | Name         | Icon (Lucide)  | Default Size | Default Position | Component                  |
| -------------- | ------------ | -------------- | ------------ | --------------- | -------------------------- |
| `finder`       | Finder       | `FolderOpen`   | 800 x 500   | (100, 100)      | `Finder` (full app)        |
| `settings`     | Settings     | `Settings`     | 650 x 500   | (150, 80)       | `SettingsApp` (full app)   |
| `browser`      | Browser      | `Globe`        | 900 x 600   | (200, 80)       | placeholder `<div>`        |
| `text-editor`  | Text Editor  | `FileText`     | 500 x 600   | (180, 60)       | `TextEditor`               |
| `image-viewer` | Preview      | `Eye`          | 600 x 500   | (200, 80)       | `ImageViewer`              |
| `love-letters` | Love Letters | `Heart`        | 900 x 650   | (150, 50)       | `LoveLetters` (full app)   |
| `patch-notes`  | Patch Notes  | `Sparkles`     | 550 x 600   | (300, 100)      | `PatchNotes`               |
| `soul-sync`    | Soul Sync    | `Music`        | 700 x 450   | (200, 100)      | `SoulSync` (full app)      |

---

## Mock File System (`src/config/initialFileSystem.ts`)

Normalized flat map with the following tree:

```
root/
└── Home/
    ├── Desktop/
    │   ├── Welcome.txt
    │   └── Project_Nebula_Roadmap.md
    ├── Documents/
    │   ├── Resume.pdf (mock text)
    │   └── Notes.txt
    ├── Downloads/          (empty)
    └── Pictures/
        ├── Roses.jpg       (Unsplash URL)
        ├── Hearts.jpg      (Unsplash URL)
        └── Valentine_Sunset.jpg (Unsplash URL)
```

Each item has: `id`, `parentId`, `name`, `type`, `content?`, `children?`, `createdAt`.

---

## Design Tokens

- **Glassmorphism:** `backdrop-blur-2xl bg-white/10 border border-white/20`
- **Window background:** `bg-white/80 backdrop-blur-xl border border-white/30`
- **Traffic lights:** Red `#ff5f57`, Yellow `#febc2e`, Green `#28c840` — 12px circles, 8px gap
- **Window corners:** `rounded-lg` (8px)
- **Shadows:** Windows `shadow-2xl`, Dock `shadow-lg`
- **Finder sidebar:** `w-48 bg-base-200/50 backdrop-blur-md border-r border-base-300`
- **Finder sidebar item:** `btn btn-ghost btn-sm justify-start font-normal`; active: `bg-black/10`
- **Finder main area:** `flex-1 bg-white/90 p-4 overflow-y-auto`
- **Finder grid:** `grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-4`
- **File icon selected:** `bg-blue-500/20 ring-1 ring-blue-500`; hover: `bg-blue-500/10`

### Mobile Design Tokens (< 768px)
- **Mobile breakpoint:** `MOBILE_BREAKPOINT = 768` (matches Tailwind `md:`)
- **Mobile window:** `fixed inset-0 rounded-none` (full-screen modal)
- **Mobile title bar:** `h-10 px-4` (vs desktop `h-8 px-3`), close button `w-5 h-5`
- **Mobile dock:** `z-[200] bottom-0 left-0 right-0 w-full rounded-none px-2 py-2 justify-evenly`
- **Mobile dock icon:** Static `48px` (no magnification)
- **Mobile desktop icons:** `flex flex-wrap gap-4 p-4 pt-10 content-start`

### Settings Design Tokens
- **Settings sidebar (desktop):** `w-44 bg-white/40 backdrop-blur-md border-r border-rose-100`
- **Settings tab active:** `bg-rose-500 text-white font-medium`
- **Settings background:** `bg-rose-50/50`
- **Uptime unit:** `bg-rose-50 rounded-lg px-3 py-2 border border-rose-100`
- **Wallpaper card active:** `border-rose-500 shadow-lg shadow-rose-200` with checkmark
