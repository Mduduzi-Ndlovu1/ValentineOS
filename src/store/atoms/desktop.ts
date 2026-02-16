import { atom } from "jotai";
import type { DesktopIconState } from "@/types/os";
import { APP_REGISTRY } from "@/config/appRegistry";
import { OS_VERSION } from "@/config/version";

const DEFAULT_WALLPAPER =
  "url(https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1920&q=80)";
const FALLBACK_GRADIENT =
  "linear-gradient(135deg, #f472b6 0%, #e11d48 50%, #be123c 100%)";

export const wallpaperAtom = atom<string>(DEFAULT_WALLPAPER);
export const wallpaperFallbackAtom = atom<string>(FALLBACK_GRADIENT);

export interface UserPreferences {
  wallpaper_url: string | null;
  preferences: Record<string, any>;
  last_read_version: string | null;
}

export const userPreferencesAtom = atom<UserPreferences>({
  wallpaper_url: null,
  preferences: {},
  last_read_version: null,
});

export const hasNewVersionAtom = atom<boolean>(false);

export const loadPreferencesAtom = atom(
  null,
  async (_get, set, userAlias: string) => {
    try {
      const response = await fetch(`/api/user/preferences?userAlias=${userAlias}`);
      if (response.ok) {
        const data = await response.json();
        
        if (data.wallpaper_url) {
          set(wallpaperAtom, data.wallpaper_url);
        }
        
        const lastReadVersion = data.last_read_version || data.preferences?.last_read_version || null;
        
        const hasNew = lastReadVersion !== OS_VERSION;
        
        set(userPreferencesAtom, {
          wallpaper_url: data.wallpaper_url,
          preferences: data.preferences || {},
          last_read_version: lastReadVersion,
        });
        
        set(hasNewVersionAtom, hasNew);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  }
);

export const markVersionReadAtom = atom(
  null,
  async (_get, set, userAlias: string) => {
    set(hasNewVersionAtom, false);
    
    set(userPreferencesAtom, (prev) => ({
      ...prev,
      last_read_version: OS_VERSION,
    }));
    
    try {
      await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userAlias, 
          preferences: { last_read_version: OS_VERSION } 
        }),
      });
    } catch (error) {
      console.error("Error marking version as read:", error);
    }
  }
);

export const savePreferenceAtom = atom(
  null,
  async (_get, set, { userAlias, key, value }: { userAlias: string; key: string; value: any }) => {
    try {
      set(userPreferencesAtom, (prev) => ({
        ...prev,
        [key]: value,
        preferences: key === 'preferences' ? value : { ...prev.preferences, [key]: value },
      }));

      if (key === 'wallpaper_url' && value) {
        set(wallpaperAtom, value);
      }

      const payload: { userAlias: string; wallpaper_url?: string; preferences?: Record<string, any> } = { userAlias };
      
      if (key === 'wallpaper_url') {
        payload.wallpaper_url = value;
      } else {
        const current = _get(userPreferencesAtom);
        payload.preferences = { ...current.preferences, [key]: value };
      }

      const response = await fetch("/api/user/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Failed to save preference:", await response.text());
      }
    } catch (error) {
      console.error("Error saving preference:", error);
    }
  }
);

const GRID_START_X = 40;
const GRID_START_Y = 40;
const GRID_GAP_Y = 100;

const initialDesktopIcons: DesktopIconState[] = APP_REGISTRY.map((app, i) => ({
  appId: app.id,
  position: { x: GRID_START_X, y: GRID_START_Y + i * GRID_GAP_Y },
}));

export const desktopIconsAtom = atom<DesktopIconState[]>(initialDesktopIcons);
