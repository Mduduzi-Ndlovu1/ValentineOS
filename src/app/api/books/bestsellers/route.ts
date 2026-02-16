import { NextResponse } from "next/server";
import type { BestsellerItem } from "@/types/books";

export const dynamic = "force-dynamic";

const NYT_BESTSELLERS_URL = "https://api.nytimes.com/svc/books/v3/lists/current/hardcover-fiction.json";
const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

async function getCoverFromGoogle(isbn: string): Promise<string> {
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) return "";

  try {
    const response = await fetch(`${GOOGLE_BOOKS_URL}?q=isbn:${isbn}&key=${apiKey}`);
    if (!response.ok) return "";
    
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].volumeInfo.imageLinks?.thumbnail || "";
    }
  } catch (error) {
    console.error("Error fetching cover for ISBN " + isbn, error);
  }
  return "";
}

export async function GET() {
  const nytApiKey = process.env.NYT_API_KEY;

  if (!nytApiKey) {
    return NextResponse.json({ error: "NYT API key missing" }, { status: 500 });
  }

  try {
    const response = await fetch(`${NYT_BESTSELLERS_URL}?api-key=${nytApiKey}`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from NYT" }, { status: response.status });
    }

    const data = await response.json();
    const books = data.results.books;

    const bestsellers: BestsellerItem[] = await Promise.all(
      books.map(async (book: any) => {
        const isbn = book.primary_isbn13 || book.primary_isbn10;
        let coverUrl = book.book_image;

        if (!coverUrl) {
           coverUrl = await getCoverFromGoogle(isbn);
        }

        return {
          isbn: isbn,
          title: book.title,
          author: book.author,
          coverUrl: coverUrl,
          description: book.description,
        };
      })
    );

    return NextResponse.json({ books: bestsellers });

  } catch (error) {
    console.error("Bestsellers API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
