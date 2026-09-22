# Architecture

## What the application is

A static, client-only educational simulation. No backend, no database, no persistence beyond the chosen language in `localStorage`. Every data set the user sees is generated in the browser from a seed.

It is a **collection of scenarios**, not a collection of pages. Scenarios share a lifecycle, a visual language and a statistics layer; they differ only in what is being moved, chosen or searched.

## Stack

| Concern | Choice | Why |
| --- | --- | --- |
| Build | Vite 8 | Static output, fast dev server |
| UI | React 19 + TypeScript | Type-checked scenario contracts |
| Styling | Tailwind CSS 4 | Semantic tokens in one place (`src/index.css`) |
| Localization | i18next + react-i18next | Namespaces per scenario, instant switching |
| Tests | Vitest + Testing Library | Same resolver and aliases as the app |
| Charts | Hand-written SVG | A histogram and a line chart; no chart library needed yet |

Routing is a hash router of about twenty lines (`src/app/useHashRoute.ts`). It keeps the production build openable from any path, including `file://`, and avoids a dependency that would only serve a handful of routes.

## Directory layout

```text
src/
  app/            shell, routing, home page, scenario page
  components/     generic UI shared by all scenarios
    ui/           primitives (Button, Card, Badge, StatTile, SliderControl, tone tokens)
  i18n/           cs/ and en/ resources, one namespace per scenario
  scenarios/      types.ts, registry.ts, and one directory per scenario
  statistics/     seeded RNG, distributions, hypothesis tests, Monte Carlo helpers
  utils/          geometry, formatting, class names, chunked execution
  visualization/  reusable SVG charts
  test/           Vitest setup
docs/
  architecture.md
  scenarios/      one document per scenario
```

The rule that keeps this stable: **scenario-specific statistics never leave `src/scenarios/<id>/`, and generic infrastructure never learns about a specific scenario.** The only file that knows which scenarios exist is `src/scenarios/registry.ts`.

## Scenario contract

Every scenario follows the same conceptual lifecycle, defined once in `src/scenarios/types.ts`:

```text
INTRODUCTION → EXPERIMENT → OBSERVATION → ANALYSIS → VALIDATION → CONCLUSION
```

A scenario may render these as steps, panels or tabs; every scenario so far uses steps with a `StepIndicator`. Later stages stay locked until reached, so the surprising result is met before its explanation.

A registry entry is:

```ts
{
  id: '01-dartboard',          // directory name and route segment
  order: 1,
  status: 'available',         // or 'planned'
  titleKey, summaryKey,        // keys in the common namespace
  conceptKeys: [...],          // keys in common.concepts
  namespace: 'dartboard',      // the scenario's own i18n namespace:
                               // the id without its number and hyphens,
                               // which a registry test enforces
  docs: 'docs/scenarios/01-dartboard.md',
  component: DartboardScenario // omitted for planned scenarios
}
```

Planned scenarios are listed on the overview and get an honest "not implemented yet" page. Adding a scenario therefore means: create the directory, implement the component, add the namespace in both languages, write the document, add one registry entry. No existing scenario is touched.

## Statistics layer

`src/statistics/` holds everything that is not scenario-specific:

- `random/rng.ts` — `mulberry32`, plus `deriveSeed(base, index)` for independent data sets. Seeding is not a convenience here: the difference between *the same data* and *new independent data* is the subject being taught, so it must be explicit and reproducible.
- `distributions/gamma.ts` — `logGamma` and `logBeta`, shared by the other distributions.
- `distributions/binomial.ts` — log-space pmf and upper tail.
- `distributions/fDistribution.ts` — regularized incomplete beta (continued fraction) and the F upper tail.
- `distributions/poissonBinomial.ts` — the number of successes among independent trials that each have their own probability, by convolution. This is "expected deaths" once the individuals differ, and a binomial distribution is the wrong answer to it.
- `distributions/normal.ts` — `erf`, `erfc` and the normal tails, built on the regularized incomplete gamma function in `gamma.ts`. The two-sided tail is computed as `erfc(|z|/√2)` rather than from the distribution function: a searched-for result lands far enough into the tail that `2·(1 - Φ(|z|))` would have no significant digits left.
- `hypothesis/binomialTest.ts` — one-sided exact test, returning the observed count, the null probability, the expectation and the p-value.
- `hypothesis/fTest.ts` — overall F-test of a regression, which discounts every fitted parameter.
- `hypothesis/riskAdjustedTest.ts` — observed events against what these particular individuals' own risks predicted, with an exact Poisson-binomial p-value.
- `hypothesis/zTest.ts` — two-sided test of a sum for a known standard deviation. Exact rather than asymptotic, because the simulation chooses the standard deviation.
- `regression/leastSquares.ts` — Householder QR least squares and polynomial fitting. Not the normal equations: a degree-9 Vandermonde matrix is badly conditioned, and squaring it would leave a reported R² at the mercy of rounding error.
- `regression/goodnessOfFit.ts` — R² (negative out of sample when a model predicts worse than the mean), RMSE, correlation.
- `monteCarlo.ts` — empirical p-values with the `(1 + count) / (1 + replications)` correction, in both directions (large values extreme, or small ones as for p-values), integer and continuous histograms, mean, share.

