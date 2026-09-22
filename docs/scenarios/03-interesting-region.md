# Czech description

**Najdi zajímavou oblast**

Stroj zaznamenává jednu hodnotu za období a v každém období se hodnota posune o nezávislý náhodný krok. Žádný trend, žádný cyklus, žádný zlom. Graf přesto stoupá, zastavuje se a obrací, protože ukazuje průběžný součet — a oko v něm čte příběh.

Ještě před spuštěním stroje se zavazujeme k jedné analýze: otestovat změnu za prostřední třetinu záznamu. Potom začne hledání. Uživatel si sám vyznačí úsek, posouvá jeho okraje a hledá období, o kterém by stálo za to napsat větu; může si také nechat najít ten nejnápadnější ze všech 6 786 úseků. Stejný test, který u předem určeného období nenašel nic, u vybraného období hlásí nález. Monte Carlo simulace celého hledání a následný test na nových záznamech ukážou, co ten nález vydrží.

Hlavní pojmy: mnohonásobná porovnání, volnost výzkumníka, falešné objevy, výběr po pohledu na data.

# English description

**Find the Interesting Region**

A machine records one value per period, and each period the value moves by an independent random step. No trend, no cycle, no turning point. The chart still climbs, stalls and reverses, because it shows the running total — and the eye reads a story into it.

Before the machine is switched on we commit to one analysis: test the change across the middle third of the record. Then the search begins. The user marks a stretch of their own, drags its edges, and hunts for a period worth writing a sentence about; they can also have the most striking of all 6,786 stretches found for them. The same test that found nothing in the period fixed in advance reports a finding in the chosen one. A Monte Carlo simulation of the whole search, and then new records, show what the finding was worth.

Main concepts: multiple comparisons, researcher degrees of freedom, false discoveries, selection after seeing the data.

## Pedagogical goal

Three things, in order of how often they are confused:

- **A p-value is an answer to the question it was given.** Nothing in the arithmetic records which question that was, or how many others were asked first.
- **The size of the search is part of the result.** The same p = 0.001 means entirely different things coming from one pre-specified test and from the best of several thousand.
- **Structure in the picture is not structure in the process.** A running total of independent steps genuinely contains long smooth runs. Seeing one is not evidence; it is the shape randomness takes when it accumulates.

The secondary goal is continuity. The search has now run over a position (scenario 01), a model (scenario 02) and a stretch of time, and the mistake has been the same every time.

## Statistical mechanism

**1. The test is exact, and valid in isolation.** The steps are independent draws from `Normal(0, σ)` with σ **known**, because the simulation chooses it. For a window of `k` steps the total change `S` is the sum of those steps, so under the null

```text
z = S / (σ · √k)   ~   N(0, 1)     exactly
```

and the two-sided p-value is `erfc(|z|/√2)`. No large-sample argument is involved and nothing is estimated. Applied to a window fixed in advance, this test is right about the data 95% of the time at α = 0.05 — which the validation stage confirms empirically.

**2. The search is what breaks it.** Every contiguous stretch of at least five steps is a candidate: for a 120-period record that is **6,786** overlapping windows. The scan is exhaustive, so the window it returns really is the most extreme one, and the statistic that gets reported is `max |z|` over the family — a quantity whose null distribution has nothing to do with `N(0, 1)`.

**3. Correcting for the search.** The honest null distribution is that of the whole procedure: generate a fresh record with no trend, scan all 6,786 windows, keep the largest `|z|`, repeat 300 times. The adjusted p-value is `(1 + #{simulated ≥ observed}) / (1 + replications)`. On the default record this turns p < 0.001 into **0.176**, and the simulation also shows the search reaching p < 0.05 in **99.7%** of records with no trend at all. A procedure with a nominal 5% error rate, used this way, is wrong essentially always.

**4. Why the picture is so persuasive.** The steps are independent; the *levels* are not. `level_i` and `level_j` share `min(i, j)` steps of history, so the correlation between neighbouring levels is near one and the record is visually smooth. This is why the scenario tests the steps rather than the levels: a test applied directly to the levels would be invalid before any searching happened, and the point here is a test that is impeccable until the search is added.

## True data-generating process

```text
for each of n periods:
    step_i ~ Normal(0, σ)        independent of every other step
    level_i = level_{i-1} + step_i,  level_0 = 0

true drift = 0        in every period, everywhere in the record
```

Defaults: `n = 120` periods, `σ = 1`, `seed = 300009`, shortest searchable window 5 steps.

Every stretch of the record has exactly the same distribution as every other, so there is no interesting period to find — not a hidden one, not a subtle one, none.

The shortest window is capped at five steps to keep the marked stretch legible on the chart; the cap is not a statistical device, and the test is equally valid at any length.

Seeding follows the discipline of the earlier scenarios: separate seed roles for the observed record, the selection-null simulation, single fresh records and validation replications, so that the record used to find a period is never reused to judge it.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the declared analysis (the middle third) and the declared question. Starts the machine. |
| Experiment | Changes the length of the record or the seed and watches the pre-registered stretch find nothing. |
| Observation | Drags either edge of their own window (mouse, touch or arrow keys) and watches the change, z and p follow; or presses "find the most striking period" to be handed the winner of all 6,786. |
| Analysis | Compares the two stretches under the identical test; runs 300 simulated searches; sees the five most striking periods those searches found in records with no trend. |
| Validation | Applies both frozen stretches to a new independent record; draws further records; runs 200 replications. |
| Conclusion | Four takeaways, plus why scanning is not the error. |

