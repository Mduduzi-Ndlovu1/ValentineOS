import { useEffect } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { 
  exploreEventsAtom, 
  exploreLoadingAtom, 
  exploreErrorAtom, 
  exploreSearchAtom, 
  searchExploreEventsAtom, 
  importEventAtom,
  compassThemeAtom,
  compassSelectedEventAtom
} from "@/store/atoms/compass";
import { EventCard } from "./EventCard";
import { Search, MapPin, Loader2, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function ExploreView() {
  const [searchState, setSearchState] = useAtom(exploreSearchAtom);
  const events = useAtomValue(exploreEventsAtom);
  const isLoading = useAtomValue(exploreLoadingAtom);
  const error = useAtomValue(exploreErrorAtom);
  const searchEvents = useSetAtom(searchExploreEventsAtom);
  const importEvent = useSetAtom(importEventAtom);
  const theme = useAtomValue(compassThemeAtom);
  const setSelectedEvent = useSetAtom(compassSelectedEventAtom);

  // Auto-search on mount if empty
  useEffect(() => {
    if (events.length === 0 && !isLoading) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            
            // Get today's date range (ISO format)
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString().replace(/\.\d{3}Z$/, 'Z');
            const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString().replace(/\.\d{3}Z$/, 'Z');

            searchEvents({
              lat: latitude,
              lng: longitude,
              radius: 50, // 50 miles radius
              startDateTime: startOfDay,
              endDateTime: endOfDay
            });
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Optional: Default search if geo fails (e.g. New York) or just do nothing
          }
        );
      }
    }
  }, [events.length, isLoading, searchEvents]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchEvents();
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Search Header */}
      <div className={`
        shrink-0 border-b transition-colors duration-300
        ${theme === "light" 
          ? "bg-white/60 border-gray-100" 
          : "bg-white/5 border-white/5"
        }
      `}>
        <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-3 md:gap-4">
            {/* Query Input */}
            <div className="flex-1 relative group">
              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === "light" ? "text-gray-400 group-focus-within:text-rose-500" : "text-white/30 group-focus-within:text-rose-300"}`} />
              <input
                type="text"
                placeholder="What? (e.g., Jazz, Museum)"
                value={searchState.query}
                onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
                className={`
                  w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border outline-none transition-all duration-300 text-sm md:text-base
                  ${theme === "light"
                    ? "bg-white border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-gray-900 placeholder:text-gray-400"
                    : "bg-white/5 border-white/10 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 text-white placeholder:text-white/30"
                  }
                `}
              />
            </div>

            {/* City Input */}
            <div className="flex-1 relative group">
              <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${theme === "light" ? "text-gray-400 group-focus-within:text-rose-500" : "text-white/30 group-focus-within:text-rose-300"}`} />
              <input
                type="text"
                placeholder="Where? (e.g., Paris)"
                value={searchState.city}
                onChange={(e) => setSearchState(prev => ({ ...prev, city: e.target.value }))}
                className={`
                  w-full pl-11 pr-4 py-3 md:py-3.5 rounded-xl border outline-none transition-all duration-300 text-sm md:text-base
                  ${theme === "light"
                    ? "bg-white border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 text-gray-900 placeholder:text-gray-400"
                    : "bg-white/5 border-white/10 focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/10 text-white placeholder:text-white/30"
                  }
                `}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full lg:w-auto px-8 py-3 md:py-3.5 rounded-xl font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2
                bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:shadow-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto pb-24 md:pb-8">
          {error && (
            <div className="flex items-center justify-center h-full min-h-[200px]">
              <div className="text-center max-w-md mx-auto p-6 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                  <p className="font-bold mb-2">Something went wrong</p>
                  <p className="opacity-80 text-sm">{error}</p>
              </div>
            </div>
          )}

          {!error && !isLoading && events.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[40vh] opacity-50 text-center p-8">
              <div className={`p-6 rounded-full mb-4 ${theme === "light" ? "bg-gray-100" : "bg-white/5"}`}>
                <Globe className="w-12 h-12" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${theme === "light" ? "text-gray-900" : "text-white"}`}>
                Explore the World
              </h3>
              <p className={`max-w-xs ${theme === "light" ? "text-gray-500" : "text-white/50"}`}>
                Search for concerts, events, and adventures in your favorite cities.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <EventCard
                  event={event}
                  isExplore={true}
                  onAdd={() => importEvent(event)}
                  onClick={() => setSelectedEvent(event)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
