# durationkit

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

Bidirectional duration parsing and formatting. Parse `"2h 30m"`, `"1.5 hours"`, `"2:30:00"`, ISO 8601. Format ms to compact/long/colon/ISO. Zero dependencies, TypeScript.

[![npm](https://img.shields.io/npm/v/durationkit)](https://www.npmjs.com/package/durationkit)
[![npm downloads](https://img.shields.io/npm/dw/durationkit)](https://www.npmjs.com/package/durationkit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Why durationkit?

| Package | Problem |
|---------|---------|
| `ms` (350M/week) | Single units only: `"2h"` ✓ — `"2h 30m"` ✗ |
| `parse-duration` | No formatting, limited aliases |
| `humanize-duration` | **Feature-frozen** by maintainer (no new features) |
| `durationkit` | Parse + format, 4 styles, ISO 8601, TypeScript |

Inspired by Python's `pytimeparse`, Go's `time.ParseDuration`, Ruby's `ChronicDuration`.

## Install

```bash
npm install durationkit
```

## Quick start

```ts
import { parseDuration, formatDuration } from "durationkit";

// Parse → milliseconds
parseDuration("2h 30m")          // 9_000_000
parseDuration("1 hour 30 mins")  // 5_400_000
parseDuration("1.5 hours")       // 5_400_000
parseDuration("2:30:00")         // 9_000_000
parseDuration("PT2H30M")         // 9_000_000  (ISO 8601)

// Format → string
formatDuration(9_000_000)                    // "2h 30m"
formatDuration(9_000_000, {style:"long"})    // "2 hours 30 minutes"
formatDuration(9_000_000, {style:"colon"})   // "2:30:00"
formatDuration(9_000_000, {style:"iso"})     // "PT2H30M"
```

## Parsing

### Unit strings

```ts
parseDuration("2h 30m")               // combined units
parseDuration("2h30m15s")             // no spaces required
parseDuration("1 hour 30 minutes")    // long names
parseDuration("1.5 hours")            // fractional
parseDuration("500ms")                // milliseconds
parseDuration("3 days")               // days
parseDuration("2 weeks")              // weeks
parseDuration("1 year 2 months")      // calendar units
parseDuration("-2h 30m")              // negative
parseDuration("+30m")                 // explicit positive
parseDuration("1y 2mo 3w 4d 5h 6m 7s") // all units
```

**Supported aliases:**

| Unit | Aliases |
|------|---------|
| millisecond | `ms`, `msec`, `millisecond`, `milliseconds` |
| second | `s`, `sec`, `secs`, `second`, `seconds` |
| minute | `m`, `min`, `mins`, `minute`, `minutes` |
| hour | `h`, `hr`, `hrs`, `hour`, `hours` |
| day | `d`, `day`, `days` |
| week | `w`, `wk`, `wks`, `week`, `weeks` |
| month | `mo`, `mon`, `mos`, `month`, `months` |
| year | `y`, `yr`, `yrs`, `year`, `years` |

### Colon notation

```ts
parseDuration("2:30:00")       // H:MM:SS → 9_000_000
parseDuration("1:30")          // M:SS → 90_000
parseDuration("1:30:45.500")   // H:MM:SS.mmm
parseDuration("-2:30:00")      // negative
```

### ISO 8601

```ts
parseDuration("PT90S")             // 90s
parseDuration("PT2H30M")           // 2h 30m
parseDuration("P1DT2H30M")         // 1d 2h 30m
parseDuration("P1Y2M3DT4H5M6S")    // all parts
parseDuration("P1W")               // 1 week
```

### Safe parsing

```ts
import { tryParseDuration } from "durationkit";

tryParseDuration("2h 30m")     // 9_000_000
tryParseDuration("invalid")    // null  (no throw)
```

## Formatting

### Styles

```ts
const ms = 9_061_500; // 2h 30m 1s 500ms

formatDuration(ms)                      // "2h 30m 1s"      (compact, default)
formatDuration(ms, {style:"long"})      // "2 hours 30 minutes 1 second"
formatDuration(ms, {style:"colon"})     // "2:30:01"
formatDuration(ms, {style:"iso"})       // "PT2H30M1S"
```

### Options

```ts
// Limit parts
formatDuration(90_061_000, {maxParts: 2})          // "1d 1h"

// Custom separator
formatDuration(9_000_000, {separator: ", "})        // "2h, 30m"

// Include milliseconds
formatDuration(1_500, {smallestUnit: "millisecond"}) // "1s 500ms"

// Cap at hours (don't show days+)
formatDuration(25 * 3_600_000, {largestUnit: "hour"}) // "25h"

// Zero-pad hours in colon mode
formatDuration(9_000_000, {style:"colon", padHours:true}) // "02:30:00"

// Long style with maxParts
formatDuration(90_061_000, {style:"long", maxParts:2}) // "1 day 1 hour"
```

### FormatOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `style` | `"compact" \| "long" \| "colon" \| "iso"` | `"compact"` | Output format |
| `maxParts` | `number` | all | Max number of parts to show |
| `smallestUnit` | `UnitName` | `"second"` | Smallest unit to include |
| `largestUnit` | `UnitName` | `"year"` | Largest unit to include |
| `separator` | `string` | `" "` | Separator between compact/long parts |
| `padHours` | `boolean` | `false` | Zero-pad hours in colon style |

## Constants

```ts
import { MS_PER } from "durationkit";

MS_PER.second      // 1_000
MS_PER.minute      // 60_000
MS_PER.hour        // 3_600_000
MS_PER.day         // 86_400_000
MS_PER.week        // 604_800_000
MS_PER.month       // 2_629_800_000  (30.4375 days average)
MS_PER.year        // 31_557_600_000 (365.25 days)
```

## Error handling

```ts
import { DurationParseError } from "durationkit";

try {
  parseDuration("not-a-duration");
} catch (e) {
  if (e instanceof DurationParseError) {
    console.log(e.message); // 'Cannot parse duration: "not-a-duration"'
  }
}
```

## Contributors ✨

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome — code, docs, bug reports, ideas, reviews! See the [emoji key](https://allcontributors.org/docs/en/emoji-key) for how each contribution is recognized, and open a PR or issue to get involved.

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trananhtung"><img src="https://avatars.githubusercontent.com/u/30992229?v=4?s=100" width="100px;" alt="Tung Tran"/><br /><sub><b>Tung Tran</b></sub></a><br /><a href="https://github.com/trananhtung/durationkit/commits?author=trananhtung" title="Code">💻</a> <a href="#maintenance-trananhtung" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

MIT
