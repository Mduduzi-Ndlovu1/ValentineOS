"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Music, Heart, WifiOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { showNotificationAtom } from "@/store/atoms/ui";
import {
  soulSyncDataAtom,
  soulSyncLoadingAtom,
  fetchSoulSyncAtom,
} from "@/store/atoms/soulSync";
import type { WindowAppProps } from "@/types/os";
import type { UserPlaybackStatus } from "@/types/spotify";

const POLL_INTERVAL = 10_000;

// ─── Player Card ───
function PlayerCard({
  label,
  userAlias,
  status,
  isResonating,
}: {
  label: string;
  userAlias: "admin" | "neo";
  status: UserPlaybackStatus;
  isResonating: boolean;
}) {
  const handleConnect = useCallback(() => {
    window.location.href = `/api/auth/spotify/login?user=${userAlias}`;
  }, [userAlias]);

  // Disconnected: show connect button
  if (status.status === "disconnected") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm min-w-[260px]">
        <WifiOff className="w-12 h-12 text-white/20" />
        <span className="text-xs uppercase tracking-wider text-white/40">
          {label}
        </span>
        <p className="text-white/40 text-sm">Not connected</p>
        <button
          onClick={handleConnect}
          className="px-4 py-2 rounded-full bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
        >
          Connect Spotify
        </button>
      </div>
    );
  }

  // Playing / Paused / Idle
  return (
    <div className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm transition-all duration-500 min-w-[260px] ${isResonating ? "ring-2 ring-pink-400 shadow-[0_0_25px_rgba(244,114,182,0.4)]" : ""}`}>
      <span className="text-xs uppercase tracking-wider text-white/40">
        {label}
      </span>

      {status.track ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={status.track.albumArt}
            alt={status.track.name}
            className="w-40 h-40 rounded-xl shadow-lg object-cover"
          />
          <p className="text-white font-medium text-center truncate max-w-[220px]">
            {status.track.name}
          </p>
          <p className="text-white/60 text-sm text-center truncate max-w-[220px]">
            {status.track.artist}
          </p>

          {/* Progress bar */}
          <div className="w-full max-w-[220px] h-1 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-400 rounded-full transition-all duration-1000"
              style={{
                width: `${(status.track.progressMs / Math.max(status.track.durationMs, 1)) * 100}%`,
              }}
            />
          </div>

          <span className="text-[10px] uppercase tracking-wider text-white/30">
            {status.isPlaying ? "Now playing" : "Paused"}
          </span>
        </>
      ) : (
        <>
          <div className="w-40 h-40 rounded-xl bg-white/5 flex items-center justify-center">
            <Music className="w-12 h-12 text-white/15" />
          </div>
          <p className="text-white/40 text-sm">Nothing playing</p>
        </>
      )}
    </div>
  );
}

// ─── Sync Heart ───
// States: neither connected → empty outline, left only → left half filled,
// right only → right half filled, both → full red fill + pulse + ripples
function SyncHeart({
  adminConnected,
  neoConnected,
  isResonating,
}: {
  adminConnected: boolean;
  neoConnected: boolean;
  isResonating: boolean;
}) {
  const bothConnected = adminConnected && neoConnected;
  const neitherConnected = !adminConnected && !neoConnected;

  return (
    <div className="flex items-center justify-center px-2 shrink-0">
      <div className="relative w-12 h-12">
        {/* Ripple rings — only when both connected */}
        {bothConnected && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut",
                }}
              >
                <Heart className="w-10 h-10 text-pink-400" strokeWidth={1} />
              </motion.div>
            ))}
          </>
        )}

        {/* Main heart container */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={
            bothConnected
              ? { scale: [1, 1.15, 1] }
              : {}
          }
          transition={
            bothConnected
              ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
              : undefined
          }
        >
          {/* Base outline heart (always visible) */}
          <Heart
            className={`w-10 h-10 absolute transition-colors duration-700 ${
              neitherConnected
                ? "text-white/15"
                : bothConnected
                  ? "text-rose-500"
                  : "text-pink-400/50"
            }`}
            strokeWidth={1.5}
          />

          {/* Half-fill: admin side (left) */}
          {adminConnected && !bothConnected && (
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            >
              <Heart
                className="w-10 h-10 text-rose-500 fill-rose-500"
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Half-fill: neo side (right) */}
          {neoConnected && !bothConnected && (
            <div
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
              style={{ clipPath: "inset(0 0 0 50%)" }}
            >
              <Heart
                className="w-10 h-10 text-rose-500 fill-rose-500"
                strokeWidth={1.5}
              />
            </div>
          )}

          {/* Full fill: both connected */}
          <AnimatePresence>
            {bothConnected && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5 }}
              >
                <Heart
                  className={`w-10 h-10 fill-rose-500 transition-colors duration-500 ${
                    isResonating ? "text-pink-300" : "text-rose-500"
                  }`}
                  strokeWidth={1.5}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Main Soul Sync Component ───
export function SoulSync(_props: WindowAppProps) {
  const isMobile = useIsMobile();
  const data = useAtomValue(soulSyncDataAtom);
  const isLoading = useAtomValue(soulSyncLoadingAtom);
  const fetchData = useSetAtom(fetchSoulSyncAtom);
  const showNotification = useSetAtom(showNotificationAtom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevResonating = useRef(false);
  const [spotifyConfigured, setSpotifyConfigured] = useState<boolean | null>(null);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  // Resonance notification (fire once per resonance start)
  useEffect(() => {
    if (data?.isResonating && !prevResonating.current) {
      showNotification({
        message: "Your souls are in sync!",
        type: "success",
        icon: "heart",
        source: "Soul Sync",
      });
    }
    prevResonating.current = data?.isResonating ?? false;
  }, [data?.isResonating, showNotification]);

  const adminStatus: UserPlaybackStatus = data?.admin ?? {
    isPlaying: false,
    track: null,
    status: "disconnected",
  };

  const neoStatus: UserPlaybackStatus = data?.neo ?? {
    isPlaying: false,
    track: null,
    status: "disconnected",
  };

  // Check Spotify config on mount
  useEffect(() => {
    fetch("/api/auth/spotify/status")
      .then((res) => res.json())
      .then((statusData) => {
        setSpotifyConfigured(statusData.configured);
      })
      .catch(() => {
        setSpotifyConfigured(false);
      });
  }, []);

  return (
    <div className="h-full flex flex-col bg-transparent overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-pink-400" />
          <h1
            className="text-lg text-white/90"
            style={{ fontFamily: "var(--font-dancing-script)" }}
          >
            Soul Sync
          </h1>
        </div>
        {isLoading && (
          <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
        )}
      </div>

      {/* Content */}
      {spotifyConfigured === null ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
        </div>
      ) : !spotifyConfigured ? (
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="max-w-md text-center space-y-4">
            <WifiOff className="w-16 h-16 text-white/20 mx-auto" />
            <h2 className="text-xl text-white/80 font-medium">Spotify Not Configured</h2>
            <p className="text-white/50 text-sm">
              To use Soul Sync, you need to connect a Spotify app.
            </p>
            <div className="bg-white/5 rounded-xl p-4 text-left space-y-2">
              <p className="text-white/60 text-xs uppercase tracking-wider">Required Environment Variables</p>
              <ul className="text-white/40 text-sm space-y-1 font-mono">
                <li>SPOTIFY_CLIENT_ID</li>
                <li>SPOTIFY_CLIENT_SECRET</li>
                <li>NEXT_PUBLIC_BASE_URL</li>
              </ul>
            </div>
            <p className="text-white/40 text-xs">
              Get your credentials at{" "}
              <a
                href="https://developer.spotify.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-400 hover:underline"
              >
                developer.spotify.com
              </a>
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`flex-1 flex items-center justify-center gap-4 p-4 overflow-y-auto ${
            isMobile ? "flex-col" : "flex-row"
          }`}
        >
          {/* Admin card */}
          <PlayerCard
            label="Mduduzi"
            userAlias="admin"
            status={adminStatus}
            isResonating={data?.isResonating ?? false}
          />

          {/* Center sync heart */}
          <SyncHeart
            adminConnected={adminStatus.status !== "disconnected"}
            neoConnected={neoStatus.status !== "disconnected"}
            isResonating={data?.isResonating ?? false}
          />

          {/* Neo card */}
          <PlayerCard
            label="Neo"
            userAlias="neo"
            status={neoStatus}
            isResonating={data?.isResonating ?? false}
          />
        </div>
      )}

      {/* Footer status */}
      <div className="px-4 py-2 text-center text-[10px] uppercase tracking-wider text-white/20 border-t border-white/5 shrink-0">
        {data?.isResonating
          ? "Resonating \u2728"
          : `Polling every ${POLL_INTERVAL / 1000}s`}
      </div>
    </div>
  );
}
