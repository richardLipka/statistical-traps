# Statistical Traps — Development Guide

## 1. Project purpose

This project is an interactive educational simulation about statistical reasoning.

Its central question is:

> How easily can we find apparently meaningful patterns in data that are actually caused by randomness, selection, overfitting, or inappropriate analysis?

The project is intended for teaching:

* statistics,
* scientific methodology,
* data analysis,
* hypothesis testing,
* multiple comparisons,
* overfitting,
* replication,
* causal reasoning,
* and the limitations of automated pattern discovery and AI.

The project must remain educational rather than sensational.

The application should teach users to ask:

> "How was this pattern found, and would it survive an appropriate test on new data?"

## 2. Core pedagogical principle

The fundamental distinction is:

**Pattern discovery**

```text
data
  ↓
search
  ↓
interesting pattern
```

versus

**Confirmation**

```text
hypothesis
  ↓
new data
  ↓
predefined analysis
  ↓
evaluation
```

The project repeatedly demonstrates the danger of treating the first process as if it were the second.

The project must NOT teach:

> "Statistics is unreliable."

It must teach:

> "Statistics is useful, but the validity of a conclusion depends on how the hypothesis, data, analysis, and validation are connected."

## 3. Language requirements

The application is bilingual:

* Czech: `cs`
* English: `en`

Every user-visible string must exist in both languages.

Never write user-visible text directly inside components. Use centralized localization.

Examples of text that must be localized:

* scenario titles
* descriptions
* instructions
* buttons
* labels
* error messages
* statistical explanations
* conclusions
* tooltips
* chart labels
* accessibility labels

When adding a new feature, Czech and English localization must be added in the same change.

How this is implemented:

* i18next + react-i18next, with one namespace per scenario (`common`, `dartboard`, ...).
* Resources are TypeScript modules in `src/i18n/cs/` and `src/i18n/en/`.
* Keys are type-checked against the English resources (`src/i18n/i18next.d.ts`), so a typo fails the build.
* `src/i18n/i18n.test.ts` enforces parity: identical key sets, no empty strings, identical interpolation placeholders.
* Keys assembled at runtime from registry data go through `src/i18n/keys.ts`.
* Numbers are formatted with `src/utils/format.ts` (`Intl.NumberFormat` + the active language). Never use `toFixed` for user-facing numbers: Czech uses a decimal comma. p-values are floored at `< 0.001` rather than rounded to zero.
* Switching the language must never reload the page or reset scenario state.

## 4. Architecture

### Technology

* Vite, React, TypeScript, Tailwind CSS, i18next / react-i18next, Vitest.
* No backend, no database, no router library: routing is a small hash router (`src/app/useHashRoute.ts`), which keeps the build a static site openable from any path.
* Visualizations are hand-written SVG. Do not add a charting library unless a scenario genuinely needs one.
* Imports use the `@/` alias for `src/`.
* Do not introduce further dependencies when the existing stack can solve the problem.

### Layout

The project is organized around independent educational scenarios.

Generic application infrastructure:

```text
src/
  app/            shell, routing, home page, scenario page
  components/     generic UI shared by scenarios (ui/ holds the primitives)
  i18n/           cs/ and en/ resources, one namespace per scenario
  scenarios/      types.ts, registry.ts, one directory per scenario
  statistics/     seeded RNG, distributions, hypothesis tests, Monte Carlo
  utils/          geometry, formatting, class names, chunked execution
  visualization/  reusable SVG charts
  test/           Vitest setup
```

Tests are colocated with the code they cover: `src/**/tests/*.test.ts` for a module group, or `*.test.ts` next to a single module.

Scenario-specific code belongs inside:

```text
src/scenarios/<scenario-id>/
```

A scenario may contain:

```text
Scenario.tsx
model.ts
simulation.ts
analysis.ts
components/
types.ts
tests/
```

Do not put scenario-specific statistical algorithms into generic components.

## 5. Scenario interface

All scenarios should follow the same conceptual lifecycle:

```text
INTRODUCTION
     ↓
EXPERIMENT
     ↓
OBSERVATION
     ↓
ANALYSIS
     ↓
VALIDATION
     ↓
CONCLUSION
```

