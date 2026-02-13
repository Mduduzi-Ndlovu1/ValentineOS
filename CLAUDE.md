# ValentineOS — Project Nebula

A high-fidelity, macOS-inspired Web Operating System built as a single-page application in the browser.

---

## Project Overview

**Codename:** Project Nebula
**Theme:** Valentine — pink/red romantic aesthetic with a Valentine-themed Unsplash wallpaper
**Goal:** Create a "One Page" application that feels exactly like a native desktop OS (macOS inspired) using web technologies.

## Tech Stack

| Layer             | Technology                        |
| ----------------- | --------------------------------- |
| Framework         | Next.js 14 (App Router)           |
| State Management  | Jotai (atomic, global state)      |
| Styling           | Tailwind CSS + DaisyUI (valentine theme) |
| Animation         | Framer Motion (interactions/drag) + GSAP (complex timelines) |
| Icons             | Lucide React                      |
| Language          | TypeScript (strict mode)          |

## Core Philosophy & Rules

1. **Atomic State** — Never use large Context Providers. Every window, icon position, and system setting is its own Jotai atom.
2. **No Scrolling** — `<body>` is fixed. Scroll logic exists only within specific app windows.
3. **Mobile-First but Desktop-Primary** — UI is responsive, but the primary experience is mouse/keyboard desktop.
4. **Modular "App" Architecture** — Apps are pluggable via `AppRegistry` config, never hardcoded into layouts.
5. **Strict Types** — No `any`. All props and atoms are typed.

---

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout: Jotai Provider, Inter font, DaisyUI valentine theme
│   ├── page.tsx                # Single page: renders <Desktop />
│   └── globals.css             # Tailwind directives + body overflow lock (100dvh, position fixed)
├── components/
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
│   └── appRegistry.tsx         # APP_REGISTRY array + APP_REGISTRY_MAP (O(1) lookup) + getAppEntry()
├── store/
│   ├── atoms/
│   │   ├── desktop.ts          # wallpaperAtom, wallpaperFallbackAtom, desktopIconsAtom
│   │   └── windows.ts          # openWindowsAtom, focusedWindowAtom, zIndexCounterAtom + 6 action atoms
│   └── provider.tsx            # "use client" Jotai Provider wrapper
└── types/
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

## Type System (`src/types/os.ts`)

```
AppID               = "finder" | "settings" | "browser"
WindowPosition      = { x, y }
WindowSize          = { width, height }
AppRegistryEntry    = { id, name, icon, defaultSize, defaultPosition, component }
WindowInstance      = { id, appId, title, position, size, zIndex, isMinimized, isMaximized, preMaximizeRect? }
DesktopIconState    = { appId, position }
SystemTheme         = { wallpaper, accentColor, darkMode }
ResizeDirection     = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"
MIN_WINDOW_WIDTH    = 300
MIN_WINDOW_HEIGHT   = 200
```

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
| `openWindowAtom`      | write-only action            | Creates new WindowInstance for an AppID  |
| `closeWindowAtom`     | write-only action            | Removes window by ID, refocuses last     |
| `focusWindowAtom`     | write-only action            | Bumps z-index to top, sets focused       |
| `minimizeWindowAtom`  | write-only action            | Toggles isMinimized                      |
| `maximizeWindowAtom`  | write-only action            | Toggles maximize, stores/restores rect   |
| `moveWindowAtom`      | write-only action            | Updates window position                  |
| `resizeWindowAtom`    | write-only action            | Updates window size + optional position  |

## App Registry (`src/config/appRegistry.tsx`)

Three registered apps with placeholder content:

| AppID      | Name     | Icon (Lucide)  | Default Size | Default Position |
| ---------- | -------- | -------------- | ------------ | ---------------- |
| `finder`   | Finder   | `FolderOpen`   | 800 x 500   | (100, 100)       |
| `settings` | Settings | `Settings`     | 600 x 450   | (150, 120)       |
| `browser`  | Browser  | `Globe`        | 900 x 600   | (200, 80)        |

**Note:** This file is `.tsx` (not `.ts`) because placeholder components use JSX.

---

## Key Implementation Details

### Dock Magnification Effect (`DockIcon.tsx`)
- Each icon receives a shared `mouseX` MotionValue from the parent `Dock`
- `useTransform` maps distance from mouse to icon center → icon size (48px base → 80px peak, 150px radius)
- `useSpring` smooths the transform with `{ mass: 0.1, stiffness: 150, damping: 12 }`
- Zero-rerender animation — all animation happens via MotionValues, not React state

### Window Drag (`WindowTitleBar.tsx`)
- Uses manual pointer events (`onPointerDown` / `onPointerMove` / `onPointerUp`)
- `setPointerCapture` ensures drag continues even if pointer leaves the element
- Only the title bar area is draggable (traffic light buttons are excluded via `data-traffic-light` attribute)
- Drag is disabled when window is maximized

