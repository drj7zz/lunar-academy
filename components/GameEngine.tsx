"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CallsignPicker from "@/components/CallsignPicker";
import MeterCard, { type MeterDefinition, type MeterId } from "@/components/MeterCard";
import MoonBaseStage from "@/components/MoonBaseStage";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/components/apiClient";

type Meters = Record<MeterId, number>;
type Effects = Partial<Record<MeterId, number>>;
type Choice = { title: string; detail: string; effects: Effects };
type Chapter = {
  title: string;
  subtitle: string;
  description: string;
  hazard: string;
  scienceFact: string;
  recommendation: 0 | 1;
  choices: [Choice, Choice];
};
type GameStatus = "launch" | "playing" | "evacuated" | "debrief";
type FactPopup = {
  title: string;
  outcome: string;
  scienceFact: string;
  transition: "next" | "evacuated" | "debrief";
};

const INITIAL_METERS: Meters = {
  power: 50,
  airWater: 50,
  shields: 50,
  food: 50,
  crewHeat: 50,
};

const DAILY_DRAINS: Record<MeterId, number> = {
  power: -3,
  airWater: -2,
  shields: -1,
  food: -2,
  crewHeat: -2,
};

const METERS: MeterDefinition[] = [
  { id: "power", label: "Power", icon: "⚡", drain: DAILY_DRAINS.power, telemetry: "BUS 28.4 V · SOLAR 61%" },
  { id: "airWater", label: "Air & Water", icon: "💧", drain: DAILY_DRAINS.airWater, telemetry: "O₂ 20.8% · H₂O 14.2 L" },
  { id: "shields", label: "Shields", icon: "🛡️", drain: DAILY_DRAINS.shields, telemetry: "RAD 0.04 mSv · SEAL OK" },
  { id: "food", label: "Food", icon: "🥬", drain: DAILY_DRAINS.food, telemetry: "VEGGIE 2.4 kg · LED 72%" },
  { id: "crewHeat", label: "Crew Heat", icon: "🔥", drain: DAILY_DRAINS.crewHeat, telemetry: "CABIN 21.3°C · CREW 4/4" },
];

