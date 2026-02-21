export type CompassStatus = "idea" | "planned" | "booked" | "completed";

export type CompassCategory = "travel" | "date" | "activity" | "food" | "other";

export interface CompassEvent {
  id: string;
  created_at: string;
  created_by: "admin" | "neo";
  title: string;
  description: string | null;
  status: CompassStatus;
  category: CompassCategory | null;
  location: string | null;
  event_date: string | null;
  image_url: string | null;
  coordinates: {
    lat: number;
    lng: number;
  } | null;
}

export interface CompassState {
  events: CompassEvent[];
  filterStatus: CompassStatus | "all";
  filterCategory: CompassCategory | "all";
  isLoading: boolean;
  error: string | null;
}
