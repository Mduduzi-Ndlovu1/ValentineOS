"use client";

import { atom } from "jotai";
import type { SoulSyncResponse } from "@/types/spotify";

// ─── Data atom ───
export const soulSyncDataAtom = atom<SoulSyncResponse | null>(null);

// ─── Loading / error state ───
export const soulSyncLoadingAtom = atom<boolean>(false);
export const soulSyncErrorAtom = atom<string | null>(null);

// ─── Fetch action (write-only) ───
export const fetchSoulSyncAtom = atom(null, async (_get, set) => {
  set(soulSyncLoadingAtom, true);
  set(soulSyncErrorAtom, null);

  try {
    const response = await fetch("/api/soul-sync");
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data: SoulSyncResponse = await response.json();
    set(soulSyncDataAtom, data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch";
    set(soulSyncErrorAtom, message);
  } finally {
    set(soulSyncLoadingAtom, false);
  }
});