A scenario does not have to expose these as separate pages. They may be represented as panels, steps, tabs, or an interactive sequence. The important requirement is conceptual consistency.

The user should always understand:

1. What was generated?
2. What did I do with the data?
3. What pattern did I find?
4. Why might it look convincing?
5. What happens when I test it properly?

## 6. Scenario registry

Scenarios must be registered centrally.

Adding a scenario should require:

1. creating its scenario directory;
2. implementing the scenario interface;
3. adding localization;
4. adding documentation;
5. registering the scenario.

Do not modify unrelated scenarios.

Do not create scenario-specific routing logic outside the scenario registry.

## 7. Current scenario order

The intended implementation order is:

```text
01  The Dartboard
02  The Best Line
03  Find the Interesting Region
04  The Doctor With Unusually High Mortality
05  The Miracle Drug
06  The Mysterious Correlation
07  What Does This Mean for AI?
```

Only implement the next scenario when explicitly requested. Never implement future scenarios "for completeness".

## 8. Scenario descriptions

### 01 — The Dartboard

**Czech — Kreslení terče kolem šipek**

Náhodně generované zásahy umožní uživateli zvolit nebo posouvat terč tak, aby data vypadala přesvědčivě. Následné zopakování experimentu ukáže rozdíl mezi hypotézou stanovenou předem a hypotézou zvolenou podle výsledků.

**English — Drawing the Target Around the Darts**

Randomly generated dart impacts allow the user to choose or move a target so that the observed data appear convincing. Repeating the experiment demonstrates the difference between a hypothesis specified before seeing the data and a hypothesis selected after observing the results.

Main concepts:

* post-hoc hypothesis
* exploratory analysis
* confirmation
* replication

### 02 — The Best Line

**Czech — Najdi nejlepší přímku**

Náhodná data mohou mít na konkrétním vzorku zdánlivě přesvědčivý vztah. Uživatel hledá model, který dobře popisuje pozorovaná data, a potom jej testuje na nových datech.

**English — Find the Best Line**

Random data can show an apparently convincing relationship in a particular sample. The user searches for a model that describes the observed data well and then tests the model on new data.

Main concepts:

* overfitting
* model selection
* training data
* test data
* generalization

### 03 — Find the Interesting Region

**Czech — Najdi zajímavou oblast**

Uživatel hledá mezi mnoha možnými oblastmi dat tu, která vykazuje nejzajímavější rozdíl. Simulace ukazuje, že při dostatečném množství hledání lze najít neobvyklý výsledek i v náhodných datech.

**English — Find the Interesting Region**

The user searches among many possible regions of the data for one showing an unusually interesting difference. The simulation demonstrates that extensive searching can produce apparently unusual results even in random data.

Main concepts:

* multiple comparisons
* researcher degrees of freedom
* false discoveries
* selection

### 04 — The Doctor With Unusually High Mortality

**Czech — Lékař s neobvykle vysokou úmrtností**

Simulovaná nemocnice obsahuje více lékařů a pacientů. Jeden lékař může mít náhodou výrazně vyšší počet úmrtí. Další analýza ukáže vliv počtu porovnávaných lékařů a rozdílů mezi pacienty.

**English — The Doctor With Unusually High Mortality**

A simulated hospital contains multiple doctors and patients. One doctor may happen to have a substantially higher number of deaths. Further analysis demonstrates the effects of comparing many doctors and differences between patient populations.

Main concepts:

* multiple comparisons
* extreme values
* confounding
* risk adjustment
* investigation versus proof

**All data must be fictional/simulated.**

### 05 — The Miracle Drug

**Czech — Zázračný lék**

Simulovaná klinická studie zkoumá mnoho různých výsledků, přestože léčba ve skutečnosti nemá žádný účinek. Při dostatečném počtu testů lze náhodou nalézt statisticky neobvyklý výsledek.

**English — The Miracle Drug**

A simulated clinical study examines many different outcomes even though the treatment has no true effect. With enough tests, an apparently unusual result can occur by chance.

Main concepts:

* multiple testing
* false positives
* independent replication
* interpretation of p-values

### 06 — The Mysterious Correlation

**Czech — Záhadná korelace**

