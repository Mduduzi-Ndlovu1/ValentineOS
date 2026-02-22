import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  AlignLeft, 
  Type, 
  Compass, 
  Plane, 
  Heart, 
  Ticket, 
  Utensils, 
  Star 
} from "lucide-react";
import { useSetAtom, useAtomValue } from "jotai";
import { addCompassEventAtom, compassLoadingAtom } from "@/store/atoms/compass";
import { currentUserAtom } from "@/store/atoms/user";
import { CompassStatus, CompassCategory } from "@/types/compass";

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: { value: CompassCategory; label: string; icon: React.ReactNode }[] = [
  { value: "travel", label: "Travel", icon: <Plane className="w-4 h-4" /> },
  { value: "date", label: "Date", icon: <Heart className="w-4 h-4" /> },
  { value: "activity", label: "Activity", icon: <Ticket className="w-4 h-4" /> },
  { value: "food", label: "Food", icon: <Utensils className="w-4 h-4" /> },
  { value: "other", label: "Other", icon: <Star className="w-4 h-4" /> },
];

const STATUSES: { value: CompassStatus; label: string; color: string }[] = [
  { value: "idea", label: "Idea", color: "bg-white/10 text-white/70 border-white/20" },
  { value: "planned", label: "Planned", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { value: "booked", label: "Booked", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { value: "completed", label: "Completed", color: "bg-green-500/20 text-green-300 border-green-500/30" },
];

export function AddEventModal({ isOpen, onClose }: AddEventModalProps) {
  const addEvent = useSetAtom(addCompassEventAtom);
  const isLoading = useAtomValue(compassLoadingAtom);
  const currentUser = useAtomValue(currentUserAtom);

  const [formData, setFormData] = useState({
    title: "",
    status: "idea" as CompassStatus,
    category: "other" as CompassCategory,
    date: "",
    location: "",
    imageUrl: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    const creator = currentUser === "Neo" ? "neo" : "admin";

    await addEvent({
      title: formData.title,
      status: formData.status,
      category: formData.category,
      event_date: formData.date || null,
      location: formData.location || null,
      image_url: formData.imageUrl || null,
      description: formData.description || null,
      created_by: creator,
      coordinates: null,
      price_range: null,
    });

    setFormData({
      title: "",
      status: "idea",
      category: "other",
      date: "",
      location: "",
      imageUrl: "",
      description: "",
    });
    onClose();
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
            className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="absolute inset-0 z-[70] flex items-center justify-center p-4 md:p-12 lg:p-16 pointer-events-none"
          >
            <div className="w-full max-w-2xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col max-h-full">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                <div className="flex items-center gap-3">
                  <Compass className="w-4 h-4 text-rose-400" />
                  <h2 className="text-base font-semibold text-white">
                    Chart a New Course
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Grid */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  
                  {/* Title - Full Width */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Destination / Event
                    </label>
                    <div className="relative group">
                      <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-rose-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Paris Trip, Dinner Date..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as CompassStatus })}
                      className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all"
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value} className="bg-gray-900 text-white">
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as CompassCategory })}
                      className="w-full appearance-none bg-black/20 border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value} className="bg-gray-900 text-white">
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      When
                    </label>
                    <div className="relative group">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-rose-400 transition-colors" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Where
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-rose-400 transition-colors" />
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="City, Place..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Image URL - Full Width */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Cover Image
                    </label>
                    <div className="relative group">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-focus-within:text-rose-400 transition-colors" />
                      <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all"
                      />
                    </div>
                  </div>

                  {/* Description - Full Width */}
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider ml-1">
                      Notes
                    </label>
                    <div className="relative group">
                      <AlignLeft className="absolute left-3 top-3 w-4 h-4 text-white/30 group-focus-within:text-rose-400 transition-colors" />
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Details, plans, ideas..."
                        rows={2}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/20 focus:outline-none focus:border-rose-500/50 focus:bg-black/40 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions - Full Width */}
                  <div className="col-span-1 md:col-span-2 flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2.5 rounded-lg border border-white/10 text-sm text-white/70 hover:bg-white/5 hover:text-white hover:border-white/20 transition-all font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 to-rose-600 text-sm text-white font-bold shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {isLoading ? "Charting..." : "Chart Course"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
