import { motion } from "framer-motion";
import { Book, BestsellerItem } from "@/types/books";
import { currentBookAtom } from "@/store/atoms/books";
import { useSetAtom } from "jotai";

interface BookCardProps {
  book: Book | BestsellerItem;
  variant?: "trending" | "favorite" | "search";
}

export function BookCard({ book, variant = "trending" }: BookCardProps) {
  const setCurrentBook = useSetAtom(currentBookAtom);

  const coverUrl = "coverUrl" in book ? book.coverUrl : book.imageLinks.thumbnail;
  const author = "authors" in book ? book.authors[0] : book.author;
  const title = book.title;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative cursor-pointer flex-shrink-0 ${
        variant === "trending" ? "w-32 md:w-40" : "w-full"
      }`}
      onClick={() => setCurrentBook(book)}
    >
      <div className="aspect-[2/3] rounded-xl overflow-hidden shadow-md bg-reader-beige">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2 text-center text-reader-brown font-serif bg-reader-beige">
            <span className="text-xs line-clamp-3">{title}</span>
          </div>
        )}
      </div>
      <div className="mt-2 px-1">
        <h3 className="font-montserrat font-bold text-sm text-reader-brown line-clamp-1">
          {title}
        </h3>
        <p className="font-serif text-xs text-reader-brown/70 line-clamp-1">
          {author}
        </p>
      </div>
    </motion.div>
  );
}
