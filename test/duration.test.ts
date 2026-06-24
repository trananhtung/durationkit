import { parseDuration, tryParseDuration, DurationParseError, formatDuration, MS_PER } from "../src/index.js";

// ── parseDuration — unit strings ──────────────────────────────────────────────

describe("parseDuration — unit strings", () => {
  test("single unit: hours", () => {
    expect(parseDuration("2h")).toBe(2 * MS_PER.hour);
  });

  test("single unit: minutes", () => {
    expect(parseDuration("30m")).toBe(30 * MS_PER.minute);
  });

  test("single unit: seconds", () => {
    expect(parseDuration("45s")).toBe(45 * MS_PER.second);
  });

  test("single unit: milliseconds", () => {
    expect(parseDuration("500ms")).toBe(500);
  });

  test("combined: 2h 30m", () => {
    expect(parseDuration("2h 30m")).toBe(2 * MS_PER.hour + 30 * MS_PER.minute);
  });

  test("combined: 1h 30m 15s", () => {
    expect(parseDuration("1h 30m 15s")).toBe(
      MS_PER.hour + 30 * MS_PER.minute + 15 * MS_PER.second
    );
  });

  test("combined: no spaces between units", () => {
    expect(parseDuration("2h30m15s")).toBe(
      2 * MS_PER.hour + 30 * MS_PER.minute + 15 * MS_PER.second
    );
  });

  test("long names: hours", () => {
    expect(parseDuration("2 hours")).toBe(2 * MS_PER.hour);
  });

  test("long names: 1 hour 30 minutes", () => {
    expect(parseDuration("1 hour 30 minutes")).toBe(MS_PER.hour + 30 * MS_PER.minute);
  });

  test("long names: mixed singular/plural", () => {
    expect(parseDuration("1 hour 30 minutes 15 seconds")).toBe(
      MS_PER.hour + 30 * MS_PER.minute + 15 * MS_PER.second
    );
  });

  test("fractional: 1.5 hours", () => {
    expect(parseDuration("1.5 hours")).toBe(1.5 * MS_PER.hour);
  });

  test("fractional: 0.5h", () => {
    expect(parseDuration("0.5h")).toBe(0.5 * MS_PER.hour);
  });

  test("aliases: hrs", () => {
    expect(parseDuration("2 hrs")).toBe(2 * MS_PER.hour);
  });

  test("aliases: mins", () => {
    expect(parseDuration("30 mins")).toBe(30 * MS_PER.minute);
  });

  test("aliases: secs", () => {
    expect(parseDuration("15 secs")).toBe(15 * MS_PER.second);
  });

  test("days", () => {
    expect(parseDuration("3 days")).toBe(3 * MS_PER.day);
  });

  test("weeks", () => {
    expect(parseDuration("2 weeks")).toBe(2 * MS_PER.week);
  });

  test("months", () => {
    expect(parseDuration("1 month")).toBe(MS_PER.month);
  });

  test("years", () => {
    expect(parseDuration("1 year")).toBe(MS_PER.year);
  });

  test("complex: 1y 2mo 3w 4d 5h 6m 7s", () => {
    expect(parseDuration("1y 2mo 3w 4d 5h 6m 7s")).toBe(
      MS_PER.year + 2 * MS_PER.month + 3 * MS_PER.week +
      4 * MS_PER.day + 5 * MS_PER.hour + 6 * MS_PER.minute + 7 * MS_PER.second
    );
  });

  test("negative: -2h", () => {
    expect(parseDuration("-2h")).toBe(-2 * MS_PER.hour);
  });

  test("positive sign: +30m", () => {
    expect(parseDuration("+30m")).toBe(30 * MS_PER.minute);
  });

  test("extra whitespace tolerated", () => {
    expect(parseDuration("  2h  30m  ")).toBe(2 * MS_PER.hour + 30 * MS_PER.minute);
  });
});

// ── parseDuration — colon notation ────────────────────────────────────────────

