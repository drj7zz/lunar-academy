import { getLeaderboard, submitScore } from "@/lib/leaderboard";

export async function GET() {
  return Response.json({ entries: getLeaderboard() });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      { error: "Request body must include a callsign and score." },
      { status: 400 },
    );
  }

  const { callsign, score } = body as { callsign?: unknown; score?: unknown };
  if (
    typeof callsign !== "string" ||
    callsign.trim().length === 0 ||
    callsign.trim().length > 24 ||
    typeof score !== "number" ||
    !Number.isSafeInteger(score) ||
    score < 0
  ) {
    return Response.json(
      { error: "Callsign must be 1–24 characters and score must be a non-negative integer." },
      { status: 400 },
    );
  }

  const entry = submitScore(callsign.trim(), score);
  return Response.json({ entry }, { status: 201 });
}
