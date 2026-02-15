"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  wallpaperAtom,
  wallpaperFallbackAtom,
  desktopIconsAtom,
} from "@/store/atoms/desktop";
import { DesktopIcon } from "./DesktopIcon";
import { Dock } from "@/components/dock/Dock";
import { WindowManager } from "@/components/window/WindowManager";
import { Toast } from "@/components/ui/Toast";
import { MenuBar } from "@/components/ui/MenuBar";
import { NotificationCenter } from "@/components/ui/NotificationCenter";
import { useGlobalRealtime } from "@/hooks/useGlobalRealtime";
import { showNotificationAtom } from "@/store/atoms/ui";

function BootScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      key="boot-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <Heart className="w-20 h-20 text-pink-500 fill-pink-500" />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mt-4 text-lg font-light tracking-widest text-pink-300"
      >
        ValentineOS
      </motion.p>
    </motion.div>
  );
}

export function Desktop() {
  useGlobalRealtime();
  const isMobile = useIsMobile();

  const wallpaper = useAtomValue(wallpaperAtom);
  const fallback = useAtomValue(wallpaperFallbackAtom);
  const icons = useAtomValue(desktopIconsAtom);
  const [useFallback, setUseFallback] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const desktopRef = useRef<HTMLDivElement>(null!);

  const showNotification = useSetAtom(showNotificationAtom);

  // Handle Spotify OAuth redirect query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("connected") === "true") {
      showNotification({
        message: "Spotify connected successfully!",
        type: "success",
        icon: "heart",
        source: "Soul Sync",
      });
      window.history.replaceState({}, "", "/");
    }
    const spotifyError = params.get("spotify_error");
    if (spotifyError) {
      showNotification({
        message: `Spotify connection failed: ${spotifyError}`,
        type: "error",
        icon: "alert",
        source: "Soul Sync",
      });
      window.history.replaceState({}, "", "/");
    }
  }, [showNotification]);

  const handleImageError = useCallback(() => {
    setUseFallback(true);
  }, []);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  return (
    <div
      ref={desktopRef}
      className="relative w-dvw h-dvh overflow-hidden select-none"
      style={
        useFallback
          ? { background: fallback }
          : {
              backgroundImage: wallpaper,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
      }
    >
      {/* Preload wallpaper to detect errors */}
      {!useFallback && wallpaper.startsWith("url(") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={wallpaper.slice(4, -1)}
          alt=""
          className="hidden"
          onError={handleImageError}
        />
      )}

      {/* Desktop Icons — slide up after boot */}
      {isMobile ? (
        // pt-10 (40px) accounts for MenuBar height (h-7 = 28px) + spacing
        <div className="flex flex-wrap gap-4 p-4 pt-10 content-start">
          {icons.map((icon, i) => (
            <motion.div
              key={icon.appId}
              initial={{ opacity: 0, y: 100 }}
              animate={isBooting ? { opacity: 0, y: 100 } : { opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 25, delay: i * 0.05 }}
            >
              <DesktopIcon
                appId={icon.appId}
                index={i}
                constraintsRef={desktopRef}
                isMobile
              />
            </motion.div>
          ))}
        </div>
      ) : (
        icons.map((icon, i) => (
          <motion.div
            key={icon.appId}
            initial={{ opacity: 0, y: 100 }}
            animate={isBooting ? { opacity: 0, y: 100 } : { opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25, delay: i * 0.05 }}
          >
            <DesktopIcon
              appId={icon.appId}
              index={i}
              constraintsRef={desktopRef}
            />
          </motion.div>
        ))
      )}

      {/* Window Manager */}
      <WindowManager />

      {/* Menu Bar */}
      <MenuBar />

      {/* Toast Notifications */}
      <Toast />

      {/* Notification Center */}
      <NotificationCenter />

      {/* Dock — slides up after boot */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={isBooting ? { y: 100, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 25, delay: 0.1 }}
      >
        <Dock />
      </motion.div>

      {/* Boot Screen Overlay */}
      <AnimatePresence>
        {isBooting && <BootScreen onComplete={handleBootComplete} />}
      </AnimatePresence>
    </div>
  );
}
