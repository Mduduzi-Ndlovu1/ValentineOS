"use client";

import { useRef } from "react";
import {
  motion,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import type { AppRegistryEntry } from "@/types/os";
import {
  openWindowsAtom,
  focusedWindowAtom,
  openWindowAtom,
  minimizeWindowAtom,
  focusWindowAtom,
} from "@/store/atoms/windows";
import { customIconsAtom, iconThemeAtom } from "@/store/atoms/desktop";

interface DockIconProps {
  app: AppRegistryEntry;
  mouseX: MotionValue<number>;
  isMobile?: boolean;
}

const BASE_SIZE = 40;
const MAX_SIZE = 56;
const DISTANCE = 100;
const MOBILE_ICON_SIZE = 48;

export function DockIcon({ app, mouseX, isMobile = false }: DockIconProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = app.icon;
  const [customIcons] = useAtom(customIconsAtom);
  const [iconTheme] = useAtom(iconThemeAtom);
  const customIconUrl = customIcons[app.id];

  const windows = useAtomValue(openWindowsAtom);
  const focusedWindow = useAtomValue(focusedWindowAtom);
  const openWindow = useSetAtom(openWindowAtom);
  const minimize = useSetAtom(minimizeWindowAtom);
  const focus = useSetAtom(focusWindowAtom);

  const isActive = windows.some((w) => w.appId === app.id);

  // Distance from mouse to icon center
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: 0,
    };
    return val - (bounds.x + bounds.width / 2);
  });

  // Map distance to size
  const widthSync = useTransform(
    distance,
    [-DISTANCE, 0, DISTANCE],
    [BASE_SIZE, MAX_SIZE, BASE_SIZE]
  );

  // Smooth spring
  const width = useSpring(widthSync, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const getContainerStyle = () => {
    switch (iconTheme) {
      case "flat":
        return "bg-white/90 border border-white/10 shadow-md hover:bg-white";
      case "neon":
        return "bg-black/80 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.5)] hover:border-rose-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.7)]";
      case "water-gel":
      default:
        return "bg-gradient-to-b from-white/40 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-1px_0_0_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.2)] hover:bg-white/20";
    }
  };

  const handleClick = () => {
    const existingWindow = windows.find((w) => w.appId === app.id);

    if (!existingWindow) {
      openWindow(app.id);
    } else if (existingWindow.isMinimized) {
      minimize(existingWindow.id);
      focus(existingWindow.id);
    } else if (focusedWindow === existingWindow.id) {
      minimize(existingWindow.id);
    } else {
      focus(existingWindow.id);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        ref={ref}
        style={
          isMobile
            ? { width: MOBILE_ICON_SIZE, height: MOBILE_ICON_SIZE }
            : { width, height: width }
        }
        onClick={handleClick}
        className={`flex items-center justify-center rounded-[1.2rem] ${getContainerStyle()} cursor-pointer transition-all duration-200 overflow-hidden`}
      >
        {customIconUrl ? (
             <img src={customIconUrl} alt={app.name} className="w-full h-full object-cover" />
          ) : (
            <Icon className="w-1/2 h-1/2 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter" />
        )}
      </motion.div>
      {!isMobile && isActive && (
        <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)] backdrop-blur-sm" />
      )}
    </div>
  );
}
