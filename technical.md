# Lunar Academy — Technical Reference

This document describes the current implementation and its integration boundaries. It is intended for frontend, backend, and operations contributors.

## 1. System architecture

| Layer | Location | Responsibility |
| --- | --- | --- |
| App Router entry | `app/page.tsx` | Renders the game client component. |
| Root layout | `app/layout.tsx` | Loads DM Sans, Fredoka, and Nunito with `next/font/google` and defines page metadata. |
| Theme and styling | `app/globals.css`, `postcss.config.mjs` | Tailwind CSS v4 setup, responsive lunar UI, launch and mission page themes, stage effects, and motion preferences. |
| Browser game | `components/GameEngine.tsx` | Owns mission state, decision resolution, timers, transitions, score, and debrief UI using React state/hooks. |
| UI components | `components/CallsignPicker.tsx`, `components/MeterCard.tsx`, `components/MoonBaseStage.tsx`, `components/StoryIntro.tsx` | Custom player callsign, resource bars, telemetry, interactive lunar scene, and six-scene narrated intro. |
| Browser API client | `components/apiClient.ts` | Validated space-weather fetch helper, leaderboard API calls, and local leaderboard fallback. |
| Space-weather route | `app/api/space-weather/route.ts` | Server-side proxy to NASA DONKI FLR. |
| Leaderboard route/store | `app/api/leaderboard/route.ts`, `lib/leaderboard.ts` | Prototype GET/POST API and process-local score array. |

### Runtime boundaries

- Mission decisions and meter updates run in the browser. The game does not wait for an API call to advance a day.
- The launch screen shows an informational seven-day NASA DONKI event summary when the service is available. These observations do not affect mission simulation.
- The six story scenes use browser Web Speech API narration when available. Narration advances to the next scene when playback ends; manual navigation and skip remain available, including when speech synthesis is unavailable.
- The simulated countdowns use browser timers. They are gameplay pacing devices, not physical communications or hazard forecasts.
- The leaderboard and space-weather integrations are outside the core game loop.
- The static Moon-base SVG in `public/` is available as an asset; the game stage currently draws its scene inline in `MoonBaseStage.tsx`.
- No `/data` directory or persistent database is currently configured.

## 2. Game state and mission flow

`GameEngine` tracks the following primary state:

| State | Meaning |
| --- | --- |
| `gameStatus` | `launch`, `story`, `playing`, `evacuated`, or `debrief` |
| `callsign` | Editable player name, defaulting to `Cadet`, trimmed to 1–24 characters before launch |
| `meters` | Five integer system values, initialized to 50 |
| `dayIndex` | Current chapter index, 0–6 |
| `previewMeters` | Projected system values while a plan is hovered or keyboard-focused |
| `explorerPosition` | Moonwalker horizontal position, shared by launch and mission scenes |
| `spaceWeather` / `spaceWeatherLoaded` | Launch-page NASA DONKI summary and request completion state |
| `engineerView` | Whether exact values and simulated telemetry are visible |
| `decisionResolved` | Prevents another selection during the current chapter |
| `factPopup` | Choice result and one-sentence science fact shown before transition |
| `failedSystem` | First depleted meter displayed on the evacuation screen |
| `commsActive` / `recommendedReady` | Mission Control signal and recommendation state |

Mission flow:

```text
launch
  └─ Launch Mission → six-scene story → playing (Day 1)
       ├─ choose action → apply daily drain and action effects → science fact
       │    ├─ any meter is 0 → evacuated
       │    ├─ Day 7 survived → debrief → submit score and load leaderboard
       │    └─ otherwise → next day
       └─ Day 4 timer expires → Auto-Lockdown → science fact → next day
```

The launch screen defaults the editable callsign to `Cadet`. Launching opens the six-scene story; completing or skipping it resets the meters and mission progress and starts Day 1. The replay button from a result screen replays the story before starting a fresh run.

The launch hero uses the lunar base scene as a responsive background. The player name is editable and also appears on the hero Moonwalker. Arrow keys/A-D and on-scene arrow buttons move the Moonwalker on the launch and mission scenes.

### Meters, thresholds, and daily drain

