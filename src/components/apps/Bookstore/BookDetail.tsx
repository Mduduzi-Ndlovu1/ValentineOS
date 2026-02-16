import { useEffect, useState } from "react";
import { Book, BestsellerItem } from "@/types/books";
import {
  currentBookAtom,
  enrichmentDataAtom,
  fetchEnrichmentAtom,
  addFavoriteAtom,
  removeFavoriteAtom,
  favoritesAtom,
} from "@/store/atoms/books";
import { useAtom, useSetAtom } from "jotai";
import { motion } from "framer-motion";
import { X, Star, Heart, ExternalLink, Play, ArrowLeft, BookOpen } from "lucide-react";
import { showNotificationAtom } from "@/store/atoms/ui";
import { currentUserAtom } from "@/store/atoms/user";

interface BookDetailProps {
  book: Book | BestsellerItem;
  onClose: () => void;
  userAlias?: string;
}

export function BookDetail({ book, onClose, userAlias = "admin" }: BookDetailProps) {
  const [enrichment, setEnrichment] = useAtom(enrichmentDataAtom);
  const fetchEnrichment = useSetAtom(fetchEnrichmentAtom);
  const [favorites, setFavorites] = useAtom(favoritesAtom);
  const addFavorite = useSetAtom(addFavoriteAtom);
  const removeFavorite = useSetAtom(removeFavoriteAtom);
  const showNotification = useSetAtom(showNotificationAtom);
  const [currentUser] = useAtom(currentUserAtom);
  
  const [showPreview, setShowPreview] = useState(false);

  const title = book.title;
  const author = "authors" in book ? book.authors[0] : book.author;
  const description = "description" in book ? book.description : "No description available.";
  const coverUrl = "coverUrl" in book ? book.coverUrl : book.imageLinks.thumbnail;
  const rating = "averageRating" in book ? book.averageRating : 4.5;
  
  const bookPreviewLink = "previewLink" in book ? (book as Book).previewLink : "";
  const hasPreview = !!bookPreviewLink;

  const isFavorite = favorites.some(
    (f) =>
      f.title === title &&
      (f.id === ("id" in book ? book.id : "") || f.imageLinks.thumbnail === coverUrl)
  );

  const handleFavorite = async () => {
    const bookToSave: Book = "id" in book ? book : {
        id: book.isbn,
        title: book.title,
        authors: [book.author],
        description: book.description,
        pageCount: 0,
        categories: [],
        averageRating: 4.5,
        imageLinks: { thumbnail: book.coverUrl },
        isbn: book.isbn
    };

    if (isFavorite) {
      removeFavorite({ userAlias, bookId: bookToSave.id });
    } else {
      addFavorite({ userAlias, book: bookToSave });
      
      // If Neo is favoriting a book, save request to DB for admin
      if (currentUser === "Neo") {
        // Show local confirmation toast
        showNotification({
          message: `📚 Request sent to Mduduzi for "${title}"`,
          type: "info",
          icon: "heart",
          source: "Bookstore",
        });
        
        try {
          const response = await fetch("/api/books/request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fromUser: "neo",
              toUser: "admin",
              bookTitle: title,
              bookAuthor: author,
              bookCoverUrl: coverUrl,
            }),
          });
          
          if (!response.ok) {
            const err = await response.json();
            console.error("Failed to save request:", err);
          } else {
            console.log("Book request saved successfully");
          }
        } catch (error) {
          console.error("Error saving book request:", error);
        }
      }
    }
  };

  useEffect(() => {
    fetchEnrichment({ title, author });
    return () => setEnrichment(null);
  }, [book, title, author, fetchEnrichment, setEnrichment]);

  // Preview mode - full screen iframe
  if (showPreview && hasPreview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-[60] bg-reader-cream"
      >
        {/* Preview Header */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-reader-brown/90 backdrop-blur-sm flex items-center justify-between px-4 z-10">
          <button
            onClick={() => setShowPreview(false)}
            className="flex items-center gap-2 text-reader-cream hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-montserrat font-medium">Back to Details</span>
          </button>
          <span className="text-reader-cream/80 text-sm font-serif truncate max-w-md">
            {title}
          </span>
          <a
            href={bookPreviewLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-reader-cream hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Open in Google Books</span>
          </a>
        </div>
        
        {/* iFrame Preview */}
        <iframe
          src={bookPreviewLink}
          className="w-full h-full pt-14"
          title={`Preview of ${title}`}
          allow="clipboard-write"
        />
      </motion.div>
    );
  }

  // Normal detail view
  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-50 bg-reader-cream overflow-y-auto"
    >
      {/* Header Image */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-reader-brown/10" />
        {coverUrl ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-reader-beige/30 to-reader-brown/20">
            <img
              src={coverUrl}
              alt={title}
              className="max-h-full max-w-full object-contain drop-shadow-xl"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-reader-beige/30">
            <span className="text-reader-brown font-serif text-2xl">{title}</span>
          </div>
        )}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full shadow-sm text-reader-brown hover:bg-white/40 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Content */}
      <div className="px-6 py-6 pb-24 md:max-w-3xl md:mx-auto">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-montserrat font-bold text-2xl text-reader-brown leading-tight mb-1">
              {title}
            </h2>
            <p className="font-serif text-lg text-reader-brown/70">{author}</p>
          </div>
          <div className="flex items-center gap-1 bg-reader-beige px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
            <span className="font-montserrat font-semibold text-sm text-reader-brown">
              {rating}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!hasPreview}
            className={`flex-1 py-3 rounded-xl font-montserrat font-bold shadow-md transition-colors flex items-center justify-center gap-2 ${
              hasPreview
                ? "bg-reader-brown text-reader-cream hover:bg-reader-brown/90"
                : "bg-reader-beige/50 text-reader-brown/40 cursor-not-allowed"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {hasPreview ? "Read Sample" : "No Preview Available"}
          </button>
          <button
            onClick={handleFavorite}
            className={`p-3 rounded-xl shadow-md transition-colors ${
              isFavorite ? "bg-rose-400 text-white" : "bg-reader-beige text-reader-brown hover:bg-reader-beige/80"
            }`}
          >
            <Heart className={`w-6 h-6 ${isFavorite ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* About Section */}
        <div className="mb-8">
          <h3 className="font-montserrat font-bold text-lg text-reader-brown mb-3">
            About the Book
          </h3>
          {description && description !== "No description available." ? (
            <p className="font-serif text-reader-brown/80 leading-relaxed text-justify line-clamp-6">
              {description}
            </p>
          ) : (
            <p className="font-serif text-reader-brown/50 italic">
              No description available for this book.
            </p>
          )}
        </div>

        {/* Media Hub */}
        {enrichment && (
          <div className="space-y-8">
            {/* Reviews (NYT) */}
            {enrichment.reviews.length > 0 && (
              <div>
                <h3 className="font-montserrat font-bold text-lg text-reader-brown mb-4">
                  In The Times
                </h3>
                <div className="space-y-3">
                  {enrichment.reviews.map((review, i) => (
                    <a
                      key={i}
                      href={review.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white p-4 rounded-xl shadow-sm border border-reader-beige hover:border-reader-brown/30 transition-colors group"
                    >
                      <h4 className="font-serif font-bold text-reader-brown mb-1 group-hover:underline decoration-reader-brown/50">
                        {review.headline || title}
                      </h4>
                      <div className="flex justify-between items-center text-xs text-reader-brown/60 font-sans">
                        <span>{review.byline}</span>
                        <span>{review.publicationDate}</span>
                      </div>
                      <ExternalLink className="w-4 h-4 absolute top-4 right-4 text-reader-brown/30" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Videos (YouTube) */}
            {enrichment.videos.length > 0 && (
              <div>
                <h3 className="font-montserrat font-bold text-lg text-reader-brown mb-4">
                  BookTube Reviews
                </h3>
                <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
                  {enrichment.videos.map((video) => (
                    <div key={video.id} className="flex-shrink-0 w-64 group">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-md relative mb-2">
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 fill-white text-white" />
                            </div>
                        </div>
                        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="absolute inset-0" />
                      </div>
                      <p className="font-montserrat font-semibold text-sm text-reader-brown line-clamp-2 leading-tight">
                        {video.title}
                      </p>
                      <p className="text-xs text-reader-brown/60 mt-1">{video.channelName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
