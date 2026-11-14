import type { LucideIcon } from "lucide-react";

export type MeterId = "power" | "airWater" | "shields" | "food" | "crewHeat";

export type MeterDefinition = {
  id: MeterId;
  label: string;
  icon: LucideIcon;
};

type MeterCardProps = {
  meter: MeterDefinition;
  value: number;
  engineerView: boolean;
  dailyDrain: number;
  hazard: string;
};

const METER_EXPLANATIONS: Record<MeterId, string> = {
  power: "Runs the lights, heaters, and air-recycling tools.",
  airWater: "Keeps cabin air fresh and drinking water ready.",
  shields: "Helps protect the crew from space radiation.",
  food: "Feeds the crew and helps the Moon garden grow.",
  crewHeat: "Keeps the habitat warm enough for the crew.",
};

const LOW_METER_WARNINGS: Record<MeterId, string> = {
  power: "Low power can slow the air recycler and heaters.",
  airWater: "Low air or water can limit the food garden.",
  shields: "Low shields leave the crew less protected.",
  food: "Low food means fewer meals for the crew.",
  crewHeat: "A cold cabin makes life harder for the crew.",
};

function getEngineerReadings(meterId: MeterId, value: number, hazard: string) {
  switch (meterId) {
    case "power": {
      const solarInput = hazard === "night" ? "0.0" : hazard === "dust" ? "3.2" : "8.6";
      const solarCondition = hazard === "night" ? "no sunlight" : hazard === "dust" ? "dust-reduced" : "sunlit estimate";
      return [
        `BATTERY EST. ${(value * 0.8).toFixed(1)} / 80 kWh`,
        `SOLAR INPUT EST. ${solarInput} kW · ${solarCondition}`,
      ];
    }
    case "airWater":
      return [
        `POTABLE WATER EST. ${Math.round(value * 1.2)} / 120 L`,
        "TRAINING CABIN: 101 kPa · 20.9% O₂ (EARTH-LIKE)",
      ];
    case "shields":
      return [
        `WATER-WALL SHIELDING ${value}%`,
        `SHELTER STATUS: ${value >= 65 ? "READY" : value >= 30 ? "LIMITED" : "PRIORITY USE"}`,
      ];
    case "food":
      return [
        `FOOD STORES ${value}% OF PLANNED SUPPLY`,
        `FOOD STATUS: ${value >= 35 ? "NORMAL HARVEST" : "LOW SUPPLY"}`,
      ];
    case "crewHeat":
      return [
        `CABIN TEMPERATURE EST. ${(15 + value * 0.12).toFixed(1)}°C`,
        `COMFORT BAND 18–27°C · ${hazard === "night" ? "OUTSIDE −130°C" : "LUNAR SURFACE VARIES"}`,
        "MOON GRAVITY 1.62 m/s² · ABOUT 1/6 OF EARTH",
      ];
  }
}

export default function MeterCard({
  meter,
  value,
  engineerView,
  dailyDrain,
  hazard,
}: MeterCardProps) {
  return (
    <article className={`meter-card meter-${meter.id}`}>
      <div className="meter-card-heading">
        <span aria-hidden="true" className="meter-symbol"><meter.icon size={19} strokeWidth={2.2} /></span>
        <h3>{meter.label}</h3>
        <strong className="meter-number">{value}%</strong>
      </div>
      <div
        aria-label={`${meter.label}: ${value}%`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={value}
        className="meter-track"
        role="meter"
      >
        <span className="meter-fill" style={{ width: `${value}%` }} />
      </div>
      {!engineerView ? (
        <p className="meter-cadet-help">
          {METER_EXPLANATIONS[meter.id]}
          {value < 30 && <><br /><strong>{LOW_METER_WARNINGS[meter.id]}</strong></>}
        </p>
      ) : (
        <div className="meter-telemetry">
          <span>DAILY CHANGE {dailyDrain}% / MISSION DAY</span>
          {getEngineerReadings(meter.id, value, hazard).map((reading) => <span key={reading}>{reading}</span>)}
        </div>
      )}
    </article>
  );
}
