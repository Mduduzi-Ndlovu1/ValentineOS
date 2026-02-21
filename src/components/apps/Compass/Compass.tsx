import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { 
  compassViewAtom, 
  fetchCompassEventsAtom,
  CompassView,
  compassThemeAtom
} from "@/store/atoms/compass";
import { CompassSidebar } from "./CompassSidebar";
import { CompassMobileNav } from "./CompassMobileNav";
import { EventGrid } from "./EventGrid";
import { AddEventModal } from "./AddEventModal";
import { CompassSplash } from "./CompassSplash";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const VIEW_TITLES: Record<CompassView, string> = {
  upcoming: "North: Upcoming Adventures",
  memories: "South: Our Memories",
  "bucket-list": "East: The Horizon",
  map: "West: Map Room",
};

export function Compass() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const view = useAtomValue(compassViewAtom);
  const fetchEvents = useSetAtom(fetchCompassEventsAtom);
  const theme = useAtomValue(compassThemeAtom);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={`relative h-full w-full overflow-hidden bg-gradient-to-br transition-colors duration-500 ${
      theme === "light" 
        ? "from-rose-50 to-slate-100 text-slate-800" 
        : "from-slate-900 to-slate-800 text-white"
    }`}>
      {/* Main Content - Always rendered behind splash */}
      <div className="flex h-full w-full absolute inset-0 z-0">
        {/* Sidebar */}
        <CompassSidebar />
        <CompassMobileNav />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className={`
            p-6 border-b flex items-center justify-between shrink-0 backdrop-blur-sm transition-colors duration-300
            ${theme === "light" 
              ? "bg-white/40 border-slate-200" 
              : "bg-white/5 border-white/10"
            }
          `}>
            <h1 className={`
              text-2xl md:text-3xl font-display font-bold tracking-wide transition-colors
              ${theme === "light" ? "text-slate-800" : "text-white"}
            `}>
              {VIEW_TITLES[view]}
            </h1>
            
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-white border border-rose-500/30 transition-all active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden md:inline font-medium">Chart New Course</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar pb-20 md:pb-0">
               <EventGrid />
            </div>
          </div>
        </div>
      </div>

      {/* Splash Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="splash"
            className="absolute inset-0 z-50"
            // No exit animation needed because CompassSplash handles the fade out internally
            // before calling onComplete. This ensures the component is unmounted 
            // only after it is fully transparent.
          >
            <CompassSplash onComplete={() => setIsLoading(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AddEventModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
