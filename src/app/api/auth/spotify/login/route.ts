import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!clientId || !baseUrl) {
    const redirectUrl = baseUrl ? `${baseUrl}/` : "/";
    return NextResponse.redirect(`${redirectUrl}?spotify_error=not_configured`);
  }

  // Determine which user is connecting (admin or neo)
  const userAlias =
    request.nextUrl.searchParams.get("user") === "admin" ? "admin" : "neo";

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

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    state,
  });

  return NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}
