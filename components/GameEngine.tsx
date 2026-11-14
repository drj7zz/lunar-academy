"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  BatteryCharging,
  BookOpen,
  ChevronRight,
  Droplets,
  HeartPulse,
  Leaf,
  Lightbulb,
  Moon,
  Radio,
  RotateCcw,
  ShieldAlert,
  Signal,
  Sparkles,
  Sun,
  Thermometer,
  Trophy,
  Wind,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import CallsignPicker from "@/components/CallsignPicker";
import MeterCard, { type MeterDefinition, type MeterId } from "@/components/MeterCard";
import MoonBaseStage from "@/components/MoonBaseStage";
import StoryIntro from "@/components/StoryIntro";
import {
  fetchSpaceWeather,
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
  type SpaceWeatherSummary,
} from "@/components/apiClient";

type Meters = Record<MeterId, number>;
type Effects = Partial<Record<MeterId, number>>;
type SimulationNote = { effects: Effects; explanation: string };
type Choice = { title: string; detail: string; effects: Effects };
type Chapter = {
  title: string;
  subtitle: string;
  description: string;
  whyNeeded: string;
  hazard: string;
  icon: LucideIcon;
  physics: string;
  scienceFact: string;
  recommendation: 0 | 1;
  choices: Choice[];
};
type GameStatus = "launch" | "story" | "playing" | "evacuated" | "debrief";
type FactPopup = {
  title: string;
  outcome: string;
  whyNeeded: string;
  planReason: string;
  pros: string[];
  cons: string[];
  scienceFact: string;
  transition: "next" | "evacuated" | "debrief";
};
type DecisionRecord = {
  day: number;
  challenge: string;
  plan: string;
  planReason: string;
  pros: string[];
  cons: string[];
  changes: Meters;
};
type RunReport = {
  outcome: "survived" | "evacuated";
  day: number;
  choice: string;
  failedSystem?: string;
  rootCause: string;
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
  { id: "power", label: "Power", icon: Zap },
  { id: "airWater", label: "Air & Water", icon: Wind },
  { id: "shields", label: "Crew Shields", icon: ShieldAlert },
  { id: "food", label: "Food", icon: Leaf },
  { id: "crewHeat", label: "Crew Heat", icon: Thermometer },
];

