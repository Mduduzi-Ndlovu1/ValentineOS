"use client";

import { motion } from "framer-motion";
import { Heart, User } from "lucide-react";
import { useSetAtom } from "jotai";
import { currentUserAtom } from "@/store/atoms/user";
import type { UserName } from "@/store/atoms/user";

const USERS: { name: UserName; color: string }[] = [
  { name: "Mduduzi", color: "from-pink-500 to-rose-600" },
  { name: "Neo", color: "from-red-400 to-pink-600" },
];

export function LoginScreen() {
  const setCurrentUser = useSetAtom(currentUserAtom);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #1a0a0e 0%, #2d0a1a 40%, #1a0a0e 100%)",
      }}
    >
      {/* Floating hearts background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-pink-500/10"
            initial={{
              x: `${Math.random() * 100}%`,
              y: `${110 + Math.random() * 20}%`,
            }}
            animate={{
              y: "-10%",
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          >
            <Heart className="w-6 h-6 fill-current" />
          </motion.div>
        ))}
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-12 text-center"
      >
        <Heart className="w-16 h-16 text-pink-500 fill-pink-500 mx-auto mb-4" />
        <h1
          className="text-4xl text-pink-200 tracking-wider"
          style={{ fontFamily: "var(--font-dancing-script)" }}
        >
          ValentineOS
        </h1>
        <p className="text-sm text-pink-300/50 mt-2 tracking-widest uppercase">
          Who&apos;s writing today?
        </p>
      </motion.div>

      {/* User Cards */}
      <div className="flex gap-8">
        {USERS.map((user, i) => (
          <motion.button
            key={user.name}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.15 }}
            onClick={() => setCurrentUser(user.name)}
            className="group flex flex-col items-center gap-3 cursor-pointer"
          >
            {/* Avatar */}
            <div
              className={`w-24 h-24 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center shadow-lg shadow-pink-500/20 ring-2 ring-white/10 group-hover:ring-pink-400/50 group-hover:scale-110 transition-all duration-300`}
            >
              <User className="w-10 h-10 text-white" />
            </div>
            {/* Name */}
            <span
              className="text-lg text-pink-200 group-hover:text-white transition-colors"
              style={{ fontFamily: "var(--font-dancing-script)" }}
            >
              {user.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
