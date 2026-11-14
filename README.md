# Lunar Academy

Lunar Academy is a browser-based Moon-base survival game for young explorers ages 7–12. Across a seven-day mission at Shackleton Crater, players make decisions about power, life support, shielding, food, and crew warmth while learning a little real lunar science along the way.

The project is being developed for the 2026 NASA Space Apps Challenge. The game is an educational simulation—not mission operations software—and NASA does not endorse it.

## Current project status

| Area | Status |
| --- | --- |
| Launch screen, six preset callsigns, and kid-friendly responsive theme | Implemented |
| Seven crisis chapters, five survival meters, meter drains, and win/evacuation outcomes | Implemented in browser state |
| Cadet Mode and Engineer View with simulated telemetry | Implemented; telemetry is illustrative, not live sensor data |
| Dust-storm countdown and Earth–Moon signal-delay interaction | Implemented as timed browser simulations |
| NASA DONKI Solar Flare endpoint | Implemented; the game UI does not currently display its response |
| Leaderboard API and browser `localStorage` fallback | Prototype; server storage is in-memory and resets on restart |
| Persistent leaderboard database, accounts, and deployment configuration | Not implemented |
| Live NASA values used by the game engine | Not implemented |

The NASA data attribution modal lists DONKI, Artemis/LRO, ECLSS/Veggie, and the Deep Space Network. At present, only the backend space-weather route requests NASA data; those sources do not drive game events or meter values.

## Run locally

**Requirements:** Node.js 20.9 or later and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The game engine runs in the browser; API requests are only used by the space-weather helper and the mission debrief leaderboard.

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

1. Pick one of six preset callsigns and launch the mission.
2. Keep all five systems above zero while resolving the seven daily crises.
3. Read the trade-offs, choose an action, and review the NASA Science Fact.
4. On Day 4, respond to the dust storm before the ten-second timer triggers Auto-Lockdown.
5. Ask Mission Control for a recommendation; the simulated signal takes three seconds.
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
│   ├── layout.tsx                      # Metadata and Fredoka/Nunito fonts
│   └── page.tsx                        # App Router entry point
├── components/
│   ├── apiClient.ts                    # Browser API calls and local fallback
│   ├── CallsignPicker.tsx              # Preset callsign controls
│   ├── GameEngine.tsx                  # Browser game state and mission flow
│   ├── MeterCard.tsx                   # Survival meter and Engineer telemetry
│   └── MoonBaseStage.tsx               # Hazard-reactive crater illustration
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

- `GET /api/space-weather` requests the last seven days of NASA DONKI Solar Flare (FLR) observations.
- `GET /api/leaderboard` returns up to ten in-memory scores.
- `POST /api/leaderboard` accepts a callsign and non-negative integer score.

The leaderboard is not durable or shared across server instances. The browser client falls back to `localStorage` when leaderboard requests fail. See [technical.md](./technical.md) for request/response contracts, game rules, data flow, and operational limitations.

## NASA data and attribution

The space-weather endpoint uses the [NASA DONKI API](https://api.nasa.gov/). The in-game attribution dialog also acknowledges Artemis and LRO, ECLSS and Veggie, and the NASA Deep Space Network as educational references. Moon Trek and NASA POWER are not currently integrated.

Any future NASA data integration should record its exact dataset, endpoint, attribution, update cadence, and whether values are live, cached, or simulated. Do not treat the current game meters, hazards, or Engineer View telemetry as NASA observations.

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE).
