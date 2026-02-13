"use client";

import { Pencil, Mail, Plus } from "lucide-react";
import type { LoveLetter } from "@/types/letters";

interface LetterSidebarProps {
  letters: LoveLetter[];
  selectedLetterId: string | null;
  onSelectLetter: (id: string) => void;
  onCreateLetter: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LetterSidebar({ letters, selectedLetterId, onSelectLetter, onCreateLetter }: LetterSidebarProps) {
  return (
    <div className="w-64 h-full bg-white/40 backdrop-blur-md border-r border-white/30 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex items-center justify-between">
        <h2
          className="text-xl text-[#5c1a1a]"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          Love Letters
        </h2>
        <button
          onClick={onCreateLetter}
          className="btn btn-xs btn-circle btn-ghost text-[#5c1a1a]"
          title="New Letter"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Letter List */}
      <div className="flex-1 overflow-y-auto p-2">
        {letters.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No letters yet
          </p>
        ) : (
          <div className="space-y-1">
            {letters.map((letter) => (
              <button
                key={letter.id}
                onClick={() => onSelectLetter(letter.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedLetterId === letter.id
                    ? "bg-[#e8d5c4] border border-[#c9a88a]"
                    : "hover:bg-white/40 border border-transparent"
                }`}
              >
                <div className="flex items-start gap-2">
                  {letter.is_sealed ? (
                    <Mail className="w-4 h-4 text-[#c9a88a] shrink-0 mt-0.5" />
                  ) : (
                    <Pencil className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#4a4a4a] truncate">
                      {letter.title || "Untitled"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(letter.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
