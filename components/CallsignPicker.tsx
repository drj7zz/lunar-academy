import { Rocket } from "lucide-react";

type CallsignPickerProps = {
  selected: string;
  onSelect: (callsign: string) => void;
};

export default function CallsignPicker({
  selected,
  onSelect,
}: CallsignPickerProps) {
  return (
    <div className="callsign-select-wrap">
      <span aria-hidden="true" className="callsign-avatar"><Rocket size={20} /></span>
      <input
        aria-label="Enter your callsign"
        autoComplete="nickname"
        className="callsign-select"
        maxLength={24}
        onChange={(event) => onSelect(event.target.value)}
        placeholder="Type your name or callsign"
        required
        type="text"
        value={selected}
      />
    </div>
  );
}
