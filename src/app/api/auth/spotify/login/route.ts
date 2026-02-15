import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  console.log("[spotify/login] clientId:", clientId ? "exists" : "MISSING");
  console.log("[spotify/login] baseUrl:", baseUrl);

  if (!clientId || !baseUrl) {
    console.log("[spotify/login] ERROR: Missing config, redirecting to home");
    const redirectUrl = baseUrl ? `${baseUrl}/` : "/";
    return NextResponse.redirect(`${redirectUrl}?spotify_error=not_configured`);
  }

  // Determine which user is connecting (admin or neo)
  const userAlias =
    request.nextUrl.searchParams.get("user") === "admin" ? "admin" : "neo";

  console.log("[spotify/login] userAlias:", userAlias);

  // Generate CSRF state token
  const state = crypto.randomUUID();

  // Store state + user alias in httpOnly cookies (10 minute TTL)
  cookies().set("spotify_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  cookies().set("spotify_oauth_user", userAlias, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  const scopes = "user-read-currently-playing user-read-playback-state";
  const redirectUri = `${baseUrl}/api/auth/spotify/callback`;

  console.log("[spotify/login] redirectUri:", redirectUri);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  console.log("[spotify/login] Redirecting to Spotify...");

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
