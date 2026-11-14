export type LeaderboardEntry = {
  callsign: string;
  score: number;
  createdAt: string;
};

const entries: LeaderboardEntry[] = [];
const LEADERBOARD_SIZE = 10;

export function getLeaderboard(): LeaderboardEntry[] {
  return [...entries]
    .sort((a, b) => b.score - a.score || a.createdAt.localeCompare(b.createdAt))
    .slice(0, LEADERBOARD_SIZE);
}

export function submitScore(callsign: string, score: number): LeaderboardEntry {
  const entry = { callsign, score, createdAt: new Date().toISOString() };
  entries.push(entry);
  return entry;
}
