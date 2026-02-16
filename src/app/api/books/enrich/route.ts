import { NextResponse } from "next/server";
import { EnrichedBookData, NYTReview, YouTubeVideo } from "@/types/books";

export const dynamic = "force-dynamic";

const NYT_REVIEWS_URL = "https://api.nytimes.com/svc/books/v3/reviews.json";

async function searchNYTReviews(title: string, author: string): Promise<NYTReview[]> {
  const apiKey = process.env.NYT_API_KEY;
  if (!apiKey) return [];

  const searchTerms = title.split(' ').slice(0, 3).join(' ');

  try {
    const response = await fetch(`${NYT_REVIEWS_URL}?title=${encodeURIComponent(searchTerms)}&api-key=${apiKey}`);
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        return data.results.slice(0, 3).map((review: any) => ({
          url: review.url,
          byline: review.byline || "NYT Review",
          headline: review.book_title || title,
          publicationDate: review.publication_date || "",
        }));
      }
    }
  } catch (error) {
    console.error("NYT review search error:", error);
  }

  return [];
}

async function searchYouTube(query: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log("No YouTube API key configured");
    return [];
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) {
      console.log("YouTube API error:", response.status);
      return [];
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      channelName: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title");
  const author = searchParams.get("author");

  if (!title || !author) {
    return NextResponse.json({ error: "Missing title or author parameters" }, { status: 400 });
  }

  try {
    const [videos, reviews] = await Promise.all([
      searchYouTube(`${title} by ${author} book review`),
      searchNYTReviews(title, author),
    ]);

    const enrichedData: EnrichedBookData = {
      videos,
      reviews,
    };

    return NextResponse.json(enrichedData);

  } catch (error) {
    console.error("Enrichment API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
