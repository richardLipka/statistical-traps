# Statistical Traps · Statistické pasti

**Finding Patterns in Data / Hledání vzorů v datech**

An interactive educational simulation about how easily an apparently meaningful pattern can be found in random data — and why finding a pattern is not the same as showing that it is real.

**[Open the application →](https://richardlipka.github.io/statistical-traps/)**

Built for teaching scientific methodology, statistics, data analysis, and the limits of automated pattern discovery, including AI/ML systems.

The recurring structure of every scenario:

```text
DATA
  ↓
search for an interesting pattern
  ↓
apparently convincing result
  ↓
test on new, independent data
  ↓
the pattern weakens or disappears
```

This is **not** an argument against statistics, data mining or machine learning. Searching data for patterns is a normal part of research. The error is confusing pattern discovery with hypothesis confirmation.

## Status

**Early version.** The foundation and the first three scenarios are finished and tested; the remaining scenarios are planned and listed in the application as not yet implemented. Content, wording and defaults may still change.

| # | Scenario | State |
| --- | --- | --- |
| 01 | Kreslení terče kolem šipek / Drawing the Target Around the Darts | **implemented** |
| 02 | Najdi nejlepší přímku / Find the Best Line | **implemented** |
| 03 | Najdi zajímavou oblast / Find the Interesting Region | **implemented** |
| 04 | Lékař s neobvykle vysokou úmrtností / The Doctor With Unusually High Mortality | planned |
| 05 | Zázračný lék / The Miracle Drug | planned |
| 06 | Záhadná korelace / The Mysterious Correlation | planned |
| 07 | Co z toho plyne pro AI? / What Does This Mean for AI? | planned |

Scenarios are implemented one at a time, each tested and documented before the next begins.

## Running it

```bash
npm install
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm test` | Test suite (Vitest) |
| `npm run build` | Type-check and produce the static site in `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |

The build is a plain static site with a relative base path: `dist/` can be served from any directory, with no server configuration.

## Languages

Czech (`cs`) and English (`en`), switchable instantly from the header without a reload. Every user-facing string exists in both languages; a test enforces that the two key sets stay identical, including interpolation placeholders. Numbers and p-values are formatted per language (Czech uses a decimal comma).

## Simulated data only

Every data set in the application is generated in the browser from a seed. Nothing is taken from real studies, hospitals, patients or people, and no empirical real-world statistic is invented for a scenario. The same seed always reproduces the same data, and independent data sets are derived from separate seeds so that the sample used to *find* a pattern is never reused to *validate* it.

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — structure, scenario contract, statistics layer, visual language, testing
- [`docs/scenarios/`](docs/scenarios) — one document per scenario, Czech and English
- [`CLAUDE.md`](CLAUDE.md) — development guide and rules for contributions

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4, i18next. No backend, no database, no chart library — the visualizations are hand-written SVG.
