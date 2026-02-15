"use client";

import { useSetAtom } from "jotai";
import { useCallback, useRef } from "react";
import type { WindowInstance } from "@/types/os";
import {
  closeWindowAtom,
  minimizeWindowAtom,
  maximizeWindowAtom,
  moveWindowAtom,
  focusWindowAtom,
} from "@/store/atoms/windows";

interface WindowTitleBarProps {
  window: WindowInstance;
  isMobile?: boolean;
}

export function WindowTitleBar({ window: win, isMobile = false }: WindowTitleBarProps) {
  const close = useSetAtom(closeWindowAtom);
  const minimize = useSetAtom(minimizeWindowAtom);
  const maximize = useSetAtom(maximizeWindowAtom);
  const moveWindow = useSetAtom(moveWindowAtom);
  const focusWindow = useSetAtom(focusWindowAtom);

  const isDragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      // Don't drag if clicking traffic lights
      if ((e.target as HTMLElement).closest("[data-traffic-light]")) return;

      isDragging.current = true;
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        winX: win.position.x,
        winY: win.position.y,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      focusWindow(win.id);
    },
    [isMobile, win.position.x, win.position.y, win.id, focusWindow]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isMobile) return;
      if (!isDragging.current || win.isMaximized) return;

      const deltaX = e.clientX - dragStart.current.mouseX;
      const deltaY = e.clientY - dragStart.current.mouseY;

      moveWindow({
        windowId: win.id,
        position: {
          x: dragStart.current.winX + deltaX,
          y: dragStart.current.winY + deltaY,
        },
      });
    },
    [isMobile, win.id, win.isMaximized, moveWindow]
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  return (
    <div
      className={`flex items-center bg-white/60 backdrop-blur-sm shrink-0 ${
        isMobile
          ? "h-10 px-4 rounded-none cursor-default"
          : "h-8 px-3 rounded-t-lg cursor-grab active:cursor-grabbing"
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Traffic Lights */}
      <div className="flex items-center gap-2" data-traffic-light>
        <button
          onClick={() => close(win.id)}
          className={`${isMobile ? "w-5 h-5" : "w-3 h-3"} rounded-full bg-[#ff5f57] hover:brightness-90 transition-all`}
          aria-label="Close"
        />
        {!isMobile && (
          <>
            <button
              onClick={() => minimize(win.id)}
              className="w-3 h-3 rounded-full bg-[#febc2e] hover:brightness-90 transition-all"
              aria-label="Minimize"
            />
            <button
              onClick={() => maximize(win.id)}
              className="w-3 h-3 rounded-full bg-[#28c840] hover:brightness-90 transition-all"
              aria-label="Maximize"
            />
          </>
        )}
      </div>

      {/* Title */}
      <span className={`flex-1 text-center font-medium text-neutral/70 select-none pointer-events-none ${
        isMobile ? "text-sm" : "text-xs"
      }`}>
        {win.title}
      </span>

      {/* Spacer to balance the traffic lights */}
      <div className={isMobile ? "w-[20px]" : "w-[52px]"} />
    </div>
  );
}
