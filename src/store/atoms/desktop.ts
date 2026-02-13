import { atom } from "jotai";
import type { DesktopIconState } from "@/types/os";
import { APP_REGISTRY } from "@/config/appRegistry";

// Valentine-themed wallpaper
const DEFAULT_WALLPAPER =
  "url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80)";
const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #f472b6 0%, #e11d48 50%, #be123c 100%)";

export const wallpaperAtom = atom<string>(DEFAULT_WALLPAPER);
export const wallpaperFallbackAtom = atom<string>(FALLBACK_GRADIENT);

// Desktop icons initialized in a vertical grid from registry
const GRID_START_X = 40;
const GRID_START_Y = 40;
const GRID_GAP_Y = 100;

const initialDesktopIcons: DesktopIconState[] = APP_REGISTRY.map((app, i) => ({
  appId: app.id,
  position: { x: GRID_START_X, y: GRID_START_Y + i * GRID_GAP_Y },
}));

export const desktopIconsAtom = atom<DesktopIconState[]>(initialDesktopIcons);
