"use client";

import type { WindowAppProps } from "@/types/os";

export function ImageViewer({ imageUrl }: WindowAppProps) {
  if (!imageUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-black/50 text-gray-400 text-sm">
        No image to display
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center bg-black/50 p-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-full object-contain rounded shadow-lg"
      />
    </div>
  );
}
