"use client";

import { useAtomValue } from "jotai";
import { openWindowsAtom } from "@/store/atoms/windows";
import { WindowFrame } from "./WindowFrame";

export function WindowManager() {
  const windows = useAtomValue(openWindowsAtom);

  return (
    <>
      {windows
        .filter((w) => !w.isMinimized)
        .map((w) => (
          <WindowFrame key={w.id} window={w} />
        ))}
    </>
  );
}
