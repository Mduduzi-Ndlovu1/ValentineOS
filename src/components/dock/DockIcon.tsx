"use client";

import { useRef } from "react";
import {
  motion,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import type { AppRegistryEntry } from "@/types/os";
import {
  openWindowsAtom,
  focusedWindowAtom,
  openWindowAtom,
  minimizeWindowAtom,
  focusWindowAtom,
} from "@/store/atoms/windows";

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
        className="flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md cursor-pointer hover:bg-white/30 transition-colors"
      >
        <Icon className="w-1/2 h-1/2 text-white drop-shadow-md" />
      </motion.div>
      {!isMobile && isActive && (
        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-white" />
      )}
    </div>
  );
}
