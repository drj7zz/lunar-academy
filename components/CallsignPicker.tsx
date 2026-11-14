const CALLSIGNS = [
  "Cadet Nova",
  "Astro Orion",
  "Commander Luna",
  "Ranger Cosmo",
  "Pilot Vega",
  "Scout Apollo",
] as const;

type CallsignPickerProps = {
  selected: string;
  onSelect: (callsign: string) => void;
};

export default function CallsignPicker({
  selected,
  onSelect,
}: CallsignPickerProps) {
  return (
    <div className="callsign-grid" role="group" aria-label="Choose your callsign">
      {CALLSIGNS.map((callsign, index) => (
        <button
          aria-pressed={selected === callsign}
          className={`callsign-choice ${selected === callsign ? "is-selected" : ""}`}
          key={callsign}
          onClick={() => onSelect(callsign)}
          type="button"
        >
          <span aria-hidden="true" className="callsign-avatar">
            {["🌟", "🪐", "🌙", "🚀", "☄️", "🛰️"][index]}
          </span>
          {callsign}
          {selected === callsign && <span className="choice-check" aria-hidden="true">✓</span>}
        </button>
      ))}
    </div>
  );
}