Algoritmus prohledává velké množství proměnných a hledá zajímavé korelace. Některé mohou vypadat velmi přesvědčivě, přestože v datech není žádný skutečný vztah. Nová data ukážou, zda nalezený vztah generalizuje.

**English — The Mysterious Correlation**

An algorithm searches many variables for interesting correlations. Some may appear highly convincing even though no true relationship exists in the underlying data. New data are used to determine whether the discovered relationship generalizes.

Main concepts:

* data mining
* correlation
* multiple comparisons
* replication
* prediction versus explanation

### 07 — What Does This Mean for AI?

**Czech — Co z toho plyne pro AI?**

Závěrečný syntetizující modul navazující na šest předchozích scénářů. Odlišuje objevování vzorů, predikci, generování hypotéz, testování hypotéz, kauzální inferenci a generalizaci. Schopnost nacházet vzory není totéž co schopnost určit, které vzory jsou skutečné.

**English — What Does This Mean for AI?**

A closing synthesis module building on the six preceding scenarios. It separates pattern discovery, prediction, hypothesis generation, hypothesis testing, causal inference and generalization. The ability to find patterns is not the same as the ability to establish which patterns are real.

Main concepts:

* pattern discovery
* hypothesis generation
* generalization
* causal inference
* independent replication

See section 9 for what this module must and must not say about AI.

## 9. AI interpretation

The project must distinguish between:

* discovering a pattern,
* generating a hypothesis,
* predicting observations,
* confirming a hypothesis,
* establishing causality.

AI/ML systems are allowed to search extensively for patterns. This is not itself a statistical error.

The error occurs when a pattern discovered through extensive search is presented as independently confirmed evidence without appropriate validation.

The final AI scenario should communicate:

> The ability to find patterns is not the same as the ability to establish which patterns are real.

## 10. Statistical correctness

All statistical demonstrations must be mathematically defensible. Do not use statistical terminology merely because it sounds convincing.

In particular:

* do not equate `p < 0.05` with "the hypothesis is true";
* do not equate statistical significance with practical significance;
* do not equate correlation with causation;
* do not call exploratory findings confirmed discoveries;
* do not imply that random data cannot contain apparently strong correlations;
* do not imply that every unusual observation is evidence of wrongdoing;
* do not imply that replication alone proves causality.

When an effect is simulated, document its true generating mechanism. Prefer simulations where the underlying truth is known.

For example:

```text
true effect = 0
```

is much more pedagogically useful than an unexplained arbitrary dataset.

## 11. Randomness and reproducibility

Use seeded random number generation where practical.

The simulation should support:

* reproducible examples for debugging;
* changing the seed to demonstrate variability;
* generating independent datasets.

Never accidentally reuse the same random sample as both training/exploration data and validation data when the scenario is supposed to demonstrate independent validation.

The distinction between:

```text
same data
```

and

```text
new independent data
```

must be explicit in the UI.

## 12. Visualization principles

This is an educational visualization project. Prefer direct visual representation over paragraphs of explanation.

Use:

* points,
* lines,
* circles,
* target areas,
* distributions,
* before/after views,
* animation where it clarifies the process.

Avoid decorative graphics that do not communicate data or concepts.

Every visualization should answer a specific question. The user should be able to see the statistical problem before reading its explanation.

## 13. UX principles

Each scenario should have a simple progression:

```text
What is happening?
        ↓
Try it yourself
        ↓
What did you find?
        ↓
Now test it
        ↓
What changed?
        ↓
What should we learn?
```

Do not expose all explanations immediately. Let the user discover the surprising result first. The explanation should come after the experience.

Avoid excessive controls. Every control must have an educational purpose.

## 14. Scenario independence

Each scenario must be independently understandable. A user may open Scenario 4 without having completed Scenarios 1–3.

However, the scenarios should become progressively more sophisticated.

Use a consistent visual language so that the user recognizes the same underlying problem in different contexts.

## 15. Documentation

Every scenario must have a corresponding document:

```text
docs/scenarios/
  01-dartboard.md
  02-best-line.md
  03-interesting-region.md
  04-doctor-mortality.md
  05-miracle-drug.md
  06-mysterious-correlation.md
  07-ai-synthesis.md
```

Documents for scenarios that are not implemented yet exist as placeholders holding the Czech and English descriptions plus the section headings. The remaining sections are written together with the scenario.

