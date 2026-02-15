"use client";

import { useMotionValue, motion } from "framer-motion";
import { APP_REGISTRY } from "@/config/appRegistry";
import { DockIcon } from "./DockIcon";
import { useIsMobile } from "@/hooks/useIsMobile";

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const isMobile = useIsMobile();

  return (
    <motion.div
      onMouseMove={isMobile ? undefined : (e) => mouseX.set(e.pageX)}
      onMouseLeave={isMobile ? undefined : () => mouseX.set(Infinity)}
      className={`fixed flex items-end backdrop-blur-2xl bg-white/10 border border-white/20 shadow-lg ${
        isMobile ? "z-[200]" : "z-50"
      } ${
        isMobile
          ? "bottom-0 left-0 right-0 w-full rounded-none px-2 py-2 gap-1 justify-evenly"
          : "bottom-1 md:bottom-3 left-1/2 -translate-x-1/2 gap-0.5 md:gap-1 px-1 md:px-3 py-1 md:py-2 rounded-xl md:rounded-2xl"
      }`}
    >
      {APP_REGISTRY.map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} isMobile={isMobile} />
      ))}
    </motion.div>
  );
}
