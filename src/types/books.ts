// Book from Google Books
export interface Book {
  id: string;
  title: string;
  authors: string[];
  description: string;
  pageCount: number;
  categories: string[];
  averageRating: number;
  imageLinks: { thumbnail: string; large?: string };
  isbn?: string;
  previewLink?: string;
}

// Simplified bestseller item
export interface BestsellerItem {
  isbn: string;
  title: string;
  author: string;
  coverUrl: string;
  description: string;
}

// YouTube video
export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelName: string;
}

// NYT Review
export interface NYTReview {
  url: string;
  byline: string;
  headline: string;
  publicationDate: string;
}

// Enriched data for detail view
export interface EnrichedBookData {
  videos: YouTubeVideo[];
  reviews: NYTReview[];
}
