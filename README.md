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
| NASA DONKI Solar Flare endpoint | Implemented; launch page displays a seven-day event summary when available |
| Leaderboard API and browser `localStorage` fallback | Prototype; server storage is in-memory and resets on restart |
| Persistent leaderboard database, accounts, and deployment configuration | Not implemented |
| Live NASA values used by the game engine | Not implemented |

The launch page requests the latest seven days of NASA DONKI solar-flare records and displays the event count and date range when available. This summary does not drive game events or meter values; the adventure remains a simulation. The NASA data attribution modal also lists Artemis/LRO, ECLSS/Veggie, and the Deep Space Network as educational references.

## Run locally

**Requirements:** Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Mission decisions and meter changes run in the browser. API requests provide the launch-page space-weather summary and the mission debrief leaderboard.

To use a personal NASA API key, copy `.env.example` to `.env.local` and set `NASA_API_KEY`:

```dotenv
NASA_API_KEY=your_nasa_api_key
```

The key is read by the server-side route and is not included in browser code. If unset, the route uses NASA's shared `DEMO_KEY`, which is rate-limited.

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
│   └── leaderboard.ts                  # In-memory leaderboard prototype
├── public/
│   └── moon-base.svg                   # Static Moon-base illustration asset
├── .env.example
├── LICENSE
├── postcss.config.mjs
├── README.md
└── technical.md                        # Game rules, API contracts, and operations
```

## API overview

- `GET /api/space-weather` requests the last seven days of NASA DONKI Solar Flare (FLR) observations; the launch screen displays the event count and date range.
- `GET /api/leaderboard` returns up to ten in-memory scores.
- `POST /api/leaderboard` accepts a callsign and non-negative integer score.

The leaderboard is not durable or shared across server instances. The browser client falls back to `localStorage` when leaderboard requests fail. See [technical.md](./technical.md) for request/response contracts, game rules, data flow, and operational limitations.

## NASA data and attribution

The space-weather endpoint uses the [NASA DONKI API](https://api.nasa.gov/). The in-game attribution dialog also acknowledges Artemis and LRO, ECLSS and Veggie, and the NASA Deep Space Network as educational references. Moon Trek and NASA POWER are not currently integrated. DONKI results are informational only and do not drive game events or system values.

Any future NASA data integration should record its exact dataset, endpoint, attribution, update cadence, and whether values are live, cached, or simulated. Do not treat the current game meters, hazards, or Engineer View telemetry as NASA observations.

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE).
