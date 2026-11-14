const DONKI_URL = "https://api.nasa.gov/DONKI/FLR";
const DAYS_TO_FETCH = 7;

export async function GET() {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - DAYS_TO_FETCH);

  const query = new URLSearchParams({
    startDate: startDate.toISOString().slice(0, 10),
    endDate: endDate.toISOString().slice(0, 10),
    api_key: process.env.NASA_API_KEY || "DEMO_KEY",
  });

  let response: Response;
  try {
    response = await fetch(`${DONKI_URL}?${query}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return Response.json(
      { error: "NASA DONKI could not be reached. Please try again later." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return Response.json(
      { error: `NASA DONKI returned HTTP ${response.status}.` },
      { status: 502 },
    );
  }

  let events: unknown;
  try {
    events = await response.json();
  } catch {
    return Response.json(
      { error: "NASA DONKI returned an unreadable response." },
      { status: 502 },
    );
  }

  if (!Array.isArray(events)) {
    return Response.json(
      { error: "NASA DONKI returned an unexpected response." },
      { status: 502 },
    );
  }

  return Response.json({
    source: "NASA DONKI Solar Flare (FLR)",
    period: {
      start: query.get("startDate"),
      end: query.get("endDate"),
    },
    count: events.length,
    events,
  });
}
