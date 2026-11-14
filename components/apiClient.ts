export type LeaderboardEntry = {
  callsign: string;
  score: number;
  createdAt: string;
};

export type SpaceWeatherSummary = {
  source: string;
  period: { start: string | null; end: string | null };
  count: number;
  events: unknown[];
};

const LOCAL_LEADERBOARD_KEY = "lunar-academy-leaderboard-v1";

export const isLiveWeatherReady = false;

function isSpaceWeatherSummary(value: unknown): value is SpaceWeatherSummary {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const period = record.period;
  return (
    typeof record.source === "string" &&
    typeof record.count === "number" &&
    Number.isSafeInteger(record.count) &&
    record.count >= 0 &&
    Array.isArray(record.events) &&
    typeof period === "object" &&
    period !== null &&
    "start" in period &&
    (typeof period.start === "string" || period.start === null) &&
    "end" in period &&
    (typeof period.end === "string" || period.end === null)
  );
}

export async function fetchSpaceWeather(): Promise<SpaceWeatherSummary | null> {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 3_000);

  try {
    const response = await fetch("/api/space-weather", {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Space weather request failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (!isSpaceWeatherSummary(payload)) throw new Error("Space weather response was not valid.");
    return payload;
  } catch (error) {
    console.warn("Space weather is unavailable.", error);
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

function isLeaderboardEntry(value: unknown): value is LeaderboardEntry {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.callsign === "string" &&
    typeof entry.score === "number" &&
    Number.isSafeInteger(entry.score) &&
    typeof entry.createdAt === "string"
  );
}

function readLocalLeaderboard(): LeaderboardEntry[] {
  try {
    const stored = window.localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isLeaderboardEntry).sort((a, b) => b.score - a.score).slice(0, 10);
  } catch (error) {
    console.warn("Could not read the local leaderboard.", error);
    return [];
  }
}

function writeLocalLeaderboard(entries: LeaderboardEntry[]) {
  try {
    window.localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(entries));
  } catch (error) {
    console.warn("Could not save the local leaderboard.", error);
  }
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const response = await fetch("/api/leaderboard", { cache: "no-store" });
    if (!response.ok) throw new Error(`Leaderboard request failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("entries" in payload)) {
      throw new Error("Leaderboard response was not valid.");
    }
    const entries = Array.isArray(payload.entries)
      ? payload.entries.filter(isLeaderboardEntry).sort((a, b) => b.score - a.score).slice(0, 10)
      : [];
    writeLocalLeaderboard(entries);
    return entries;
  } catch (error) {
    console.warn("Using the saved local leaderboard.", error);
    return readLocalLeaderboard();
  }
}

export async function submitScore(
  callsign: string,
  score: number,
): Promise<LeaderboardEntry> {
  try {
    const response = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callsign, score }),
    });
    if (!response.ok) throw new Error(`Score submission failed: ${response.status}`);
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null || !("entry" in payload) || !isLeaderboardEntry(payload.entry)) {
      throw new Error("Score submission response was not valid.");
    }
    return payload.entry;
  } catch (error) {
    console.warn("Saving this score to the local leaderboard.", error);
    const entry: LeaderboardEntry = { callsign, score, createdAt: new Date().toISOString() };
    const entries = [...readLocalLeaderboard(), entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    writeLocalLeaderboard(entries);
    return entry;
  }
}