All meters use the inclusive range 0–100, start at 50, and are clamped after changes.

| Meter | Initial | Daily change | Cadet status color |
| --- | ---: | ---: | --- |
| Power | 50 | −3 | Yellow |
| Air & Water | 50 | −2 | Electric cyan |
| Shields | 50 | −1 | Cosmic purple |
| Food | 50 | −2 | Mint green |
| Crew Heat | 50 | −2 | Warm coral |

Cadet Mode labels are **Strong** at 65–100, **Okay** at 35–64, **Low!** at 15–34, and **Critical!** below 15. Engineer View adds the exact percentage, daily change, and hard-coded simulated sensor string for each meter. Those telemetry strings are not returned by NASA.

When a decision resolves, the game applies the day’s drain, the selected choice’s effects, and applicable cascade effects. Values are clamped to 0–100. Base daily drains are Power −3, Air & Water −2, Shields −1, Food −2, and Crew Heat −2. Lunar Night adds 4 Power drain; Dust Storm adds 2. Low Power (<30) adds 2 drain to Air & Water and Crew Heat; low Air & Water (<25) adds 2 Food drain; low Crew Heat (<25) adds 2 Power drain. If any final value is 0, the chapter’s science fact appears and the next screen is **Mission Evacuated**, naming the first depleted system found in meter order.

Choice cards show the action’s explicit trade-off. The fact popup’s outcome summary includes both the daily drain and the choice effect, so its net changes may differ from the choice card.

### Seven crisis chapters

Days 1–6 each offer three choices; Day 7 offers two. Choice effects are combined with daily drains and any low-resource cascades. The selected Earth recommendation points to an existing choice and does not add another action.

| Day | Chapter | Available plans | Recommended plan |
| ---: | --- | --- | --- |
| 1 | Solar Flare | Safe room; save power; move water shielding | Safe room |
| 2 | Moon Ice | Make air; protect the base; carry ice by rover | Make air |
| 3 | Lunar Night | Keep crew warm; save battery; turn off garden lights | Save battery |
| 4 | Dust Storm | Seal base; clean panels; cover air vents | Seal base |
| 5 | Moonquake | Strengthen base; protect garden; tie down battery | Strengthen base |
| 6 | Food Garden | Add plant light; save power; harvest a small crop | Add plant light |
| 7 | Supply Lander | Unpack air and water; unpack food | Unpack air and water |

Choice cards preview projected meter levels after daily drain, the choice, and applicable cascade effects. Hover or keyboard focus also previews the base scene. Selecting a plan commits the same calculation and shows the outcome plus that chapter’s science fact.

Each resolved action, including Auto-Lockdown, is followed by a science-fact dialog before the mission transitions. The six-story-scene introduction uses speech synthesis when supported and automatically advances after narration ends; voice controls, manual scene navigation, and skip provide alternatives.

### Day 4 countdown and comms delay

- Day 4 starts a 10-second browser interval and renders a decreasing progress bar.
- If no choice resolves before expiry, the engine applies the standard daily drains and `Auto-Lockdown` (`Power −15`), then displays the chapter’s fact and continues to Day 5 after confirmation.
- Selecting an action stops the countdown. A decision lock prevents a click/timer race from resolving twice.
- **Order from Earth** runs a 3-second progress animation. When it completes, Mission Control’s recommendation is shown and can be selected. The simulation does not make a network request or model a live DSN round trip.

### Score

Both completed and safely evacuated runs reach a result screen and attempt leaderboard submission. The current score is:

```text
700 + Power + Air & Water + Shields + Food + Crew Heat
```

The score and callsign are submitted once when entering a result screen. There is no account identity or anti-cheat validation.

## 3. API contracts

All endpoints are same-origin Next.js Route Handlers. They are publicly reachable and currently have no authentication, authorization, or rate limiting.

### `GET /api/space-weather`

**Upstream:** `https://api.nasa.gov/DONKI/FLR`

Requests the current UTC date and the date seven days earlier, using `NASA_API_KEY` or `DEMO_KEY`. The request uses `cache: "no-store"` and a 10-second timeout. The response exposes the DONKI event objects without reshaping their provider-specific fields.

