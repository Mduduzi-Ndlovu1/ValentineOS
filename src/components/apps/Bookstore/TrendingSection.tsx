import { BestsellerItem } from "@/types/books";
import { BookCard } from "./BookCard";
import { ChevronRight } from "lucide-react";

interface TrendingSectionProps {
  books: BestsellerItem[];
  loading: boolean;
}

export function TrendingSection({ books, loading }: TrendingSectionProps) {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4 px-4">
        <h2 className="font-montserrat font-bold text-xl text-reader-brown">
          Trending Now
        </h2>
        <button className="text-sm font-semibold text-reader-brown/60 hover:text-reader-brown transition-colors flex items-center gap-1">
          See All <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 px-4 scrollbar-hide snap-x snap-mandatory">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="w-32 md:w-40 flex-shrink-0 animate-pulse"
              >
                <div className="aspect-[2/3] bg-reader-beige/50 rounded-xl mb-2" />
                <div className="h-4 bg-reader-beige/50 rounded w-3/4 mb-1" />
                <div className="h-3 bg-reader-beige/30 rounded w-1/2" />
              </div>
            ))
          : books.map((book) => (
              <div key={book.isbn} className="snap-start">
                <BookCard book={book} variant="trending" />
              </div>
            ))}
      </div>
    </div>
  );
}