const CHAPTERS: Chapter[] = [
  {
    title: "Solar Flare!",
    subtitle: "The Sun sends a burst of energy toward the Moon!",
    description: "A solar flare is on the way. Choose how to keep your crew safe.",
    whyNeeded: "Space radiation can pass through an unprotected base, so the crew needs a safe place and enough shielding.",
    hazard: "flare",
    icon: Sun,
    physics: "Solar particles can pass through an unprotected habitat; water-rich shelter helps absorb radiation.",
    scienceFact: "The Moon has almost no atmosphere, so lunar explorers use shielding and protected shelters to reduce radiation exposure.",
    recommendation: 0,
    choices: [
      { title: "Hide in the safe room", detail: "The crew gets more protection. The room uses some power.", effects: { shields: 20, power: -15 } },
      { title: "Save power for later", detail: "Keep more power in the battery. The crew has less shield protection.", effects: { power: 20, shields: -15 } },
      { title: "Move water packs to the safe room", detail: "Water helps block radiation, but moving heavy packs takes time and cools the crew.", effects: { shields: 14, crewHeat: -8, power: -5 } },
    ],
  },
  {
    title: "Find Moon Ice",
    subtitle: "A dark crater may have ice hiding inside!",
    description: "Choose what to do with the ice: make air or add more protection.",
    whyNeeded: "Ice can become drinking water or oxygen, and water stored around a room can help shield the crew.",
    hazard: "ice",
    icon: Droplets,
    physics: "Water can be split by electrolysis to make oxygen, but water stored around the habitat also helps shield the crew.",
    scienceFact: "Some lunar polar craters stay in permanent shadow, and spacecraft have found evidence of water ice there.",
    recommendation: 0,
    choices: [
      { title: "Make air from the ice", detail: "Give the crew more air. This uses some power and protection water.", effects: { airWater: 20, shields: -15, power: -5 } },
      { title: "Use ice to protect the base", detail: "Add more protection around the base. Save less ice for air and drinking.", effects: { shields: 20, airWater: -15 } },
      { title: "Carry ice home by rover", detail: "Moon gravity makes lifting easier, but ice can slide when the rover stops. Tie it down and drive slowly.", effects: { airWater: 15, power: -10, crewHeat: -5 } },
    ],
  },
  {
    title: "A Long, Cold Moon Night",
    subtitle: "The Sun has gone down. The Moon is getting very cold!",
    description: "Choose what to save: warmth for the crew or power for the base.",
    whyNeeded: "Without sunlight, solar panels stop charging. Heaters must use stored battery power to keep the cabin warm.",
    hazard: "night",
    icon: Moon,
    physics: "With no sunlight for solar panels, closing thermal louvers keeps heat inside while heaters draw energy from the battery.",
    scienceFact: "A lunar day-night cycle lasts about 29.5 Earth days, with roughly two weeks of daylight followed by two weeks of night.",
    recommendation: 1,
    choices: [
      { title: "Keep the crew warm", detail: "Close the warm-air covers. The heaters use more power.", effects: { crewHeat: 20, power: -15 } },
      { title: "Save battery power", detail: "Use less power, but the base and crew get colder.", effects: { power: 20, crewHeat: -15 } },
      { title: "Turn off garden lights", detail: "Save battery power, but the plants grow less food.", effects: { power: 15, food: -10 } },
    ],
  },
  {
    title: "Moon Dust Storm!",
    subtitle: "Moon dust is swirling around the solar panels!",
    description: "Dust is blowing everywhere! Pick what to protect first.",
    whyNeeded: "Fine dust can cover solar panels and sneak into equipment seals, so the crew must protect the base or restore power.",
    hazard: "dust",
    icon: Wind,
    physics: "Electrically charged regolith can cling to surfaces, coating solar panels and stressing seals.",
    scienceFact: "Lunar dust is jagged and can cling to surfaces because it becomes electrically charged in sunlight.",
    recommendation: 0,
    choices: [
      { title: "Close the doors and windows", detail: "Keep dust away from the crew. This uses some power.", effects: { shields: 20, power: -15 } },
      { title: "Clean the solar panels", detail: "Help the panels make more power. Use some water to clean them.", effects: { power: 20, airWater: -15 } },
      { title: "Cover the air vents", detail: "Keep dust out of the air system, but the filters use extra power.", effects: { airWater: 12, power: -8, food: -5 } },
    ],
  },
  {
    title: "The Moon Shakes!",
    subtitle: "Rumble! The ground shakes under your Moon base.",
    description: "Choose what to protect before the next little shake.",
    whyNeeded: "A moonquake can shake loose equipment, so the crew has to secure the habitat, garden, or power system first.",
    hazard: "quake",
    icon: Activity,
    physics: "A ground tremor can shift equipment and damage supports, so the crew must protect either the habitat or its food supply.",
    scienceFact: "Apollo seismometers recorded moonquakes, and some shallow ones can last longer than earthquakes on Earth.",
    recommendation: 0,
    choices: [
      { title: "Make the base stronger", detail: "Protect the habitat. The repair team uses some food.", effects: { shields: 20, food: -15 } },
      { title: "Protect the food garden", detail: "Save the plants. The base has a little less power.", effects: { food: 20, power: -15 } },
      { title: "Tie down the battery", detail: "Keep the battery from shifting, but the crew has less time for other repairs.", effects: { power: 12, shields: -8, food: -5 } },
    ],
  },
  {
    title: "Help the Food Garden",
    subtitle: "The plants need light, but the base needs power too.",
    description: "Choose whether to grow more food or save battery power.",
    whyNeeded: "Plants need light and water to grow, while the habitat needs power for life-support equipment.",
    hazard: "greenhouse",
    icon: Leaf,
    physics: "Plant growth lights use electrical power, while a smaller harvest leaves less fresh food for the crew.",
    scienceFact: "NASA's Veggie experiment studies how astronauts can grow fresh plants in space using controlled light and careful resource use.",
    recommendation: 0,
    choices: [
      { title: "Give plants more light", detail: "Grow more food. The lights use battery power.", effects: { food: 20, power: -15 } },
      { title: "Save power for the base", detail: "Keep more battery power. The plants grow less food.", effects: { power: 20, food: -15 } },
      { title: "Harvest a small crop now", detail: "Get food ready today, but use water to clean and pack the plants.", effects: { food: 12, airWater: -8 } },
    ],
  },
  {
    title: "Supplies from Earth!",
    subtitle: "A delivery ship is bringing boxes to the Moon!",
    description: "Choose what the crew should unpack first.",
    whyNeeded: "The lander has limited cargo, so the crew should unload the supplies that help the base most.",
    hazard: "lander",
    icon: BatteryCharging,
    physics: "A supply lander can restore limited resources, but unloading and integrating cargo takes crew time and base power.",
    scienceFact: "Communications and careful landing plans help Earth teams support future Moon missions from far away.",
    recommendation: 0,
    choices: [
      { title: "Unpack air and water", detail: "Give the crew more air and water. Unpacking uses power.", effects: { airWater: 20, power: -15 } },
      { title: "Unpack the food boxes", detail: "Give the crew more food. Unpacking takes a little warmth.", effects: { food: 20, crewHeat: -15 } },
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

function getDailyDrains(meters: Meters, hazard: string): Meters {
  const drains = { ...DAILY_DRAINS };

  if (hazard === "night") drains.power -= 4;
  if (hazard === "dust") drains.power -= 2;
  if (meters.power < 30) {
    drains.airWater -= 2;
    drains.crewHeat -= 2;
  }
  if (meters.airWater < 25) drains.food -= 2;
  if (meters.crewHeat < 25) drains.power -= 2;

  return drains;
}

function getCascadeNotes(afterChoice: Meters, choiceEffects: Effects): SimulationNote[] {
  const notes: SimulationNote[] = [];

  if (afterChoice.power <= 20 && (choiceEffects.power ?? 0) < 0) {
    notes.push({
      effects: { airWater: -5, crewHeat: -5 },
      explanation: "The nearly empty battery slowed the air-and-water recycler and heaters.",
    });
  }
  if (afterChoice.airWater <= 20 && (choiceEffects.airWater ?? 0) < 0) {
    notes.push({
      effects: { food: -5 },
      explanation: "With very little water left, the crew could not keep the food garden growing.",
    });
  }
  if (afterChoice.crewHeat <= 20 && (choiceEffects.crewHeat ?? 0) < 0) {
    notes.push({
      effects: { power: -5 },
      explanation: "The cold cabin made the heaters work harder and use more battery power.",
    });
  }
  if (afterChoice.shields <= 20 && (choiceEffects.shields ?? 0) < 0) {
    notes.push({
      effects: { power: -3 },
      explanation: "The crew stayed in the protected room, so air circulation used extra power.",
    });
  }

  return notes;
}

function getChoiceForecast(meters: Meters, hazard: string, choice: Choice): Meters {
  const afterDailyDrain = applyEffects(meters, getDailyDrains(meters, hazard));
  const afterChoice = applyEffects(afterDailyDrain, choice.effects);
  return getCascadeNotes(afterChoice, choice.effects).reduce(
    (current, note) => applyEffects(current, note.effects),
    afterChoice,
  );
}

function getNetEffectSummary(before: Meters, after: Meters, engineerView: boolean) {
  return METERS.flatMap((meter) => {
    const change = after[meter.id] - before[meter.id];
    if (change === 0) return [];
    return [
      `${meter.label} ${
        engineerView ? `${change > 0 ? "+" : ""}${change}%` : change > 0 ? "goes up" : "goes down"
      }`,
    ];
  }).join(" · ");
}

function getPlanPros(choice: Choice) {
  const benefitText: Record<MeterId, string> = {
    power: "Saves battery power",
    airWater: "Adds air and water supplies",
    shields: "Adds crew protection",
    food: "Adds food supplies",
    crewHeat: "Warms the crew",
  };
  const benefits = METERS.flatMap((meter) =>
    (choice.effects[meter.id] ?? 0) > 0 ? [benefitText[meter.id]] : [],
  );
  return benefits.length > 0 ? benefits : ["Keeps the crew inside the sealed base"];
}

function getPlanCons(choice: Choice) {
  const costText: Record<MeterId, string> = {
    power: "Uses battery power",
    airWater: "Uses air or water supplies",
    shields: "Lowers crew protection",
    food: "Uses stored food",
    crewHeat: "Cools the crew",
  };
  const costs = METERS.flatMap((meter) =>
    (choice.effects[meter.id] ?? 0) < 0 ? [costText[meter.id]] : [],
  );
  return costs.length > 0 ? costs : ["No extra resource cost in this plan"];
}

function getMissionHint(chapter: Chapter, meters: Meters) {
  const lowestMeter = METERS.reduce((lowest, meter) =>
    meters[meter.id] < meters[lowest.id] ? meter : lowest,
  );
  const helpfulPlan = chapter.choices.findIndex((choice) => (choice.effects[lowestMeter.id] ?? 0) > 0);

  if (helpfulPlan >= 0) {
    return `${lowestMeter.label} is your lowest bar at ${meters[lowestMeter.id]}%. Plan ${helpfulPlan + 1} helps it, but check which other bar may go down.`;
  }
  return `Look at your lowest bar first. Each plan helps one part of the base and uses another—pick what your crew needs most today.`;
}

export default function GameEngine() {
  const [gameStatus, setGameStatus] = useState<GameStatus>("launch");
  const [callsign, setCallsign] = useState("Cadet");
  const [meters, setMeters] = useState<Meters>(INITIAL_METERS);
  const [previewMeters, setPreviewMeters] = useState<Meters>();
  const [dayIndex, setDayIndex] = useState(0);
  const [explorerPosition, setExplorerPosition] = useState(48);
  const [engineerView, setEngineerView] = useState(false);
  const [dustSecondsLeft, setDustSecondsLeft] = useState(10);
  const [decisionResolved, setDecisionResolved] = useState(false);
  const [commsActive, setCommsActive] = useState(false);
  const [commsProgress, setCommsProgress] = useState(0);
  const [recommendedReady, setRecommendedReady] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [factPopup, setFactPopup] = useState<FactPopup | null>(null);
  const [failedSystem, setFailedSystem] = useState("");
  const [runReport, setRunReport] = useState<RunReport | null>(null);
  const [decisionHistory, setDecisionHistory] = useState<DecisionRecord[]>([]);
  const [attributionOpen, setAttributionOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [spaceWeather, setSpaceWeather] = useState<SpaceWeatherSummary | null>(null);
  const [spaceWeatherLoaded, setSpaceWeatherLoaded] = useState(false);
  const decisionRef = useRef<(choice: Choice, automatic?: boolean) => void>(() => {});
  const decisionLockRef = useRef(false);
  const debriefStartedRef = useRef(false);

  const chapter = CHAPTERS[dayIndex];
  const dailyDrains = chapter ? getDailyDrains(meters, chapter.hazard) : DAILY_DRAINS;
  const score = 700 + Object.values(meters).reduce((total, value) => total + value, 0);

  useEffect(() => {
    if (gameStatus !== "launch") return;
    let active = true;
    void fetchSpaceWeather().then((summary) => {
      if (!active) return;
      setSpaceWeather(summary);
      setSpaceWeatherLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [gameStatus]);

  const moveExplorer = useCallback((direction: "left" | "right") => {
    setExplorerPosition((position) =>
      Math.max(8, Math.min(87, position + (direction === "left" ? -6 : 6))),
    );
  }, []);

  const makeDecision = useCallback(
    (choice: Choice, automatic = false) => {
      if (gameStatus !== "playing" || decisionResolved || decisionLockRef.current) return;
      decisionLockRef.current = true;
      setDecisionResolved(true);
      setPreviewMeters(undefined);
      setCommsActive(false);
      setRecommendedReady(false);

      const afterDailyDrain = applyEffects(meters, getDailyDrains(meters, chapter.hazard));
      const afterChoice = applyEffects(afterDailyDrain, choice.effects);
      const cascadeNotes = getCascadeNotes(afterChoice, choice.effects);
      const nextMeters = cascadeNotes.reduce(
        (current, note) => applyEffects(current, note.effects),
        afterChoice,
      );
      setMeters(nextMeters);

      const failed = METERS.find((meter) => nextMeters[meter.id] <= 0);
      if (failed) setFailedSystem(failed.label);
      const effectSummary = getNetEffectSummary(meters, nextMeters, engineerView);
      const cascadeExplanation = cascadeNotes.map((note) => note.explanation).join(" ");
      const decisionRecord: DecisionRecord = {
        day: dayIndex + 1,
        challenge: chapter.title,
        plan: choice.title,
        planReason: choice.detail,
        pros: getPlanPros(choice),
        cons: getPlanCons(choice),
        changes: {
          power: nextMeters.power - meters.power,
          airWater: nextMeters.airWater - meters.airWater,
          shields: nextMeters.shields - meters.shields,
          food: nextMeters.food - meters.food,
          crewHeat: nextMeters.crewHeat - meters.crewHeat,
        },
      };
      setDecisionHistory((history) => [...history, decisionRecord]);
      setRunReport({
        outcome: failed ? "evacuated" : "survived",
        day: dayIndex + 1,
        choice: choice.title,
        failedSystem: failed?.label,
        rootCause: failed
          ? `${chapter.physics} ${failed.label} reached zero after ${effectSummary || "the daily life-support drain"} and the crew's ${choice.title.toLowerCase()} decision. ${cascadeExplanation}`
          : `The crew chose ${choice.title.toLowerCase()}. ${chapter.physics} ${cascadeExplanation}`,
      });
      const transition = failed
        ? "evacuated"
        : dayIndex === CHAPTERS.length - 1
          ? "debrief"
          : "next";
      const outcome = automatic
        ? `Auto-lockdown kept the base safe, but used some power.${cascadeExplanation ? ` ${cascadeExplanation}` : ""}`
        : `${choice.title} complete. ${effectSummary}.${cascadeExplanation ? ` ${cascadeExplanation}` : ""}`;

      setFactPopup({
        title: automatic ? "Safety system activated" : choice.title,
        outcome,
        whyNeeded: chapter.whyNeeded,
        planReason: choice.detail,
        pros: getPlanPros(choice),
        cons: getPlanCons(choice),
        scienceFact: chapter.scienceFact,
        transition,
      });
    },
    [chapter, dayIndex, decisionResolved, engineerView, gameStatus, meters],
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

  const startMission = useCallback(() => {
    setMeters(INITIAL_METERS);
    setPreviewMeters(undefined);
    setDayIndex(0);
    setExplorerPosition(48);
    setDecisionResolved(false);
    decisionLockRef.current = false;
    setDustSecondsLeft(10);
    setFailedSystem("");
    setRunReport(null);
    setDecisionHistory([]);
    setHintOpen(false);
    setFactPopup(null);
    setCommsActive(false);
    setCommsProgress(0);
    setRecommendedReady(false);
    setLeaderboard([]);
    debriefStartedRef.current = false;
    setGameStatus("playing");
  }, []);

  useEffect(() => {
    if (gameStatus !== "playing" && gameStatus !== "launch") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest("button, input, select, textarea")) return;
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        event.preventDefault();
        moveExplorer("left");
      } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
        event.preventDefault();
        moveExplorer("right");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, moveExplorer]);

  const beginMission = () => {
    const playerName = callsign.trim();
    if (!playerName) return;
    setCallsign(playerName);
    setGameStatus("story");
  };

  const enterDebrief = () => setGameStatus("debrief");

  useEffect(() => {
    if (
      (gameStatus !== "debrief" && gameStatus !== "evacuated") ||
      !runReport ||
      debriefStartedRef.current
    ) return;
    debriefStartedRef.current = true;
    setLeaderboardLoading(true);
    void (async () => {
      try {
        await submitScore(callsign, score);
        const entries = await fetchLeaderboard();
        setLeaderboard(entries);
      } finally {
        setLeaderboardLoading(false);
      }
    })();
  }, [callsign, gameStatus, runReport, score]);

  const closeFact = () => {
    if (!factPopup) return;
    const transition = factPopup.transition;
    setFactPopup(null);
    setHintOpen(false);
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

  return (
    <main
      className={`game-shell min-h-screen ${
        gameStatus === "launch"
          ? "landing-page"
          : ["playing", "debrief", "evacuated"].includes(gameStatus)
            ? "player-page"
            : ""
      }`}
    >
      {gameStatus !== "story" && <header className="game-topbar">
        <a aria-label="Lunar Academy home" className="brand-lockup" href="/">
          <span className="brand-mark" aria-hidden="true">◕</span>
          <span>LUNAR <strong>ACADEMY</strong></span>
        </a>
        <div className="topbar-controls">
          {gameStatus !== "launch" && (
            <label className="engineer-toggle">
              <span className={engineerView ? "" : "mode-selected"}>CADET</span>
              <input
                aria-label="Toggle Engineer View"
                checked={engineerView}
                onChange={(event) => setEngineerView(event.target.checked)}
                role="switch"
                type="checkbox"
              />
              <span aria-hidden="true" className="toggle-track"><i /></span>
              <span className={engineerView ? "mode-selected" : ""}>ENGINEER</span>
            </label>
          )}
          <button
            className="sources-button"
            onClick={() => setAttributionOpen(true)}
            type="button"
          >
            <BookOpen size={15} /> <span>NASA DATA SOURCES</span>
          </button>
        </div>
      </header>}

      {gameStatus === "launch" && (
        <section aria-labelledby="landing-title" className="launch-screen landing-screen">
          <div className="launch-copy">
            <p className="landing-kicker"><span className="live-dot" /> YOUR NEXT GREAT ADVENTURE</p>
            <h1 id="landing-title">The Moon<br />is calling, <span>Cadet.</span></h1>
            <p className="landing-subtitle">Your crew. Your moon base. Seven days to make it home.</p>
            <p className="landing-briefing">
              Explore Shackleton Crater, solve surprises together, and keep your crew safe. Every choice
              changes how your Moon base is doing.
            </p>
            <p className="landing-credit">
              <strong>Developed by Team Binary Coders</strong>
              <span>A NASA Space Apps Challenge project for junior astronaut assistants.</span>
            </p>
            <div className="landing-facts">
              <span><Moon size={17} /> 7 moon-days</span>
              <span><ShieldAlert size={17} /> 5 base systems</span>
              <span><Sparkles size={17} /> Choices change your base</span>
            </div>
            <div aria-live="polite" className="landing-weather">
              <Radio aria-hidden="true" size={17} />
              <div>
                <strong>NASA SPACE WEATHER</strong>
                {!spaceWeatherLoaded ? (
                  <span>Fetching recent solar-flare observations…</span>
                ) : spaceWeather ? (
                  <span>
                    {spaceWeather.dataStatus === "LIVE_NASA_DONKI" ? (
                      <>
                        {spaceWeather.count} solar-flare {spaceWeather.count === 1 ? "report" : "reports"} from{" "}
                        <a href="https://kauai.ccmc.gsfc.nasa.gov/DONKI/" rel="noreferrer" target="_blank">
                          NASA DONKI
                        </a>
                        {" · "}{spaceWeather.period.start} to {spaceWeather.period.end}.
                      </>
                    ) : (
                      spaceWeather.note
                    )}{" "}
                    Game events remain simulated.
                  </span>
                ) : (
                  <span>NASA’s live feed is unavailable right now. The mission is still ready to launch.</span>
                )}
              </div>
            </div>
            <div className="landing-cadet-panel">
              <div className="landing-picker-heading">
                <strong>Who’s joining the mission?</strong>
                <span>Pick your callsign, Cadet!</span>
              </div>
              <CallsignPicker onSelect={setCallsign} selected={callsign} />
              <button
                className="button button-primary launch-button"
                disabled={!callsign.trim()}
                onClick={beginMission}
                type="button"
              >
                <Zap aria-hidden="true" size={19} /> LAUNCH MISSION <ChevronRight className="launch-arrow" size={19} />
              </button>
            </div>
          </div>
          <div className="launch-visual landing-visual">
            <MoonBaseStage
              day={1}
              explorerPosition={explorerPosition}
              hazard="calm"
              interactive
              meters={INITIAL_METERS}
              onMoveExplorer={moveExplorer}
              explorerLabel={callsign}
              hideControllerHint
              showVitals={false}
            />
          </div>
        </section>
      )}

      {gameStatus === "story" && (
        <StoryIntro
          callsign={callsign}
          onSkip={startMission}
          onComplete={startMission}
        />
      )}

      {gameStatus === "playing" && chapter && (
        <section className="mission-screen">
          <div className="mission-heading">
            <div>
              <p className="eyebrow">HEY, {callsign.toUpperCase()}! YOU&apos;VE GOT THIS.</p>
              <h1>Mission Day {dayIndex + 1}: <span>{chapter.title}</span></h1>
              <p>{chapter.subtitle}</p>
              <div className="mission-world-facts">
                <span><Sparkles size={14} /> Moon gravity: 1/6 of Earth</span>
                <span>
                  <Thermometer size={14} />
                  {chapter.hazard === "night"
                    ? "Lunar night: about −130°C outside"
                    : chapter.hazard === "dust"
                      ? "Dust can block sunlight from solar panels"
                      : "Lunar sunlight can power the base"}
                </span>
                <span><Moon size={14} /> Moon day + night: about 29.5 Earth days</span>
              </div>
            </div>
            <div className="day-progress" aria-label={`Day ${dayIndex + 1} of 7`}>
              <span className="day-progress-label">DAY {String(dayIndex + 1).padStart(2, "0")} / 07</span>
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
              <MoonBaseStage
                day={dayIndex + 1}
                explorerPosition={explorerPosition}
                hazard={chapter.hazard}
                interactive
                hideControllerHint
                meters={meters}
                previewMeters={previewMeters}
                onMoveExplorer={moveExplorer}
              />
              <div className="crisis-card">
                <div className="crisis-intro">
                  <span className="crisis-icon" aria-hidden="true"><chapter.icon size={21} /></span>
                  <div>
                    <h2>Mission briefing</h2>
                    <p>{chapter.description}</p>
                    <p className="why-needed"><strong>Why choose a plan?</strong> {chapter.whyNeeded}</p>
                  </div>
                  <button
                    aria-expanded={hintOpen}
                    className="hint-button"
                    onClick={() => setHintOpen((open) => !open)}
                    type="button"
                  >
                    <Lightbulb size={17} /> {hintOpen ? "Hide hint" : "Need a hint?"}
                  </button>
                </div>
                {hintOpen && (
                  <p className="mission-hint" role="status">
                    <Lightbulb aria-hidden="true" size={18} />
                    <span><strong>Cadet hint:</strong> {getMissionHint(chapter, meters)}</span>
                  </p>
                )}

                {dayIndex === 3 && !decisionResolved && (
                  <div className="dust-countdown" aria-live="polite">
                    <div className="countdown-title">
                      <strong>Dust alert! Pick a plan before time runs out</strong>
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
                  {chapter.choices.map((choice, index) => {
                    const forecast = getChoiceForecast(meters, chapter.hazard, choice);
                    return (
                      <button
                        className="choice-card"
                        disabled={decisionResolved}
                        key={choice.title}
                        onBlur={() => setPreviewMeters(undefined)}
                        onClick={() => {
                          setPreviewMeters(undefined);
                          makeDecision(choice);
                        }}
                        onFocus={() => setPreviewMeters(forecast)}
                        onMouseEnter={() => setPreviewMeters(forecast)}
                        onMouseLeave={() => setPreviewMeters(undefined)}
                        type="button"
                      >
                        <span className="choice-number">PLAN 0{index + 1}</span>
                        <strong>{choice.title}</strong>
                        <span className="choice-detail">{choice.detail}</span>
                        <span aria-label="Projected system levels after this plan" className="choice-impact">
                          {METERS.filter((meter) => (choice.effects[meter.id] ?? 0) !== 0).map((meter) => {
                            const change = forecast[meter.id] - meters[meter.id];
                            return (
                              <span
                                className={`choice-impact-meter meter-${meter.id} ${change > 0 ? "is-up" : change < 0 ? "is-down" : "is-steady"}`}
                                key={meter.id}
                              >
                                <meter.icon aria-hidden="true" size={14} />
                                <span>
                                  {meter.label}
                                  <strong>{meters[meter.id]} → {forecast[meter.id]}%</strong>
                                </span>
                              </span>
                            );
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="comms-box">
                  <div className="comms-copy">
                    <span aria-hidden="true" className="comms-icon"><Radio size={20} /></span>
                    <div>
                      <strong>Ask Earth for help <small>RADIO SIGNAL</small></strong>
                      <span>Earth’s reply takes about 3 seconds for a radio signal to travel there and back.</span>
                    </div>
                  </div>
                  {recommendedReady ? (
                    <button
                      className="button button-secondary"
                      disabled={decisionResolved}
                      onClick={() => makeDecision(chapter.choices[chapter.recommendation])}
                      type="button"
                    >
                      Use Earth&apos;s plan
                    </button>
                  ) : (
                    <button
                      className="button button-comms"
                      disabled={commsActive || decisionResolved}
                      onClick={requestMissionControl}
                      type="button"
                    >
                      {commsActive ? "Message on its way…" : <><Radio size={17} /> Ask Earth for help</>}
                    </button>
                  )}
                  {commsActive && (
                    <div className="comms-progress-wrap" aria-live="polite">
                      <Signal size={15} />
                      <div className="comms-progress-track" role="progressbar" aria-valuenow={Math.round(commsProgress)} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${commsProgress}%` }} />
                      </div>
                      <span>Earth reply · about 3 seconds · {Math.round(commsProgress)}%</span>
                    </div>
                  )}
                  {recommendedReady && (
                    <p className="mission-control-recommendation">
                      Earth says: <strong>{chapter.choices[chapter.recommendation].title}</strong>
                    </p>
                  )}
                </div>
              </div>
            </div>

            <aside className="systems-panel">
              <div className="systems-heading">
                <div><p className="eyebrow">HOW IS THE BASE?</p><h2>Check your crew bars</h2></div>
                <span className="systems-heart" aria-hidden="true"><HeartPulse size={23} /></span>
              </div>
              {engineerView && (
                <div className="telemetry-banner">
                  <span className="sensor-pulse" /> SIMULATION ESTIMATES · NOT LIVE FLIGHT DATA
                </div>
              )}
              <div className="meter-list">
                {METERS.map((meter) => (
                  <MeterCard
                    engineerView={engineerView}
                    dailyDrain={dailyDrains[meter.id]}
                    hazard={chapter.hazard}
                    key={meter.id}
                    meter={meter}
                    value={meters[meter.id]}
                  />
                ))}
              </div>
              <div className="crew-tip">
                <span aria-hidden="true"><BookOpen size={16} /></span>
                <p><strong>Cadet tip</strong> Read each trade-off. A helpful choice for one system can change another!</p>
              </div>
            </aside>
          </div>
        </section>
      )}

      {(gameStatus === "debrief" || gameStatus === "evacuated") && (
        <section className={`debrief-screen ${gameStatus === "evacuated" ? "debrief-evacuated" : ""}`}>
          <div className="debrief-confetti" aria-hidden="true">
            {gameStatus === "debrief" ? <Sparkles size={28} /> : <ShieldAlert size={28} />}
          </div>
          <span className="ending-icon" aria-hidden="true">
            {gameStatus === "debrief" ? <Trophy size={38} /> : <ShieldAlert size={38} />}
          </span>
          <p className="eyebrow">
            {gameStatus === "debrief" ? "MISSION COMPLETE · SHACKLETON CRATER" : "CREW RESCUED · BLACK-BOX REVIEW"}
          </p>
          <h1>
            {gameStatus === "debrief" ? <>You did it, <span>{callsign}!</span></> : <>Mission debrief, <span>{callsign}</span></>}
          </h1>
          <p className="ending-lede">
            {gameStatus === "debrief"
              ? "Seven days on the Moon! Your crew kept the base running and made it home together. Stellar teamwork!"
              : "Your crew is safe aboard the rescue shuttle. Let’s see what the base recorder can teach us for next time."}
          </p>
          <div className="score-card">
            <span>{gameStatus === "debrief" ? "MISSION SCORE" : "BLACK-BOX SCORE"}</span>
            <strong>{score}</strong><small>CADET EXPLORER POINTS</small>
          </div>
          <article className="black-box-card">
            <div className="black-box-heading">
              <span><Activity size={18} /></span>
              <div><p className="eyebrow">FLIGHT RECORDER · MISSION DAY {runReport?.day ?? dayIndex + 1}</p><h2>Black-Box Debrief</h2></div>
            </div>
            <div className="black-box-status">
              <span className={gameStatus === "debrief" ? "status-light status-safe" : "status-light status-alert"} />
              {gameStatus === "debrief" ? "ALL SEVEN MISSION DAYS SURVIVED" : `${(runReport?.failedSystem ?? failedSystem) || "BASE SYSTEM"} DEPLETED`}
            </div>
            <div className="cause-step">
              <span className="cause-number">01</span>
              <div><strong>Cadet decision</strong><p>{runReport?.choice ?? "Mission decision recorded"}</p></div>
            </div>
            <div className="cause-connector" />
            <div className="cause-step">
              <span className="cause-number">02</span>
              <div><strong>Physics chain</strong><p>{runReport?.rootCause ?? "Daily resource use and lunar conditions shaped the base response."}</p></div>
            </div>
            {gameStatus === "evacuated" && (
              <p className="rescue-note"><ShieldAlert size={15} /> Mission Control safely evacuated the crew when {runReport?.failedSystem ?? failedSystem} reached zero.</p>
            )}
          </article>
          <section aria-labelledby="decision-log-title" className="decision-log-card">
            <div className="decision-log-heading">
              <span><BookOpen size={19} /></span>
              <div>
                <p className="eyebrow">YOUR MISSION STORY</p>
                <h2 id="decision-log-title">Every plan and what it changed</h2>
              </div>
            </div>
            <p className="decision-summary-intro">
              Here are the plans you picked and how they changed the base. Final crew supplies:
            </p>
            <div className="decision-final-status">
              {METERS.map((meter) => (
                <span className={`final-meter meter-${meter.id}`} key={meter.id}>
                  <strong>{meter.label}</strong><b>{meters[meter.id]}%</b>
                </span>
              ))}
            </div>
            <ol className="decision-log-list">
              {decisionHistory.map((record) => (
                <li className="decision-log-item" key={`${record.day}-${record.plan}`}>
                  <div className="decision-log-title">
                    <span>DAY {record.day}</span>
                    <strong>{record.challenge}</strong>
                  </div>
                  <h3>{record.plan}</h3>
                  <p>{record.planReason}</p>
                  <div className="decision-log-tradeoffs">
                    <span><strong>Helped:</strong> {record.pros.join(" · ")}</span>
                    <span><strong>Cost:</strong> {record.cons.join(" · ")}</span>
                  </div>
                  <div className="decision-change-list" aria-label="Meter changes">
                    {METERS.map((meter) => {
                      const change = record.changes[meter.id];
                      if (change === 0) return null;
                      return (
                        <span className={change > 0 ? "change-up" : "change-down"} key={meter.id}>
                          {meter.label} {change > 0 ? "+" : ""}{change}%
                        </span>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ol>
            <p className="decision-log-note">
              Changes include one mission day of use, your plan, and any extra strain caused by low supplies.
            </p>
          </section>
          <div className="leaderboard-card">
            <div className="leaderboard-heading"><div><p className="eyebrow">CREW HALL OF FAME</p><h2>Mission leaderboard</h2></div><span aria-hidden="true"><Trophy size={22} /></span></div>
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
          <button className="button button-primary replay-button" onClick={beginMission} type="button">
            <RotateCcw size={17} /> REPLAY MISSION <ChevronRight size={17} />
          </button>
        </section>
      )}

      {gameStatus !== "story" && <footer className="game-footer">
        <span>MADE FOR MOON EXPLORERS <Sun size={13} /></span>
        <button onClick={() => setAttributionOpen(true)} type="button"><BookOpen size={13} /> NASA DATA SOURCES</button>
      </footer>}

      {factPopup && (
        <div className="modal-backdrop" role="presentation">
          <section aria-labelledby="fact-title" aria-modal="true" className="dialog-card science-dialog" role="dialog">
            <span className="dialog-icon" aria-hidden="true"><BookOpen size={23} /></span>
            <p className="eyebrow">PLAN REVIEW · {factPopup.title.toUpperCase()}</p>
            <h2 id="fact-title">Plan review</h2>
            <p className="decision-why"><strong>Why this mattered:</strong> {factPopup.whyNeeded}</p>
            <p className="decision-plan-reason">{factPopup.planReason}</p>
            <div className="popup-pros-cons">
              <section>
                <h3>Good things</h3>
                <ul>{factPopup.pros.map((pro) => <li key={pro}>{pro}</li>)}</ul>
              </section>
              <section>
                <h3>Trade-offs</h3>
                <ul>{factPopup.cons.map((con) => <li key={con}>{con}</li>)}</ul>
              </section>
            </div>
            <p className="dialog-outcome">{factPopup.outcome}</p>
            <div className="science-fact-panel">
              <h3>NASA Science Fact!</h3>
              <p>{factPopup.scienceFact}</p>
            </div>
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
            <button aria-label="Close attribution" className="dialog-close" onClick={() => setAttributionOpen(false)} type="button"><X size={18} /></button>
            <p className="eyebrow">EXPLORE THE REAL SCIENCE</p>
            <h2 id="attribution-title">NASA Data Sources</h2>
            <p className="attribution-intro">This learning game is inspired by real spaceflight and lunar-science references. Gameplay readings are simplified simulations, not live mission data.</p>
            <ul className="attribution-list">
              <li><strong>NASA DONKI</strong><span>Space-weather event context and solar activity references.</span></li>
              <li><strong>NASA-STD-3001</strong><span>Human-system standards that inform crew-health context.</span></li>
              <li><strong>ISS ECLSS</strong><span>Environmental control and life-support concepts.</span></li>
              <li><strong>LRO Diviner</strong><span>Lunar surface temperature and thermal environment context.</span></li>
              <li><strong>NASA Veggie</strong><span>Plant-growth research for fresh food in space.</span></li>
            </ul>
            <p className="attribution-note">NASA is not responsible for this game. This is an educational simulation, not medical or mission-operations guidance.</p>
            <button className="button button-secondary dialog-button" onClick={() => setAttributionOpen(false)} type="button">GOT IT!</button>
          </section>
        </div>
      )}
    </main>
  );
}