const CHAPTERS: Chapter[] = [
  {
    title: "Solar Flare Radiation",
    subtitle: "A burst of solar energy is heading your way!",
    description: "Your crew has a little time to prepare. Pick a plan to keep everyone safe.",
    hazard: "flare",
    scienceFact: "The Moon has almost no atmosphere, so lunar explorers use shielding and protected shelters to reduce radiation exposure.",
    recommendation: 0,
    choices: [
      { title: "Shelter in the shielded habitat", detail: "Extra protection for the crew; the shield systems need power.", effects: { shields: 20, power: -15 } },
      { title: "Power up the active shield", detail: "Boost the shield field; reserve power takes a hit.", effects: { power: 20, shields: -15 } },
    ],
  },
  {
    title: "Shadow Crater Ice Mining",
    subtitle: "A nearby crater may hold precious water ice.",
    description: "Choose how the crew will collect ice while protecting the base supplies.",
    hazard: "ice",
    scienceFact: "Some lunar polar craters stay in permanent shadow, and spacecraft have found evidence of water ice there.",
    recommendation: 0,
    choices: [
      { title: "Send the ice rover", detail: "Bring back water for the crew; the rover uses base power.", effects: { airWater: 20, power: -15 } },
      { title: "Run the water recycler longer", detail: "Save energy by recycling; stored water runs lower.", effects: { power: 20, airWater: -15 } },
    ],
  },
  {
    title: "14-Day Lunar Night",
    subtitle: "The Sun has dipped below the horizon.",
    description: "Lunar nights are long and cold. Decide where to spend the remaining energy.",
    hazard: "night",
    scienceFact: "A lunar day-night cycle lasts about 29.5 Earth days, with roughly two weeks of daylight followed by two weeks of night.",
    recommendation: 1,
    choices: [
      { title: "Save energy for essential systems", detail: "Keep the batteries healthy; the habitat gets cooler.", effects: { power: 20, crewHeat: -15 } },
      { title: "Keep the habitat extra cozy", detail: "Warm the crew through the night; use more stored power.", effects: { crewHeat: 20, power: -15 } },
    ],
  },
  {
    title: "Electrostatic Regolith Dust Storm",
    subtitle: "Moon dust is swirling around the solar panels!",
    description: "Choose a quick response before the dust coats the base equipment.",
    hazard: "dust",
    scienceFact: "Lunar dust is jagged and can cling to surfaces because it becomes electrically charged in sunlight.",
    recommendation: 0,
    choices: [
      { title: "Seal up and shield the crew", detail: "Protect the habitat; the cleanup uses power.", effects: { shields: 20, power: -15 } },
      { title: "Brush off the solar panels", detail: "Restore power collection; water reserves are used for careful cleaning.", effects: { power: 20, airWater: -15 } },
    ],
  },
  {
    title: "Shallow Moonquake",
    subtitle: "The ground gives a gentle but surprising shake.",
    description: "Secure the base before a second tremor arrives.",
    hazard: "quake",
    scienceFact: "Apollo seismometers recorded moonquakes, and some shallow ones can last longer than earthquakes on Earth.",
    recommendation: 0,
    choices: [
      { title: "Brace the habitat supports", detail: "Strengthen the base; the crew spends food during repairs.", effects: { shields: 20, food: -15 } },
      { title: "Protect the greenhouse first", detail: "Keep crops safe; divert energy from the shield supports.", effects: { food: 20, power: -15 } },
    ],
  },
  {
    title: "Greenhouse LED Rationing",
    subtitle: "The veggie garden needs light, but power is precious.",
    description: "Balance fresh food against the energy needed to run the habitat.",
    hazard: "greenhouse",
    scienceFact: "NASA's Veggie experiment studies how astronauts can grow fresh plants in space using controlled light and careful resource use.",
    recommendation: 0,
    choices: [
      { title: "Give the plants a light boost", detail: "Grow more fresh food; the LEDs use stored power.", effects: { food: 20, power: -15 } },
      { title: "Dim the lights and save energy", detail: "Protect the power reserve; the harvest will be smaller.", effects: { power: 20, food: -15 } },
    ],
  },
  {
    title: "Earth Supply Lander",
    subtitle: "A supply lander is on its way to Shackleton Crater!",
    description: "Choose what the crew should prioritize when the cargo arrives.",
    hazard: "lander",
    scienceFact: "Communications and careful landing plans help Earth teams support future Moon missions from far away.",
    recommendation: 0,
    choices: [
      { title: "Unload water and air filters", detail: "Replenish life-support supplies; moving cargo takes power.", effects: { airWater: 20, power: -15 } },
      { title: "Unload greenhouse food packs", detail: "Restock the pantry; the crew uses warmth to handle the cargo.", effects: { food: 20, crewHeat: -15 } },
    ],
  },
];

const AUTO_LOCKDOWN: Choice = {
  title: "Auto-Lockdown",
  detail: "Base safe, -15 Power",
  effects: { power: -15 },
};

function applyEffects(current: Meters, effects: Effects): Meters {
  const next = { ...current };
  for (const [id, delta] of Object.entries(effects) as [MeterId, number][]) {
    next[id] = Math.max(0, Math.min(100, next[id] + delta));
  }
  return next;
}

function getEffectSummary(effects: Effects, dailyDrain = true) {
  const changes = METERS.flatMap((meter) => {
    const total = (dailyDrain ? meter.drain : 0) + (effects[meter.id] ?? 0);
    return total === 0 ? [] : [`${meter.label} ${total > 0 ? "+" : ""}${total}%`];
  });
  return changes.join(" · ");
}

