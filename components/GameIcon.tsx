export type GameIconName =
  | "power"
  | "water"
  | "shield"
  | "food"
  | "heat"
  | "moon"
  | "rocket"
  | "radio"
  | "spark"
  | "left"
  | "right"
  | "sound"
  | "mute"
  | "home";

type GameIconProps = {
  name: GameIconName;
  size?: number;
  className?: string;
};

export default function GameIcon({
  name,
  size = 24,
  className,
}: GameIconProps) {
  const shared = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.8,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      {name === "power" && <path {...shared} d="M18 3 8 18h7l-1 11 11-16h-7l1-10Z" />}
      {name === "water" && (
        <>
          <path {...shared} d="M16 3C13 8 7 14.5 7 20a9 9 0 0 0 18 0c0-5.5-6-12-9-17Z" />
          <path {...shared} d="M12 21c.4 2 1.7 3.2 3.7 3.6" />
        </>
      )}
      {name === "shield" && (
        <>
          <path {...shared} d="M16 3 26 7v7c0 7-4.3 12-10 15C10.3 26 6 21 6 14V7l10-4Z" />
          <path {...shared} d="m11.5 16 3 3 6-7" />
        </>
      )}
      {name === "food" && (
        <>
          <path {...shared} d="M16 28V12" />
          <path {...shared} d="M16 16C8 16 5 11 5 6c7 0 11 3 11 10Zm0 4c8 0 11-5 11-10-7 0-11 3-11 10Z" />
          <path {...shared} d="M10 28h12" />
        </>
      )}
      {name === "heat" && (
        <>
          <path {...shared} d="M17 3c2 6-3 7-1 12 1-3 4-4 5-7 5 5 7 10 5 15a11 11 0 0 1-21-4c0-5 3-9 8-13-1 5 2 7 3 8 2-4 0-7 1-11Z" />
          <path {...shared} d="M16 18c2 3 4 4 3 7a4 4 0 0 1-8-1c0-2 2-4 5-6Z" />
        </>
      )}
      {name === "moon" && <path {...shared} d="M24.7 20.7A12 12 0 0 1 11.3 7.3 12 12 0 1 0 24.7 20.7Z" />}
      {name === "rocket" && (
        <>
          <path {...shared} d="M18 5c4-2 7-2 9-2 0 2 0 5-2 9l-8 9-7-7 8-9Z" />
          <circle cx="21" cy="8" r="2" fill="currentColor" />
          <path {...shared} d="m10 14-5 1-2 5 7-1m6 3-1 5-5 2 1-7" />
          <path {...shared} d="M8 23c-2 1-3 3-3 5 2 0 4-1 5-3" />
        </>
      )}
      {name === "radio" && (
        <>
          <rect {...shared} x="7" y="12" width="19" height="15" rx="4" />
          <path {...shared} d="m11 12 10-7M13 18h.1M18 18h.1M12 23h10" />
          <path {...shared} d="M5 8c2-2 4-3 7-3" />
        </>
      )}
      {name === "spark" && (
        <>
          <path {...shared} d="m16 3 3.2 9.8L29 16l-9.8 3.2L16 29l-3.2-9.8L3 16l9.8-3.2L16 3Z" />
          <path {...shared} d="m25 3 .9 2.1L28 6l-2.1.9L25 9l-.9-2.1L22 6l2.1-.9L25 3Z" />
        </>
      )}
      {name === "left" && <path {...shared} d="m19 7-9 9 9 9" />}
      {name === "right" && <path {...shared} d="m13 7 9 9-9 9" />}
      {name === "sound" && (
        <>
          <path {...shared} d="M5 13h5l7-6v18l-7-6H5v-6Z" />
          <path {...shared} d="M21 12a6 6 0 0 1 0 8m3-12a11 11 0 0 1 0 16" />
        </>
      )}
      {name === "mute" && (
        <>
          <path {...shared} d="M5 13h5l7-6v18l-7-6H5v-6Z" />
          <path {...shared} d="m22 13 6 6m0-6-6 6" />
        </>
      )}
      {name === "home" && (
        <>
          <path {...shared} d="m4 14 12-10 12 10" />
          <path {...shared} d="M7 12v15h18V12M13 27v-9h6v9" />
        </>
      )}
    </svg>
  );
}
