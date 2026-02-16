import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    .from("user_preferences")
    .select("*")
    .eq("user_alias", userAlias)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Supabase fetch preferences error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ 
      wallpaper_url: null, 
      preferences: {},
      last_read_version: null 
    });
  }

  return NextResponse.json({
    wallpaper_url: data.wallpaper_url,
    preferences: data.preferences || {},
    last_read_version: data.preferences?.last_read_version || null,
  });
}

export async function POST(request: Request) {
  const { userAlias, wallpaper_url, preferences, last_read_version } = await request.json();

  if (!userAlias) {
    return NextResponse.json({ error: "Missing userAlias" }, { status: 400 });
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (wallpaper_url !== undefined) {
    updateData.wallpaper_url = wallpaper_url;
  }

  if (preferences !== undefined || last_read_version !== undefined) {
    const { data: existing } = await supabase
      .from("user_preferences")
      .select("preferences")
      .eq("user_alias", userAlias)
      .single();

    const mergedPreferences = {
      ...(existing?.preferences || {}),
      ...preferences,
    };

    if (last_read_version !== undefined) {
      mergedPreferences.last_read_version = last_read_version;
    }

    updateData.preferences = mergedPreferences;
  }

  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_alias: userAlias,
      ...updateData,
    }, {
      onConflict: 'user_alias'
    });

  if (error) {
    console.error("Supabase upsert preferences error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
