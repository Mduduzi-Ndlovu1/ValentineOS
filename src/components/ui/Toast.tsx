"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, Heart, Check, AlertCircle, X, Trash2 } from "lucide-react";
import { useAtomValue, useSetAtom } from "jotai";
import { notificationsAtom, dismissNotificationAtom } from "@/store/atoms/ui";
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

export function Toast() {
  const notifications = useAtomValue(notificationsAtom);
  const dismiss = useSetAtom(dismissNotificationAtom);
  const openWindow = useSetAtom(openWindowAtom);

  const handleNotificationClick = (n: Notification) => {
    if (n.letterId) {
      openWindow({
        appId: "love-letters",
        props: { content: n.letterId },
      });
      dismiss(n.id);
    }
  };

  return (
    <div className="fixed top-10 right-4 z-[9999] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => {
          const iconKey = n.icon ?? TYPE_DEFAULT_ICON[n.type];
          const Icon = ICON_MAP[iconKey];
          return (
            <motion.div
              key={n.id}
              layout
              initial={{ x: 400, opacity: 0, scale: 0.8 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 400, opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div
                className={`relative bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-4 pr-10 rounded-xl flex items-center gap-3 min-w-[280px] ${n.letterId ? "cursor-pointer hover:bg-white/90 transition-colors" : ""}`}
                onClick={() => handleNotificationClick(n)}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${TYPE_COLORS[n.type]}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  {n.source && (
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      {n.source}
                    </p>
                  )}
                  <p className="text-sm font-medium text-gray-800">
                    {n.message}
                  </p>
                  {n.letterId && (
                    <p className="text-[10px] text-pink-400 mt-0.5">Click to open</p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(n.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