describe("parseDuration — colon notation", () => {
  test("HH:MM:SS", () => {
    expect(parseDuration("2:30:00")).toBe(2 * MS_PER.hour + 30 * MS_PER.minute);
  });

  test("H:MM:SS with leading zero seconds", () => {
    expect(parseDuration("1:30:45")).toBe(MS_PER.hour + 30 * MS_PER.minute + 45 * MS_PER.second);
  });

  test("MM:SS (no hours)", () => {
    expect(parseDuration("30:00")).toBe(30 * MS_PER.minute);
  });

  test("MM:SS with seconds", () => {
    expect(parseDuration("1:30")).toBe(MS_PER.minute + 30 * MS_PER.second);
  });

  test("H:MM:SS.mmm with milliseconds", () => {
    expect(parseDuration("1:30:45.500")).toBe(
      MS_PER.hour + 30 * MS_PER.minute + 45 * MS_PER.second + 500
    );
  });

  test("negative colon: -2:30:00", () => {
    expect(parseDuration("-2:30:00")).toBe(-(2 * MS_PER.hour + 30 * MS_PER.minute));
  });
});

// ── parseDuration — ISO 8601 ──────────────────────────────────────────────────

describe("parseDuration — ISO 8601", () => {
  test("PT90S", () => {
    expect(parseDuration("PT90S")).toBe(90 * MS_PER.second);
  });

  test("PT2H30M", () => {
    expect(parseDuration("PT2H30M")).toBe(2 * MS_PER.hour + 30 * MS_PER.minute);
  });

  test("P1DT2H30M", () => {
    expect(parseDuration("P1DT2H30M")).toBe(MS_PER.day + 2 * MS_PER.hour + 30 * MS_PER.minute);
  });

  test("P1Y2M3DT4H5M6S", () => {
    expect(parseDuration("P1Y2M3DT4H5M6S")).toBe(
      MS_PER.year + 2 * MS_PER.month + 3 * MS_PER.day +
      4 * MS_PER.hour + 5 * MS_PER.minute + 6 * MS_PER.second
    );
  });

  test("P1W (1 week)", () => {
    expect(parseDuration("P1W")).toBe(MS_PER.week);
  });

  test("lowercase: pt2h30m", () => {
    expect(parseDuration("pt2h30m")).toBe(2 * MS_PER.hour + 30 * MS_PER.minute);
  });
});

// ── tryParseDuration ──────────────────────────────────────────────────────────

describe("tryParseDuration", () => {
  test("valid input returns ms", () => {
    expect(tryParseDuration("2h")).toBe(2 * MS_PER.hour);
  });

  test("invalid input returns null", () => {
    expect(tryParseDuration("not-a-duration")).toBeNull();
  });

  test("empty string returns null", () => {
    expect(tryParseDuration("")).toBeNull();
  });
});

// ── DurationParseError ────────────────────────────────────────────────────────

describe("DurationParseError", () => {
  test("thrown for unrecognized input", () => {
    expect(() => parseDuration("invalid")).toThrow(DurationParseError);
  });

  test("error message includes input", () => {
    try { parseDuration("foo"); } catch (e) {
      expect((e as Error).message).toContain("foo");
    }
  });

  test("empty string throws", () => {
    expect(() => parseDuration("")).toThrow(DurationParseError);
  });
});

// ── formatDuration — compact ──────────────────────────────────────────────────

describe("formatDuration — compact (default)", () => {
  test("zero → 0s", () => {
    expect(formatDuration(0)).toBe("0s");
  });

  test("pure milliseconds", () => {
    expect(formatDuration(500)).toBe("0s"); // below second threshold
  });

  test("1 second", () => {
    expect(formatDuration(1000)).toBe("1s");
  });

  test("90 seconds", () => {
    expect(formatDuration(90000)).toBe("1m 30s");
  });

  test("2h 30m", () => {
    expect(formatDuration(9000000)).toBe("2h 30m");
  });

  test("exact hours", () => {
    expect(formatDuration(3 * MS_PER.hour)).toBe("3h");
  });

  test("1 day", () => {
    expect(formatDuration(MS_PER.day)).toBe("1d");
  });

  test("complex duration", () => {
    const ms = MS_PER.day + 2 * MS_PER.hour + 30 * MS_PER.minute + 15 * MS_PER.second;
    expect(formatDuration(ms)).toBe("1d 2h 30m 15s");
  });

  test("maxParts=2", () => {
    const ms = MS_PER.day + 2 * MS_PER.hour + 30 * MS_PER.minute;
    expect(formatDuration(ms, { maxParts: 2 })).toBe("1d 2h");
  });

  test("maxParts=1", () => {
    const ms = 2 * MS_PER.hour + 30 * MS_PER.minute;
    expect(formatDuration(ms, { maxParts: 1 })).toBe("2h");
  });

  test("negative duration", () => {
    expect(formatDuration(-9000000)).toBe("-2h 30m");
  });

  test("custom separator", () => {
    expect(formatDuration(9000000, { separator: ", " })).toBe("2h, 30m");
  });

  test("smallestUnit = millisecond", () => {
    expect(formatDuration(1500, { smallestUnit: "millisecond" })).toBe("1s 500ms");
  });

  test("largestUnit = hour (days not shown)", () => {
    const ms = 25 * MS_PER.hour;
    expect(formatDuration(ms, { largestUnit: "hour" })).toBe("25h");
  });
});

