"use client";

import { useCallback, useRef } from "react";
import { useSetAtom } from "jotai";
import { motion } from "framer-motion";
import type { WindowInstance, ResizeDirection } from "@/types/os";
import { MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from "@/types/os";
import {
  focusWindowAtom,
  resizeWindowAtom,
} from "@/store/atoms/windows";
import { getAppEntry } from "@/config/appRegistry";
import { WindowTitleBar } from "./WindowTitleBar";
import { useIsMobile } from "@/hooks/useIsMobile";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

interface WindowFrameProps {
  window: WindowInstance;
}

const RESIZE_HANDLE_SIZE = 6;

const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: "cursor-ns-resize",
  s: "cursor-ns-resize",
  e: "cursor-ew-resize",
  w: "cursor-ew-resize",
  ne: "cursor-nesw-resize",
  nw: "cursor-nwse-resize",
  se: "cursor-nwse-resize",
  sw: "cursor-nesw-resize",
};

const RESIZE_POSITIONS: Record<ResizeDirection, React.CSSProperties> = {
  n: { top: 0, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE },
  s: { bottom: 0, left: RESIZE_HANDLE_SIZE, right: RESIZE_HANDLE_SIZE, height: RESIZE_HANDLE_SIZE },
  e: { right: 0, top: RESIZE_HANDLE_SIZE, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE },
  w: { left: 0, top: RESIZE_HANDLE_SIZE, bottom: RESIZE_HANDLE_SIZE, width: RESIZE_HANDLE_SIZE },
  ne: { top: 0, right: 0, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 },
  nw: { top: 0, left: 0, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 },
  se: { bottom: 0, right: 0, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 },
  sw: { bottom: 0, left: 0, width: RESIZE_HANDLE_SIZE * 2, height: RESIZE_HANDLE_SIZE * 2 },
};

const windowVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
};

const mobileWindowVariants = {
  initial: { opacity: 0, y: "100%" },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: "100%" },
};

const windowTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

export function WindowFrame({ window: win }: WindowFrameProps) {
  const isMobile = useIsMobile();
  const focusWindow = useSetAtom(focusWindowAtom);
  const resizeWindow = useSetAtom(resizeWindowAtom);
  const app = getAppEntry(win.appId);
  const AppComponent = app.component;

  const resizeState = useRef<{
    dir: ResizeDirection;
    startMouseX: number;
    startMouseY: number;
    startX: number;
    startY: number;
    startW: number;
    startH: number;
  } | null>(null);

  const handleResizePointerDown = useCallback(
    (dir: ResizeDirection, e: React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();

      resizeState.current = {
        dir,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startX: win.position.x,
        startY: win.position.y,
        startW: win.size.width,
        startH: win.size.height,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      focusWindow(win.id);
    },
    [win.position.x, win.position.y, win.size.width, win.size.height, win.id, focusWindow]
  );

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const state = resizeState.current;
      if (!state) return;

      const deltaX = e.clientX - state.startMouseX;
      const deltaY = e.clientY - state.startMouseY;

      let newX = state.startX;
      let newY = state.startY;
      let newW = state.startW;
      let newH = state.startH;

      const dir = state.dir;

      // East
      if (dir.includes("e")) {
        newW = Math.max(MIN_WINDOW_WIDTH, state.startW + deltaX);
      }
      // West
      if (dir.includes("w")) {
        const proposedW = state.startW - deltaX;
        if (proposedW >= MIN_WINDOW_WIDTH) {
          newW = proposedW;
          newX = state.startX + deltaX;
        }
      }
      // South
      if (dir === "s" || dir === "se" || dir === "sw") {
        newH = Math.max(MIN_WINDOW_HEIGHT, state.startH + deltaY);
      }
      // North
      if (dir === "n" || dir === "ne" || dir === "nw") {
        const proposedH = state.startH - deltaY;
        if (proposedH >= MIN_WINDOW_HEIGHT) {
          newH = proposedH;
          newY = state.startY + deltaY;
        }
      }

      resizeWindow({
        windowId: win.id,
        size: { width: newW, height: newH },
        position: { x: newX, y: newY },
      });
    },
    [win.id, resizeWindow]
  );

  const handleResizePointerUp = useCallback(() => {
    resizeState.current = null;
  }, []);

  return (
    <motion.div
      layout={false}
      variants={isMobile ? mobileWindowVariants : windowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={windowTransition}
      className={`flex flex-col shadow-2xl overflow-hidden bg-white/80 backdrop-blur-xl border border-white/30 ${
        isMobile ? "fixed inset-0 rounded-none" : "absolute rounded-lg"
      }`}
      style={
        isMobile
          ? { zIndex: win.zIndex }
          : {
              left: win.position.x,
              top: win.position.y,
              width: win.size.width,
              height: win.size.height,
              minWidth: Math.min(MIN_WINDOW_WIDTH, window.innerWidth - 20),
              minHeight: Math.min(MIN_WINDOW_HEIGHT, window.innerHeight - 100),
              maxWidth: "calc(100vw - 20px)",
              maxHeight: "calc(100vh - 120px)",
              zIndex: win.zIndex,
            }
      }
      onPointerDown={() => focusWindow(win.id)}
    >
      {/* Title Bar */}
      <WindowTitleBar window={win} isMobile={isMobile} />

      {/* App Content */}
      <div className="flex-1 overflow-auto">
        <ErrorBoundary>
          <AppComponent {...(win.props ?? {})} />
        </ErrorBoundary>
      </div>

      {/* Resize Handles — desktop only */}
      {!isMobile && !win.isMaximized &&
        (Object.keys(RESIZE_POSITIONS) as ResizeDirection[]).map((dir) => (
          <div
            key={dir}
            className={`absolute ${RESIZE_CURSORS[dir]}`}
            style={{
              ...RESIZE_POSITIONS[dir],
              position: "absolute",
            }}
            onPointerDown={(e) => handleResizePointerDown(dir, e)}
            onPointerMove={handleResizePointerMove}
            onPointerUp={handleResizePointerUp}
          />
        ))}
    </motion.div>
  );
}
