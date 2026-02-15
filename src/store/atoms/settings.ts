"use client";

import { atom } from "jotai";

// ─── Relationship Start Date ───
export const RELATIONSHIP_START_DATE = "2025-08-27";

// ─── Wallpaper Gallery ───
export interface WallpaperOption {
  id: string;
  url: string;
  label: string;
}

export const WALLPAPER_GALLERY: WallpaperOption[] = [
  {
    id: "valentine-roses",
    url: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80",
    label: "Valentine Roses",
  },
  {
    id: "pink-petals",
    url: "https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=1920&q=80",
    label: "Pink Petals",
  },
  {
    id: "heart-bokeh",
    url: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1920&q=80",
    label: "Heart Bokeh",
  },
  {
    id: "sunset-love",
    url: "https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1920&q=80",
    label: "Sunset Love",
  },
  {
    id: "cherry-blossoms",
    url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80",
    label: "Cherry Blossoms",
  },
  {
    id: "starry-night",
    url: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80",
    label: "Starry Night",
  },
];

// ─── Selected wallpaper ID (tracks which gallery item is active) ───
export const selectedWallpaperIdAtom = atom<string>("valentine-roses");

// ─── Uptime Types ───
export interface Uptime {
  years: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function calculateUptime(startDate: string): Uptime {
  const start = new Date(startDate).getTime();
  const now = Date.now();
  let diff = Math.max(0, Math.floor((now - start) / 1000));

  const years = Math.floor(diff / (365.25 * 24 * 3600));
  diff -= Math.floor(years * 365.25 * 24 * 3600);

  const days = Math.floor(diff / (24 * 3600));
  diff -= days * 24 * 3600;

  const hours = Math.floor(diff / 3600);
  diff -= hours * 3600;

  const minutes = Math.floor(diff / 60);
  const seconds = diff - minutes * 60;

  return { years, days, hours, minutes, seconds };
}
