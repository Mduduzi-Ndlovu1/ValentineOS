"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Music, Heart, WifiOff, Loader2 } from "lucide-react";
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
}: {
  label: string;
  userAlias: "admin" | "neo";
  status: UserPlaybackStatus;
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
    <div className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 backdrop-blur-sm transition-all duration-500 min-w-[260px]">
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

// ─── Main Soul Sync Component ───
export function SoulSync(_props: WindowAppProps) {
  const data = useAtomValue(soulSyncDataAtom);
  const isLoading = useAtomValue(soulSyncLoadingAtom);
  const fetchData = useSetAtom(fetchSoulSyncAtom);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [spotifyConfigured, setSpotifyConfigured] = useState<boolean | null>(null);

  // Initial fetch + polling
  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(() => fetchData(), POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  const adminStatus: UserPlaybackStatus = data?.admin ?? {
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
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1a0a2e] to-[#2d1b4e] overflow-hidden">
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
          className="flex-1 flex items-center justify-center gap-4 p-4 overflow-y-auto"
        >
          {/* Admin card */}
          <PlayerCard
            label="Mduduzi"
            userAlias="admin"
            status={adminStatus}
          />

          {/* Center heart */}
          <div className="flex items-center justify-center px-2 shrink-0">
            <Heart className="w-8 h-8 text-white/15" />
          </div>
        </div>
      )}

      {/* Footer status */}
      <div className="px-4 py-2 text-center text-[10px] uppercase tracking-wider text-white/20 border-t border-white/5 shrink-0">
        {adminStatus.status === "playing" ? "Playing" : adminStatus.status === "paused" ? "Paused" : `Polling every ${POLL_INTERVAL / 1000}s`}
      </div>
    </div>
  );
}
