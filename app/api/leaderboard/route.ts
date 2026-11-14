
import { getClientPromise } from "@/lib/mongodb";
import { isRateLimited } from "@/lib/rateLimit";
import { getLeaderboard, submitScore } from "@/lib/leaderboard";
import {
  ALLOWED_CALLSIGNS,
  DB_NAME,
  MAX_SCORE,
  RATE_LIMIT_MAX,
  SCORES_COLLECTION,
} from "@/lib/config";
import type { Document } from "mongodb";

type LeaderboardEntry = {
  callsign: string;
  score: number;
  createdAt: string;
};

type StoredLeaderboardEntry = LeaderboardEntry & Document;

export const dynamic = "force-dynamic";

const LEADERBOARD_SIZE = 10;

function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

export async function GET() {
  try {
    const client = await getClientPromise();
    const collection = client
      .db(DB_NAME)
      .collection<StoredLeaderboardEntry>(SCORES_COLLECTION);

    const entries = await collection
      .find({}, { projection: { _id: 0, callsign: 1, score: 1, createdAt: 1 } })
      .sort({ score: -1, createdAt: 1 })
      .limit(LEADERBOARD_SIZE)
      .toArray();

    return Response.json({
      entries,
      storage: "database",
    });
  } catch {
    console.error("Leaderboard database read failed. Using memory fallback.");

    return Response.json({
      entries: getLeaderboard(),
      storage: "memory",
    });
  }
}

export async function POST(request: Request) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return Response.json(
      { error: `Too many requests. Maximum ${RATE_LIMIT_MAX} submissions per minute.` },
      { status: 429 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return Response.json(
      { error: "Request body must include a callsign and score." },
      { status: 400 },
    );
  }

  const { callsign, score } = body as {
    callsign?: unknown;
    score?: unknown;
  };

  if (
    typeof callsign !== "string" ||
    !ALLOWED_CALLSIGNS.includes(callsign.trim())
  ) {
    return Response.json(
      { error: "Please select an approved cadet callsign." },
      { status: 400 },
    );
  }

  if (
    typeof score !== "number" ||
    !Number.isSafeInteger(score) ||
    score < 0 ||
    score > MAX_SCORE
  ) {
    return Response.json(
      { error: `Score must be an integer between 0 and ${MAX_SCORE}.` },
      { status: 400 },
    );
  }

  const entry: LeaderboardEntry = {
    callsign: callsign.trim(),
    score,
    createdAt: new Date().toISOString(),
  };

  try {
    const client = await getClientPromise();
    const collection = client
      .db(DB_NAME)
      .collection<StoredLeaderboardEntry>(SCORES_COLLECTION);

    await collection.insertOne(entry);

    return Response.json(
      { entry, storage: "database" },
      { status: 201 },
    );
  } catch {
    console.error("Leaderboard database write failed. Using memory fallback.");

    const fallbackEntry = submitScore(entry.callsign, entry.score);

    return Response.json(
      { entry: fallbackEntry, storage: "memory" },
      { status: 201 },
    );
  }
}
