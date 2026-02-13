import type { LucideIcon } from "lucide-react";
import type { ComponentType } from "react";

// ─── App Identity ───
export type AppID = "finder" | "settings" | "browser" | "text-editor" | "image-viewer";

// ─── Window Geometry ───
export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

// ─── Window App Props (passed from WindowInstance → app component) ───
export interface WindowAppProps {
  content?: string;
  imageUrl?: string;
}

// ─── App Registry ───
export interface AppRegistryEntry {
  id: AppID;
  name: string;
  icon: LucideIcon;
  defaultSize: WindowSize;
  defaultPosition: WindowPosition;
  component: ComponentType<WindowAppProps>;
}

// ─── Window Instance (runtime state) ───
export interface WindowInstance {
  id: string;
  appId: AppID;
  title: string;
  position: WindowPosition;
  size: WindowSize;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  preMaximizeRect?: { position: WindowPosition; size: WindowSize };
  props?: WindowAppProps;
}

// ─── Desktop Icon State ───
export interface DesktopIconState {
  appId: AppID;
  position: WindowPosition;
}

// ─── System Theme ───
export interface SystemTheme {
  wallpaper: string;
  accentColor: string;
  darkMode: boolean;
}

// ─── Resize ───
export type ResizeDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

// ─── Window Constants ───
export const MIN_WINDOW_WIDTH = 300;
export const MIN_WINDOW_HEIGHT = 200;
