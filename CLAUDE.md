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

## 4. Architecture

The project is organized around independent educational scenarios.

Generic application infrastructure:

```text
src/
  app/
  components/
  i18n/
  scenarios/
  statistics/
  visualization/
  utils/
```

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
```

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

The project starts with:

```text
Foundation
  ↓
Scenario 01 — The Dartboard
```

Do not implement Scenario 02 or later until explicitly requested.

After completing a development step, report:

* changed files;
* new files;
* tests;
* build status;
* current architecture;
* remaining work;
* recommended next step.

Then stop.

## 20. Suggested project structure

```text
statistical-traps/
│
├── CLAUDE.md
├── README.md
├── package.json
├── vite.config.ts
│
├── docs/
│   ├── architecture.md
│   └── scenarios/
│       ├── 01-dartboard.md
│       ├── 02-best-line.md
│       ├── 03-interesting-region.md
│       ├── 04-doctor-mortality.md
│       ├── 05-miracle-drug.md
│       └── 06-mysterious-correlation.md
│
├── src/
│   ├── app/
│   ├── components/
│   │   ├── ScenarioShell/
│   │   ├── StepIndicator/
│   │   ├── ExplanationPanel/
│   │   ├── ReplicationPanel/
│   │   └── ...
│   │
│   ├── i18n/
│   │   ├── cs/
│   │   └── en/
│   │
│   ├── statistics/
│   │   ├── distributions/
│   │   ├── hypothesis/
│   │   └── multipleTesting/
│   │
│   ├── scenarios/
│   │   ├── 01-dartboard/
│   │   ├── 02-best-line/
│   │   ├── 03-interesting-region/
│   │   ├── 04-doctor-mortality/
│   │   ├── 05-miracle-drug/
│   │   └── 06-mysterious-correlation/
│   │
│   └── main.tsx
│
└── tests/
```