Each document must contain:

```text
# Czech description

# English description

## Pedagogical goal

## Statistical mechanism

## True data-generating process

## User interaction

## Expected observation

## Explanation

## Validation

## Common misunderstanding

## Implementation notes
```

## 16. Development discipline

Implement the project incrementally.

For every task:

1. inspect the current code;
2. understand existing abstractions;
3. identify reusable components;
4. make the smallest coherent change;
5. test;
6. run the production build;
7. check both languages;
8. update documentation.

Do not perform broad refactoring unless explicitly requested.

Do not rewrite working code to introduce personal stylistic preferences.

Do not implement future scenarios prematurely.

## 17. Definition of done

A scenario is complete only when:

* it has Czech and English content;
* it follows the common scenario lifecycle;
* its simulation has a known underlying truth;
* its statistical interpretation is correct;
* the user can perform the experiment;
* the user can test the result on appropriate data;
* the key lesson is visible without reading source code;
* the scenario works on desktop and reasonable smaller screens;
* tests pass;
* production build succeeds;
* documentation exists.

## 18. Before every implementation

Before coding a new scenario, Claude Code should briefly identify:

```text
1. Pedagogical goal
2. True data-generating process
3. User interaction
4. Statistical mechanism
5. Validation method
6. Reusable existing components
7. New components required
```

Then implement only that scenario.

If a requirement is ambiguous and could affect statistical correctness, stop and ask for clarification rather than inventing the statistical model.

## 19. Current development state

Completed:

```text
Foundation        application shell, routing, localization, scenario registry,
                  shared components, statistics layer, tests, documentation
  ↓
Scenario 01       The Dartboard — complete (six-stage lifecycle, exhaustive
                  post-hoc search, Monte Carlo correction for the search,
                  independent replication)
  ↓
Scenario 02       The Best Line — complete (hand-drawn line, least-squares fit,
                  search over model flexibility with R² and F-test per degree,
                  Monte Carlo correction for the search, out-of-sample
                  validation and the fit-against-prediction curve)
  ↓
Scenario 03       Find the Interesting Region — complete (random walk with no
                  drift, exact z-test of a window with known sigma, user-dragged
                  window plus an exhaustive scan of all 6 786 of them, Monte
                  Carlo correction for the scan, validation on independent
                  records with both windows frozen)
  ↓
Scenario 04       The Doctor With Unusually High Mortality — complete (simulated
                  hospital where doctors differ in case mix but not in skill,
                  exact Poisson-binomial risk adjustment, then a Monte Carlo
                  correction for the search across all doctors, then later years
                  with both doctors frozen)
  ↓
Scenario 05       The Miracle Drug — complete (two-arm trial of a treatment with
                  no effect, 20 correlated outcomes, Welch t-test per outcome,
                  Bonferroni and Holm beside a Monte Carlo of the search that
                  comes out milder because the outcomes are correlated, then a
                  replication trial with both outcomes frozen)
  ↓
Scenario 06       The Mysterious Correlation — complete (60 independent columns,
                  an automated sweep of all 1 770 pairs, the flat histogram of
                  every pair's p-value as the centrepiece, Benjamini-Hochberg
                  beside a Monte Carlo of the sweep, then new rows where the
                  frozen line predicts worse than the mean)
  ↓
Scenario 07       What Does This Mean for AI? — complete (two finalists the
                  training data cannot tell apart, one of them genuinely
                  connected to the outcome through an unmeasured cause; the user
                  commits to a guess, the search correction rejects both, fresh
                  cases separate them, and an intervention shows the real one
                  predicts without causing)
```

The sequence is finished. Every scenario in section 7 is implemented, tested and
documented, and the registry contains no planned entries.

Work from here is revision rather than extension: wording, defaults, accessibility,
classroom use. Treat a request for an eighth scenario as a request to extend
section 7 first.

Conventions established by the foundation, to be reused rather than reinvented:

