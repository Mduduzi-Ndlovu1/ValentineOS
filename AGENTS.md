# AGENTS.md - ValentineOS Development Guide

This file provides guidelines for agents working on the ValentineOS project.

## Project Overview

ValentineOS is a macOS-inspired Web Operating System built with Next.js 14 (App Router), Jotai for state management, Framer Motion for animations, and Tailwind CSS with DaisyUI.

---

## Commands

### Development
```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm start            # Serve production build
```

### Linting & Type Checking
```bash
npm run lint         # Run ESLint with Next.js config
```

There are **no test commands** currently configured. Do not add test frameworks without user approval.

---

## Code Style Guidelines

### TypeScript (Strict Mode)

- **NO `any` types** - All props and atoms must be properly typed
- Use `import type` for type-only imports to enable tree-shaking
- Define types in `src/types/` (os.ts for OS types, fs.ts for file system types)
- Export interfaces with descriptive names (e.g., `WindowInstance`, `FileSystemItem`)

### Imports

- Use `@/*` path alias (e.g., `import { foo } from "@/store/atoms/windows"`)
- Group imports in this order:
  1. External (React, Jotai, Framer Motion, Lucide)
  2. Internal (types, config, store)
  3. Local components
- Use `import { x } from "module"` (named imports) over `import * as x`
- Separate import groups with a single blank line

Example:
```typescript
import { useCallback, useRef } from "react";
import { useSetAtom } from "jotai";
import { motion } from "framer-motion";
import type { WindowInstance, ResizeDirection } from "@/types/os";
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from "@/types/os";
import { focusWindowAtom, resizeWindowAtom } from "@/store/atoms/windows";
import { getAppEntry } from "@/config/appRegistry";
import { WindowTitleBar } from "./WindowTitleBar";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `WindowFrame`, `DockIcon`)
- **Atoms**: camelCase with `Atom` suffix (e.g., `openWindowsAtom`, `wallpaperAtom`)
- **Types/Interfaces**: PascalCase (e.g., `WindowInstance`, `AppID`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `MIN_WINDOW_WIDTH`)
- **Files**: PascalCase for components (e.g., `WindowFrame.tsx`), camelCase for utilities

### Component Structure

- Use "use client" directive for any component using hooks or Jotai atoms
- Props interfaces should be defined inline or in separate file if reused
- Destructure props in function signature: `function Component({ prop1, prop2 }: Props)`
- Use `export function` not `export const` for React components

### State Management (Jotai)

- Atoms go in `src/store/atoms/` directory
- Write-only atoms use the `atom(null, (get, set, payload) => {...})` pattern
- Derived (read-only) atoms use `atom((get) => {...})`
- Private atoms (not exported) should not be prefixed with `Atom` unless exported
- Action atoms should have descriptive names: `openWindowAtom`, `closeWindowAtom`, etc.

### Styling (Tailwind + DaisyUI)

- Use DaisyUI `valentine` theme: `data-theme="valentine"` in layout
- Use Tailwind utility classes with `bg-white/80`, `backdrop-blur-xl`, etc.
- Avoid custom CSS unless absolutely necessary - use Tailwind
- Glassmorphism pattern: `bg-white/10 border border-white/20 backdrop-blur-2xl`
- Use `className` for styles, not `style` prop (except for dynamic values)

### Animations (Framer Motion)

- Use `motion.div` for animated elements
- Define variants as separate constants outside component
- Use spring transitions: `{ type: "spring", stiffness: 300, damping: 30 }`
- Use `layout={false}` to prevent Framer from animating position/size changes during drag/resize

### Error Handling

- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe access
- Avoid try/catch unless absolutely necessary (Next.js handles errors at page level)
- Validate function inputs with early returns
- Use `typeof window !== "undefined"` checks for SSR compatibility

### Window System

- Window ID format: `${appId}-${Date.now()}`
- Z-index starts at 100 (above dock at z-50)
- Minimum window size: 300x200 pixels
- Always enforce minimum sizes in resize handlers

---

## Project Structure

```
src/
├── app/           # Next.js pages (layout.tsx, page.tsx, globals.css)
├── components/    # React components
│   ├── apps/      # App components (Finder, TextEditor, ImageViewer, LoveLetters)
│   │   └── LoveLetters/   # Love letters app (LoveLetters, LetterSidebar, LetterEditor, Stationery)
│   ├── desktop/   # Desktop components (Desktop, DesktopIcon)
│   ├── dock/      # Dock components (Dock, DockIcon)
│   └── window/    # Window system (WindowFrame, WindowManager, WindowTitleBar)
├── config/        # App registry, initial file system
├── lib/          # Utility libraries (supabase.ts)
├── services/     # Service layer (letterService.ts)
├── store/        # Jotai atoms and actions
│   ├── atoms/    # State atoms (desktop.ts, filesystem.ts, windows.ts, letters.ts)
│   └── actions/  # Complex actions (fileActions.ts)
└── types/        # TypeScript definitions (os.ts, fs.ts, letters.ts)
```

---

## Adding New Apps

1. Add `AppID` to union type in `src/types/os.ts`
2. Create component in `src/components/apps/`
3. Add entry to `APP_REGISTRY` in `src/config/appRegistry.tsx`
4. App automatically appears in dock and desktop icons

---

## Important Notes

- No scrolling on body - scroll logic exists only within app windows
- All windows use pointer events (not mouse events) for cross-platform support
- Desktop icons persist positions to Jotai atom on drag end
- Dock has magnification effect using shared `MotionValue` for mouse position
- Boot sequence uses `AnimatePresence` for smooth transitions

---

## Love Letters App

The Love Letters app is a romantic letter-writing application with Supabase backend integration.

### Key Files
- `src/components/apps/LoveLetters/LoveLetters.tsx` - Main container
- `src/components/apps/LoveLetters/LetterSidebar.tsx` - Glassmorphism sidebar with + button
- `src/components/apps/LoveLetters/LetterEditor.tsx` - Tiptap rich text editor
- `src/components/apps/LoveLetters/Stationery.tsx` - Paper component with lined texture
- `src/lib/supabase.ts` - Supabase client
- `src/services/letterService.ts` - CRUD operations
- `src/store/atoms/letters.ts` - Jotai state atoms
- `src/types/letters.ts` - LoveLetter interface

### Features
- Create new letters with + button
- Edit title, author, and content
- Auto-save with debouncing (500ms for title/author, 2000ms for content)
- Save button - saves and seals the letter (read-only)
- Seal button - locks the letter without saving
- Wax seal badge (Heart icon) on sealed letters

### Tiptap Editor
- Use `immediatelyRender: false` to avoid SSR hydration errors
- Style `.tiptap-editor` class with Dancing Script font
- Use debounced onUpdate callbacks to prevent excessive API calls

### Font Configuration
- Dancing Script font configured in `src/app/layout.tsx`
- CSS variable: `--font-dancing-script`
- Apply via: `style={{ fontFamily: "var(--font-dancing-script)" }}`
