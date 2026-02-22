import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const keyword = searchParams.get("keyword");
  const city = searchParams.get("city");
  const classificationName = searchParams.get("classificationName");
  const latlong = searchParams.get("latlong");
  const radius = searchParams.get("radius");
  const startDateTime = searchParams.get("startDateTime");
  const endDateTime = searchParams.get("endDateTime");
  
  const apiKey = process.env.TICKETMASTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Ticketmaster API key not configured" },
      { status: 500 }
    );
  }

  // Build the Ticketmaster API URL
  const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
  url.searchParams.append("apikey", apiKey);
  
  if (keyword) url.searchParams.append("keyword", keyword);
  if (city) url.searchParams.append("city", city);
  if (classificationName) url.searchParams.append("classificationName", classificationName);
  if (latlong) url.searchParams.append("latlong", latlong);
  if (radius) url.searchParams.append("radius", radius);
  if (startDateTime) url.searchParams.append("startDateTime", startDateTime);
  if (endDateTime) url.searchParams.append("endDateTime", endDateTime);
  
  // Default sort by date
  url.searchParams.append("sort", "date,asc");
  url.searchParams.append("size", "20"); // Limit to 20 results

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ticketmaster API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Ticketmaster API error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The events are nested under _embedded.events
    const events = data._embedded?.events || [];
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching from Ticketmaster:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}
