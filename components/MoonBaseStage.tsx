import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MeterId } from "@/components/MeterCard";

type MoonBaseStageProps = {
  hazard: string;
  day: number;
  meters: Record<MeterId, number>;
  previewMeters?: Record<MeterId, number>;
  compact?: boolean;
  interactive?: boolean;
  showExplorer?: boolean;
  showVitals?: boolean;
  hideControllerHint?: boolean;
  explorerPosition?: number;
  explorerLabel?: string;
  onMoveExplorer?: (direction: "left" | "right") => void;
};

const STAGE_METERS: { id: MeterId; label: string }[] = [
  { id: "power", label: "PWR" },
  { id: "airWater", label: "AIR" },
  { id: "shields", label: "SHIELD" },
  { id: "food", label: "FOOD" },
  { id: "crewHeat", label: "HEAT" },
];

const HAZARD_LABELS: Record<string, string> = {
  calm: "ALL SYSTEMS READY",
  flare: "SOLAR FLARE WATCH",
  ice: "MOON ICE MISSION",
  night: "LUNAR NIGHT",
  dust: "MOON DUST STORM",
  quake: "MOONQUAKE ALERT",
  greenhouse: "GREENHOUSE CHECK",
  lander: "SUPPLY LANDER INBOUND",
};

export default function MoonBaseStage({
  hazard,
  day,
  meters,
  previewMeters,
  compact = false,
  interactive = false,
  showExplorer = false,
  showVitals = true,
  hideControllerHint = false,
  explorerPosition = 48,
  explorerLabel,
  onMoveExplorer,
}: MoonBaseStageProps) {
  const sceneMeters = previewMeters ?? meters;

  return (
    <section
      aria-label={`Shackleton Crater Moon Base, mission day ${day}`}
      className={`moon-stage scene-${hazard} ${previewMeters ? "scene-forecast" : ""} ${compact ? "stage-compact" : ""}`}
    >
      <div className="stage-stars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <svg
        aria-hidden="true"
        className="stage-earth"
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="earth-clip">
            <circle cx="32" cy="32" r="29" />
          </clipPath>
          <linearGradient id="earth-ocean" x1="0" x2="1" y1="0" y2="1">
            <stop stopColor="var(--art-earth-light)" />
            <stop offset="1" stopColor="var(--art-earth-ocean)" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#earth-ocean)" stroke="var(--art-suit)" strokeWidth="3" />
        <g clipPath="url(#earth-clip)" fill="var(--art-earth-land)">
          <path d="m8 17 7-5 5 2 2 6-5 3-1 7-5 1-3-7-5-2zm21-15 7 3 2 7-5 4-2 8-6-2-2-8 3-6zm14 25 7-4 7 3 2 8-5 6-1 9-7 1-4-7-5-2 1-8zm-23 8 8-3 6 5-2 7-6 2-2 8-6-3-2-8-5-2z" />
        </g>
        <path d="M11 17c7-8 18-13 30-12" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeOpacity=".7" strokeWidth="3" />
      </svg>
      <svg
        aria-hidden="true"
        className="stage-space-doodles"
        preserveAspectRatio="none"
        viewBox="0 0 760 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g className="doodle-cloud" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="5">
          <path d="M253 74h79c13 0 21-9 19-20-2-10-12-15-22-12-6-20-34-22-44-4-16-9-34 2-32 19-15 0-19 17 0 17Z" fill="var(--art-suit)" />
          <path d="M270 63h19m13 0h19" fill="none" stroke="var(--art-outline)" strokeLinecap="round" strokeWidth="4" />
          <path d="M284 69q7 6 14 0" fill="none" stroke="var(--art-outline)" strokeLinecap="round" strokeWidth="3" />
        </g>
        <g className="doodle-moon" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="5">
          <circle cx="430" cy="70" r="37" fill="var(--art-warm-light)" />
          <circle cx="418" cy="65" r="3" fill="var(--art-outline)" stroke="none" />
          <circle cx="441" cy="65" r="3" fill="var(--art-outline)" stroke="none" />
          <path d="M418 78q12 12 24 0" fill="none" strokeLinecap="round" strokeWidth="4" />
          <circle cx="406" cy="77" r="5" fill="var(--art-coral-soft)" stroke="none" />
          <circle cx="454" cy="77" r="5" fill="var(--art-coral-soft)" stroke="none" />
        </g>
        <g className="doodle-rocket" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="5" transform="translate(112 32) rotate(-18 28 34)">
          <path d="M28 3C43 15 46 36 37 53H19C10 36 13 15 28 3Z" fill="var(--art-suit)" />
          <circle cx="28" cy="27" r="7" fill="var(--art-glass)" />
          <path d="m18 42-11 13 15-2m16-11 11 13-15-2" fill="var(--art-amber)" />
          <path d="M23 53h10l-5 13-5-13Z" fill="var(--art-coral)" />
          <path d="M27 58h2" stroke="var(--art-suit)" strokeLinecap="round" />
        </g>
        <g className="doodle-stars" fill="var(--art-suit)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="3">
          <path d="m193 30 5 12 12 5-12 5-5 12-5-12-12-5 12-5 5-12Z" />
          <path d="m520 28 4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" />
          <path d="m354 26 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z" />
        </g>
      </svg>
      <div className="stage-hills stage-hills-back" aria-hidden="true" />
      <div className="stage-crater" aria-hidden="true" />
      {interactive && showVitals && (
        <div aria-label="Base systems now and projected after this plan" className="stage-vitals">
          <strong className="stage-vitals-title">
            {previewMeters ? "PROJECTED AFTER THIS PLAN" : "BASE SYSTEMS"}
          </strong>
          {STAGE_METERS.map(({ id, label }) => {
            const current = meters[id];
            const projected = previewMeters?.[id] ?? current;
            const delta = projected - current;
            return (
              <div className={`stage-vital meter-${id}`} key={id}>
                <div className="stage-vital-heading">
                  <span>{label}</span>
                  <strong>{previewMeters ? `${current} → ${projected}` : current}%</strong>
                </div>
                <div aria-hidden="true" className="stage-vital-track">
                  <span className="stage-vital-fill" style={{ width: `${current}%` }} />
                  {delta !== 0 && (
                    <i
                      className={delta > 0 ? "stage-vital-change is-up" : "stage-vital-change is-down"}
                      style={{
                        left: `${Math.min(current, projected)}%`,
                        width: `${Math.abs(delta)}%`,
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <svg
        aria-hidden="true"
        className="base-illustration"
        viewBox="0 0 760 330"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="378" cy="278" fill="var(--art-shadow)" opacity=".25" rx="247" ry="24" />
        <ellipse
          cx="378"
          cy="190"
          rx="165"
          ry="112"
          fill="none"
          stroke="var(--stage-shield)"
          strokeDasharray="8 8"
          strokeOpacity={sceneMeters.shields / 250}
          strokeWidth="5"
        />
        <path d="M259 188c0-59 48-107 107-107h32c59 0 107 48 107 107v74H259v-74Z" fill="var(--art-habitat)" stroke="var(--art-outline)" strokeWidth="8" />
        <path d="M280 188c0-47 38-85 85-85h34c47 0 85 38 85 85v54H280v-54Z" fill="var(--art-panel)" />
        <path d="M288 184c0-42 34-76 76-76h36c42 0 76 34 76 76v28H288v-28Z" fill="var(--stage-window)" opacity={Math.max(.35, sceneMeters.crewHeat / 100)} />
        <path d="M291 212h182v28H291z" fill="var(--stage-window-frame)" />
        <path d="M376 109v131m-84-33h181" stroke="var(--art-habitat)" strokeWidth="7" />
        <path d="M325 261v-28h124v28" fill="var(--art-amber)" stroke="var(--art-outline)" strokeWidth="6" />
        <g opacity={Math.max(.2, sceneMeters.power / 100)}>
          <path d="m105 215 107-28 15 58-107 28-15-58Z" fill="var(--art-panel)" stroke="var(--art-outline)" strokeWidth="5" />
          <path d="m118 217 87-23 8 32-87 23-8-32Z" fill="var(--stage-water)" />
          <path d="m151 208 13 47m16-55 13 47m-74-17 100-26" stroke="var(--art-glass-light)" strokeWidth="3" />
          <path d="m537 215 107-28 15 58-107 28-15-58Z" fill="var(--art-panel)" stroke="var(--art-outline)" strokeWidth="5" />
          <path d="m550 217 87-23 8 32-87 23-8-32Z" fill="var(--stage-water)" />
          <path d="m583 208 13 47m16-55 13 47m-74-17 100-26" stroke="var(--art-glass-light)" strokeWidth="3" />
        </g>
        <g className="base-garden" opacity={Math.max(.15, sceneMeters.food / 100)}>
          <path d="M251 230v-17m0 9-9-8m9 12 9-10m271 14v-18m0 10-9-8m9 12 9-10" fill="none" stroke="var(--stage-garden)" strokeLinecap="round" strokeWidth="5" />
          <circle cx="251" cy="208" r="4" fill="var(--stage-garden)" />
          <circle cx="522" cy="208" r="4" fill="var(--stage-garden)" />
        </g>
        <g opacity={Math.max(.15, sceneMeters.airWater / 100)}>
          <rect x="474" y="214" width="13" height="28" rx="4" fill="var(--stage-water)" stroke="var(--art-outline)" strokeWidth="3" />
          <path d="M477 224h7" stroke="var(--art-glass-light)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <path d="m230 234 27 9m219-9 27 9M92 271h572" stroke="var(--art-habitat)" strokeLinecap="round" strokeWidth="5" />
        <path d="m497 179 28-20 23 9-24 13v38h-27v-40Z" fill="var(--art-amber)" />
        <circle cx="511" cy="182" r="5" fill="var(--art-star)" />
        <path d="M92 273h572" stroke="var(--art-suit)" strokeDasharray="3 15" strokeLinecap="round" strokeOpacity=".6" strokeWidth="2" />
        <g aria-hidden="true" fill="var(--art-rock)" stroke="var(--art-habitat)" strokeLinejoin="round" strokeWidth="3">
          <path d="m62 258 13-21 17 4 10 24H62Z" />
          <path d="m663 262 10-17 17 1 11 20h-36Z" />
          <path d="m229 270 8-12 11 2 6 12h-25Z" />
          <path d="m493 270 7-11 13 1 6 10h-26Z" />
        </g>
        <g aria-hidden="true" transform="translate(666 214)">
          <circle cx="18" cy="48" r="8" fill="var(--art-outline)" stroke="var(--art-habitat)" strokeWidth="3" />
          <circle cx="48" cy="48" r="8" fill="var(--art-outline)" stroke="var(--art-habitat)" strokeWidth="3" />
          <path d="M11 25h39l6 18H7l4-18Z" fill="var(--art-amber)" stroke="var(--art-outline)" strokeLinejoin="round" strokeWidth="3" />
          <rect x="22" y="12" width="17" height="14" rx="6" fill="var(--art-glass)" stroke="var(--art-outline)" strokeWidth="3" />
          <path d="m29 15 3-10m-3 10-7-5m7 5 7-5" fill="none" stroke="var(--art-outline)" strokeLinecap="round" strokeWidth="2" />
        </g>
        <g className="base-beacon">
          <path d="M636 211v-31m-7 0h14" stroke="var(--art-outline)" strokeLinecap="round" strokeWidth="4" />
          <circle cx="636" cy="176" r="5" fill="var(--art-coral)" />
          <circle cx="636" cy="176" r="11" fill="var(--art-coral)" opacity=".22" />
        </g>
      </svg>
      {hazard === "flare" && (
        <svg aria-hidden="true" className="stage-event-doodle stage-flare-doodle" viewBox="0 0 90 90">
          <circle cx="46" cy="43" r="20" fill="var(--art-amber)" stroke="var(--art-suit)" strokeWidth="4" />
          <circle cx="39" cy="40" r="2" fill="var(--art-face)" />
          <circle cx="53" cy="40" r="2" fill="var(--art-face)" />
          <path d="M39 49q7 8 14 0M46 7v9m0 54v9M10 43h10m52 0h9M19 16l8 8m38 38 7 8m0-54-8 8m-38 38-7 8" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="4" />
        </svg>
      )}
      {hazard === "dust" && (
        <svg aria-hidden="true" className="stage-event-doodle stage-dust-doodle" viewBox="0 0 150 85">
          <path d="M12 52h95c22 0 31-23 13-31-12-5-21 2-23 10-4-18-28-20-36-5-13-9-33-3-34 11-21-5-32 4-28 15Z" fill="var(--art-dust)" stroke="var(--art-suit)" strokeLinejoin="round" strokeWidth="4" />
          <path d="M20 68h46m-25 9h70m-19-15h36" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="4" />
        </svg>
      )}
      {hazard === "lander" && (
        <svg aria-hidden="true" className="stage-event-doodle stage-lander-doodle" viewBox="0 0 100 90">
          <path d="M50 12 70 35l-7 26H37l-7-26 20-23Z" fill="var(--art-amber)" stroke="var(--art-suit)" strokeLinejoin="round" strokeWidth="4" />
          <circle cx="50" cy="34" r="7" fill="var(--art-glass)" stroke="var(--art-suit)" strokeWidth="3" />
          <path d="m36 49-18 25h24l8-13m14-12 18 25H58l-8-13m-11 0-5 15m30-15 5 15" fill="var(--art-suit)" stroke="var(--art-route)" strokeLinejoin="round" strokeWidth="4" />
        </svg>
      )}
      {(interactive || showExplorer) && (
        <div
          aria-label={explorerLabel ? `${explorerLabel}, Moonwalker explorer` : "Moonwalker explorer"}
          className="explorer-sprite"
          style={{ left: `${explorerPosition}%` }}
        >
          {explorerLabel && (
            <span
              aria-hidden="true"
              className="explorer-name-tag"
              style={{
                transform: `translateX(${explorerPosition < 20 ? "-20%" : explorerPosition > 75 ? "-80%" : "-50%"})`,
              }}
            >
              {explorerLabel}
            </span>
          )}
          <span className="explorer-glow" />
          <svg aria-hidden="true" viewBox="0 0 64 78" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="32" cy="74" fill="var(--art-shadow)" opacity=".5" rx="19" ry="3" />
            <path d="M20 39v20l-7 9m7-7 7 6m17-28v20l7 8m-7-6-7 5" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="7" />
            <path d="M21 34h25l5 22H18l3-22Z" fill="var(--art-suit)" stroke="var(--art-outline)" strokeWidth="2" />
            <path d="M20 40 11 51m33-11 9 10" fill="none" stroke="var(--art-suit)" strokeLinecap="round" strokeWidth="6" />
            <rect x="22" y="6" width="23" height="25" rx="11" fill="var(--art-suit)" stroke="var(--art-outline)" strokeWidth="2" />
            <path d="M26 17c0-6 4-9 8-9 5 0 8 4 8 9v5H26v-5Z" fill="var(--art-glass)" stroke="var(--art-glass-light)" strokeWidth="2" />
            <path d="M29 15c2-3 5-4 9-3" stroke="var(--art-suit)" strokeLinecap="round" strokeOpacity=".8" strokeWidth="2" />
            <rect x="13" y="38" width="7" height="13" rx="3.5" fill="var(--art-amber)" stroke="var(--art-suit)" />
            <path d="M15 66h9m14 0h10" stroke="var(--art-amber)" strokeLinecap="round" strokeWidth="4" />
          </svg>
        </div>
      )}
      <div className="stage-hills stage-hills-front" aria-hidden="true" />
      <div className="stage-hazard-overlay" aria-hidden="true" />
      {interactive && (
        <div className="scene-controller">
          {!hideControllerHint && (
            <span className="scene-controller-hint"><b>MOVE</b> <kbd>←</kbd><kbd>→</kbd> or <kbd>A</kbd><kbd>D</kbd></span>
          )}
          <div className="scene-controller-pad">
            <button aria-label="Move Moonwalker left" onClick={() => onMoveExplorer?.("left")} type="button">
              <ChevronLeft size={18} />
            </button>
            <button aria-label="Move Moonwalker right" onClick={() => onMoveExplorer?.("right")} type="button">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
      <div className="stage-caption">
        <span className="stage-location">SHACKLETON CRATER · MOON</span>
        <strong>{HAZARD_LABELS[hazard] ?? "BASE STATUS"}</strong>
        <span className="stage-day">DAY {String(day).padStart(2, "0")} / 07</span>
      </div>
    </section>
  );
}
