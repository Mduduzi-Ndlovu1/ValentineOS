"use client";

import { Bell, Sparkles } from "lucide-react";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import {
  notificationHistoryAtom,
  toggleNotificationCenterAtom,
} from "@/store/atoms/ui";
import { openWindowAtom } from "@/store/atoms/windows";
import { hasNewVersionAtom } from "@/store/atoms/desktop";
import { currentUserAtom } from "@/store/atoms/user";
import { markVersionReadAtom } from "@/store/atoms/desktop";
import { OS_VERSION } from "@/config/version";

export function MenuBar() {
  const history = useAtomValue(notificationHistoryAtom);
  const toggle = useSetAtom(toggleNotificationCenterAtom);
  const openWindow = useSetAtom(openWindowAtom);
  const hasNotifications = history.length > 0;
  
  const [hasNewVersion] = useAtom(hasNewVersionAtom);
  const [currentUser] = useAtom(currentUserAtom);
  const markVersionRead = useSetAtom(markVersionReadAtom);

  const handleOpenPatchNotes = () => {
    openWindow({ appId: "patch-notes" });
    
    if (currentUser) {
      const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";
      markVersionRead(userAlias);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 h-7 z-[9980] bg-white/20 backdrop-blur-2xl border-b border-white/10 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={handleOpenPatchNotes}
          className="relative flex items-center gap-1.5 px-2 py-0.5 hover:bg-white/10 rounded transition-colors group"
        >
          <Sparkles className="w-3 h-3 text-white/80 group-hover:text-rose-300 transition-colors" />
          <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors">
            {OS_VERSION}
          </span>
          {hasNewVersion && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
              NEW
            </span>
          )}
          {hasNotifications && !hasNewVersion && (
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
