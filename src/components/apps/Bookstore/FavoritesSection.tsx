import { Book } from "@/types/books";
import { BookCard } from "./BookCard";
import { Heart } from "lucide-react";

interface FavoritesSectionProps {
  books: Book[];
  loading: boolean;
}

export function FavoritesSection({ books, loading }: FavoritesSectionProps) {
  if (books.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-reader-brown/40 border-t border-reader-beige">
        <Heart className="w-12 h-12 mb-2 stroke-1" />
        <p className="font-serif text-lg italic">Your shelf is empty.</p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-20">
      <h2 className="font-montserrat font-bold text-xl text-reader-brown mb-4">
        Your Favorites
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} variant="favorite" />
        ))}
      </div>
    </div>
  );
}
