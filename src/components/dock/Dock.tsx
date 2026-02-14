"use client";

import { useMotionValue, motion } from "framer-motion";
import { APP_REGISTRY } from "@/config/appRegistry";
import { DockIcon } from "./DockIcon";

export function Dock() {
  const mouseX = useMotionValue(Infinity);

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed bottom-1 md:bottom-3 left-1/2 -translate-x-1/2 flex items-end gap-0.5 md:gap-1 px-1 md:px-3 py-1 md:py-2 rounded-xl md:rounded-2xl backdrop-blur-2xl bg-white/10 border border-white/20 shadow-lg z-50"
    >
      {APP_REGISTRY.map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} />
      ))}
    </motion.div>
  );
}
