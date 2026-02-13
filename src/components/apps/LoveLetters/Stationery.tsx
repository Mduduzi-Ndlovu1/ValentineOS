"use client";

import type { LoveLetter } from "@/types/letters";

interface StationeryProps {
  letter: LoveLetter;
}

export function Stationery({ letter }: StationeryProps) {
  return (
    <div
      className="max-w-3xl w-full aspect-[1/1.414] bg-[#fffbf0] shadow-2xl rotate-[0.5deg] relative"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 79px, #e8d5c4 79px, #e8d5c4 81px, transparent 81px),
          linear-gradient(#e8d5c4 1px, transparent 1px)
        `,
        backgroundSize: "100% 2rem",
      }}
    >
      {/* Paper Content */}
      <div className="p-12 pl-20 h-full overflow-y-auto">
        {/* Header */}
        <h1
          className="text-4xl text-[#5c1a1a] mb-8"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          {letter.title}
        </h1>

        {/* Author */}
        <p className="text-sm text-[#8b5a5a] mb-8 italic">
          — {letter.author}
        </p>

        {/* Content */}
        <div
          className="prose prose-p:text-[#4a4a4a] prose-headings:text-[#5c1a1a] text-lg leading-relaxed"
          dangerouslySetInnerHTML={{ __html: letter.content }}
        />
      </div>

      {/* Wax Seal Badge (if sealed) */}
      {letter.is_sealed && (
        <div className="absolute bottom-8 right-8 w-12 h-12 rounded-full bg-[#c41e3a] shadow-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">♥</span>
        </div>
      )}
    </div>
  );
}
