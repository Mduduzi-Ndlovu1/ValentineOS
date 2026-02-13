"use client";

import type { WindowAppProps } from "@/types/os";

export function TextEditor({ content }: WindowAppProps) {
  return (
    <div className="h-full bg-white/95 p-4 overflow-y-auto">
      <pre className="font-mono text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
        {content ?? "No content"}
      </pre>
    </div>
  );
}
