import { atom } from "jotai";
import type { LoveLetter } from "@/types/letters";
import { fetchLetters } from "@/services/letterService";

export const lettersAtom = atom<LoveLetter[]>([]);

export const loadLettersAtom = atom(null, async (get, set) => {
  const letters = await fetchLetters();
  set(lettersAtom, letters);
});

// Track which sealed letters have been opened/read (persisted in localStorage)
const STORAGE_KEY = "valentineos-read-letters";

function loadReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
  } catch {
    // storage full or unavailable
  }
}

export const readLetterIdsAtom = atom<Set<string>>(loadReadIds());

export const markLetterReadAtom = atom(null, (get, set, letterId: string) => {
  const current = get(readLetterIdsAtom);
  if (current.has(letterId)) return;
  const next = new Set(current);
  next.add(letterId);
  set(readLetterIdsAtom, next);
  saveReadIds(next);
});
