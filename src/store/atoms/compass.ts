import { atom } from "jotai";
import { supabase } from "@/lib/supabase";
import { CompassEvent, CompassStatus, CompassCategory } from "@/types/compass";

// State Atoms
export type CompassView = "upcoming" | "memories" | "bucket-list" | "map";
export const compassViewAtom = atom<CompassView>("upcoming");
export const compassEventsAtom = atom<CompassEvent[]>([]);
export const compassLoadingAtom = atom<boolean>(false);
export const compassErrorAtom = atom<string | null>(null);
export const compassFilterStatusAtom = atom<CompassStatus | "all">("all");
export const compassFilterCategoryAtom = atom<CompassCategory | "all">("all");
export const compassThemeAtom = atom<"light" | "dark">("light");

// Derived Atoms
export const filteredEventsAtom = atom((get) => {
  const events = get(compassEventsAtom);
  const view = get(compassViewAtom);
  const statusFilter = get(compassFilterStatusAtom);
  const categoryFilter = get(compassFilterCategoryAtom);

  return events.filter((event) => {
    // Filter by View
    let matchesView = false;
    if (view === "upcoming") {
      matchesView = event.status === "planned" || event.status === "booked";
    } else if (view === "memories") {
      matchesView = event.status === "completed";
    } else if (view === "bucket-list") {
      matchesView = event.status === "idea";
    } else if (view === "map") {
      matchesView = true; // Show all on map (or filter by specific logic if needed)
    }

    // Filter by additional status/category filters (if applied on top of view)
    // Note: The ticket implies view drives the status filtering, but existing filters are kept.
    // If the view enforces specific statuses, we should probably prioritize view logic.
    // However, let's keep the existing filters as an AND condition if they are set to something specific.
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;
    
    return matchesView && matchesStatus && matchesCategory;
  });
});

// Actions
export const setCompassViewAtom = atom(
  null,
  (_get, set, view: CompassView) => {
    set(compassViewAtom, view);
    // Optionally reset other filters when changing view?
    // For now, let's keep it simple.
  }
);

export const toggleCompassThemeAtom = atom(
  null,
  (get, set) => {
    const currentTheme = get(compassThemeAtom);
    set(compassThemeAtom, currentTheme === "light" ? "dark" : "light");
  }
);

// Actions
export const fetchCompassEventsAtom = atom(
  null,
  async (_get, set) => {
    if (!supabase) {
      set(compassErrorAtom, "Supabase client not initialized");
      return;
    }

    set(compassLoadingAtom, true);
    set(compassErrorAtom, null);

    try {
      const { data, error } = await supabase
        .from("compass_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;

      // Ensure data matches CompassEvent type structure if needed
      // Assuming Supabase returns data matching the interface
      set(compassEventsAtom, (data as unknown as CompassEvent[]) || []);
    } catch (error) {
      set(compassErrorAtom, error instanceof Error ? error.message : "Unknown error fetching compass events");
      console.error("Error fetching compass events:", error);
    } finally {
      set(compassLoadingAtom, false);
    }
  }
);

export const addCompassEventAtom = atom(
  null,
  async (_get, set, newEvent: Omit<CompassEvent, "id" | "created_at">) => {
    if (!supabase) {
      set(compassErrorAtom, "Supabase client not initialized");
      return;
    }

    set(compassLoadingAtom, true);
    set(compassErrorAtom, null);

    try {
      const { data, error } = await supabase
        .from("compass_events")
        .insert(newEvent)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        set(compassEventsAtom, (prev) => [...prev, data as unknown as CompassEvent]);
      }
    } catch (error) {
      set(compassErrorAtom, error instanceof Error ? error.message : "Unknown error adding compass event");
      console.error("Error adding compass event:", error);
    } finally {
      set(compassLoadingAtom, false);
    }
  }
);

export const updateCompassEventAtom = atom(
  null,
  async (_get, set, { id, updates }: { id: string; updates: Partial<CompassEvent> }) => {
    if (!supabase) {
      set(compassErrorAtom, "Supabase client not initialized");
      return;
    }

    // Optimistic update
    const previousEvents = _get(compassEventsAtom);
    set(compassEventsAtom, (prev) =>
      prev.map((event) => (event.id === id ? { ...event, ...updates } : event))
    );

    try {
      const { error } = await supabase
        .from("compass_events")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      set(compassErrorAtom, error instanceof Error ? error.message : "Unknown error updating compass event");
      console.error("Error updating compass event:", error);
      // Revert on failure
      set(compassEventsAtom, previousEvents);
    }
  }
);

export const deleteCompassEventAtom = atom(
  null,
  async (_get, set, id: string) => {
    if (!supabase) {
      set(compassErrorAtom, "Supabase client not initialized");
      return;
    }

    // Optimistic update
    const previousEvents = _get(compassEventsAtom);
    set(compassEventsAtom, (prev) => prev.filter((event) => event.id !== id));

    try {
      const { error } = await supabase
        .from("compass_events")
        .delete()
        .eq("id", id);

      if (error) throw error;
    } catch (error) {
      set(compassErrorAtom, error instanceof Error ? error.message : "Unknown error deleting compass event");
      console.error("Error deleting compass event:", error);
      // Revert on failure
      set(compassEventsAtom, previousEvents);
    }
  }
);
