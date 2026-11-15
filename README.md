# Lunar Academy

Lunar Academy is a browser-based Moon-base survival game for young explorers ages 7–12. Across a seven-day mission at Shackleton Crater, players make decisions about power, life support, shielding, food, and crew warmth while learning a little real lunar science along the way.

The project is being developed for the 2026 NASA Space Apps Challenge. The game is an educational simulation—not mission operations software—and NASA does not endorse it.

Developed by Team Binary Coders for junior astronaut assistants.

## Current project status

| Area | Status |
| --- | --- |
| Responsive launch screen, custom player callsign, and lunar base scene | Implemented |
| Seven crisis chapters, five survival meters, choice forecasts, and win/evacuation outcomes | Implemented in browser state |
| Cadet Mode and Engineer View with simulated telemetry | Implemented; telemetry is illustrative, not live sensor data |
| Dust-storm countdown and Earth–Moon signal-delay interaction | Implemented as timed browser simulations |
| Six-scene narrated story | Browser speech synthesis; can be skipped or navigated manually |
| NASA DONKI Solar Flare endpoint | Implemented; shows a 30-day summary with a labeled historical fallback |
| Leaderboard API | MongoDB persistence when configured, with a server-memory fallback |
| Browser leaderboard fallback | `localStorage` keeps scores available when requests fail or a custom callsign is not accepted by the server |
| Accounts and deployment configuration | Not implemented; there is no player account system |
| Live NASA values used by the game engine | Not implemented |

The launch page requests 30 days of NASA DONKI solar-flare records. The server caches successful responses for ten minutes and returns clearly labeled historical data if NASA is unavailable. The summary does not drive game events or meter values; the adventure remains a simulation. The NASA data attribution modal also lists Artemis/LRO, ECLSS/Veggie, and the Deep Space Network as educational references.

## Run locally

**Requirements:** Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Mission decisions and meter changes run in the browser. API requests provide the launch-page space-weather summary and the mission debrief leaderboard.

For persistent leaderboard storage, copy `.env.example` to `.env.local` and set `MONGODB_URI` to your MongoDB connection string:

```dotenv
MONGODB_URI=your_mongodb_connection_string
```

MongoDB is optional for local development. If `MONGODB_URI` is unset or the database is unavailable, the server uses an in-memory leaderboard that resets when the process restarts. The space-weather route uses NASA's CCMC DONKI endpoint and does not require `NASA_API_KEY`.

## Available scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run build` | Create the production build |
| `npm run start` | Serve the production build |

## How to play

1. Keep the default **Cadet** callsign or enter your own name, then launch the mission.
2. Keep all five systems above zero while resolving the seven daily crises.
3. Preview each plan’s projected effects, including daily resource use, then choose one and review the NASA Science Fact.
4. On Day 4, respond to the dust storm before the ten-second timer triggers Auto-Lockdown.
5. Ask Earth for a recommendation; the simulated signal takes three seconds.
6. Survive through Day 7 to reach the debrief. If a system reaches zero, the crew is safely evacuated.

Cadet Mode uses the labels **Strong**, **Okay**, **Low!**, and **Critical!** instead of numeric meter readings. Engineer View reveals exact percentages, daily drain rates, and explicitly simulated telemetry.

## Project structure

```text
lunar-academy/
├── app/
│   ├── api/
│   │   ├── health/route.ts             # GET /api/health
│   │   ├── leaderboard/route.ts       # GET/POST /api/leaderboard
│   │   └── space-weather/route.ts     # GET /api/space-weather
│   ├── globals.css                    # Tailwind import and visual theme
│   ├── layout.tsx                     # Metadata and DM Sans/Fredoka/Nunito fonts
│   └── page.tsx                       # App Router entry point
├── components/
│   ├── apiClient.ts                   # Browser API calls and local fallback
│   ├── CallsignPicker.tsx             # Custom player callsign input
│   ├── GameEngine.tsx                 # Browser game state and mission flow
│   ├── GameIcon.tsx                   # Reusable game illustration icon
│   ├── MeterCard.tsx                  # Survival meter and Engineer telemetry
│   ├── MoonBaseStage.tsx              # Hazard-reactive crater illustration
│   └── StoryIntro.tsx                 # Six-scene narrated story introduction
├── lib/
│   ├── config.ts                       # Callsigns, limits, and database settings
│   ├── leaderboard.ts                  # In-memory leaderboard fallback
│   ├── mongodb.ts                      # Optional MongoDB connection
│   ├── rateLimit.ts                    # In-memory submission rate limit
│   └── spaceWeather.ts                 # DONKI fetch, cache, and fallback
├── data/
│   └── fallback-flares.json            # Labeled historical flare data
├── public/
│   └── moon-base.svg                   # Static Moon-base illustration asset
├── .env.example
├── LICENSE
├── postcss.config.mjs
├── README.md
└── technical.md                        # Game rules, API contracts, and operations
```

## API overview

- `GET /api/health` returns the service status.
- `GET /api/space-weather` requests 30 days of NASA DONKI Solar Flare (FLR) observations, caches the result for ten minutes, and returns labeled historical fallback data if the upstream request fails.
- `GET /api/leaderboard` returns up to ten scores from MongoDB when configured, otherwise from the in-memory fallback.
- `POST /api/leaderboard` accepts an approved callsign and a score from 0 to 1200, with a limit of ten submissions per minute per IP. The approved callsigns are configured in `lib/config.ts`.

The browser still allows a custom callsign; because the API only accepts its approved list, custom-name scores are kept in that browser's `localStorage` and merged into the displayed leaderboard. Server-memory scores are not durable or shared across instances. See [technical.md](./technical.md) for request/response contracts, game rules, data flow, and operational limitations.

## NASA data and attribution

The space-weather endpoint uses NASA's [CCMC DONKI API](https://kauai.ccmc.gsfc.nasa.gov/DONKI/). If the live request fails, the response is explicitly labeled as historical fallback data. The in-game attribution dialog also acknowledges Artemis and LRO, ECLSS and Veggie, and the NASA Deep Space Network as educational references. Moon Trek and NASA POWER are not currently integrated. DONKI results are informational only and do not drive game events or system values.

Any future NASA data integration should record its exact dataset, endpoint, attribution, update cadence, and whether values are live, cached, or simulated. Do not treat the current game meters, hazards, or Engineer View telemetry as NASA observations.

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE).
