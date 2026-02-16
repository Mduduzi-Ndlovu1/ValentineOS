"use client";

import type { WindowAppProps } from "@/types/os";
import { OS_VERSION } from "@/config/version";

const PATCH_NOTES = [
  {
    version: "1.1.0",
    date: "February 16, 2026",
    title: "The Reader's Nook",
    changes: [
      "A new corner of the city. I built a room for readers — warm cream walls, soft beige light. It feels like a nook where you can curl up with a good story.",
      "The shelves stock the NYT bestsellers. I cross-referenced with Google to make sure every book has its cover — no empty spines on my watch.",
      "If there's something specific you're after, just search. Google Books has it indexed. Type, and it appears.",
      "Tap any book to dive deeper. You'll see YouTube reviews — real people talking about the story — and articles from the Times. The world has plenty to say about what you're reading.",
      "Your favorites stay on your shelf. Close the app, come back later — they're still there. I wired that to Supabase so it remembers you.",
      "And speaking of remembering: your wallpaper now sticks. Pick a new one, log out, come back — it's still there. The city remembers what you chose.",
      "I brought in new fonts. Montserrat for the headers, Libre Caslon for the words. Readability meets elegance.",
    ],
  },
  {
    version: "1.0.3",
    date: "February 16, 2026",
    title: "Resonance",
    changes: [
      "You can connect your Spotify now. I built Soul Sync for two \u2014 your card lights up next to mine, and suddenly we\u2019re in the same room.",
      "Both our now-playing tracks show side by side. Album art, song names, progress bars. I can see what you\u2019re vibing to in real-time.",
      "When we\u2019re playing the same song at the same time, the whole widget glows pink. I called it resonance \u2014 felt like the right word.",
      "The heart between our cards fills from whichever side connects first. My half from the left, yours from the right. Two halves finding each other.",
      "When we\u2019re both in, it fills completely and pulses. Ripples radiate outward like a shared heartbeat \u2014 three rings, expanding, fading, again.",
      "You\u2019ll get a notification the moment we hit resonance. Just so you know it happened. Just so you feel it too.",
    ],
  },
  {
    version: "1.0.2",
    date: "February 16, 2026",
    title: "A Frequency in the Static",
    changes: [
      "New app: Soul Sync. I wired Spotify into our world \u2014 a dark room with a cosmic ceiling where I can see what you\u2019re listening to.",
      "Secure login through Spotify. Tap \u201CConnect\u201D, sign in, and you\u2019re linked. No passwords stored, no shortcuts \u2014 I built it properly for you.",
      "It checks every 10 seconds. Your album art, track name, artist, and how far through the song you are \u2014 all live on screen.",
      "Your session stays alive even if you close the tab and come back. The connection remembers you.",
      "If something\u2019s not set up yet, it tells you what\u2019s needed instead of breaking. I didn\u2019t want you to hit a dead end.",
      "The whole thing sits in a dark gradient with a cosmic feel. I built it for two, but in this version \u2014 only my side was lit.",
    ],
  },
  {
    version: "1.0.1",
    date: "February 15, 2026",
    title: "The City Learns to Breathe",
    changes: [
      "I made everything work on your phone. Apps open full-screen, the dock is touch-friendly, and the icons rearrange into a clean grid.",
      "One tap to open anything on mobile. No double-click. I wanted it to feel effortless when you\u2019re on the go.",
      "New Settings app with a live counter \u2014 years, days, hours, minutes, seconds since we started. Open it. Watch it tick. It hasn\u2019t stopped.",
      "I picked six wallpapers for you. Sunsets, roses, city lights. Go to Settings, choose one, and the whole world changes around you.",
      "Love Letters works on mobile now too \u2014 a clean list view with a back button so you can browse through everything we\u2019ve written.",
      "Fixed the wallpapers so they always fill your screen perfectly. No gaps, no tiling. Just the full picture.",
    ],
  },
  {
    version: "1.0.0",
    date: "February 15, 2026",
    title: "The First Light",
    changes: [
      "This is where it started. ValentineOS boots with a heartbeat in the dark, the name fades in, and then \u2014 your world appears.",
      "The Dock sits along the bottom. Hover over the icons and they magnify toward you. Click one and the app launches.",
      "I built a Finder so you can browse through folders and files. Open a text file and it shows in the editor. Open an image and it previews.",
      "Love Letters \u2014 a desk with lined paper where we write to each other. Rich text, auto-save, and when you\u2019re done \u2014 seal it with a wax heart. Sealed letters are forever.",
      "Every window can be dragged, resized, minimized, and maximized. They spring open with a bounce and blur away when you close them.",
      "The whole design is frosted glass and soft pinks. I wanted it to feel like something you\u2019d want to live inside.",
      "There\u2019s a notification bell that tracks everything \u2014 sealed letters, new connections, little moments worth remembering.",
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
            The Valentina Chronicles
          </h1>
          <p className="text-rose-400 font-medium italic">Dispatches from the city &mdash; v{OS_VERSION}</p>
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
          The story continues. The city hums.
        </div>
      </div>
    </div>
  );
}
