import { NextResponse } from "next/server";
import { Book } from "@/types/books";

export const dynamic = "force-dynamic";

const GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Google Books API key missing" }, { status: 500 });
  }

  try {
    const response = await fetch(`${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=20`);
    
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from Google Books" }, { status: response.status });
    }

    const data = await response.json();
    
    const books: Book[] = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title || "Unknown Title",
      authors: item.volumeInfo.authors || ["Unknown Author"],
      description: item.volumeInfo.description || "",
      pageCount: item.volumeInfo.pageCount || 0,
      categories: item.volumeInfo.categories || [],
      averageRating: item.volumeInfo.averageRating || 0,
      imageLinks: {
        thumbnail: item.volumeInfo.imageLinks?.thumbnail || "",
        large: item.volumeInfo.imageLinks?.large || item.volumeInfo.imageLinks?.medium || "",
      },
      isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || "",
      previewLink: item.volumeInfo.previewLink || "",
    }));

    return NextResponse.json({ books });

  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
