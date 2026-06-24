import { MS_PER, UNIT_ORDER, UNIT_LABELS, UnitName } from "./units.js";

// ── Types ─────────────────────────────────────────────────────────────────────

export type FormatStyle = "compact" | "long" | "colon" | "iso";

export interface FormatOptions {
  /** Output style. Default: "compact" */
  style?: FormatStyle;
  /** Maximum number of parts to include. Default: all non-zero parts */
  maxParts?: number;
  /** Smallest unit to include. Default: "second" for colon/compact/long, "millisecond" for iso */
  smallestUnit?: UnitName;
  /** Largest unit to include. Default: "year" */
  largestUnit?: UnitName;
  /** Separator between parts (compact/long only). Default: " " */
  separator?: string;
  /** Zero-pad hours in colon style. Default: false */
  padHours?: boolean;
}

// ── formatDuration ────────────────────────────────────────────────────────────

/**
 * Format a millisecond duration as a human-readable string.
 *
 * @example
 * formatDuration(9000000)                  // "2h 30m"
 * formatDuration(9000000, {style:"long"})  // "2 hours 30 minutes"
 * formatDuration(9000000, {style:"colon"}) // "2:30:00"
 * formatDuration(9000000, {style:"iso"})   // "PT2H30M"
 * formatDuration(90061000, {maxParts:2})   // "1d 1h"
 */
export function formatDuration(ms: number, opts: FormatOptions = {}): string {
  const {
    style = "compact",
    maxParts,
    smallestUnit = style === "iso" ? "millisecond" : "second",
    largestUnit = "year",
    separator = " ",
    padHours = false,
  } = opts;

  const negative = ms < 0;
  let remaining = Math.abs(ms);

  // Determine the unit range
  const largestIdx = UNIT_ORDER.indexOf(largestUnit);
  const smallestIdx = UNIT_ORDER.indexOf(smallestUnit);
  const units = UNIT_ORDER.slice(largestIdx, smallestIdx + 1);

  const parts: Array<{ value: number; unit: UnitName }> = [];
  for (const unit of units) {
    const perUnit = MS_PER[unit];
    const value = Math.floor(remaining / perUnit);
    remaining %= perUnit;
    if (value > 0) parts.push({ value, unit });
  }

  // Handle zero
  if (parts.length === 0) {
    const zeroUnit = smallestUnit;
    parts.push({ value: 0, unit: zeroUnit });
  }

  // Apply maxParts
  const limited = maxParts !== undefined ? parts.slice(0, maxParts) : parts;

  const prefix = negative ? "-" : "";

  if (style === "colon") {
    return prefix + formatColon(limited, padHours);
  }

  if (style === "iso") {
    return formatISO(ms);
  }

  const formatted = limited.map(({ value, unit }) => {
    if (style === "long") {
      const label = value === 1 ? UNIT_LABELS[unit].singular : UNIT_LABELS[unit].plural;
      return `${value} ${label}`;
    }
    return `${value}${UNIT_LABELS[unit].short}`;
  });

  return prefix + formatted.join(separator);
}

function formatColon(parts: Array<{ value: number; unit: UnitName }>, padHours: boolean): string {
  // Build H:MM:SS or MM:SS or HH:MM:SS.mmm
  const unitMap = new Map<UnitName, number>();
  for (const { value, unit } of parts) unitMap.set(unit, value);

  const hasHours = unitMap.has("hour");
  const hasMs = unitMap.has("millisecond");

  const h = unitMap.get("hour") ?? 0;
  const m = unitMap.get("minute") ?? 0;
  const s = unitMap.get("second") ?? 0;
  const ms = unitMap.get("millisecond") ?? 0;

  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");

  let result: string;
  if (hasHours) {
    const hh = padHours ? String(h).padStart(2, "0") : String(h);
    result = `${hh}:${mm}:${ss}`;
  } else {
    result = `${mm}:${ss}`;
  }

  if (hasMs && ms > 0) {
    result += `.${String(ms).padStart(3, "0")}`;
  }

  return result;
}

function formatISO(ms: number): string {
  const negative = ms < 0;
  let remaining = Math.abs(ms);

  const years   = Math.floor(remaining / MS_PER.year);   remaining %= MS_PER.year;
  const months  = Math.floor(remaining / MS_PER.month);  remaining %= MS_PER.month;
  const weeks   = Math.floor(remaining / MS_PER.week);   remaining %= MS_PER.week;
  const days    = Math.floor(remaining / MS_PER.day);    remaining %= MS_PER.day;
  const hours   = Math.floor(remaining / MS_PER.hour);   remaining %= MS_PER.hour;
  const minutes = Math.floor(remaining / MS_PER.minute); remaining %= MS_PER.minute;
  const seconds = Math.floor(remaining / MS_PER.second); remaining %= MS_PER.second;

  let date = "";
  if (years)  date += `${years}Y`;
  if (months) date += `${months}M`;
  if (weeks)  date += `${weeks}W`;
  if (days)   date += `${days}D`;

  let time = "";
  if (hours)   time += `${hours}H`;
  if (minutes) time += `${minutes}M`;
  if (seconds || remaining > 0) {
    const totalSecs = seconds + remaining / 1000;
    time += totalSecs % 1 === 0 ? `${seconds}S` : `${totalSecs.toFixed(3)}S`;
  }

  const result = `P${date}${time ? `T${time}` : ""}`;
  // PT0S for zero duration
  return (result === "P" ? "PT0S" : result);
}
