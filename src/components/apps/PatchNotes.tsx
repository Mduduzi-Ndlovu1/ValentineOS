"use client";

import type { WindowAppProps } from "@/types/os";

const OS_VERSION = "1.0.0";

const PATCH_NOTES = [
  {
    version: "1.0.0",
    date: "February 15, 2026",
    title: "Initial Release",
    changes: [
      "Welcome to ValentineOS - a macOS-inspired web operating system!",
      "Launch apps from the dock or desktop icons",
      "Organize your files with the Finder app",
      "Write beautiful love letters with the Love Letters app",
      "Responsive window management with drag, resize, and minimize",
      "Beautiful glassmorphism UI design",
      "Notification center for system alerts",
    ],
  },
];

export function PatchNotes({}: WindowAppProps) {
  return (
    <div className="h-full bg-gradient-to-br from-rose-50 to-pink-50 overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold text-rose-600 mb-2"
            style={{ fontFamily: "var(--font-dancing-script)" }}
          >
            ValentineOS
          </h1>
          <p className="text-rose-400 font-medium">Version {OS_VERSION}</p>
        </div>

        <div className="space-y-8">
          {PATCH_NOTES.map((patch) => (
            <div
              key={patch.version}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-rose-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    v{patch.version}
                  </span>
                  <span className="text-rose-400 text-sm">{patch.date}</span>
                </div>
              </div>

              <h2 className="text-xl font-semibold text-rose-700 mb-4">
                {patch.title}
              </h2>

              <ul className="space-y-3">
                {patch.changes.map((change, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 text-rose-600/80"
                  >
                    <span className="text-rose-400 mt-1">♥</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 text-rose-400/60 text-sm">
          Made with love for Valentine&apos;s Day
        </div>
      </div>
    </div>
  );
}