Rules followed throughout: no statistical term is used decoratively; the true generating process of every simulation is documented; a value that is illustrative is labelled as illustrative. Where a test's assumptions do not hold - a line positioned by hand is not a least-squares fit - the application reports no p-value rather than a meaningless one.

## Localization

Two languages, `cs` and `en`, with complete parity enforced by a test (`src/i18n/i18n.test.ts`): identical key sets, no empty strings, identical interpolation placeholders. Translation keys are type-checked against the English resources through `src/i18n/i18next.d.ts`, so a typo fails the build.

No user-facing string is written inside a component. Numbers go through `src/utils/format.ts`, which uses `Intl.NumberFormat` with the active language — Czech gets a decimal comma, and p-values are floored at `< 0,001` rather than rounded to a dishonest zero.

Switching languages is instantaneous: no reload, no lost scenario state. `<html lang>` and the document title follow.

## Visualization

`src/visualization/` holds the reusable charts: `Histogram` (labelled columns with one bar optionally singled out) and `LineChart` (small multi-series chart). Neither knows anything about a scenario; each scenario maps its own values to labels and colours. Both, and the scenario-specific plots, break a curve where it leaves the visible range instead of flattening it against the edge - a clipped line would claim something untrue about the model.

## Visual language

Three tones carry meaning across every scenario and are defined once in `src/index.css`:

- **preset** (blue) — anything specified before the data were seen;
- **posthoc** (red) — anything chosen after looking at the data;
- **fresh** (green) — new, independent data used for validation.

`src/components/ui/tone.ts` maps those tokens to text, border, surface, dot and SVG stroke classes, so a chart and a badge agree without duplicating colour values.

## Testing

Tests live next to the code they cover (`src/**/tests/` or `*.test.ts` beside the module) and run in the same Vite resolver as the app.

What is covered today:

- RNG determinism, range and independence of derived seeds;
- binomial pmf/tail against exactly known values and against direct summation;
- Monte Carlo helpers;
- scenario 01 model, data-generating process, and analysis — including that the exhaustive search beats 400 random placements and a 150×150 grid search;
- the F distribution against tabulated critical values, and least squares against exactly solvable fits (a straight line, a quadratic, an interpolating degree-9 polynomial);
- scenario 02 model, data-generating process, and analysis — including that R² rises with flexibility while the p-value does not, that the search finds "significance" in noise far more often than 5%, and that the chosen model predicts new data worse than a flat line;
- scenario 03 model, data-generating process, and analysis — including that the scan really does return the most extreme window of all 6,786 (checked against a brute-force pass), that a record with no drift ends above its start about half the time, and that the search finds "significance" in over 90% of records with nothing in them
- the pedagogical claims themselves: searching inflates the statistic, the adjusted p-value is far larger than the naive one, every one of the best simulated searches would be reported as significant, and the advantage disappears on independent data;
- that validation always runs on fresh data, whichever way the user reaches the stage;
- registry consistency (unique ids, known concept keys, documentation paths, which scenarios are implemented);
- localization parity;
- the normal distribution and the z-test against tabulated values, including tail accuracy where `1 - erf` has run out of digits;
- the Poisson-binomial distribution against an exhaustive enumeration of every outcome, and against the binomial when every risk is equal;
- scenario 04 model, data-generating process, and analysis — including that doctors differ in case mix but not in skill, that the search flags somebody in most hospitals where no doctor differs, and that the flagged doctor returns to a ratio of 1 on later years;
- application-level walkthroughs of every implemented scenario in both languages.

## Commands

```bash
npm run dev      # dev server
npm test         # vitest run
npm run build    # tsc -b && vite build
npm run preview  # serve the production build
npm run lint     # oxlint
```
