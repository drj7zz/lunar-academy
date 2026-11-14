export type MeterId = "power" | "airWater" | "shields" | "food" | "crewHeat";

export type MeterDefinition = {
  id: MeterId;
  label: string;
  icon: string;
  drain: number;
  telemetry: string;
};

type MeterCardProps = {
  meter: MeterDefinition;
  value: number;
  engineerView: boolean;
};

function getCadetStatus(value: number) {
  if (value >= 65) return { label: "Strong", icon: "✨" };
  if (value >= 35) return { label: "Okay", icon: "🙂" };
  if (value >= 15) return { label: "Low!", icon: "⚠️" };
  return { label: "Critical!", icon: "🆘" };
}

export default function MeterCard({
  meter,
  value,
  engineerView,
}: MeterCardProps) {
  const status = getCadetStatus(value);

  return (
    <article className={`meter-card meter-${meter.id}`}>
      <div className="meter-card-heading">
        <span aria-hidden="true" className="meter-symbol">{meter.icon}</span>
        <h3>{meter.label}</h3>
        {engineerView ? (
          <strong className="meter-number">{value}%</strong>
        ) : (
          <strong className="meter-status">
            <span aria-hidden="true">{status.icon}</span> {status.label}
          </strong>
        )}
      </div>
      <div
        aria-label={`${meter.label}: ${engineerView ? `${value}%` : status.label}`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="meter-track"
        role="meter"
      >
        <span className="meter-fill" style={{ width: `${value}%` }} />
      </div>
      {engineerView && (
        <div className="meter-telemetry">
          <span>DAILY DRAIN {meter.drain}%</span>
          <span>{meter.telemetry}</span>
        </div>
      )}
    </article>
  );
}
