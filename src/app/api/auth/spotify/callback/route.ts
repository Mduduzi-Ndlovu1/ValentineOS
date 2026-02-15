import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  // Handle user denial
  if (error) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=${error}`);
  }

  // Validate CSRF state
  const storedState = cookies().get("spotify_oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=state_mismatch`);
  }

  // Read which user is connecting
  const userAlias = cookies().get("spotify_oauth_user")?.value ?? "neo";

  // Clear OAuth cookies
  cookies().delete("spotify_oauth_state");
  cookies().delete("spotify_oauth_user");

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=no_code`);
  }

  // Exchange code for tokens
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=missing_credentials`
    );
  }

  const redirectUri = `${baseUrl}/api/auth/spotify/callback`;

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=token_exchange_failed`
    );
  }

  const tokenData = await tokenResponse.json();

  // Upsert refresh token into Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { error: dbError } = await supabase
      .from("spotify_tokens")
      .upsert(
        {
          user_alias: userAlias,
          refresh_token: tokenData.refresh_token,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_alias" }
      );

    if (dbError) {
      console.error("[spotify/callback] Supabase upsert error:", dbError.message);
      return NextResponse.redirect(
        `${baseUrl}/?spotify_error=db_error`
      );
    }
  } else {
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=supabase_not_configured`
    );
  }

  return NextResponse.redirect(`${baseUrl}/?connected=true`);
}
