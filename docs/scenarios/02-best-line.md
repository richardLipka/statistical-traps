# Czech description

**Najdi nejlepší přímku**

Stroj vytváří dvojice čísel, jejichž souřadnice vznikají nezávisle na sobě: y je čistý šum, který nemá s x nic společného. Ještě před pohledem na data se zavazujeme k jedné analýze — proložit vzorkem přímku a otestovat ji.

Potom začne hledání. Uživatel si nejprve umístí vlastní přímku ručně, pak si nechá proložit tu nejlepší a nakonec prochází modely rostoucí pružnosti, ke každému vidí R² i p-hodnotu a vybírá si ten, který vypadá nejpřesvědčivěji. R² roste s pružností mechanicky; p-hodnota ne, a právě proto je výběr modelu skutečným hledáním. Monte Carlo simulace téhož hledání a následný test na nových datech ukážou, co nález vydrží.

Hlavní pojmy: přeučení, výběr modelu, trénovací data, testovací data, generalizace.

# English description

**Find the Best Line**

A machine produces pairs of numbers whose coordinates are drawn independently: y is pure noise with no connection to x. Before looking at anything, we commit to one analysis — fit a straight line through the sample and test it.

Then the search begins. The user first places a line by hand, then has the best straight line fitted, and finally walks through models of increasing flexibility, seeing R² and the p-value for each and picking whichever looks most convincing. R² rises with flexibility mechanically; the p-value does not, which is what makes model selection a genuine search. A Monte Carlo simulation of that same search, and then a test on new data, show what the finding was worth.

Main concepts: overfitting, model selection, training data, test data, generalization.

## Pedagogical goal

Separate three things that are routinely run together:

- **describing** the sample a model was built from (R², always improvable by flexibility);
- **testing** a model that was specified in advance (a valid p-value);
- **predicting** data the model has never seen (the only one that settles anything).

The secondary goal is to show that the selection trap of scenario 01 is not about geometry. The circle became a curve and the board became a space of models; the mistake is identical.

## Statistical mechanism

Three mechanisms are demonstrated separately.

**1. R² rises with flexibility for free.** A polynomial of degree d+1 contains every polynomial of degree d, so the least-squares fit can never get worse. On the default sample R² climbs from 0.01 (straight line) to 0.73 (degree 9) in data with no relationship at all. This is a property of the fitting, not evidence about the world.

**2. The F-test is not fooled by flexibility — it is fooled by the search.** The overall F-test

```text
F = (R² / p) / ((1 - R²) / (n - p - 1))
```

discounts every fitted parameter, so the most flexible model is not automatically the most significant one. On the default sample degree 9 has the highest R² (0.73) and an unremarkable p-value (0.24), while degree 3 has R² = 0.51 and p = 0.030. Because the p-value does not follow R², picking the degree with the smallest p-value is a real search over nine correlated tests — and the reported p-value describes only the winner.

**3. Correcting for the search.** The honest null distribution is that of the whole procedure: draw a fresh sample of pure noise, fit every degree from 1 to 9, keep the smallest p-value, repeat 300 times. The adjusted p-value is `(1 + #{simulated ≤ observed}) / (1 + replications)`. On the default sample this turns p = 0.030 into **0.100**, and the simulation also shows that the search finds something below 0.05 in about **20%** of pure-noise samples — a procedure with a nominal 5% error rate, used in a way that makes it wrong four times as often.

**4. Out-of-sample prediction.** The frozen models are applied to independent samples. R² measured there can be negative, and is: a model that followed the wobbles of one sample predicts the next one worse than claiming nothing.

## True data-generating process

```text
for each of n points:
    x ~ Uniform(0, 1)
    y ~ Normal(0, 1)          drawn independently of x

true relationship = none      (not linear, not curved, not monotone)
```

Defaults: `n = 16`, `seed = 4242`, degrees 1…9 available.

The highest degree offered is `min(9, n - 3)`, which keeps at least two residual degrees of freedom so the F-test stays defined, and avoids the degenerate fit that passes exactly through every point.

Seeding follows the same discipline as scenario 01: separate seed roles for the observed sample, the selection-null simulation, single fresh samples and validation replications, so that data used to find a model is never reused to validate it.

Fits are computed with Householder QR rather than the normal equations. A degree-9 Vandermonde matrix is badly conditioned and squaring it would leave the reported R² at the mercy of rounding error; the x values are also centred and scaled to [-1, 1] before fitting.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the declared analysis (one straight line) and the declared question. Draws the sample. |
| Experiment | Changes the sample size or seed and watches the pre-registered line find nothing. |
| Observation | Drags the two ends of their own line (mouse, touch or arrow keys) and watches R² respond; fits the best straight line; then picks among degrees 1–9, each shown with its R² and its p-value, or presses "pick the most convincing model". |
| Analysis | Compares the pre-registered line with the chosen model under the identical test; runs 300 simulated searches; sees the five most convincing models those searches found in pure noise. |
| Validation | Applies the three frozen models to a new independent sample; sees fit against prediction degree by degree; runs 200 replications. |
| Conclusion | Four takeaways, plus why flexible models are not the error. |

