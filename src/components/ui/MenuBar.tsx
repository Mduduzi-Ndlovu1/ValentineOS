"use client";

import { Bell, Sparkles } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  notificationHistoryAtom,
  toggleNotificationCenterAtom,
} from "@/store/atoms/ui";
import { openWindowAtom } from "@/store/atoms/windows";

const OS_VERSION = "1.0.0";

export function MenuBar() {
  const history = useAtomValue(notificationHistoryAtom);
  const toggle = useSetAtom(toggleNotificationCenterAtom);
  const openWindow = useSetAtom(openWindowAtom);
  const hasNotifications = history.length > 0;

  return (
    <div className="fixed top-0 left-0 right-0 h-7 z-[9980] bg-white/20 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => openWindow({ appId: "patch-notes" })}
          className="relative flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded transition-colors group"
        >
          <Sparkles className="w-3 h-3 text-white/80 group-hover:text-rose-300 transition-colors" />
          <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
            {OS_VERSION}
          </span>
          {hasNotifications && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#c41e3a] rounded-full" />
          )}
        </button>
        <span
          className="text-xs font-semibold text-white/80"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          ValentineOS
        </span>
      </div>
      <button
        onClick={() => toggle()}
        className="relative p-1 hover:bg-white/10 rounded transition-colors"
      >
        <Bell className="w-3.5 h-3.5 text-white/80" />
        {hasNotifications && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#c41e3a] rounded-full" />
        )}
      </button>
    </div>
  );
}
