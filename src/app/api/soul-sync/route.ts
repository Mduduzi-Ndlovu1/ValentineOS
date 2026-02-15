import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { UserPlaybackStatus, SoulSyncResponse } from "@/types/spotify";

export const dynamic = "force-dynamic";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

// ─── Helper: refresh access token ───
async function refreshAccessToken(
  refreshToken: string,
  userAlias?: string
): Promise<string | null> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return null;
  const data = await response.json();

  // Handle token rotation: Spotify may issue a new refresh token
  if (data.refresh_token && data.refresh_token !== refreshToken && userAlias) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase
        .from("spotify_tokens")
        .update({
          refresh_token: data.refresh_token,
          updated_at: new Date().toISOString(),
        })
        .eq("user_alias", userAlias);
    }
  }

  return data.access_token as string;
}

// ─── Helper: get Spotify playback status ───
async function getSpotifyStatus(
  refreshToken: string,
  userAlias?: string
): Promise<UserPlaybackStatus> {
  const accessToken = await refreshAccessToken(refreshToken, userAlias);
  if (!accessToken) {
    return { isPlaying: false, track: null, status: "disconnected" };
  }

  const response = await fetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  // 204 = no active playback
  if (response.status === 204) {
    return { isPlaying: false, track: null, status: "idle" };
  }

  if (!response.ok) {
    return { isPlaying: false, track: null, status: "idle" };
  }

  const data = await response.json();

  if (!data.item) {
    return { isPlaying: false, track: null, status: "idle" };
  }

  return {
    isPlaying: data.is_playing,
    status: data.is_playing ? "playing" : "paused",
    track: {
      name: data.item.name,
      artist: data.item.artists
        .map((a: { name: string }) => a.name)
        .join(", "),
      albumArt: data.item.album.images[0]?.url ?? "",
      trackUri: data.item.uri,
      progressMs: data.progress_ms ?? 0,
      durationMs: data.item.duration_ms ?? 0,
    },
  };
}

// ─── Helper: get refresh token from Supabase ───
async function getRefreshToken(
  userAlias: string
): Promise<string | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return null;

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data } = await supabase
    .from("spotify_tokens")
    .select("refresh_token")
    .eq("user_alias", userAlias)
    .single();

  return data?.refresh_token ?? null;
}

// ─── GET /api/soul-sync ───
export async function GET() {
  const disconnected: UserPlaybackStatus = {
    isPlaying: false,
    track: null,
    status: "disconnected",
  };

  const adminToken = await getRefreshToken("admin");

  const adminStatus = adminToken
    ? await getSpotifyStatus(adminToken, "admin")
    : disconnected;

  const body: SoulSyncResponse = {
    admin: adminStatus,
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
