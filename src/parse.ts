import { MS_PER, ALIASES, UnitName } from "./units.js";

// ── Patterns ──────────────────────────────────────────────────────────────────

// "2h 30m 15s" / "1.5 hours" / "30 mins"
const UNIT_RE = /([+-]?\d+(?:\.\d+)?)\s*([a-z]+)/gi;

// "HH:MM:SS" or "H:MM:SS" or "MM:SS"
const COLON_RE = /^([+-])?(\d+):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;

// ISO 8601 duration: P1Y2M3DT4H5M6S (subset — no W in T part)
const ISO_RE =
  /^P(?:(\d+(?:\.\d+)?)Y)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i;

// ── Error ─────────────────────────────────────────────────────────────────────

export class DurationParseError extends Error {
  constructor(input: string) {
    super(`Cannot parse duration: "${input}"`);
    this.name = "DurationParseError";
  }
}

// ── parseDuration ─────────────────────────────────────────────────────────────

/**
 * Parse a human duration string to milliseconds.
 *
 * Supported formats:
 * - Unit strings: `"2h 30m"`, `"1.5 hours"`, `"30 mins 15 secs"`, `"500ms"`
 * - Colon notation: `"2:30:00"`, `"1:30"` (MM:SS)
 * - ISO 8601: `"P1DT2H30M"`, `"PT90S"`
 * - Signed: `"-2h"`, `"+30m"`
 *
 * @throws {DurationParseError} if the string cannot be parsed
 */
export function parseDuration(input: string): number {
  if (typeof input !== "string") throw new DurationParseError(String(input));
  const s = input.trim();
  if (!s) throw new DurationParseError(s);

  // ISO 8601
  if (s.toUpperCase().startsWith("P")) {
    return parseISO(s);
  }

  // Colon notation
  const colonMatch = COLON_RE.exec(s);
  if (colonMatch) {
    return parseColon(colonMatch);
  }

  // Unit string
  return parseUnits(s);
}

function parseISO(s: string): number {
  const m = ISO_RE.exec(s);
  if (!m) throw new DurationParseError(s);
  const [, years, months, weeks, days, hours, minutes, seconds] = m;
  return (
    (parseFloat(years  ?? "0") || 0) * MS_PER.year   +
    (parseFloat(months ?? "0") || 0) * MS_PER.month  +
    (parseFloat(weeks  ?? "0") || 0) * MS_PER.week   +
    (parseFloat(days   ?? "0") || 0) * MS_PER.day    +
    (parseFloat(hours  ?? "0") || 0) * MS_PER.hour   +
    (parseFloat(minutes?? "0") || 0) * MS_PER.minute +
    (parseFloat(seconds?? "0") || 0) * MS_PER.second
  );
}

function parseColon(m: RegExpExecArray): number {
  const sign = m[1] === "-" ? -1 : 1;
  // Groups: sign, p1, p2, p3 (optional seconds), p4 (optional ms)
  const p1 = parseInt(m[2], 10);
  const p2 = parseInt(m[3], 10);
  const p3 = m[4] !== undefined ? parseInt(m[4], 10) : undefined;
  const ms = m[5] !== undefined ? parseInt(m[5].padEnd(3, "0"), 10) : 0;

  if (p3 !== undefined) {
    // H:MM:SS[.mmm]
    return sign * (p1 * MS_PER.hour + p2 * MS_PER.minute + p3 * MS_PER.second + ms);
  } else {
    // M:SS
    return sign * (p1 * MS_PER.minute + p2 * MS_PER.second + ms);
  }
}

function parseUnits(s: string): number {
  // Detect leading sign for plain negative like "-2h30m"
  const sign = s.startsWith("-") ? -1 : 1;
  const stripped = s.replace(/^[+-]/, "");

  let total = 0;
  let matched = false;

  UNIT_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = UNIT_RE.exec(stripped)) !== null) {
    const value = parseFloat(m[1]);
    const alias = m[2].toLowerCase();
    const unit = ALIASES[alias];
    if (!unit) throw new DurationParseError(s);
    total += value * MS_PER[unit];
    matched = true;
  }

  if (!matched) throw new DurationParseError(s);
  return sign * total;
}

/**
 * Like `parseDuration` but returns `null` instead of throwing.
 */
export function tryParseDuration(input: string): number | null {
  try {
    return parseDuration(input);
  } catch {
    return null;
  }
}
