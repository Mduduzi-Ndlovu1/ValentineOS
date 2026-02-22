import { useEffect, useState } from "react";
import { useAtomValue, useSetAtom, useAtom } from "jotai";
import { 
  compassViewAtom, 
  fetchCompassEventsAtom,
  compassSelectedEventAtom,
  CompassView,
  compassThemeAtom,
  toggleCompassThemeAtom
} from "@/store/atoms/compass";
import { CompassSidebar } from "./CompassSidebar";
import { CompassMobileNav } from "./CompassMobileNav";
import { EventGrid } from "./EventGrid";
import { AddEventModal } from "./AddEventModal";
import { EventDetailModal } from "./EventDetailModal";
import { CompassSplash } from "./CompassSplash";
import { ExploreView } from "./ExploreView";
import { Plus, Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const VIEW_TITLES: Record<CompassView, string> = {
  upcoming: "North: Upcoming Adventures",
  memories: "South: Our Memories",
  "bucket-list": "East: The Horizon",
  map: "West: Explore the World",
};

export function Compass() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const view = useAtomValue(compassViewAtom);
  const fetchEvents = useSetAtom(fetchCompassEventsAtom);
  const theme = useAtomValue(compassThemeAtom);
  const toggleTheme = useSetAtom(toggleCompassThemeAtom);
  const [selectedEvent, setSelectedEvent] = useAtom(compassSelectedEventAtom);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <div className={`relative h-full w-full overflow-hidden transition-colors duration-300 ${
      theme === "light" 
        ? "bg-white/10 text-slate-900" 
        : "bg-black/20 text-white"
    }`}>
      {/* Main Content - Always rendered behind splash */}
      {/* Layout wrapper: flex-col for mobile, md:flex-row for desktop */}
      <div className="flex flex-col md:flex-row h-full w-full absolute inset-0 z-0">
        
        {/* Sidebar (Desktop Only) */}
        <CompassSidebar />
        
        {/* Main Content Column */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          {/* Header */}
          <div className={`
            p-6 border-b flex items-center justify-between shrink-0 backdrop-blur-sm transition-colors duration-300
            ${theme === "light" 
              ? "bg-white/40 border-slate-200" 
              : "bg-white/5 border-white/10"
            }
          `}>
            <div className="flex items-center gap-4">
              <h1 className={`
                text-2xl md:text-3xl font-display font-bold tracking-wide transition-colors
                ${theme === "light" ? "text-gray-900" : "text-white"}
              `}>
                {VIEW_TITLES[view]}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Theme Toggle - Mobile Only (Desktop has it in Sidebar) */}
              <button
                onClick={toggleTheme}
                className={`
                  p-2 rounded-lg transition-colors md:hidden
                  ${theme === "light" 
                    ? "hover:bg-black/5 text-slate-600" 
                    : "hover:bg-white/10 text-slate-300"
                  }
                `}
                title="Toggle Theme"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 hover:text-white border border-rose-500/30 transition-all active:scale-95 group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden md:inline font-medium">Chart New Course</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden relative">
            {view === "map" ? (
              <ExploreView />
            ) : (
              <EventGrid />
            )}
          </div>
        </div>

        {/* Mobile Nav (Mobile Only) */}
        <CompassMobileNav />
      </div>

      {/* Splash Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="splash"
            className="absolute inset-0 z-50"
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
      <EventDetailModal 
        isOpen={!!selectedEvent} 
        onClose={() => setSelectedEvent(null)} 
      />
    </div>
  );
}
