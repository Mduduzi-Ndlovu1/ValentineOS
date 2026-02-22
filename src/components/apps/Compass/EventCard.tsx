import { motion } from "framer-motion";
import { CompassEvent } from "@/types/compass";
import { useAtomValue } from "jotai";
import { compassThemeAtom } from "@/store/atoms/compass";
import { 
  MapPin, 
  Clock,
  Ticket,
} from "lucide-react";

interface EventCardProps {
  event: CompassEvent;
  onClick?: () => void;
  isExplore?: boolean;
  onAdd?: () => void;
}

const getStatusStyles = (status: CompassEvent["status"], theme: "light" | "dark") => {
  if (theme === "light") {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "booked":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "planned":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "idea":
      default:
        return "bg-rose-100 text-rose-700 border-rose-200";
    }
  } else {
    // Dark mode
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "booked":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "planned":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "idea":
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    }
  }
};

export function EventCard({ event, onClick, isExplore, onAdd }: EventCardProps) {
  const theme = useAtomValue(compassThemeAtom);
  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const month = dateObj ? dateObj.toLocaleDateString("en-US", { month: "short" }).toUpperCase() : "TBD";
  const day = dateObj ? dateObj.toLocaleDateString("en-US", { day: "numeric" }) : "--";
  const time = dateObj ? dateObj.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "Time TBD";

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        group flex flex-col w-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border
        ${theme === "light" 
          ? "bg-white border-gray-200 shadow-md hover:shadow-lg text-gray-900" 
          : "bg-white/5 border-white/10 shadow-lg text-white"
        }
      `}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-video overflow-hidden">
        {/* Date Badge */}
        <div className={`
          absolute top-4 right-4 z-20 flex flex-col items-center justify-center w-14 h-14 rounded-2xl shadow-lg border
          ${theme === "light"
            ? "bg-white text-gray-900 border-gray-100"
            : "bg-white/10 backdrop-blur-md text-white border-white/10"
          }
        `}>
          <span className={`text-[10px] font-bold uppercase tracking-wider leading-none mb-0.5 ${theme === "light" ? "text-gray-500" : "text-white/60"}`}>
            {month}
          </span>
          <span className="text-xl font-black leading-none">{day}</span>
        </div>

        {/* Status Tag (Top Left) - Only show if not in explore mode */}
        {!isExplore ? (
          <div className="absolute top-4 left-4 z-20">
            <span className={`
              px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm backdrop-blur-md
              ${getStatusStyles(event.status, theme)}
            `}>
              {event.status}
            </span>
          </div>
        ) : (
          event.price_range && (
            <div className="absolute top-4 left-4 z-20">
              <span className={`
                px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border shadow-sm backdrop-blur-md
                ${theme === "light"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                }
              `}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.min)}
                {event.price_range.min !== event.price_range.max && ` - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.max)}`}
              </span>
            </div>
          )
        )}

        {/* Image */}
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${theme === "light" ? "bg-gray-100" : "bg-gradient-to-br from-slate-800 to-slate-900"}`}>
            <span className="text-4xl opacity-20">🗺️</span>
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
      </div>

      {/* Content Section */}
      <div className="flex flex-col p-5 gap-3">
        {/* Time & Title */}
        <div className="space-y-1">
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${theme === "light" ? "text-gray-500" : "text-white/60"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
          <h3 className={`font-display font-bold text-xl leading-tight line-clamp-2 transition-colors ${theme === "light" ? "text-gray-900 group-hover:text-rose-600" : "text-white group-hover:text-rose-200"}`}>
            {event.title}
          </h3>
        </div>

        {/* Location & Price */}
        <div className="space-y-1">
          {event.location && (
            <div className={`flex items-center gap-1.5 text-sm ${theme === "light" ? "text-gray-500" : "text-white/50"}`}>
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          {!isExplore && event.price_range && (
            <div className={`flex items-center gap-1.5 text-sm font-medium ${theme === "light" ? "text-emerald-600" : "text-emerald-400"}`}>
              <Ticket className="w-4 h-4 shrink-0" />
              <span>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.min)}
                {event.price_range.min !== event.price_range.max && ` - ${new Intl.NumberFormat('en-US', { style: 'currency', currency: event.price_range.currency, maximumFractionDigits: 0 }).format(event.price_range.max)}`}
              </span>
            </div>
          )}
        </div>

        {/* Footer: Avatars or Add Button */}
        {isExplore ? (
           <div className={`mt-2 pt-4 border-t ${theme === "light" ? "border-gray-100" : "border-white/5"}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd?.();
              }}
              className="w-full py-2.5 rounded-xl font-bold text-sm bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Add to Compass</span>
              <span className="text-lg leading-none">+</span>
            </button>
           </div>
        ) : (
          <div className={`mt-2 pt-4 border-t flex items-center justify-between ${theme === "light" ? "border-gray-100" : "border-white/5"}`}>
            <div className="flex -space-x-2">
              {/* Mock Avatars for Admin & Neo */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                A
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                N
              </div>
              <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm ${theme === "light" ? "bg-gray-100 text-gray-400" : "bg-white/10 text-white/50"}`}>
                +
              </div>
            </div>
            
            <button className={`text-xs font-medium transition-colors ${theme === "light" ? "text-gray-400 hover:text-gray-600" : "text-white/40 hover:text-white"}`}>
              View Details
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
