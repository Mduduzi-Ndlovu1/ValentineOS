// ─── Database row (spotify_tokens table) ───
export interface SpotifyToken {
  id: string;
  user_alias: string;
  refresh_token: string;
  updated_at: string;
}

// ─── Track info returned by the aggregation API ───
export interface SpotifyTrack {
  name: string;
  artist: string;
  albumArt: string;
  trackUri: string;
  progressMs: number;
  durationMs: number;
}

// ─── Per-user playback status ───
export interface UserPlaybackStatus {
  isPlaying: boolean;
  track: SpotifyTrack | null;
  status: "playing" | "paused" | "idle" | "disconnected";
}

// ─── Full API response from /api/soul-sync ───
export interface SoulSyncResponse {
  admin: UserPlaybackStatus;
}
