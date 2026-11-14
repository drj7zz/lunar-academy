type MoonBaseStageProps = {
  hazard: string;
  day: number;
  compact?: boolean;
};

const HAZARD_LABELS: Record<string, string> = {
  calm: "ALL SYSTEMS READY",
  flare: "SOLAR FLARE WATCH",
  ice: "ICE MINING OPERATION",
  night: "LUNAR NIGHT",
  dust: "REGOLITH DUST STORM",
  quake: "MOONQUAKE ALERT",
  greenhouse: "GREENHOUSE CHECK",
  lander: "SUPPLY LANDER INBOUND",
};

export default function MoonBaseStage({
  hazard,
  day,
  compact = false,
}: MoonBaseStageProps) {
  return (
    <section
      aria-label={`Shackleton Crater Moon Base, mission day ${day}`}
      className={`moon-stage scene-${hazard} ${compact ? "stage-compact" : ""}`}
    >
      <div className="stage-stars" aria-hidden="true">
        <i /><i /><i /><i /><i /><i /><i /><i />
      </div>
      <div className="stage-earth" aria-hidden="true" />
      <div className="stage-hills stage-hills-back" aria-hidden="true" />
      <div className="stage-crater" aria-hidden="true" />
      <svg
        aria-hidden="true"
        className="base-illustration"
        viewBox="0 0 760 330"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="378" cy="278" fill="#060A18" opacity=".42" rx="247" ry="24" />
        <path d="M259 188c0-59 48-107 107-107h32c59 0 107 48 107 107v74H259v-74Z" fill="#D9E5FF" stroke="#91A9E9" strokeWidth="8" />
        <path d="M280 188c0-47 38-85 85-85h34c47 0 85 38 85 85v54H280v-54Z" fill="#263B70" />
        <path d="M288 184c0-42 34-76 76-76h36c42 0 76 34 76 76v28H288v-28Z" fill="#8CEBFF" opacity=".83" />
        <path d="M291 212h182v28H291z" fill="#547BC4" />
        <path d="M376 109v131m-84-33h181" stroke="#D9E5FF" strokeWidth="7" />
        <path d="M325 261v-28h124v28" fill="#AEBFEA" stroke="#748BC7" strokeWidth="6" />
        <path d="m105 215 107-28 15 58-107 28-15-58Z" fill="#233A70" stroke="#91A9E9" strokeWidth="5" />
        <path d="m118 217 87-23 8 32-87 23-8-32Z" fill="#4DCDE8" />
        <path d="m151 208 13 47m16-55 13 47m-74-17 100-26" stroke="#B5F5FF" strokeWidth="3" />
        <path d="m537 215 107-28 15 58-107 28-15-58Z" fill="#233A70" stroke="#91A9E9" strokeWidth="5" />
        <path d="m550 217 87-23 8 32-87 23-8-32Z" fill="#4DCDE8" />
        <path d="m583 208 13 47m16-55 13 47m-74-17 100-26" stroke="#B5F5FF" strokeWidth="3" />
        <path d="m230 234 27 9m219-9 27 9M92 271h572" stroke="#D9E5FF" strokeLinecap="round" strokeWidth="5" />
        <path d="m497 179 28-20 23 9-24 13v38h-27v-40Z" fill="#FFCF74" />
        <circle cx="511" cy="182" r="5" fill="#FFF6C5" />
      </svg>
      <div className="stage-hills stage-hills-front" aria-hidden="true" />
      <div className="stage-hazard-overlay" aria-hidden="true" />
      <div className="stage-caption">
        <span className="stage-location">SHACKLETON CRATER · MOON</span>
        <strong>{HAZARD_LABELS[hazard] ?? "BASE STATUS"}</strong>
        <span className="stage-day">SOL {String(day).padStart(2, "0")} / 07</span>
      </div>
    </section>
  );
}
