"use client";

import { useAtomValue } from "jotai";
import { AnimatePresence } from "framer-motion";
import { openWindowsAtom } from "@/store/atoms/windows";
import { WindowFrame } from "./WindowFrame";

export function WindowManager() {
  const windows = useAtomValue(openWindowsAtom);

  return (
    <AnimatePresence>
      {windows
        .filter((w) => !w.isMinimized)
        .map((w) => (
          <WindowFrame key={w.id} window={w} />
        ))}
    </AnimatePresence>
  );
}