export default function GameEngine() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("launch");
  const [callsign, setCallsign] = useState("Cadet Nova");
  const [meters, setMeters] = useState<Meters>(INITIAL_METERS);
  const [dayIndex, setDayIndex] = useState(0);
  const [engineerView, setEngineerView] = useState(false);
  const [dustSecondsLeft, setDustSecondsLeft] = useState(10);
  const [decisionResolved, setDecisionResolved] = useState(false);
  const [commsActive, setCommsActive] = useState(false);
  const [commsProgress, setCommsProgress] = useState(0);
  const [recommendedReady, setRecommendedReady] = useState(false);
  const [factPopup, setFactPopup] = useState<FactPopup | null>(null);
  const [failedSystem, setFailedSystem] = useState("");
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const decisionRef = useRef<(choice: Choice, automatic?: boolean) => void>(() => {});
  const decisionLockRef = useRef(false);
  const debriefStartedRef = useRef(false);

  const chapter = CHAPTERS[dayIndex];
  const score = 700 + Object.values(meters).reduce((total, value) => total + value, 0);

  const makeDecision = useCallback(
    (choice: Choice, automatic = false) => {
      if (gameStatus !== "playing" || decisionResolved || decisionLockRef.current) return;
      decisionLockRef.current = true;
      setDecisionResolved(true);
      setCommsActive(false);
      setRecommendedReady(false);

      const afterDailyDrain = applyEffects(meters, DAILY_DRAINS);
      const nextMeters = applyEffects(afterDailyDrain, choice.effects);
      setMeters(nextMeters);

      const failed = METERS.find((meter) => nextMeters[meter.id] <= 0);
      if (failed) setFailedSystem(failed.label);
      const transition = failed
        ? "evacuated"
        : dayIndex === CHAPTERS.length - 1
          ? "debrief"
          : "next";
      const outcome = automatic
        ? "Auto-Lockdown: Base safe, -15 Power."
        : `${choice.title} complete. ${getEffectSummary(choice.effects)}.`;

      setFactPopup({
        title: automatic ? "Safety system activated" : choice.title,
        outcome,
        scienceFact: chapter.scienceFact,
        transition,
      });
    },
    [chapter, dayIndex, decisionResolved, gameStatus, meters],
  );

  useEffect(() => {
    decisionRef.current = makeDecision;
  }, [makeDecision]);

  useEffect(() => {
    if (gameStatus !== "playing" || dayIndex !== 3 || decisionResolved) return;
    const startedAt = Date.now();
    setDustSecondsLeft(10);
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, 10 - (Date.now() - startedAt) / 1000);
      setDustSecondsLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(timer);
        decisionRef.current(AUTO_LOCKDOWN, true);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [dayIndex, decisionResolved, gameStatus]);

  useEffect(() => {
    if (!commsActive || decisionResolved) return;
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(100, ((Date.now() - startedAt) / 3_000) * 100);
      setCommsProgress(progress);
      if (progress >= 100) {
        window.clearInterval(timer);
        setCommsActive(false);
        setRecommendedReady(true);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [commsActive, decisionResolved]);

  const beginMission = () => {
    setMeters(INITIAL_METERS);
    setDayIndex(0);
    setDecisionResolved(false);
    decisionLockRef.current = false;
    setDustSecondsLeft(10);
    setFailedSystem("");
    setLeaderboard([]);
    debriefStartedRef.current = false;
    setGameStatus("playing");
  };

  const enterDebrief = () => {
    setGameStatus("debrief");
    if (debriefStartedRef.current) return;
    debriefStartedRef.current = true;
    setLeaderboardLoading(true);
    void (async () => {
      await submitScore(callsign, score);
      const entries = await fetchLeaderboard();
      setLeaderboard(entries);
      setLeaderboardLoading(false);
    })();
  };

  const closeFact = () => {
    if (!factPopup) return;
    const transition = factPopup.transition;
    setFactPopup(null);
    if (transition === "evacuated") {
      setGameStatus("evacuated");
    } else if (transition === "debrief") {
      enterDebrief();
    } else {
      setDayIndex((current) => current + 1);
      setDecisionResolved(false);
      decisionLockRef.current = false;
      setDustSecondsLeft(10);
      setCommsProgress(0);
      setRecommendedReady(false);
    }
  };

  const requestMissionControl = () => {
    if (decisionResolved || commsActive || recommendedReady) return;
    setCommsProgress(0);
    setCommsActive(true);
  };

  const retryMission = () => {
    setGameStatus("launch");
    setMeters(INITIAL_METERS);
    setDayIndex(0);
    setDecisionResolved(false);
    decisionLockRef.current = false;
    setFailedSystem("");
  };

  return (
    <main className="game-shell min-h-screen">
      <header className="game-topbar">
        <a aria-label="Lunar Academy home" className="brand-lockup" href="/">
          <span className="brand-mark" aria-hidden="true">◕</span>
          <span>LUNAR <strong>ACADEMY</strong></span>
        </a>
        <div className="topbar-controls">
          {gameStatus === "playing" && (
            <span className="mission-day-pill">MISSION DAY {dayIndex + 1} / 7</span>
          )}
          <label className="engineer-toggle">
            <span>Engineer View</span>
            <input
              aria-label="Toggle Engineer View"
              checked={engineerView}
              onChange={(event) => setEngineerView(event.target.checked)}
              role="switch"
              type="checkbox"
            />
            <span aria-hidden="true" className="toggle-track"><i /></span>
          </label>
        </div>
      </header>

      {gameStatus === "launch" && (
        <section className="launch-screen">
          <div className="launch-copy">
            <p className="eyebrow"><span className="live-dot" /> YOUR NEXT GREAT ADVENTURE</p>
            <h1>Lunar <span>Academy</span></h1>
            <p className="launch-subtitle">A Moon base survival mission for curious explorers ages 7–12.</p>
            <p className="launch-briefing">
              Your crew is headed to Shackleton Crater! Make seven smart choices to keep your Moon base powered,
              cozy, and ready for anything. Every resource matters—and Mission Control is only a radio call away.
            </p>
            <div className="launch-facts">
              <span>🌙 7 lunar days</span><span>🧑‍🚀 5 base systems</span><span>🧠 Your choices matter</span>
            </div>
            <div className="picker-heading">
              <strong>Pick your callsign, Cadet!</strong>
              <span>Choose your explorer name</span>
            </div>
            <CallsignPicker onSelect={setCallsign} selected={callsign} />
            <button className="button button-primary launch-button" onClick={beginMission} type="button">
              <span aria-hidden="true">🚀</span> LAUNCH MISSION <span aria-hidden="true">→</span>
            </button>
          </div>
          <div className="launch-visual">
            <div className="orbit-label"><span>MISSION DESTINATION</span><strong>SHACKLETON CRATER</strong></div>
            <MoonBaseStage day={1} hazard="calm" />
            <div className="launch-sticker sticker-top">HOME IS<br />WHERE THE<br />MOON BASE IS! 🌙</div>
            <div className="launch-sticker sticker-bottom"><span>EST. MISSION</span><strong>7 DAYS</strong></div>
          </div>
        </section>
      )}

      {gameStatus === "playing" && chapter && (
        <section className="mission-screen">
          <div className="mission-heading">
            <div>
              <p className="eyebrow">HEY, {callsign.toUpperCase()}! YOU&apos;VE GOT THIS.</p>
              <h1>Day {dayIndex + 1}: <span>{chapter.title}</span></h1>
              <p>{chapter.subtitle}</p>
            </div>
            <div className="day-progress" aria-label={`Day ${dayIndex + 1} of 7`}>
              {CHAPTERS.map((item, index) => (
                <span
                  aria-label={`Day ${index + 1}${index < dayIndex ? ", complete" : index === dayIndex ? ", current" : ""}`}
                  className={index < dayIndex ? "day-dot is-done" : index === dayIndex ? "day-dot is-current" : "day-dot"}
                  key={item.title}
                  title={`Day ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="mission-layout">
            <div className="mission-main">
              <MoonBaseStage day={dayIndex + 1} hazard={chapter.hazard} />
              <div className="crisis-card">
                <div className="crisis-intro">
                  <span className="crisis-icon" aria-hidden="true">
                    {["☀️", "🧊", "🌑", "🌪️", "🌘", "🌱", "🛬"][dayIndex]}
                  </span>
                  <div><h2>Mission briefing</h2><p>{chapter.description}</p></div>
                </div>

                {dayIndex === 3 && !decisionResolved && (
                  <div className="dust-countdown" aria-live="polite">
                    <div className="countdown-title">
                      <strong>Dust alert! Choose before auto-lockdown</strong>
                      <span>{Math.ceil(dustSecondsLeft)}s</span>
                    </div>
                    <div
                      aria-label={`${Math.ceil(dustSecondsLeft)} seconds remaining`}
                      className="countdown-track"
                      role="progressbar"
                      aria-valuemax={10}
                      aria-valuemin={0}
                      aria-valuenow={Math.ceil(dustSecondsLeft)}
                    >
                      <span style={{ width: `${(dustSecondsLeft / 10) * 100}%` }} />
                    </div>
                  </div>
                )}

                <div className="choice-grid">
                  {chapter.choices.map((choice, index) => (
                    <button
                      className="choice-card"
                      disabled={decisionResolved}
                      key={choice.title}
                      onClick={() => makeDecision(choice)}
                      type="button"
                    >
                      <span className="choice-number">OPTION 0{index + 1}</span>
                      <strong>{choice.title}</strong>
                      <span className="choice-detail">{choice.detail}</span>
                      <span className="choice-tradeoff">{getEffectSummary(choice.effects)}</span>
                    </button>
                  ))}
                </div>

                <div className="comms-box">
                  <div className="comms-copy">
                    <span aria-hidden="true">📡</span>
                    <div>
                      <strong>Order from Earth <small>COMMS DELAY</small></strong>
                      <span>Mission Control can recommend a plan—but signals take a moment.</span>
                    </div>
                  </div>
                  {recommendedReady ? (
                    <button
                      className="button button-secondary"
                      disabled={decisionResolved}
                      onClick={() => makeDecision(chapter.choices[chapter.recommendation])}
                      type="button"
                    >
                      Use Mission Control&apos;s choice
                    </button>
                  ) : (
                    <button
                      className="button button-comms"
                      disabled={commsActive || decisionResolved}
                      onClick={requestMissionControl}
                      type="button"
                    >
                      {commsActive ? "Signal travelling…" : "📡 Ask Mission Control"}
                    </button>
                  )}
                  {commsActive && (
                    <div className="comms-progress-wrap" aria-live="polite">
                      <div className="comms-progress-track" role="progressbar" aria-valuenow={Math.round(commsProgress)} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${commsProgress}%` }} />
                      </div>
                      <span>Earth ↔ Moon signal {Math.round(commsProgress)}%</span>
                    </div>
                  )}
                  {recommendedReady && (
                    <p className="mission-control-recommendation">
                      Mission Control recommends: <strong>{chapter.choices[chapter.recommendation].title}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="systems-panel">
              <div className="systems-heading">
                <div><p className="eyebrow">BASE STATUS</p><h2>Keep your crew thriving</h2></div>
                <span className="systems-heart" aria-hidden="true">💜</span>
              </div>
              {engineerView && (
                <div className="telemetry-banner">
                  <span className="sensor-pulse" /> SIMULATED NASA-STYLE SENSORS
                </div>
              )}
              <div className="meter-list">
                {METERS.map((meter) => (
                  <MeterCard
                    engineerView={engineerView}
                    key={meter.id}
                    meter={meter}
                    value={meters[meter.id]}
                  />
                ))}
              </div>
              <div className="crew-tip">
                <span aria-hidden="true">💡</span>
                <p><strong>Cadet tip</strong> There&apos;s no perfect answer. Think about what your crew needs most!</p>
              </div>
            </aside>
          </div>
        </section>
      )}

      {gameStatus === "evacuated" && (
        <section className="ending-screen">
          <div className="ending-art"><MoonBaseStage day={dayIndex + 1} hazard="calm" compact /></div>
          <span className="ending-icon" aria-hidden="true">🧑‍🚀</span>
          <p className="eyebrow">MISSION UPDATE</p>
          <h1>Mission Evacuated</h1>
          <p className="ending-lede">Your crew is safe aboard the rescue shuttle. Good explorers learn from every mission!</p>
          <div className="ending-reason"><span>🛟</span><div><strong>{failedSystem} ran out</strong><p>This system reached 0%, so Mission Control brought everyone home safely.</p></div></div>
          <button className="button button-primary" onClick={retryMission} type="button">↻ TRY AGAIN</button>
        </section>
      )}

      {gameStatus === "debrief" && (
        <section className="debrief-screen">
          <div className="debrief-confetti" aria-hidden="true">✦　✧　✦</div>
          <span className="ending-icon" aria-hidden="true">🏆</span>
          <p className="eyebrow">MISSION COMPLETE · SHACKLETON CRATER</p>
          <h1>You did it, <span>{callsign}!</span></h1>
          <p className="ending-lede">Seven days on the Moon—and your whole crew made it home safe. That&apos;s out-of-this-world teamwork!</p>
          <div className="score-card">
            <span>MISSION SCORE</span><strong>{score}</strong><small>CADET EXPLORER POINTS</small>
          </div>
          <div className="leaderboard-card">
            <div className="leaderboard-heading"><div><p className="eyebrow">CREW HALL OF FAME</p><h2>Mission leaderboard</h2></div><span aria-hidden="true">🌟</span></div>
            {leaderboardLoading ? (
              <p className="leaderboard-loading">Contacting Mission Control…</p>
            ) : leaderboard.length === 0 ? (
              <p className="leaderboard-loading">Your score is saved. Be the first explorer on this leaderboard!</p>
            ) : (
              <ol className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                  <li className={entry.callsign === callsign && entry.score === score ? "is-you" : ""} key={`${entry.callsign}-${entry.createdAt}-${index}`}>
                    <span className="leaderboard-rank">{index + 1}</span>
                    <span>{entry.callsign}{entry.callsign === callsign && entry.score === score ? " (YOU)" : ""}</span>
                    <strong>{entry.score}</strong>
                  </li>
                ))}
              </ol>
            )}
            <p className="local-fallback-note">If the leaderboard service is offline, your score is saved in this browser.</p>
          </div>
          <button className="button button-primary" onClick={retryMission} type="button">↻ PLAY AGAIN</button>
        </section>
      )}

      <footer className="game-footer">
        <span>MADE FOR MOON EXPLORERS <span aria-hidden="true">🚀</span></span>
        <button onClick={() => setAttributionOpen(true)} type="button">NASA DATA & ATTRIBUTION</button>
      </footer>

      {factPopup && (
        <div className="modal-backdrop" role="presentation">
          <section aria-labelledby="fact-title" aria-modal="true" className="dialog-card science-dialog" role="dialog">
            <span className="dialog-icon" aria-hidden="true">🔬</span>
            <p className="eyebrow">MISSION CONTROL SCIENCE CORNER</p>
            <h2 id="fact-title">NASA Science Fact!</h2>
            <p className="dialog-outcome">{factPopup.outcome}</p>
            <p className="science-fact">{factPopup.scienceFact}</p>
            <button autoFocus className="button button-primary dialog-button" onClick={closeFact} type="button">
              {factPopup.transition === "next" ? "CONTINUE MISSION →" : "SEE MISSION UPDATE →"}
            </button>
          </section>
        </div>
      )}

      {attributionOpen && (
        <div className="modal-backdrop" onClick={() => setAttributionOpen(false)} role="presentation">
          <section
            aria-labelledby="attribution-title"
            aria-modal="true"
            className="dialog-card attribution-dialog"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <button aria-label="Close attribution" className="dialog-close" onClick={() => setAttributionOpen(false)} type="button">×</button>
            <p className="eyebrow">EXPLORE THE REAL SCIENCE</p>
            <h2 id="attribution-title">NASA Data & Attribution</h2>
            <p className="attribution-intro">This learning game is inspired by real space science. Game meters and events are simplified for play.</p>
            <ul className="attribution-list">
              <li><strong>NASA DONKI</strong><span>Space-weather observations and event context.</span></li>
              <li><strong>Artemis & Lunar Reconnaissance Orbiter (LRO)</strong><span>Lunar exploration, terrain, and polar-region context.</span></li>
              <li><strong>ECLSS & Veggie</strong><span>Life-support systems and growing plants in space.</span></li>
              <li><strong>NASA Deep Space Network</strong><span>Earth–Moon communication and signal-delay inspiration.</span></li>
            </ul>
            <p className="attribution-note">NASA is not responsible for this game. This is an educational simulation, not mission operations guidance.</p>
            <button className="button button-secondary dialog-button" onClick={() => setAttributionOpen(false)} type="button">GOT IT!</button>
          </section>
        </div>
      )}
    </main>
  );
}
