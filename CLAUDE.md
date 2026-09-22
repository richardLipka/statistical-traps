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
```

Next step: Scenario 03 — Find the Interesting Region, when explicitly requested.

Do not implement Scenario 03 or later until explicitly requested.

Conventions established by the foundation, to be reused rather than reinvented:

* Lifecycle stages come from `src/scenarios/types.ts`; later stages stay locked until reached.
* Shared components: `ScenarioShell`, `StepIndicator`, `ExplanationPanel`, `ReplicationPanel`, `ResultTable`, `FlowDiagram`, `ui/*`, `visualization/Histogram`.
* Visual language (`src/index.css`, `src/components/ui/tone.ts`): **preset** = fixed before the data, **posthoc** = chosen after seeing the data, **fresh** = new independent data. Reuse these tones in every scenario.
* Seeding: derive independent data sets with `deriveSeed`, and keep separate seed roles so that exploration data is never reused for validation.
* Long simulations run through `runChunked` so the interface stays responsive.
* Both scenarios follow the same arc, and a third should too: a pre-registered analysis, a search the user performs themselves, the identical test applied to both, a Monte Carlo correction that simulates the whole search, a gallery of what that search finds in data with no effect, and finally independent data.
* Statistics already available: seeded RNG, binomial and F distributions, exact binomial and overall F tests, least squares (Householder QR) and polynomial fitting, R²/RMSE/correlation, Monte Carlo p-values in both directions, integer and continuous histograms.
* Charts already available: `visualization/Histogram` (labelled columns, one highlighted) and `visualization/LineChart` (multi-series).
* Report no statistic rather than an invalid one when a test's assumptions do not hold.

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
    |   +-- cs/             common.ts, dartboard.ts
    |   +-- en/             common.ts, dartboard.ts
    |   +-- index.ts        i18next setup, language detection and persistence
    |   +-- resources.ts    languages, namespaces, resource map
    |   +-- keys.ts         keys built from registry data
    |   +-- i18next.d.ts    type-checked translation keys
    |
    +-- scenarios/
    |   +-- types.ts        lifecycle stages and the scenario contract
    |   +-- registry.ts     the only file that knows which scenarios exist
    |   +-- 01-dartboard/
    |       +-- Scenario.tsx
    |       +-- model.ts
    |       +-- simulation.ts
    |       +-- analysis.ts
    |       +-- components/
    |       +-- tests/
    |
    +-- statistics/
    |   +-- random/rng.ts
    |   +-- distributions/binomial.ts
    |   +-- hypothesis/binomialTest.ts
    |   +-- monteCarlo.ts
    |   +-- tests/
    |
    +-- utils/              geometry, format, cn, chunked
    +-- visualization/      Histogram
    +-- test/               Vitest setup
    +-- index.css           Tailwind import and semantic colour tokens
    +-- main.tsx
```
