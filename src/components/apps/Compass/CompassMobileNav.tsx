import { useAtom, useSetAtom, useAtomValue } from "jotai";
import { 
  compassViewAtom, 
  setCompassViewAtom, 
  compassThemeAtom,
  CompassView 
} from "@/store/atoms/compass";
import { Compass, History, Flag, Map } from "lucide-react";
import { motion } from "framer-motion";

export function CompassMobileNav() {
  const [view] = useAtom(compassViewAtom);
  const setView = useSetAtom(setCompassViewAtom);
  const theme = useAtomValue(compassThemeAtom);

  const items = [
    { id: "upcoming" as CompassView, label: "North", icon: Compass },
    { id: "memories" as CompassView, label: "South", icon: History },
    { id: "bucket-list" as CompassView, label: "East", icon: Flag },
    { id: "map" as CompassView, label: "West", icon: Map },
  ];

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 h-16 backdrop-blur-lg border-t z-30 md:hidden flex items-center justify-evenly px-4 pb-safe ${
        theme === "light" 
          ? "bg-white/80 border-gray-200" 
          : "bg-black/80 border-white/10"
      }`}
    >
      {items.map((item) => {
        const isActive = view === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className="relative flex flex-col items-center justify-center p-2 w-full"
            title={item.label}
          >
            <div className="relative">
              <Icon 
                size={24} 
                strokeWidth={isActive ? 2 : 1.5} 
                className={`transition-all duration-300 ${
                  isActive 
                    ? "text-rose-500 scale-110" 
                    : theme === "light" ? "text-gray-400" : "text-white/40"
                }`}
              />
              
              {isActive && (
                <motion.div
                  layoutId="compass-mobile-active"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-rose-500 rounded-full"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                />
              )}
            </div>
            <span className={`text-[10px] mt-1 font-medium transition-colors ${
              isActive 
                ? "text-rose-500" 
                : theme === "light" ? "text-gray-400" : "text-white/40"
            }`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
