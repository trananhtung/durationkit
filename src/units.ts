// ── Unit definitions ──────────────────────────────────────────────────────────

export const MS_PER = {
  millisecond: 1,
  second:      1_000,
  minute:      60_000,
  hour:        3_600_000,
  day:         86_400_000,
  week:        604_800_000,
  month:       2_629_800_000,  // 30.4375 days — average calendar month
  year:        31_557_600_000, // 365.25 days
} as const;

export type UnitName = keyof typeof MS_PER;

export const UNIT_ORDER: UnitName[] = [
  "year", "month", "week", "day", "hour", "minute", "second", "millisecond",
];

// Alias → canonical unit name
export const ALIASES: Record<string, UnitName> = {
  // milliseconds
  ms: "millisecond", millisecond: "millisecond", milliseconds: "millisecond", msec: "millisecond",
  // seconds
  s: "second", sec: "second", secs: "second", second: "second", seconds: "second",
  // minutes
  m: "minute", min: "minute", mins: "minute", minute: "minute", minutes: "minute",
  // hours
  h: "hour", hr: "hour", hrs: "hour", hour: "hour", hours: "hour",
  // days
  d: "day", day: "day", days: "day",
  // weeks
  w: "week", wk: "week", wks: "week", week: "week", weeks: "week",
  // months
  mo: "month", mon: "month", mos: "month", month: "month", months: "month",
  // years
  y: "year", yr: "year", yrs: "year", year: "year", years: "year",
};

export const UNIT_LABELS: Record<UnitName, { singular: string; plural: string; short: string }> = {
  year:        { singular: "year",        plural: "years",        short: "y"  },
  month:       { singular: "month",       plural: "months",       short: "mo" },
  week:        { singular: "week",        plural: "weeks",        short: "w"  },
  day:         { singular: "day",         plural: "days",         short: "d"  },
  hour:        { singular: "hour",        plural: "hours",        short: "h"  },
  minute:      { singular: "minute",      plural: "minutes",      short: "m"  },
  second:      { singular: "second",      plural: "seconds",      short: "s"  },
  millisecond: { singular: "millisecond", plural: "milliseconds", short: "ms" },
};
