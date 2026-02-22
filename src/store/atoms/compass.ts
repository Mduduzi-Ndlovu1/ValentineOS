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
export const compassSelectedEventAtom = atom<CompassEvent | null>(null);
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

// -----------------------------------------------------------------------------
// Explore Feed (Ticketmaster Integration)
// -----------------------------------------------------------------------------

export const exploreEventsAtom = atom<CompassEvent[]>([]);
export const exploreLoadingAtom = atom<boolean>(false);
export const exploreErrorAtom = atom<string | null>(null);
export const exploreSearchAtom = atom<{
  query: string;
  city: string;
  lat?: number;
  lng?: number;
  radius?: number;
  startDateTime?: string;
  endDateTime?: string;
}>({
  query: "",
  city: "",
});

export const searchExploreEventsAtom = atom(
  null,
  async (get, set, overrideParams?: {
    lat?: number;
    lng?: number;
    radius?: number;
    startDateTime?: string;
    endDateTime?: string;
    query?: string;
    city?: string;
  }) => {
    const currentState = get(exploreSearchAtom);
    
    // Merge override params with current state, prioritizing overrides
    const query = overrideParams?.query ?? currentState.query;
    const city = overrideParams?.city ?? currentState.city;
    const lat = overrideParams?.lat ?? currentState.lat;
    const lng = overrideParams?.lng ?? currentState.lng;
    const radius = overrideParams?.radius ?? currentState.radius;
    const startDateTime = overrideParams?.startDateTime ?? currentState.startDateTime;
    const endDateTime = overrideParams?.endDateTime ?? currentState.endDateTime;

    // Check if we have enough info to search
    // Need either a query, a city, or geolocation
    if (!query && !city && (lat === undefined || lng === undefined)) {
      set(exploreErrorAtom, "Please enter a keyword, city, or allow location access");
      return;
    }

    set(exploreLoadingAtom, true);
    set(exploreErrorAtom, null);
    set(exploreEventsAtom, []);

    try {
      const params = new URLSearchParams();
      if (query) params.append("keyword", query);
      if (city) params.append("city", city);
      
      if (lat !== undefined && lng !== undefined) {
        params.append("latlong", `${lat},${lng}`);
      }
      
      if (radius) params.append("radius", radius.toString());
      if (startDateTime) params.append("startDateTime", startDateTime);
      if (endDateTime) params.append("endDateTime", endDateTime);

      // Optional: Filter by classificationName if needed, e.g. 'Music', 'Arts'
      // params.append("classificationName", "Music");

      const response = await fetch(`/api/compass/explore?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.statusText}`);
      }

      const data = await response.json();
      const rawEvents = data.events || [];

      // Map Ticketmaster events to CompassEvent format
      const mappedEvents: CompassEvent[] = rawEvents.map((tmEvent: any) => {
        // Extract venue info
        const venue = tmEvent._embedded?.venues?.[0];
        const locationName = venue?.name || tmEvent.place?.name;
        const cityName = venue?.city?.name || tmEvent.place?.city?.name;
        const fullLocation = [locationName, cityName].filter(Boolean).join(", ");

        // Extract image (find best quality or first)
        const image = tmEvent.images?.find((img: any) => img.width > 600) || tmEvent.images?.[0];

        // Map category
        // Ticketmaster classifications: Segment -> Genre -> SubGenre
        const segment = tmEvent.classifications?.[0]?.segment?.name?.toLowerCase();
        let category: CompassCategory = "other";
        if (segment === "music" || segment === "arts & theatre") category = "activity";
        else if (segment === "sports") category = "activity";
        else if (segment === "film") category = "date";
        // 'travel' and 'food' are less likely from TM, but 'other' is a safe fallback.

        // Map price range
        const priceRange = tmEvent.priceRanges?.[0]
          ? {
              min: tmEvent.priceRanges[0].min,
              max: tmEvent.priceRanges[0].max,
              currency: tmEvent.priceRanges[0].currency,
            }
          : null;

        return {
          id: `tm-${tmEvent.id}`, // Prefix to avoid collision with UUIDs, though not saved to DB yet
          created_at: new Date().toISOString(),
          created_by: "admin", // Default, will be overridden on import if needed
          title: tmEvent.name,
          description: tmEvent.info || tmEvent.pleaseNote || null,
          status: "idea", // Default status for explore items
          category: category,
          location: fullLocation || null,
          event_date: tmEvent.dates?.start?.dateTime || tmEvent.dates?.start?.localDate || null,
          image_url: image?.url || null,
          coordinates: venue?.location
            ? {
                lat: parseFloat(venue.location.latitude),
                lng: parseFloat(venue.location.longitude),
              }
            : null,
          price_range: priceRange,
        };
      });

      set(exploreEventsAtom, mappedEvents);
    } catch (error) {
      console.error("Explore search failed:", error);
      set(exploreErrorAtom, error instanceof Error ? error.message : "Search failed");
    } finally {
      set(exploreLoadingAtom, false);
    }
  }
);

export const importEventAtom = atom(
  null,
  async (_get, set, event: CompassEvent) => {
    // Remove the temporary ID prefix if present and let DB generate a real UUID
    // Or simpler: just pass the data to addCompassEventAtom which handles insertion
    
    // We need to strip the ID because addCompassEventAtom expects Omit<CompassEvent, "id" | "created_at">
    // and Supabase will generate the ID.
    const { id, created_at, ...eventData } = event;
    
    // Call the existing add action
    await set(addCompassEventAtom, eventData);
    
    // Optionally remove from explore list to indicate it's been added?
    // Or just let the UI handle showing "Added" state.
    // For now, let's remove it from the explore list so it doesn't show up as a duplicate suggestion
    set(exploreEventsAtom, (prev) => prev.filter((e) => e.id !== id));
  }
);

