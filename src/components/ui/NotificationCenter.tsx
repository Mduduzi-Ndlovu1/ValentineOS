"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Heart, Check, AlertCircle, Trash2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  notificationHistoryAtom,
  notificationCenterOpenAtom,
  clearNotificationHistoryAtom,
  toggleNotificationCenterAtom,
} from "@/store/atoms/ui";
import { openWindowAtom } from "@/store/atoms/windows";
import type { Notification, NotificationIcon } from "@/store/atoms/ui";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<NotificationIcon, LucideIcon> = {
  mail: Mail,
  heart: Heart,
  check: Check,
  alert: AlertCircle,
  trash: Trash2,
};

const TYPE_DEFAULT_ICON: Record<Notification["type"], NotificationIcon> = {
  info: "mail",
  success: "check",
  error: "alert",
};

const TYPE_COLORS: Record<Notification["type"], string> = {
  info: "bg-[#c41e3a]/10 text-[#c41e3a]",
  success: "bg-green-500/10 text-green-600",
  error: "bg-red-500/10 text-red-600",
};

function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function NotificationCenter() {
  const isOpen = useAtomValue(notificationCenterOpenAtom);
  const history = useAtomValue(notificationHistoryAtom);
  const clearHistory = useSetAtom(clearNotificationHistoryAtom);
  const toggle = useSetAtom(toggleNotificationCenterAtom);
  const openWindow = useSetAtom(openWindowAtom);

  const handleItemClick = (n: Notification) => {
    if (n.letterId) {
      openWindow({
        appId: "love-letters",
        props: { content: n.letterId },
      });
      toggle();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9990]"
            onClick={() => toggle()}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-7 right-0 bottom-0 w-[360px] z-[9991] bg-white/70 backdrop-blur-2xl border-l border-white/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5">
              <h2 className="text-base font-semibold text-gray-800">
                Notifications
              </h2>
              {history.length > 0 && (
                <button
                  onClick={() => clearHistory()}
                  className="text-xs text-[#c41e3a] hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>
            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {history.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-12">
                  No notifications
                </p>
              ) : (
                history.map((n) => (
                  <HistoryItem key={n.id} notification={n} onClick={() => handleItemClick(n)} />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function HistoryItem({ notification, onClick }: { notification: Notification; onClick: () => void }) {
  const iconKey = notification.icon ?? TYPE_DEFAULT_ICON[notification.type];
  const Icon = ICON_MAP[iconKey];
  const timeAgo = getRelativeTime(notification.timestamp);

  return (
    <div
      className={`bg-white/60 rounded-lg p-3 flex items-start gap-3 border border-white/30 ${notification.letterId ? "cursor-pointer hover:bg-white/80 transition-colors" : ""}`}
      onClick={onClick}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLORS[notification.type]}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        {notification.source && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            {notification.source}
          </p>
        )}
        <p className="text-sm text-gray-700">{notification.message}</p>
        <p className="text-[10px] text-gray-400 mt-1">{timeAgo}</p>
      </div>
    </div>
  );
}