* Lifecycle stages come from `src/scenarios/types.ts`; later stages stay locked until reached.
* Shared components: `ScenarioShell`, `StepIndicator`, `ExplanationPanel`, `ReplicationPanel`, `ResultTable`, `FlowDiagram`, `ui/*`, `visualization/Histogram`.
* Visual language (`src/index.css`, `src/components/ui/tone.ts`): **preset** = fixed before the data, **posthoc** = chosen after seeing the data, **fresh** = new independent data. Reuse these tones in every scenario.
* Seeding: derive independent data sets with `deriveSeed`, and keep separate seed roles so that exploration data is never reused for validation.
* Long simulations run through `runChunked` so the interface stays responsive.
* Every scenario follows the same arc, and the next one should too: a pre-registered analysis, a search the user performs themselves, the identical test applied to both, a Monte Carlo correction that simulates the whole search, a gallery of what that search finds in data with no effect, and finally independent data.
* The structure of what was searched decides which correction fits. Scenario 05 correlates its outcomes, which makes Bonferroni too severe; scenario 06 keeps its columns independent, which makes Bonferroni right and the p-value histogram exactly flat. Say which case a scenario is in rather than implying one rule.
* Correcting for a search says "this data set has not established it", not "it is false". Scenario 07 exists partly to stop the first six leaving the impression that anything found by searching is noise: it rejects a real finding with the same correction that rejects a spurious one, and says so in the interface.
* Prediction and causation come apart, and only scenario 07 reaches that rung. Where a scenario can perform an intervention it should say plainly that this is possible because the world is simulated, and that collected data need an experiment instead.
* At the scale where a search is automated, the most useful thing to show is the distribution of every result rather than the winner. Under no effect p-values are uniform, so a flat histogram is what "nothing is there" looks like, and a reader can apply that diagnostic to somebody else's analysis without re-running it.
* Where a textbook correction exists, show it beside the simulated one rather than instead of it. Scenario 05 puts Bonferroni and Holm next to a Monte Carlo of the search and explains why they disagree: the outcomes are correlated, so Bonferroni charges for more independent chances than the search had. "Multiply by the number of tests" is a safe default, not the right answer.
* A scenario may correct a result more than once. Scenario 04 separates confounding (removed by risk adjustment) from selection (removed only by simulating the search), because "we adjusted for that" is routinely offered as though it answered both.
* When a scenario grants an analysis an advantage it would not have in reality - scenario 04 risk-adjusts with each patient's true risk - say so in the interface, not only in the documentation. The point survives better when the trap cannot be blamed on a weak analysis.
* Scenarios about people use numbered, generated individuals, and state in the introduction that nobody in them is real.
* A scenario may change the generator, but the null must stay exactly true: the point being taught is what a search does to a valid test, so the test must be valid before the search. Scenario 03 tests the independent steps of a random walk, not its correlated levels, for exactly this reason - a statistic that was already invalid would teach a different lesson.
* Statistics already available: seeded RNG, binomial, Poisson-binomial, F, t and normal distributions (including the regularized incomplete gamma and beta functions), exact binomial, Poisson-binomial risk-adjusted, overall F, Welch two-sample t, correlation and known-sigma z tests, Bonferroni, Holm and Benjamini-Hochberg adjustments, least squares (Householder QR) and polynomial fitting, R²/RMSE/correlation, Monte Carlo p-values in both directions, integer and continuous histograms.
* Charts already available: `visualization/Histogram` (labelled columns, one highlighted), `visualization/LineChart` (multi-series) and `visualization/ScatterPlot` (two measurements with an optional fitted line, passed as a function so the chart stays independent of the regression module).
* Report no statistic rather than an invalid one when a test's assumptions do not hold.
* Every scenario now opens with the "what this experiment is meant to show" card and carries the "what do these numbers mean?" panel; a new one is not finished without them.
* Write for a first-year student, not for someone who already knows the terms. Every scenario opens with a "what this experiment is meant to show" card - the point plus the three steps that will demonstrate it - and puts a collapsed "what do these numbers mean?" panel beside the first screen that shows a statistic. A scenario must be readable by somebody who has never met a p-value, because section 14 allows starting anywhere in the sequence.
* Czech is not a translation of the English: "term" in a model became "člen", which a beginner reads as a person, and "outcome" as "výsledek" collided with "výsledek" meaning result. Outcomes are "ukazatele", trial arms are "skupiny", and model terms are described rather than named. Check the Czech as prose, not as a mapping.
* No user-facing sentence may state a number that a slider can change. Interpolate it, or write around it.
* The localization parity test cannot catch a value a component forgets to pass to `t()`: both languages are equally wrong and the placeholder renders as text. `src/i18n/index.ts` records these through i18next's `missingInterpolationHandler`, and an application test asserts the list is empty after walking a scenario through the panels that only appear once a simulation has run. Check any new scenario the same way.
* A Monte Carlo histogram is binned on the statistic whose labels can be told apart, not necessarily on the p-value: scenarios 03 and 06 bin on |z| and |r| because the winning p-values all round to the same text. The correction is identical as long as the two order identically, which holds when every replication has the same sample size.
* The bundle is a single chunk and reached 612 kB (171 kB gzipped) with all seven scenarios. Loading scenario components lazily from the registry is the contained fix if it needs one.
* Nothing in the registry is `planned` any more, so the "not implemented yet" page has no route pointing at it. It is still reachable if an eighth entry is added, but no test covers it - the application test that used to was repointed at the not-found route.

