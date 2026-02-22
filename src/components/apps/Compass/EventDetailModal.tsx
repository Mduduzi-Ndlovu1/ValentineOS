import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock,
  Ticket,
  Plane,
  Heart,
  Utensils,
  Star,
  Globe
} from "lucide-react";
import { useAtomValue } from "jotai";
import { compassSelectedEventAtom, compassThemeAtom } from "@/store/atoms/compass";
import { CompassCategory, CompassStatus } from "@/types/compass";

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<CompassCategory, React.ReactNode> = {
  travel: <Plane className="w-4 h-4" />,
  date: <Heart className="w-4 h-4" />,
  activity: <Ticket className="w-4 h-4" />,
  food: <Utensils className="w-4 h-4" />,
  other: <Star className="w-4 h-4" />,
};

const STATUS_LABELS: Record<CompassStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  booked: "Booked",
  completed: "Completed",
};

export function EventDetailModal({ isOpen, onClose }: EventDetailModalProps) {
  const event = useAtomValue(compassSelectedEventAtom);
  const theme = useAtomValue(compassThemeAtom);

  if (!event) return null;

  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const dateStr = dateObj ? dateObj.toLocaleDateString("en-US", { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }) : "Date TBD";
  
  const timeStr = dateObj ? dateObj.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit" 
  }) : "Time TBD";

  const getStatusColor = (status: CompassStatus) => {
    if (theme === "light") {
      switch (status) {
        case "completed": return "bg-green-100 text-green-700 border-green-200";
        case "booked": return "bg-blue-100 text-blue-700 border-blue-200";
        case "planned": return "bg-amber-100 text-amber-700 border-amber-200";
        default: return "bg-rose-100 text-rose-700 border-rose-200";
      }
    } else {
      switch (status) {
        case "completed": return "bg-green-500/20 text-green-300 border-green-500/30";
        case "booked": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
        case "planned": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
        default: return "bg-rose-500/20 text-rose-300 border-rose-500/30";
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute inset-0 z-[70] flex items-center justify-center p-4 md:p-12 lg:p-16 pointer-events-none"
          >
            <div className={`
              w-full max-w-3xl max-h-full overflow-hidden flex flex-col pointer-events-auto rounded-3xl shadow-2xl border
              ${theme === "light" 
                ? "bg-white/90 border-white/20 text-slate-900 backdrop-blur-xl" 
                : "bg-slate-900/90 border-white/10 text-white backdrop-blur-xl"
              }
            `}>
              
              {/* Cover Image */}
              <div className="relative w-full aspect-[21/9] shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                {event.image_url ? (
                  <img 
                    src={event.image_url} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${theme === "light" ? "bg-gray-100" : "bg-slate-800"}`}>
                    <Globe className={`w-16 h-16 ${theme === "light" ? "text-gray-300" : "text-white/10"}`} />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`
                    px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm backdrop-blur-md
                    ${getStatusColor(event.status)}
                  `}>
                    {STATUS_LABELS[event.status]}
                  </span>
                </div>

                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white text-shadow-lg line-clamp-2">
                    {event.title}
                  </h2>
                </div>
              </div>

              {/* Content Scroll Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6">
                
                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {/* Date */}
                  <div className={`flex flex-col gap-1 p-3 rounded-xl border ${theme === "light" ? "bg-white/50 border-gray-100" : "bg-white/5 border-white/5"}`}>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                      <Calendar className="w-3 h-3" />
                      <span>Date</span>
                    </div>
                    <div className="font-medium text-xs leading-tight">
                      {dateStr}
                    </div>
                  </div>

                  {/* Time */}
                  <div className={`flex flex-col gap-1 p-3 rounded-xl border ${theme === "light" ? "bg-white/50 border-gray-100" : "bg-white/5 border-white/5"}`}>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                      <Clock className="w-3 h-3" />
                      <span>Time</span>
                    </div>
                    <div className="font-medium text-xs leading-tight">
                      {timeStr}
                    </div>
                  </div>

                  {/* Location */}
                  <div className={`flex flex-col gap-1 p-3 rounded-xl border ${theme === "light" ? "bg-white/50 border-gray-100" : "bg-white/5 border-white/5"}`}>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                      <MapPin className="w-3 h-3" />
                      <span>Location</span>
                    </div>
                    <div className="font-medium text-xs leading-tight truncate" title={event.location || "TBD"}>
                      {event.location || "TBD"}
                    </div>
                  </div>

                  {/* Category */}
                  <div className={`flex flex-col gap-1 p-3 rounded-xl border ${theme === "light" ? "bg-white/50 border-gray-100" : "bg-white/5 border-white/5"}`}>
                    <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                      {event.category ? CATEGORY_ICONS[event.category] : <Star className="w-3 h-3" />}
                      <span>Category</span>
                    </div>
                    <div className="font-medium text-xs leading-tight capitalize">
                      {event.category || "Uncategorized"}
                    </div>
                  </div>

                  {/* Price */}
                  {event.price_range && (
                    <div className={`flex flex-col gap-1 p-3 rounded-xl border ${theme === "light" ? "bg-white/50 border-gray-100" : "bg-white/5 border-white/5"}`}>
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                        <Ticket className="w-3 h-3" />
                        <span>Price</span>
                      </div>
                      <div className="font-medium text-xs leading-tight">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.min)}
                        {event.price_range.min !== event.price_range.max && ` - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.max)}`}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className={`text-[10px] font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-400" : "text-white/40"}`}>
                    About this Adventure
                  </h3>
                  <div className={theme === "light" ? "prose prose-sm max-w-none prose-slate" : "prose prose-sm max-w-none prose-invert"}>
                    {event.description ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed opacity-90">
                        {event.description}
                      </p>
                    ) : (
                      <p className={`italic text-sm ${theme === "light" ? "text-gray-400" : "text-white/30"}`}>
                        No detailed notes added yet.
                      </p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
