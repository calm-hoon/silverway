const PATHS: Record<string, string> = {
  car:    "M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2",
  bus:    "M8 6v6 M16 6v6 M2 12h19.6 M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3",
  rain:   "M20 16.2A4.5 4.5 0 0 0 17.5 8h-1.8A7 7 0 1 0 4 14.9 M16 14v6 M8 14v6 M12 16v6",
  alert:  "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z M12 9v4 M12 17h.01",
  shield: "M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3Z m-11 9 2 2 4-4",
  pin:    "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z",
  users:  "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  back:   "m15 18-6-6 6-6",
  next:   "m9 18 6-6-6-6",
  clock:  "M12 6v6l4 2",
  check:  "m5 13 4 4L19 7",
  x:      "M18 6 6 18 M6 6l12 12",
  walk:   "M13 4a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z M9 20l3-6 2 2 3-2",
  share:  "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8 M16 6l-4-4-4 4 M12 2v13",
  train:  "M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-3 M8 21l4-4 4 4 M9 3h6 M9 13h6",
};

type IconProps = {
  name: string;
  size?: number;
  stroke?: number;
  color?: string;
  className?: string;
};

export function Icon({ name, size = 24, stroke, color = "currentColor", className }: IconProps) {
  const strokeWidth = stroke ?? (size >= 32 ? 1.75 : 2);
  const d = PATHS[name];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {d && <path d={d} />}
      {name === "car"   && <><circle cx="6.5"  cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></>}
      {name === "bus"   && <><circle cx="7"    cy="18"   r="2"/><circle cx="16" cy="18" r="2"/></>}
      {name === "pin"   && <circle cx="12" cy="10" r="3"/>}
      {name === "users" && <circle cx="9"  cy="7"  r="4"/>}
      {name === "clock" && <circle cx="12" cy="12" r="10"/>}
    </svg>
  );
}
