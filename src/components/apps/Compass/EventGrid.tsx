import { useAtomValue, useSetAtom } from "jotai";
import { filteredEventsAtom, compassLoadingAtom, compassThemeAtom, compassSelectedEventAtom } from "@/store/atoms/compass";
import { EventCard } from "./EventCard";
import { motion, AnimatePresence } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function EventGrid() {
  const events = useAtomValue(filteredEventsAtom);
  const isLoading = useAtomValue(compassLoadingAtom);
  const theme = useAtomValue(compassThemeAtom);
  const setSelectedEvent = useSetAtom(compassSelectedEventAtom);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`w-full aspect-video rounded-3xl animate-pulse border ${
              theme === "light" 
                ? "bg-gray-200 border-gray-300" 
                : "bg-white/5 border-white/10"
            }`}
          />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-full min-h-[50vh] text-center p-8 space-y-4"
      >
        <div className={`text-6xl animate-bounce ${theme === "light" ? "grayscale opacity-50" : ""}`}>🧭</div>
        <h3 className={`text-2xl font-display font-bold ${theme === "light" ? "text-gray-900" : "text-white"}`}>
          Uncharted Territory
        </h3>
        <p className={`text-base max-w-sm ${theme === "light" ? "text-gray-500" : "text-white/50"}`}>
          No adventures found here yet. Why not chart a new course?
        </p>
      </motion.div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-y-auto custom-scrollbar">
      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              <motion.div key={event.id} variants={item} layout>
                <EventCard 
                  event={event} 
                  onClick={() => setSelectedEvent(event)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
