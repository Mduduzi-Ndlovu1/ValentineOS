import { useEffect, useRef } from "react";
import { useAtom, useSetAtom } from "jotai";
import {
  searchQueryAtom,
  bestsellersAtom,
  fetchBestsellersAtom,
  fetchSearchAtom,
  searchResultsAtom,
  booksLoadingAtom,
  favoritesAtom,
  loadFavoritesAtom,
  currentBookAtom,
} from "@/store/atoms/books";
import { Search, Loader2 } from "lucide-react";
import { TrendingSection } from "./TrendingSection";
import { FavoritesSection } from "./FavoritesSection";
import { BookCard } from "./BookCard";
import { BookDetail } from "./BookDetail";
import { AnimatePresence, motion } from "framer-motion";
import { currentUserAtom } from "@/store/atoms/user";

export function Bookstore() {
  const [query, setQuery] = useAtom(searchQueryAtom);
  const [loading, setLoading] = useAtom(booksLoadingAtom);
  const bestsellers = useAtom(bestsellersAtom)[0];
  const searchResults = useAtom(searchResultsAtom)[0];
  const favorites = useAtom(favoritesAtom)[0];
  const [currentBook, setCurrentBook] = useAtom(currentBookAtom);
  
  const fetchBestsellers = useSetAtom(fetchBestsellersAtom);
  const fetchSearch = useSetAtom(fetchSearchAtom);
  const loadFavorites = useSetAtom(loadFavoritesAtom);
  
  const [currentUser] = useAtom(currentUserAtom);
  const userAlias = currentUser === "Mduduzi" ? "admin" : "neo";

  const searchDebounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchBestsellers();
    loadFavorites(userAlias);
  }, [fetchBestsellers, loadFavorites, userAlias]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    
    if (value.trim().length > 2) {
      searchDebounceRef.current = setTimeout(() => {
        fetchSearch(value);
      }, 500);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent relative overflow-hidden font-sans p-3">
      {/* Header / Search */}
      <div className="sticky top-0 z-20 bg-white/30 backdrop-blur-md px-4 py-4 border-b border-reader-beige">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-reader-brown/40" />
          <input
            type="text"
            placeholder="Find your next read..."
            value={query}
            onChange={handleSearch}
            className="w-full bg-white border border-reader-beige rounded-full py-3 pl-12 pr-4 text-reader-brown placeholder-reader-brown/40 focus:outline-none focus:ring-2 focus:ring-reader-beige/50 font-montserrat transition-all shadow-sm"
          />
          {loading && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-reader-brown animate-spin" />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-6">
        {query.length > 2 ? (
          <div className="px-4 pb-20 max-w-4xl mx-auto">
            <h2 className="font-montserrat font-bold text-xl text-reader-brown mb-4">
              Search Results
            </h2>
            {searchResults.length === 0 && !loading ? (
              <p className="text-center text-reader-brown/50 py-10 font-serif italic">
                No books found matching &quot;{query}&quot;
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {searchResults.map((book) => (
                  <BookCard key={book.id} book={book} variant="search" />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <TrendingSection
              books={bestsellers}
              loading={loading && bestsellers.length === 0}
            />
            <FavoritesSection books={favorites} loading={loading} />
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {currentBook && (
          <BookDetail
            book={currentBook}
            onClose={() => setCurrentBook(null)}
            userAlias={userAlias}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
