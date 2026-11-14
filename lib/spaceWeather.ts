
import fallback from "@/data/fallback-flares.json";
import { DONKI_TIMEOUT_MS, DONKI_CACHE_MS } from "./config";

export type Flare = {
  classType: string;
  peakTime: string;
};

export type SpaceWeather = {
  // Existing API response fields, preserved for frontend compatibility.
  source: string;
  period: {
    start: string;
    end: string;
  };
  count: number;
  events: unknown[];

  // Additional game-specific fields.
  dataStatus: "LIVE_NASA_DONKI" | "CURATED_FALLBACK";
  flareClass: string | null;
  stormActive: boolean;
  note: string;
  flares: Flare[];
};

let cache: { at: number; data: SpaceWeather } | null = null;

// Turns a flare class such as M2.1 into a comparable number.
function flareRank(classType: string): number {
  const match = classType.match(/^([ABCMX])(\d+(?:\.\d+)?)$/i);

  if (!match) return -1;

  const idx = "ABCMX".indexOf(match[1].toUpperCase());
  return idx * 100 + Number(match[2]);
}

const M1_RANK = flareRank("M1.0");

function strongest(flares: Flare[]): string | null {
  if (flares.length === 0) return null;

  return flares.reduce((a, b) =>
    flareRank(b.classType) > flareRank(a.classType) ? b : a
  ).classType;
}

const day = (d: Date) => d.toISOString().slice(0, 10);

async function fetchLive(): Promise<SpaceWeather> {
  const end = new Date();
  const start = new Date(end.getTime() - 30 * 24 * 3600 * 1000);

  const startDate = day(start);
  const endDate = day(end);

  const url =
    `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR` +
    `?startDate=${startDate}&endDate=${endDate}`;

  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    DONKI_TIMEOUT_MS
  );

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`DONKI responded ${res.status}`);
    }

    const text = await res.text();
    const raw: unknown = text ? JSON.parse(text) : [];

    if (!Array.isArray(raw)) {
      throw new Error("Unexpected DONKI response");
    }

    const events: unknown[] = raw;

    const flares: Flare[] = events
      .filter(
        (f): f is Record<string, unknown> =>
          typeof f === "object" &&
          f !== null &&
          typeof (f as Record<string, unknown>).classType === "string"
      )
      .map((f) => ({
        classType: f.classType as string,
        peakTime: String(f.peakTime ?? f.beginTime ?? ""),
      }))
      .sort(
        (a, b) =>
          Date.parse(b.peakTime) - Date.parse(a.peakTime)
      );

    const since = Date.now() - 72 * 3600 * 1000;

    const stormActive = flares.some((f) => {
      const peak = Date.parse(f.peakTime);

      return (
        flareRank(f.classType) >= M1_RANK &&
        Number.isFinite(peak) &&
        peak <= Date.now() &&
        peak >= since
      );
    });

    return {
      source: "NASA DONKI Solar Flare (FLR)",
      period: {
        start: startDate,
        end: endDate,
      },
      count: events.length,
      events,
      dataStatus: "LIVE_NASA_DONKI",
      flareClass: strongest(flares),
      stormActive,
      note: flares.length
        ? "Live solar flare data from NASA DONKI (last 30 days). The game uses a simplified flare threshold as a simulation cue, not a direct radiation measurement."
        : "Live NASA DONKI data: no solar flares were reported in the last 30 days.",
      flares: flares.slice(0, 5),
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildFallback(): SpaceWeather {
  const flares = fallback.flares as Flare[];

  const dates = flares
    .map((f) => f.peakTime.slice(0, 10))
    .sort();

  return {
    source: "NASA DONKI Solar Flare (FLR)",
    period: {
      start: dates[0] ?? "",
      end: dates[dates.length - 1] ?? "",
    },
    count: flares.length,
    events: flares,
    dataStatus: "CURATED_FALLBACK",
    flareClass: strongest(flares),
    stormActive: fallback.stormActive,
    note:
      `${fallback.note} This is historical fallback data, not a live space-weather alert.`,
    flares: flares.slice(0, 5),
  };
}

// Never throws: if NASA is unavailable, the game receives labeled fallback data.
export async function getSpaceWeather(): Promise<SpaceWeather> {
  if (cache && Date.now() - cache.at < DONKI_CACHE_MS) {
    return cache.data;
  }

  try {
    const data = await fetchLive();

    cache = {
      at: Date.now(),
      data,
    };

    return data;
  } catch (err) {
    console.error(
      "DONKI fetch failed:",
      err instanceof Error ? err.message : "unknown error"
    );

    return buildFallback();
  }
}
