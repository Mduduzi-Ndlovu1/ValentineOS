"use client";

import { Pencil, Mail, Plus, Trash2 } from "lucide-react";
import type { LoveLetter } from "@/types/letters";

interface LetterSidebarProps {
  letters: LoveLetter[];
  selectedLetterId: string | null;
  onSelectLetter: (id: string) => void;
  onCreateLetter: () => void;
  onDeleteLetter: (id: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function LetterSidebar({ letters, selectedLetterId, onSelectLetter, onCreateLetter, onDeleteLetter }: LetterSidebarProps) {
  return (
    <div className="h-full bg-white/40 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="p-2 md:p-4 border-b border-white/20 flex items-center justify-between">
        <h2
          className="text-lg md:text-xl text-[#5c1a1a]"
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
      <div className="flex-1 overflow-y-auto p-1 md:p-2">
        {letters.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            No letters yet
          </p>
        ) : (
          <div className="space-y-1">
            {letters.map((letter) => (
              <div
                key={letter.id}
                className={`relative group ${
                  selectedLetterId === letter.id
                    ? "bg-[#e8d5c4] border border-[#c9a88a] rounded-lg"
                    : ""
                }`}
              >
                <button
                  onClick={() => onSelectLetter(letter.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedLetterId === letter.id
                      ? "bg-transparent"
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
                {/* Delete button - only show on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteLetter(letter.id);
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                  title="Delete letter"
                >
                  <Trash2 className="w-3 h-3 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
