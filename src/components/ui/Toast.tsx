"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { useAtomValue } from "jotai";
import { notificationAtom } from "@/store/atoms/ui";

export function Toast() {
  const notification = useAtomValue(notificationAtom);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-4 right-4 z-[9999]"
        >
          <div className="glass card bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl p-4 pr-6 rounded-xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c41e3a]/10 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#c41e3a]" />
            </div>
            <p className="text-sm font-medium text-gray-800 whitespace-nowrap">
              {notification.message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
