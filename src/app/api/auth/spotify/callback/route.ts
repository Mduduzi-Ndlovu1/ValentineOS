import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";

  console.log("[spotify/callback] Received callback");
  console.log("[spotify/callback] code:", code ? "yes" : "no");
  console.log("[spotify/callback] error:", error ? error : "none");
  console.log("[spotify/callback] state:", state ? "yes" : "no");

  // Handle user denial
  if (error) {
    console.log("[spotify/callback] User denied access");
    return NextResponse.redirect(`${baseUrl}/?spotify_error=${error}`);
  }

  // Validate CSRF state
  const storedState = cookies().get("spotify_oauth_state")?.value;
  console.log("[spotify/callback] State validation:", state === storedState ? "passed" : "FAILED");
  if (!state || state !== storedState) {
    console.log("[spotify/callback] State mismatch!");
    return NextResponse.redirect(`${baseUrl}/?spotify_error=state_mismatch`);
  }

  // Read which user is connecting
  const userAlias = cookies().get("spotify_oauth_user")?.value ?? "neo";
  console.log("[spotify/callback] userAlias:", userAlias);

  // Clear OAuth cookies
  cookies().delete("spotify_oauth_state");
  cookies().delete("spotify_oauth_user");

  if (!code) {
    console.log("[spotify/callback] No code received!");
    return NextResponse.redirect(`${baseUrl}/?spotify_error=no_code`);
  }

  // Exchange code for tokens
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  console.log("[spotify/callback] clientId:", clientId ? "exists" : "MISSING");

  if (!clientId || !clientSecret) {
    console.log("[spotify/callback] Missing credentials!");
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=missing_credentials`
    );
  }

  const redirectUri = `${baseUrl}/api/auth/spotify/callback`;
  console.log("[spotify/callback] redirectUri:", redirectUri);

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

  console.log("[spotify/callback] Token exchange status:", tokenResponse.ok ? "success" : "FAILED");

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    console.log("[spotify/callback] Token error:", errText);
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=token_exchange_failed`
    );
  }

  const tokenData = await tokenResponse.json();
  console.log("[spotify/callback] Got tokens for user:", userAlias);

  // Upsert refresh token into Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log("[spotify/callback] Supabase URL:", supabaseUrl ? "exists" : "MISSING");

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

    console.log("[spotify/callback] DB save:", dbError ? "FAILED" : "success");

    if (dbError) {
      console.error("[spotify/callback] Supabase upsert error:", dbError.message);
      return NextResponse.redirect(
        `${baseUrl}/?spotify_error=db_error`
      );
    }
  } else {
    console.log("[spotify/callback] Supabase not configured!");
    return NextResponse.redirect(
      `${baseUrl}/?spotify_error=supabase_not_configured`
    );
  }

  console.log("[spotify/callback] Success! Redirecting to home with connected=true");
  return NextResponse.redirect(`${baseUrl}/?connected=true`);
}