### Window Resize (`WindowFrame.tsx`)
- 8 invisible resize handles positioned on edges (4px strips) and corners (12px squares)
- Pointer capture on `onPointerDown`, delta calculation on `onPointerMove`
- Direction-aware: east/south expand, west/north expand + shift position
- Enforces `MIN_WINDOW_WIDTH` (300) and `MIN_WINDOW_HEIGHT` (200)
- Resize handles hidden when window is maximized

### Z-Index Stacking
- `zIndexCounterAtom` starts at 100 (above dock's z-50)
- Each focus action increments the counter and assigns it to the focused window
- Monotonically increasing — no z-index collisions

### Dock Click Behavior (macOS-style)
1. No window for app → **open** new window
2. Window exists, is minimized → **restore** + focus
3. Window exists, is focused → **minimize**
4. Window exists, not focused → **focus** (bring to front)

### Desktop Icons
- Draggable via Framer Motion `drag` prop with `dragMomentum={false}`
- Constrained to desktop bounds via `dragConstraints={desktopRef}`
- Position synced to `desktopIconsAtom` on `onDragEnd`
- Double-click opens the corresponding app

### Wallpaper
- Default: `url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80)` (Valentine theme)
- Fallback: `linear-gradient(135deg, #f472b6 0%, #e11d48 50%, #be123c 100%)`
- Hidden `<img>` preloads the wallpaper; on error, switches to gradient fallback

### Design Tokens
- **Glassmorphism:** `backdrop-blur-2xl bg-white/10 border border-white/20`
- **Window background:** `bg-white/80 backdrop-blur-xl border border-white/30`
- **Traffic lights:** Red `#ff5f57`, Yellow `#febc2e`, Green `#28c840` — 12px circles, 8px gap
- **Window corners:** `rounded-lg` (8px)
- **Shadows:** Windows `shadow-2xl`, Dock `shadow-lg`

---

## Ticket History

All tickets completed in order:

### TICKET-001: Project Scaffolding & Types ✅
- Manually set up Next.js 14 (create-next-app rejected the directory name `ValentineOS` due to npm capital letter restriction)
- Installed: jotai, framer-motion, gsap, lucide-react, daisyui, autoprefixer
- Created `src/types/os.ts` with all type definitions
- Created `src/config/appRegistry.tsx` with 3 dummy apps

### TICKET-002: The Viewport & Wallpaper Engine ✅
- Created `Desktop` component with `100dvh` lock
- `globals.css` locks `html, body` to fixed position with `overflow: hidden`
- Jotai `wallpaperAtom` with Valentine Unsplash image, gradient fallback on error
- Jotai `Provider` wrapper in `src/store/provider.tsx`
- Root layout wraps app in `JotaiProvider`, sets `data-theme="valentine"`

### TICKET-003: The Dock (Visuals & Motion) ✅
- `Dock` component: glassmorphism bar fixed at bottom center
- `DockIcon` component: `useTransform` + `useSpring` magnification wave effect
- Shared `mouseX` MotionValue pattern (set to `Infinity` on mouse leave)
- Active app indicator dot below icon

### TICKET-004: Draggable Desktop Icons ✅
- `DesktopIcon` component with Framer Motion `drag` + `dragMomentum={false}`
- Positions persist in `desktopIconsAtom` (updated on `onDragEnd`)
- Icons initialized in vertical grid (40px from left, 100px spacing)
- Double-click opens app via `openWindowAtom`

### TICKET-005: The Window System (Core) ✅
- `WindowFrame`: absolute-positioned div with pointer-event drag and 8 resize handles
- `WindowTitleBar`: traffic light buttons + pointer-capture drag
- `WindowManager`: reads `openWindowsAtom`, renders non-minimized windows
- Z-index stacking via monotonic counter (starts at 100)
- Maximize stores `preMaximizeRect`, restores on un-maximize
- Minimum window size enforced at 300x200

### TICKET-006: App Integration ✅
- Dock clicks connected to window system (open/minimize/restore/focus)
- Desktop icon double-click opens apps
- macOS-style dock behavior fully implemented

---

## Gotchas & Lessons Learned

1. **Directory name** — `ValentineOS` has capitals; `create-next-app` rejects this for npm naming. Used manual Next.js setup instead.
2. **JSX in config** — `appRegistry` has placeholder React components with JSX, so it must be `.tsx` not `.ts`.
3. **autoprefixer** — Next.js 14 with Tailwind requires `autoprefixer` as an explicit dev dependency.
4. **Old files** — When converting from a plain TS project, leftover `src/index.ts` caused build failure. Must clean up.

---

## Adding a New App

1. Add the new `AppID` to the union type in `src/types/os.ts`
2. Create the app component (e.g., `src/components/apps/Calculator.tsx`)
3. Add an entry to `APP_REGISTRY` in `src/config/appRegistry.tsx` with icon, default size/position, and component
4. The app automatically appears in the dock and as a desktop icon — no other changes needed

## Running

```bash
npm run dev    # Start dev server at http://localhost:3000
npm run build  # Production build
npm start      # Serve production build
```
