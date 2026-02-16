import { atom } from "jotai";
import { Book, BestsellerItem, EnrichedBookData } from "@/types/books";

// Atoms
export const searchQueryAtom = atom<string>("");
export const bestsellersAtom = atom<BestsellerItem[]>([]);
export const searchResultsAtom = atom<Book[]>([]);
export const currentBookAtom = atom<Book | BestsellerItem | null>(null);
export const enrichmentDataAtom = atom<EnrichedBookData | null>(null);
export const favoritesAtom = atom<Book[]>([]);
export const booksLoadingAtom = atom<boolean>(false);
export const booksErrorAtom = atom<string | null>(null);

// Actions
export const fetchBestsellersAtom = atom(
  null,
  async (_get, set) => {
    set(booksLoadingAtom, true);
    set(booksErrorAtom, null);
    try {
      const response = await fetch("/api/books/bestsellers");
      if (!response.ok) throw new Error("Failed to fetch bestsellers");
      const data = await response.json();
      set(bestsellersAtom, data.books || []);
    } catch (error) {
      set(booksErrorAtom, error instanceof Error ? error.message : "Unknown error");
    } finally {
      set(booksLoadingAtom, false);
    }
  }
);

export const fetchSearchAtom = atom(
  null,
  async (_get, set, query: string) => {
    set(booksLoadingAtom, true);
    set(booksErrorAtom, null);
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Failed to search books");
      const data = await response.json();
      set(searchResultsAtom, data.books || []);
    } catch (error) {
      set(booksErrorAtom, error instanceof Error ? error.message : "Unknown error");
    } finally {
      set(booksLoadingAtom, false);
    }
  }
);

export const fetchEnrichmentAtom = atom(
  null,
  async (_get, set, { title, author }: { title: string; author: string }) => {
    // Don't set global loading here to avoid blocking UI; handle locally if needed
    // or use a separate atom for enrichment loading
    try {
      const response = await fetch(`/api/books/enrich?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`);
      if (!response.ok) throw new Error("Failed to fetch enrichment data");
      const data = await response.json();
      set(enrichmentDataAtom, data);
    } catch (error) {
      console.error("Enrichment fetch error:", error);
    }
  }
);

export const addFavoriteAtom = atom(
  null,
  async (_get, set, { userAlias, book }: { userAlias: string; book: Book }) => {
     // Optimistically update
     set(favoritesAtom, (prev) => [...prev, book]);

     try {
       const response = await fetch("/api/books/favorites", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ userAlias, book }),
       });
       if (!response.ok) throw new Error("Failed to add favorite");
     } catch (error) {
        console.error("Error adding favorite:", error);
        // Revert on failure
        set(favoritesAtom, (prev) => prev.filter((b) => b.id !== book.id));
     }
  }
);

export const removeFavoriteAtom = atom(
  null,
  async (_get, set, { userAlias, bookId }: { userAlias: string; bookId: string }) => {
    // Optimistically update
    set(favoritesAtom, (prev) => prev.filter((b) => b.id !== bookId));

    try {
      const response = await fetch("/api/books/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAlias, bookId }),
      });
      if (!response.ok) throw new Error("Failed to remove favorite");
    } catch (error) {
       console.error("Error removing favorite:", error);
       // Ideally revert here, but complex to restore the exact object without re-fetching
    }
  }
);

export const loadFavoritesAtom = atom(
  null,
  async (_get, set, userAlias: string) => {
    try {
      const response = await fetch(`/api/books/favorites?userAlias=${userAlias}`);
      if (response.ok) {
        const data = await response.json();
        // Transform Supabase data to Book interface
        const books: Book[] = (data.favorites || []).map((fav: any) => ({
          id: fav.book_id,
          title: fav.title,
          authors: fav.authors || [],
          description: "", // Missing
          pageCount: 0,
          categories: [],
          averageRating: 0,
          imageLinks: { thumbnail: fav.image_url },
          isbn: "",
        }));
        set(favoritesAtom, books);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  }
);