A hand-drawn line gets an R² but no p-value, and the scenario says why: the F-test assumes a least-squares fit. Advancing to the analysis stage therefore requires choosing one of the fitted models.

## Expected observation

With the default settings:

| | R² on the sample | p-value as usually reported |
| --- | --- | --- |
| Straight line, decided in advance | 0.01 | 0.656 |
| Degree 3, chosen after looking | 0.51 | 0.030 |

and then:

- adjusted for the search: **p = 0.100**, with the search finding p < 0.05 in **20%** of pure-noise samples;
- the five best simulated searches: R² between 0.61 and 0.95, p between < 0.001 and 0.008 — all in data with no relationship;
- on a new sample: flat line R² −0.29, pre-registered line −0.20, chosen model **−0.60** (prediction error 1.25 against a noise spread of 1.0);
- over 200 replications: average R² −0.08 / −0.11 / **−0.73**, and the chosen model predicts worse than claiming no relationship in **92%** of them.

The numbers move with the seed; the pattern does not.

## Explanation

R² answers "how close is this curve to these points?", which a flexible curve can always improve. It is a description of the fitting, not evidence about the process that made the data.

The p-value answers a different question, and answers it correctly for one model fixed in advance. Fitting nine models and reporting the smallest p-value is nine chances to be unlucky; the number that gets reported describes the last step of the procedure and not the procedure.

Prediction is what the original question was actually about. A model that reproduces the noise of one sample carries that noise into the next one, where it is simply wrong — which is why the chosen model ends up worse than a flat line that claims nothing.

## Validation

Two forms, as in scenario 01, answering different questions:

1. **Adjusting for the search** (Monte Carlo, on the original sample) — what does this search produce when nothing is there? Answer: p ≈ 0.03 quite regularly.
2. **Independent data** (new samples, models frozen) — does the model predict? Answer: worse than nothing, reliably.

The second is decisive, and it is also the practical remedy: a model chosen by comparing candidates should be judged on data that took no part in the comparison.

## Common misunderstanding

- **"R² = 0.51 means the model explains half of what is going on."** It means the curve is close to these 16 points. With nine candidate shapes and 16 points, that is what noise looks like.
- **"A more flexible model is a better model."** More flexibility guarantees a better fit to the sample and, absent a real signal, a worse prediction.
- **"The F-test failed."** The F-test answered the question it was given. It was given the wrong one.
- **"Negative R² must be a bug."** Out of sample it is a legitimate result: the model predicts worse than the mean of the data being predicted.
- **"Comparing models is cheating."** Model selection is normal practice. The requirements are that the comparison is reported, and that the winner is judged on data held out from it.
- **"A bigger sample would fix it."** More points make the fit less wild, but as long as the model is chosen from the same data the correction is still needed.

## Implementation notes

```text
src/scenarios/02-best-line/
  Scenario.tsx                      stage machine and layout
  model.ts                          ranges, defaults, model specs, degree limits
  simulation.ts                     true data-generating process, seed roles
  analysis.ts                       fits, F-tests, the degree search, Monte Carlo, validation
  components/DataPlot.tsx           scatter, curves, draggable line handles
  components/DegreePicker.tsx       every candidate model with its R² and p-value
  components/SampleControls.tsx     sample size and seed
  components/SearchGallery.tsx      the best simulated searches, redrawn
  tests/                            model, simulation, analysis
```

New shared statistics, usable by later scenarios:

- `statistics/regression/leastSquares.ts` — Householder QR least squares, polynomial fitting, prediction.
- `statistics/regression/goodnessOfFit.ts` — R², RMSE, correlation.
- `statistics/distributions/fDistribution.ts` — regularized incomplete beta and the F tail.
- `statistics/hypothesis/fTest.ts` — the overall F-test of a regression.
- `statistics/distributions/gamma.ts` — `logGamma`, shared with the binomial module.
- `statistics/monteCarlo.ts` — `empiricalPValueLessOrEqual` (small values extreme), `binValues`, `binIndexOf`.
- `visualization/LineChart.tsx` — small multi-series chart; a series leaves the chart rather than being flattened against the edge.

`visualization/Histogram.tsx` now takes labelled columns instead of integer values, so both scenarios feed it from their own data without it knowing anything about either.

**Curve drawing.** Both the plot and the chart break a path where it leaves the visible range instead of clamping it. A degree-9 polynomial does leave the plot, and drawing it pinned to the edge would show a model that does not exist.

**Redrawing a simulated search.** As in scenario 01, a simulated search stores only its replication index and the degree it chose; `selectionNullSample` regenerates the exact sample from the seed. A test asserts the round-trip reproduces the recorded R².