// ── formatDuration — long ─────────────────────────────────────────────────────

describe("formatDuration — long", () => {
  test("2h 30m → 2 hours 30 minutes", () => {
    expect(formatDuration(9000000, { style: "long" })).toBe("2 hours 30 minutes");
  });

  test("1h → 1 hour (singular)", () => {
    expect(formatDuration(MS_PER.hour, { style: "long" })).toBe("1 hour");
  });

  test("1m → 1 minute", () => {
    expect(formatDuration(MS_PER.minute, { style: "long" })).toBe("1 minute");
  });

  test("1s → 1 second", () => {
    expect(formatDuration(MS_PER.second, { style: "long" })).toBe("1 second");
  });

  test("1ms → 1 millisecond", () => {
    expect(formatDuration(1, { style: "long", smallestUnit: "millisecond" })).toBe("1 millisecond");
  });

  test("zero → 0 seconds", () => {
    expect(formatDuration(0, { style: "long" })).toBe("0 seconds");
  });
});

// ── formatDuration — colon ────────────────────────────────────────────────────

describe("formatDuration — colon", () => {
  test("2:30:00", () => {
    expect(formatDuration(9000000, { style: "colon" })).toBe("2:30:00");
  });

  test("MM:SS for durations under 1 hour", () => {
    expect(formatDuration(45000, { style: "colon" })).toBe("00:45");
  });

  test("padHours=true → 02:30:00", () => {
    expect(formatDuration(9000000, { style: "colon", padHours: true })).toBe("02:30:00");
  });

  test("with ms", () => {
    expect(formatDuration(9000500, { style: "colon", smallestUnit: "millisecond" })).toBe("2:30:00.500");
  });

  test("negative → -2:30:00", () => {
    expect(formatDuration(-9000000, { style: "colon" })).toBe("-2:30:00");
  });
});

// ── formatDuration — ISO ──────────────────────────────────────────────────────

describe("formatDuration — ISO", () => {
  test("PT2H30M", () => {
    expect(formatDuration(9000000, { style: "iso" })).toBe("PT2H30M");
  });

  test("PT90S", () => {
    expect(formatDuration(90000, { style: "iso" })).toBe("PT1M30S");
  });

  test("P1DT2H30M", () => {
    const ms = MS_PER.day + 2 * MS_PER.hour + 30 * MS_PER.minute;
    expect(formatDuration(ms, { style: "iso" })).toBe("P1DT2H30M");
  });

  test("PT0S for zero", () => {
    expect(formatDuration(0, { style: "iso" })).toBe("PT0S");
  });

  test("P1W for 1 week", () => {
    expect(formatDuration(MS_PER.week, { style: "iso" })).toBe("P1W");
  });
});

// ── Round-trip ────────────────────────────────────────────────────────────────

describe("round-trip", () => {
  const cases = [
    "2h 30m",
    "1d 2h",
    "3h",
    "45s",
    "1h 30m 15s",
  ];

  test.each(cases)("parse → format → same: %s", (str) => {
    const ms = parseDuration(str);
    expect(formatDuration(ms)).toBe(str);
  });

  test("ISO round-trip: PT2H30M", () => {
    const ms = parseDuration("PT2H30M");
    expect(formatDuration(ms, { style: "iso" })).toBe("PT2H30M");
  });
});

// ── MS_PER constants ──────────────────────────────────────────────────────────

describe("MS_PER constants", () => {
  test("second = 1000", () => expect(MS_PER.second).toBe(1000));
  test("minute = 60000", () => expect(MS_PER.minute).toBe(60000));
  test("hour = 3600000", () => expect(MS_PER.hour).toBe(3600000));
  test("day = 86400000", () => expect(MS_PER.day).toBe(86400000));
  test("week = 7 * day", () => expect(MS_PER.week).toBe(7 * MS_PER.day));
});
