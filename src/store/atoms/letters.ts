import { atom } from "jotai";
import type { LoveLetter } from "@/types/letters";
import { fetchLetters } from "@/services/letterService";

export const lettersAtom = atom<LoveLetter[]>([]);

export const loadLettersAtom = atom(null, async (get, set) => {
  const letters = await fetchLetters();
  set(lettersAtom, letters);
});
