"use client";

import { motion } from "framer-motion";
import { Lock, Heart } from "lucide-react";
import type { LoveLetter } from "@/types/letters";
import { LetterEditor } from "./LetterEditor";

interface StationeryProps {
  letter: LoveLetter;
  editable: boolean;
  onUpdateContent: (content: string) => void;
  onUpdateTitle?: (title: string) => void;
  onUpdateAuthor?: (author: string) => void;
  onSeal?: () => void;
  onSave?: () => void;
}

export function Stationery({ letter, editable, onUpdateContent, onUpdateTitle, onUpdateAuthor, onSeal, onSave }: StationeryProps) {
  return (
    <div
      className="max-w-3xl w-full max-h-[90%] bg-[#fffbf0] shadow-2xl rotate-[0.5deg] relative overflow-hidden flex flex-col"
      style={{
        backgroundImage: `
          linear-gradient(90deg, transparent 79px, #e8d5c4 79px, #e8d5c4 81px, transparent 81px),
          linear-gradient(#e8d5c4 1px, transparent 1px)
        `,
        backgroundSize: "100% 2rem",
      }}
    >
      {/* Action Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        {editable && onSave && (
          <button
            onClick={onSave}
            className="btn btn-xs btn-primary text-[#5c1a1a] border-[#5c1a1a] hover:bg-[#5c1a1a] hover:text-white gap-1"
          >
            <Heart className="w-3 h-3" />
            Save
          </button>
        )}
        {!letter.is_sealed && onSeal && (
          <button
            onClick={onSeal}
            className="btn btn-xs btn-outline text-[#5c1a1a] border-[#5c1a1a] hover:bg-[#5c1a1a] hover:text-white gap-1"
          >
            <Lock className="w-3 h-3" />
            Seal
          </button>
        )}
      </div>

      {/* Paper Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-12 pl-20">
        {/* Title */}
        {editable && onUpdateTitle ? (
          <input
            type="text"
            value={letter.title}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="text-4xl text-[#5c1a1a] mb-8 bg-transparent border-none outline-none w-full"
            style={{ fontFamily: "var(--font-dancing-script)" }}
            placeholder="Letter title..."
          />
        ) : (
          <h1
            className="text-4xl text-[#5c1a1a] mb-8"
            style={{ fontFamily: "var(--font-dancing-script)" }}
          >
            {letter.title}
          </h1>
        )}

        {/* Author */}
        {editable && onUpdateAuthor ? (
          <input
            type="text"
            value={letter.author}
            onChange={(e) => onUpdateAuthor(e.target.value)}
            className="text-sm text-[#8b5a5a] mb-8 italic bg-transparent border-none outline-none w-full"
            placeholder="From: "
          />
        ) : (
          <p className="text-sm text-[#8b5a5a] mb-8 italic">
            — {letter.author}
          </p>
        )}

        {/* Editor */}
        <LetterEditor
          content={letter.content}
          editable={editable}
          onUpdate={onUpdateContent}
        />
      </div>

      {/* Wax Seal Badge (if sealed) */}
      {letter.is_sealed && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-[#c41e3a] shadow-lg flex items-center justify-center"
        >
          <Heart className="w-8 h-8 text-white" fill="white" />
        </motion.div>
      )}
    </div>
  );
}
