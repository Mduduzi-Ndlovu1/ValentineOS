"use client";

import { useMotionValue, motion, AnimatePresence, PanInfo } from "framer-motion";
import { APP_REGISTRY } from "@/config/appRegistry";
import { DockIcon } from "./DockIcon";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useState, useRef, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export function Dock() {
  const mouseX = useMotionValue(Infinity);
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const swipeAreaRef = useRef<HTMLDivElement>(null);

  // Auto-close on resize if switching from desktop to mobile
  useEffect(() => {
    if (!isMobile) setIsMobileOpen(false);
  }, [isMobile]);

  // Handle swipe up gesture on the trigger area
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y < -50) {
      setIsMobileOpen(true);
    } else if (info.offset.y > 50) {
      setIsMobileOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Click away overlay */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-[190] bg-black/20 backdrop-blur-[2px]"
            />
          )}
        </AnimatePresence>

        {/* Swipe Trigger Area (Always visible at bottom) */}
        {!isMobileOpen && (
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 h-8 z-[195] flex items-center justify-center bg-transparent touch-none"
          >
            <div className="w-12 h-1 bg-white/20 rounded-full backdrop-blur-sm" />
          </motion.div>
        )}

        {/* Mobile Dock Drawer */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: isMobileOpen ? "0%" : "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.y > 50) setIsMobileOpen(false);
          }}
          className="fixed bottom-0 left-0 right-0 z-[200] pb-6 pt-4 bg-black/40 backdrop-blur-xl border-t border-white/10 rounded-t-3xl shadow-2xl touch-none"
        >
          {/* Handle for dragging down */}
          <div className="w-full flex justify-center mb-4">
            <div className="w-12 h-1.5 bg-white/20 rounded-full" />
          </div>

          {/* Carousel */}
          <div className="carousel carousel-center max-w-full p-4 space-x-4 bg-transparent rounded-box">
            {APP_REGISTRY.map((app) => (
              <div key={app.id} className="carousel-item">
                <DockIcon app={app} mouseX={mouseX} isMobile={true} />
              </div>
            ))}
          </div>
        </motion.div>
      </>
    );
  }

  // Desktop Dock (Unchanged)
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className="fixed flex items-end backdrop-blur-3xl bg-white/15 border border-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.2)] z-50 bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 gap-2 px-2 py-2 rounded-2xl md:rounded-[2rem]"
    >
      {APP_REGISTRY.map((app) => (
        <DockIcon key={app.id} app={app} mouseX={mouseX} isMobile={false} />
      ))}
    </motion.div>
  );
}