**Success — HTTP 200**

```json
{
  "source": "NASA DONKI Solar Flare (FLR)",
  "period": { "start": "YYYY-MM-DD", "end": "YYYY-MM-DD" },
  "count": 0,
  "events": []
}
```

The sample above illustrates the response shape only; the route returns NASA’s actual event array. Network errors, non-success provider responses, invalid JSON, or a non-array response return HTTP 502 with `{ "error": "..." }`.

The launch screen calls `fetchSpaceWeather()` in `components/apiClient.ts`, which applies a 3-second browser timeout and validates the response shape. It displays the recent event count and date range, or an explicit unavailable message. NASA observations are not used to drive game events or meter values; the adventure remains simulated. `isLiveWeatherReady = false` keeps live observations out of the game engine.

### `GET /api/leaderboard`

**Success — HTTP 200**

```json
{
  "entries": [
    { "callsign": "Cadet Nova", "score": 950, "createdAt": "2026-11-14T12:00:00.000Z" }
  ]
}
```

Returns at most ten entries sorted by descending score; ties are ordered by earlier creation time. An empty store returns `{ "entries": [] }`.

### `POST /api/leaderboard`

**Request**

```json
{ "callsign": "Cadet Nova", "score": 950 }
```

`callsign` is trimmed and must contain 1–24 characters. `score` must be a non-negative safe integer.

**Success — HTTP 201**

```json
{
  "entry": {
    "callsign": "Cadet Nova",
    "score": 950,
    "createdAt": "2026-11-14T12:00:00.000Z"
  }
}
```

Invalid JSON or invalid fields return HTTP 400 with `{ "error": "..." }`.

### Leaderboard persistence and client fallback

`lib/leaderboard.ts` stores entries in a module-level array and returns the top ten. This is suitable only for local prototyping: data is lost on server restart, may differ between server workers/instances, and is not a durable shared leaderboard.

On either result screen, the client calls `POST /api/leaderboard` and then `GET /api/leaderboard`. If either call fails or returns a non-success status (including 404), `components/apiClient.ts` reads/writes the browser key `lunar-academy-leaderboard-v1` in `localStorage`. Browser storage may be unavailable or cleared by the user; storage failures are logged and do not interrupt the game.

**Before production:** replace the in-memory store with a persistent database, add server-side input/rate controls and abuse prevention, define tie/duplicate-score policy, and decide whether local fallback scores should be merged with server scores.

## 4. NASA data, simulation, and attribution

| Source | Current use |
| --- | --- |
| NASA DONKI Solar Flare (FLR) | Seven-day event count/date range displayed on the launch page; not consumed by game logic |
| Artemis / Lunar Reconnaissance Orbiter (LRO) | Cited in the attribution modal as lunar-exploration context; no runtime integration |
| ECLSS / Veggie | Educational references in UI text; not live life-support data |
| NASA Deep Space Network | Inspiration for the 3-second browser comms animation; no DSN request |
| Moon Trek / NASA POWER | Not integrated |

The chapter choices, daily drains, science text, stage effects, meter values, and Engineer telemetry are authored simulation content. They are not forecasts, sensor measurements, or mission recommendations.

Any integration should document the exact dataset and fields used, provider URL, attribution, update/caching policy, error behavior, and whether values are live or simulated.

## 5. Local development and validation

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm audit
```

The game currently has no dedicated automated gameplay test suite. Type checking and a production build validate the application structure and types; manual browser checks are still needed for the full interactive mission and timer scenarios.

## 6. Production-readiness gaps

- Persist leaderboard data in a database and introduce an abuse-resistant score submission policy.
- Configure deployment secrets, monitoring, and rate limits for the public NASA proxy.
- Decide which live NASA observations should affect gameplay, and validate their interpretation with authoritative sources.
- Add automated tests for choice effects, depletion/evacuation, Day 4 timeout, and API fallback behavior.
- Review accessibility with keyboard-only and screen-reader testing, including modal focus handling and reduced-motion behavior.
- Replace illustrative telemetry and ensure any displayed live data has timestamps, units, and clear provenance.
