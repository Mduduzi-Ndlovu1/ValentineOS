"use client";

import { motion, type PanInfo } from "framer-motion";
import { useAtom, useSetAtom } from "jotai";
import { desktopIconsAtom, customIconsAtom, iconThemeAtom } from "@/store/atoms/desktop";
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
  const [customIcons] = useAtom(customIconsAtom);
  const [iconTheme] = useAtom(iconThemeAtom);
  const openWindow = useSetAtom(openWindowAtom);
  const iconState = icons[index];
  const app = getAppEntry(appId);
  const Icon = app.icon;
  const customIconUrl = customIcons[appId];

  const getContainerStyle = () => {
    switch (iconTheme) {
      case "flat":
        return "bg-white/90 border border-white/10 shadow-md";
      case "neon":
        return "bg-black/80 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.5)]";
      case "water-gel":
      default:
        return "bg-gradient-to-b from-white/40 via-white/10 to-white/5 backdrop-blur-2xl border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),inset_0_-1px_0_0_rgba(0,0,0,0.1),0_8px_20px_rgba(0,0,0,0.2)]";
    }
  };

  const containerClassName = `w-16 h-16 flex items-center justify-center rounded-[1.2rem] ${getContainerStyle()} active:scale-95 transition-transform overflow-hidden`;

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

  const baseContainerClass = `w-16 h-16 flex items-center justify-center rounded-[1.2rem] overflow-hidden ${getContainerStyle()}`;

  if (isMobile) {
    return (
      <div
        onClick={handleOpen}
        className="flex flex-col items-center gap-1.5 cursor-pointer"
      >
        <div className={`${baseContainerClass} active:scale-95 transition-transform`}>
          {customIconUrl ? (
             <img src={customIconUrl} alt={app.name} className="w-full h-full object-cover" />
          ) : (
             <Icon className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter" />
          )}
        </div>
        <span className="text-xs text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center max-w-[80px] truncate antialiased tracking-wide">
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
        left: Math.round(iconState.position.x),
        top: Math.round(iconState.position.y),
      }}
    >
      <div className={`${baseContainerClass} group transition-transform duration-200 hover:scale-105 active:scale-95`}>
         {customIconUrl ? (
             <img src={customIconUrl} alt={app.name} className="w-full h-full object-cover" />
          ) : (
             <Icon className="w-8 h-8 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] filter" />
          )}
      </div>
      <span className="text-xs text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] text-center max-w-[80px] truncate antialiased tracking-wide">
        {app.name}
      </span>
    </motion.div>
  );
}
