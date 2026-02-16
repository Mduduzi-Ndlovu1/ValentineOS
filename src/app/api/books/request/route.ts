import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Key is missing.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  const { fromUser, toUser, bookTitle, bookAuthor, bookCoverUrl } = await request.json();

  if (!fromUser || !toUser || !bookTitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_requests")
    .insert({
      from_user: fromUser,
      to_user: toUser,
      book_title: bookTitle,
      book_author: bookAuthor || "",
      book_cover_url: bookCoverUrl || "",
      is_read: false,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert book request error:", error);
    return NextResponse.json({ error: "Failed to save book request" }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userAlias = searchParams.get("userAlias");

  if (!userAlias) {
    return NextResponse.json({ error: "Missing userAlias parameter" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("book_requests")
    .select("*")
    .eq("to_user", userAlias)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch book requests error:", error);
    return NextResponse.json({ error: "Failed to fetch book requests" }, { status: 500 });
  }

  return NextResponse.json({ requests: data || [] });
}

export async function PATCH(request: Request) {
  const { requestId } = await request.json();

  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("book_requests")
    .update({ is_read: true })
    .eq("id", requestId);

  if (error) {
    console.error("Supabase update book request error:", error);
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