After completing a development step, report:

* changed files;
* new files;
* tests;
* build status;
* current architecture;
* remaining work;
* recommended next step.

Then stop.

## 20. Project structure

```text
statistical-traps/
|
+-- CLAUDE.md
+-- README.md
+-- package.json
+-- vite.config.ts          Vite + Tailwind + Vitest configuration
+-- tsconfig*.json
|
+-- docs/
|   +-- architecture.md
|   +-- scenarios/
|       +-- 01-dartboard.md
|       +-- 02-best-line.md
|       +-- 03-interesting-region.md
|       +-- 04-doctor-mortality.md
|       +-- 05-miracle-drug.md
|       +-- 06-mysterious-correlation.md
|       +-- 07-ai-synthesis.md
|
+-- src/
    +-- app/                App, routes, useHashRoute, HomePage, ScenarioPage
    +-- components/
    |   +-- ui/             Button, Card, Badge, StatTile, SliderControl, tone
    |   +-- AppHeader.tsx
    |   +-- LanguageSwitcher.tsx
    |   +-- ScenarioShell.tsx
    |   +-- StepIndicator.tsx
    |   +-- ExplanationPanel.tsx
    |   +-- ReplicationPanel.tsx
    |   +-- ResultTable.tsx
    |   +-- FlowDiagram.tsx
    |
    +-- i18n/
    |   +-- cs/             one module per namespace, named after the scenario id
    |   +-- en/             without its number and hyphens (dartboard, bestline,
    |   |                   interestingregion, doctormortality, miracledrug,
    |   |                   mysteriouscorrelation, aisynthesis)
    |   +-- index.ts        i18next setup, language detection and persistence
    |   +-- resources.ts    languages, namespaces, resource map
    |   +-- keys.ts         keys built from registry data
    |   +-- i18next.d.ts    type-checked translation keys
    |
    +-- scenarios/
    |   +-- types.ts        lifecycle stages and the scenario contract
    |   +-- registry.ts     the only file that knows which scenarios exist
    |   +-- 01-dartboard/    Scenario.tsx, model.ts, simulation.ts,
    |   +-- 02-best-line/    analysis.ts, components/, tests/
    |   +-- 03-interesting-region/
    |   +-- 04-doctor-mortality/
    |   +-- 05-miracle-drug/
    |   +-- 06-mysterious-correlation/
    |   +-- 07-ai-synthesis/
    |
    +-- statistics/
    |   +-- random/rng.ts
    |   +-- distributions/   binomial.ts, poissonBinomial.ts, gamma.ts,
    |   |                    fDistribution.ts, normal.ts, studentT.ts
    |   +-- hypothesis/      binomialTest.ts, riskAdjustedTest.ts, fTest.ts,
    |                        zTest.ts, tTest.ts, correlationTest.ts,
    |                        multiplicity.ts
    |   +-- regression/      leastSquares.ts, goodnessOfFit.ts
    |   +-- monteCarlo.ts
    |   +-- tests/
    |
    +-- utils/              geometry, format, cn, chunked
    +-- visualization/      Histogram, LineChart, ScatterPlot
    +-- test/               Vitest setup
    +-- index.css           Tailwind import and semantic colour tokens
    +-- main.tsx
```
