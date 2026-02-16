import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Book } from "@/types/books";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAlias = searchParams.get("userAlias");

  if (!userAlias) {
    return NextResponse.json({ error: "Missing userAlias parameter" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_favorites")
    .select("*")
    .eq("user_alias", userAlias);

  if (error) {
    console.error("Supabase fetch favorites error:", error);
    return NextResponse.json({ error: "Failed to fetch favorites" }, { status: 500 });
  }

  return NextResponse.json({ favorites: data });
}

export async function POST(request: Request) {
  const { userAlias, book } = await request.json();

  if (!userAlias || !book) {
    return NextResponse.json({ error: "Missing userAlias or book data" }, { status: 400 });
  }

  const { error } = await supabase
    .from("book_favorites")
    .insert({
      user_alias: userAlias,
      book_id: book.id,
      title: book.title,
      authors: book.authors,
      image_url: book.imageLinks.thumbnail,
    });

  if (error) {
    console.error("Supabase add favorite error:", error);
    return NextResponse.json({ error: "Failed to add favorite" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const { userAlias, bookId } = await request.json();

  if (!userAlias || !bookId) {
    return NextResponse.json({ error: "Missing userAlias or bookId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("book_favorites")
    .delete()
    .match({ user_alias: userAlias, book_id: bookId });

  if (error) {
    console.error("Supabase delete favorite error:", error);
    return NextResponse.json({ error: "Failed to delete favorite" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
