import { useAtomValue } from "jotai";
import { filteredEventsAtom, compassLoadingAtom, compassThemeAtom } from "@/store/atoms/compass";
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {[...Array(6)].map((_, i) => (
          <div 
            key={i} 
            className={`w-full aspect-video rounded-3xl animate-pulse border ${
              theme === "light" 
                ? "bg-slate-200 border-slate-300" 
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
        <div className="text-6xl animate-bounce">🧭</div>
        <h3 className={`text-2xl font-display font-bold ${theme === "light" ? "text-slate-800" : "text-white"}`}>
          Uncharted Territory
        </h3>
        <p className={`text-base max-w-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
          No adventures found here yet. Why not chart a new course?
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pb-24"
    >
      <AnimatePresence mode="popLayout">
        {events.map((event) => (
          <motion.div key={event.id} variants={item} layout>
            <EventCard 
              event={event} 
              onClick={() => {
                console.log("Clicked event:", event.title);
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