Both windows are tested identically at every stage. Nothing is withheld from the chosen one and nothing is added to it: the only difference the scenario ever introduces is *when the window was named*.

## Expected observation

With the default settings:

| | Change across it | z | p-value as usually reported |
| --- | --- | --- | --- |
| Periods 40–80, fixed in advance | 7.1 | 1.13 | 0.260 |
| Periods 31–41, chosen afterwards | −10.8 | −3.43 | < 0.001 |

and then:

- adjusted for the search: **p = 0.176**, with the search reaching p < 0.05 in **99.7%** of records with no trend;
- the five most striking simulated searches: |z| between 4.0 and 4.4, every one of them p < 0.001, all in records with no trend;
- on a new record: the chosen stretch changes by −5.1, p = 0.105 — unremarkable;
- over 200 replications: average |z| of **0.84** for the pre-registered stretch and **0.83** for the chosen one, called significant **5.0%** and **6.5%** of the time. Both are back at the error rate the test was always entitled to;
- re-running the search on each new record lands on a period that does not even overlap the original one **83%** of the time, and its winner averages |z| = 2.93.

The numbers move with the seed; the pattern does not.

## Explanation

The record is a running total of independent steps. Adding independent numbers produces something that wanders: it leaves where it started, drifts a long way, turns around and drifts again. Every long smooth run in the chart is real, in the sense that it is genuinely there in the data — and none of it is caused by anything.

A window chosen after seeing that chart is the winner of a competition with thousands of entrants, and the p-value was never told the competition happened. This is not a flaw in the p-value. It answered the question "how unusual is this change for a stretch fixed in advance?", and it answered it correctly; the question just was not the one being asked.

The correction is not a different formula. It is the honest null distribution: the distribution of the *winner* of the search, not of a single contestant. Once the reported number is measured against that, the finding is ordinary.

## Validation

Two forms, answering different questions:

1. **Adjusting for the search** (Monte Carlo, on the original record) — what does this search produce when nothing is there? Answer: something striking, essentially every time.
2. **Independent records** (new data, both windows frozen) — do those dates mean anything? Answer: no, and measurably so — the chosen stretch and the pre-registered one become indistinguishable, both sitting at the nominal 5% error rate.

The replication panel adds a third observation that neither p-value shows: re-running the search on new records finds its "interesting period" somewhere else 83% of the time. A result that moves whenever the data move was a property of the data, not of the process.

## Common misunderstanding

- **"That drop is obviously real — look at it."** It is real, in the sense of being present in the data. It has no cause, which is the only sense that matters for the conclusion being drawn.
- **"The test must be wrong."** The test is exact — the standard deviation is known rather than estimated, so the null distribution of z is standard normal with no approximation. The validation stage shows it hitting 5% on the nose when it is used as intended.
- **"So you should never look at data before deciding what to test."** Exploration is how hypotheses are generated. The requirement is that the search is reported, and that the result is judged either against the distribution of the search or on data the search never touched.
- **"Correcting for 6,786 tests will make it impossible to find anything."** The correction here is a Monte Carlo of the actual procedure, which accounts for the fact that overlapping windows are heavily dependent. A Bonferroni correction across 6,786 windows would be far more severe, and far too conservative.
- **"A longer record would settle it."** A longer record means more windows to search. The problem scales with the search, not against it.
- **"A random walk is a contrived example."** Prices, queue lengths, cumulative counts, sensor drift and population totals all accumulate. Records that are running totals are the normal case, not the exotic one.

## Implementation notes

```text
src/scenarios/03-interesting-region/
  Scenario.tsx                      stage machine and layout
  model.ts                          windows, limits, the pre-registered stretch, the candidate count
  simulation.ts                     true data-generating process, seed roles
  analysis.ts                       the window test, the exhaustive scan, Monte Carlo, validation
  components/SeriesPlot.tsx         the record, highlighted windows, draggable edges
  components/RecordControls.tsx     length of the record and seed
  components/SearchGallery.tsx      the most striking simulated searches, redrawn
  tests/                            model, simulation, analysis
```

New shared statistics, usable by later scenarios:

- `statistics/distributions/normal.ts` — `erf`, `erfc`, `normalCdf`, `normalTwoSidedTail`, `normalUpperTail`.
- `statistics/distributions/gamma.ts` — `regularizedGammaP` and `regularizedGammaQ`, added beside the existing `logGamma` and shared with the normal module.
- `statistics/hypothesis/zTest.ts` — the two-sided test of a sum for a known standard deviation.

**Tail accuracy.** `erfc` is computed from the incomplete gamma function directly rather than as `1 - erf`. A searched-for result routinely lands past |z| = 4, where `1 - erf` has thrown away most of its significant digits; a test asserts that `erfc(9)` is still a number while `1 - erf(9)` is exactly zero.

**Cost of the scan.** A window's change is a difference of two running totals, so each of the 6,786 candidates costs one subtraction. The full scan is a single pass over the pairs of endpoints, which makes 300 simulated searches cheap enough to run in the browser through `runChunked`.

**Redrawing a simulated search.** As in the earlier scenarios, a simulated search stores only its replication index and the window it chose; `selectionNullSeries` regenerates the exact record from the seed. A test asserts the round-trip reproduces the recorded z and change.

**The histogram bins |z|, not p.** With thousands of candidate windows the smallest p-value of a search is almost always minuscule, so a histogram of p-values would pile every simulation into the first bin and show nothing. The search statistic `max |z|` spreads out properly, and the two orderings are equivalent — a larger |z| is a smaller p.
