"use client";

import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { lettersAtom, loadLettersAtom } from "@/store/atoms/letters";
import { LetterSidebar } from "./LetterSidebar";
import { Stationery } from "./Stationery";
import type { LoveLetter } from "@/types/letters";

export function LoveLetters() {
  const [selectedLetterId, setSelectedLetterId] = useState<string | null>(null);
  const letters = useAtomValue(lettersAtom);
  const loadLetters = useSetAtom(loadLettersAtom);

  useEffect(() => {
    loadLetters();
  }, [loadLetters]);

  const selectedLetter = letters.find((l) => l.id === selectedLetterId) ?? null;

  return (
    <div className="flex h-full bg-[#f3e5dc]">
      {/* Sidebar */}
      <LetterSidebar
        letters={letters}
        selectedLetterId={selectedLetterId}
        onSelectLetter={setSelectedLetterId}
      />

      {/* Main Stage - Desk/Wood background */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-[#8b5a2b] to-[#5c3a1e]">
        {selectedLetter ? (
          <Stationery letter={selectedLetter} />
        ) : (
          <div className="text-center text-white/60">
            <p className="font-['Dancing_Script'] text-3xl mb-2">
              Select a letter to read
            </p>
            <p className="text-sm text-white/40">
              Or create a new one to pour your heart out
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
