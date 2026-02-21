import { motion } from "framer-motion";
import { CompassEvent } from "@/types/compass";
import { useAtomValue } from "jotai";
import { compassThemeAtom } from "@/store/atoms/compass";
import { 
  MapPin, 
  Clock,
  User
} from "lucide-react";

interface EventCardProps {
  event: CompassEvent;
  onClick?: () => void;
}

const getStatusColor = (status: CompassEvent["status"]) => {
  switch (status) {
    case "completed":
      return "text-green-400";
    case "booked":
      return "text-blue-400";
    case "planned":
      return "text-amber-400";
    case "idea":
    default:
      return "text-rose-400";
  }
};

export function EventCard({ event, onClick }: EventCardProps) {
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
        group flex flex-col w-full rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border
        ${theme === "light" 
          ? "bg-white border-slate-100 shadow-slate-200/50" 
          : "bg-white/5 border-white/10 hover:border-white/20"
        }
      `}
    >
      {/* Image Section */}
      <div className="relative w-full aspect-video overflow-hidden">
        {/* Date Badge */}
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
          <span className="text-[10px] font-bold text-black/50 uppercase tracking-wider leading-none mb-0.5">{month}</span>
          <span className="text-xl font-black text-black leading-none">{day}</span>
        </div>

        {/* Status Tag (Top Left) */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md rounded-full border border-white/10 ${theme === "light" ? "bg-white/90 shadow-sm" : "bg-black/60"} ${getStatusColor(event.status)}`}>
            {event.status}
          </span>
        </div>

        {/* Image */}
        {event.image_url ? (
          <img 
            src={event.image_url} 
            alt={event.title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${theme === "light" ? "bg-slate-100" : "bg-gradient-to-br from-slate-800 to-slate-900"}`}>
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
          <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${getStatusColor(event.status)}`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{time}</span>
          </div>
          <h3 className={`font-display font-bold text-xl leading-tight line-clamp-2 transition-colors ${theme === "light" ? "text-slate-800 group-hover:text-rose-500" : "text-white group-hover:text-rose-200"}`}>
            {event.title}
          </h3>
        </div>

        {/* Location */}
        {event.location && (
          <div className={`flex items-center gap-1.5 text-sm ${theme === "light" ? "text-slate-500" : "text-white/50"}`}>
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
        )}

        {/* Footer: Avatars */}
        <div className={`mt-2 pt-4 border-t flex items-center justify-between ${theme === "light" ? "border-slate-100" : "border-white/5"}`}>
          <div className="flex -space-x-2">
            {/* Mock Avatars for Admin & Neo */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-orange-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              A
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
              N
            </div>
            <div className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] shadow-sm ${theme === "light" ? "bg-slate-100 text-slate-400" : "bg-white/10 text-white/50"}`}>
              +
            </div>
          </div>
          
          <button className={`text-xs font-medium transition-colors ${theme === "light" ? "text-slate-400 hover:text-slate-600" : "text-white/40 hover:text-white"}`}>
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
}
