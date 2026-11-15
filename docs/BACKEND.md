# Lunar Academy: Backend Documentation

The backend is a set of Next.js API routes (`app/api/*`) deployed on Vercel as serverless functions. The game itself runs in the browser. The backend provides real NASA space-weather data and a shared leaderboard for children's scores.

## Endpoints

### GET /api/health
Returns `{ "status": "OK" }`. Used to check that the service is running.

### GET /api/space-weather
Returns recent solar flare data from NASA DONKI for the last 30 days.

| Field | Description |
|---|---|
| `source` | Data source label |
| `period` | `{ start, end }` dates covered |
| `count` / `events` | Number of flares and the raw NASA records |
| `dataStatus` | `LIVE_NASA_DONKI` (live data) or `CURATED_FALLBACK` (saved real flares) |
| `flareClass` | Strongest flare in the period (for example `M3.5`) |
| `stormActive` | `true` if an M- or X-class flare occurred in the last 72 hours |
| `note` | Human-readable explanation. The game uses a simplified flare threshold as a simulation cue, not a direct radiation measurement. |
| `flares` | Up to 5 most recent flares: `{ classType, peakTime }` |

### GET /api/leaderboard
Returns the top 10 scores, highest first (ties: earliest first):

```json
{ "entries": [ { "callsign": "Cadet Nova", "score": 700, "createdAt": "2026-11-15T08:11:49.820Z" } ], "storage": "database" }
```

`storage` is `"database"` when MongoDB is used, and `"memory"` when the temporary in-memory backup is used.

### POST /api/leaderboard
Saves a score. Body: `{ "callsign": string, "score": number }`.

- `callsign` must be one of the approved callsigns: Cadet Nova, Astro Orion, Commander Luna, Ranger Cosmo, Pilot Vega, Scout Apollo. Free text is rejected, because players are children and no personal data is collected.
- `score` must be a whole number from 0 to 1,200 (700 base points plus up to 100 for each of five meters).
- Success: `201` with `{ "entry": {...}, "storage": "database" | "memory" }`.
- Invalid input: `400` with an `error` message.
- Too many requests: `429` (limit: 10 submissions per minute per IP).

## NASA data source
Solar flare data comes from NASA's Community Coordinated Modeling Center (CCMC) DONKI service: `https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR`. No API key is needed. NASA moved DONKI to this address on 30 September 2026, and the older `api.nasa.gov/DONKI` address no longer returns data.

Credit: NASA CCMC DONKI, https://ccmc.gsfc.nasa.gov/DONKI/

## Reliability design
- Requests to NASA time out after 10 seconds, and successful results are cached for 10 minutes.
- If NASA is slow or down, `/api/space-weather` returns saved real flares from `data/fallback-flares.json` (October 2026 DONKI data), clearly labeled `CURATED_FALLBACK`. The game never breaks.
- If MongoDB is not configured or unavailable, the leaderboard uses a temporary in-memory list (`storage: "memory"`). It is lost when the server restarts, and each serverless instance has its own copy.

## Storage
MongoDB Atlas (free tier), database `lunar_academy`, collection `scores`. Documents: `{ callsign, score, createdAt }`. The app connects with a limited database user (`readWrite` access), not an admin user.

**Current deployment status:** The public demo currently runs on the in-memory fallback because `MONGODB_URI` is not set on the deployment; MongoDB persistence is implemented and tested locally.

## Environment variables
| Name | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string (required for the persistent leaderboard) |

Never commit `.env.local`. On Vercel, add `MONGODB_URI` under Project Settings → Environment Variables, then redeploy.

## Run locally
1. `npm install`
2. Create `.env.local` with `MONGODB_URI=...`
3. `npm run dev`, then open http://localhost:3000/api/health

## Known limitations
- Scores are sent from the browser, so the leaderboard is not cheat-proof.
- The rate limiter is in memory and per server instance, so it is best-effort.
- DONKI has had outages and slow responses, which the fallback covers.

## Files
`app/api/health`, `app/api/space-weather`, `app/api/leaderboard` (routes); `lib/spaceWeather.ts`, `lib/mongodb.ts`, `lib/rateLimit.ts`, `lib/config.ts`, `lib/leaderboard.ts` (helpers); `data/fallback-flares.json` (saved flares).