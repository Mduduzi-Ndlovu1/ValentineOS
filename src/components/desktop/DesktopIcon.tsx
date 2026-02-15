"use client";

import { motion, type PanInfo } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { desktopIconsAtom } from "@/store/atoms/desktop";
import { openWindowAtom } from "@/store/atoms/windows";
import { getAppEntry } from "@/config/appRegistry";
import type { AppID } from "@/types/os";
import type { RefObject } from "react";

interface DesktopIconProps {
  appId: AppID;
  index: number;
  constraintsRef: RefObject<HTMLDivElement>;
  isMobile?: boolean;
}

export function DesktopIcon({ appId, index, constraintsRef, isMobile = false }: DesktopIconProps) {
  const [icons, setIcons] = useAtom(desktopIconsAtom);
  const openWindow = useSetAtom(openWindowAtom);
  const iconState = icons[index];
  const app = getAppEntry(appId);
  const Icon = app.icon;

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIcons((prev) =>
      prev.map((ic, i) =>
        i === index
          ? {
              ...ic,
              position: {
                x: ic.position.x + info.offset.x,
                y: ic.position.y + info.offset.y,
              },
            }
          : ic
      )
    );
  };

  const handleOpen = () => {
    openWindow(appId);
  };

  if (isMobile) {
    return (
      <div
        onClick={handleOpen}
        className="flex flex-col items-center gap-1 cursor-pointer"
      >
        <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
          <Icon className="w-8 h-8 text-white drop-shadow-md" />
        </div>
        <span className="text-xs text-white font-medium drop-shadow-md text-center max-w-[80px] truncate">
          {app.name}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      drag
      dragMomentum={false}
      dragConstraints={constraintsRef}
      onDragEnd={handleDragEnd}
      onDoubleClick={handleOpen}
      className="absolute flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing"
      style={{
        left: iconState.position.x,
        top: iconState.position.y,
      }}
    >
      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
        <Icon className="w-8 h-8 text-white drop-shadow-md" />
      </div>
      <span className="text-xs text-white font-medium drop-shadow-md text-center max-w-[80px] truncate">
        {app.name}
      </span>
    </motion.div>
  );
}
