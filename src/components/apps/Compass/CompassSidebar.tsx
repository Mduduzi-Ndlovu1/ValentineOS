import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { 
  compassViewAtom, 
  setCompassViewAtom, 
  CompassView,
  compassThemeAtom,
  toggleCompassThemeAtom
} from "@/store/atoms/compass";
import { Compass, History, Flag, Map, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export function CompassSidebar() {
  const [view] = useAtom(compassViewAtom);
  const setView = useSetAtom(setCompassViewAtom);
  const theme = useAtomValue(compassThemeAtom);
  const toggleTheme = useSetAtom(toggleCompassThemeAtom);

  const items = [
    { id: "upcoming" as CompassView, label: "North (Upcoming)", icon: Compass },
    { id: "memories" as CompassView, label: "South (Memories)", icon: History },
    { id: "bucket-list" as CompassView, label: "East (Bucket List)", icon: Flag },
    { id: "map" as CompassView, label: "West (Map Room)", icon: Map },
  ];

  return (
    <div className={`
      hidden md:flex h-full w-16 flex-col items-center py-6 space-y-6 border-r transition-colors duration-300
      ${theme === "light" 
        ? "bg-white/80 border-gray-200" 
        : "bg-black/40 border-white/10"
      }
    `}>
      {items.map((item) => {
        const isActive = view === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`
              relative p-3 rounded-xl transition-all duration-300 group
              ${isActive 
                ? "text-rose-400 bg-white/10 shadow-[0_0_15px_rgba(251,113,133,0.2)]" 
                : theme === "light"
                  ? "text-gray-500 hover:text-gray-900 hover:bg-black/5"
                  : "text-white/40 hover:text-white hover:bg-white/5"
              }
            `}
            title={item.label}
          >
            <Icon 
              size={24} 
              strokeWidth={isActive ? 2 : 1.5} 
              className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
            />
            
            {/* Active Indicator (Glow line) */}
            {isActive && (
              <motion.div
                layoutId="compass-active-indicator"
                className="absolute inset-y-2 left-0 w-0.5 bg-rose-500 rounded-r-full shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            )}
          </button>
        );
      })}

      <div className="flex-1" />

      <button
        onClick={toggleTheme}
        className={`
          p-3 rounded-xl transition-all duration-300 group
          ${theme === "light"
            ? "text-gray-500 hover:text-gray-900 hover:bg-black/5"
            : "text-white/40 hover:text-white hover:bg-white/5"
          }
        `}
        title="Toggle Theme"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </button>
    </div>
  );
}
