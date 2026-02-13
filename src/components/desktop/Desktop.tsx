"use client";

import { useAtomValue } from "jotai";
import { useCallback, useRef, useState } from "react";
import {
  wallpaperAtom,
  wallpaperFallbackAtom,
  desktopIconsAtom,
} from "@/store/atoms/desktop";
import { DesktopIcon } from "./DesktopIcon";
import { Dock } from "@/components/dock/Dock";
import { WindowManager } from "@/components/window/WindowManager";

export function Desktop() {
  const wallpaper = useAtomValue(wallpaperAtom);
  const fallback = useAtomValue(wallpaperFallbackAtom);
  const icons = useAtomValue(desktopIconsAtom);
  const [useFallback, setUseFallback] = useState(false);
  const desktopRef = useRef<HTMLDivElement>(null!);

  const handleImageError = useCallback(() => {
    setUseFallback(true);
  }, []);

  return (
    <div
      ref={desktopRef}
      className="relative w-dvw h-dvh overflow-hidden select-none"
      style={{
        background: useFallback ? fallback : wallpaper,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Preload wallpaper to detect errors */}
      {!useFallback && wallpaper.startsWith("url(") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wallpaper.slice(4, -1)}
          alt=""
          className="hidden"
          onError={handleImageError}
        />
      )}

      {/* Desktop Icons */}
      {icons.map((icon, i) => (
        <DesktopIcon
          key={icon.appId}
          appId={icon.appId}
          index={i}
          constraintsRef={desktopRef}
        />
      ))}

      {/* Window Manager */}
      <WindowManager />

      {/* Dock */}
      <Dock />
    </div>
  );
}
