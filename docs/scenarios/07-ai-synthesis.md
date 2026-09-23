# Czech description

**Co z toho plyne pro AI?**

Závěrečný syntetizující modul navazující na šest předchozích scénářů. Tabulka s jedním výsledkem a dvěma sty kandidátskými příznaky se předá systému, který každého kandidáta ohodnotí a vrátí nejsilnější. Hledání proběhne správně — a jeden z kandidátů je s výsledkem opravdu spojený.

Scénář sleduje dva finalisty: toho, kterého mělo hledání nejraději, a toho skutečně spojeného. V datech, ve kterých byli nalezeni, je nelze odlišit, a uživatel je vyzván, aby se přesto rozhodl. Rozhodnou až nová data — a pak přijde otázka, ke které se žádný z předchozích scénářů nedostal: když příznak sami nastavíme, změní se výsledek? Nezmění. Skutečný příznak předpovídá, protože sdílí s výsledkem neměřenou příčinu, a zasahovat do něj je k ničemu.

Hlavní pojmy: objevování vzorů, generování hypotéz, generalizace, kauzální inference, nezávislá replikace.

# English description

**What Does This Mean for AI?**

A closing synthesis module building on the six preceding scenarios. A table with one outcome and two hundred candidate features is handed to a system that scores every candidate and returns the strongest. The search is performed correctly — and one of the candidates really is connected to the outcome.

The scenario follows two finalists: the one the search liked best and the genuinely connected one. In the data they were found in they cannot be told apart, and the user is asked to decide anyway. New data settle it — and then comes the question none of the earlier scenarios reach: if we set the feature ourselves, does the outcome change? It does not. The real feature predicts because it shares an unmeasured cause with the outcome, and intervening on it achieves nothing.

Main concepts: pattern discovery, hypothesis generation, generalization, causal inference, independent replication.

## Pedagogical goal

Section 9 of the development guide sets the requirement: the project must distinguish discovering a pattern, generating a hypothesis, predicting observations, confirming a hypothesis, and establishing causality — and it must not teach that searching is itself an error. This scenario turns that list into four questions with four different answers:

| | Found by the search, unrelated | Found by the search, really connected |
| --- | --- | --- |
| Does it describe the data it was found in? | yes | yes |
| Can that data tell it apart from the other? | **no** | **no** |
| Does it predict cases nobody has seen? | no | **yes** |
| If we change it, does the outcome change? | no | **no** |

Three things follow, and each corrects a plausible misreading of the first six scenarios.

**Searching is not the error.** One of these two findings is real, and it was found by exactly the same sweep that produced the other. A reader who left scenario 06 believing "discovered by searching means false" would get this wrong.

**A correction for the search is not a verdict on truth.** The Monte Carlo rejects *both* finalists — including the real one. What it says is "this data set has not established it", which is a different statement from "it is false".

**Prediction is not causation.** This is the rung the other six never reach. The real feature predicts the outcome reliably, forever, on data nobody has seen — and changing it does nothing at all, because it shares a cause with the outcome rather than producing it.

## Statistical mechanism

**1. The search is correct.** Every candidate is scored by the exact test that a Pearson correlation is zero, and ranked. Nothing is wrong with the method, which is the premise of the whole scenario.

**2. The two finalists are genuinely indistinguishable.** The connected feature's true correlation with the outcome is 0.49, deliberately close to what the strongest of 200 unrelated features reaches by chance at 60 rows. On the default table the search returns an unrelated feature first (r = −0.44) and the connected one third (r = 0.41). Both are significant; no statistic computable from those 60 rows separates them.

**3. Correcting for the search rejects both.** Simulating the whole procedure in a world where nothing is connected gives adjusted p-values of **0.070** and **0.169**. The correction prices the search, and both were found by the same search — so it cannot distinguish them, and it is right not to claim it can.

**4. Held-out data separate them, and nothing else does.** Over 200 fresh tables the unrelated candidate averages r = 0.01, is significant 5.5% of the time, and its frozen line predicts new cases with R² = **−0.20**. The connected one averages r = **0.49**, is significant **99%** of the time, and predicts with R² = **+0.21**.

**5. The intervention.** Each replication is measured twice: once as the world produces it, and once with the feature overwritten by values drawn independently of everything else — which severs its link to the hidden cause. That is `do(X)`. The outcome is generated from the hidden variable either way, so:

| | Difference, as found | Difference, when set |
| --- | --- | --- |
| Unrelated candidate | 0.01 | −0.02 |
| Connected candidate | **0.78** | **−0.02** |

The scenario states plainly that this column is only computable because the world was written here. With collected data it is the experiment that has not been run.

## True data-generating process

```text
hidden_i     ~ Normal(0, 1)                             never in the table
outcome_i    = 0.7 · hidden_i + noise
feature_0_i  = 0.7 · hidden_i + noise                   the connected candidate
feature_j_i  ~ Normal(0, 1)                             every other candidate

corr(feature_0, outcome) = 0.49   real, and not caused by feature_0
causal effect of every feature on the outcome = 0
```

Defaults: 200 candidates, 60 cases, `seed = 7471047`.

Two properties are load-bearing. The connected feature's correlation is *real* — it holds in fresh data indefinitely — so the scenario is not another demonstration of noise. And nothing in the table causes anything, so prediction and intervention come apart cleanly.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the setting and the four questions. Hands over the data. |
| Experiment | Sees the ranked shortlist; changes the number of candidates, the number of cases, or the seed, and watches the count of "significant" candidates track the number of candidates. |
| Observation | Sees the two finalists side by side and **commits to a guess** about which is real. |
| Analysis | Prices the search with a Monte Carlo; sees both finalists rejected; sees the five strongest candidates from worlds with nothing in them. |
| Validation | Runs 200 fresh tables, learns which finalist was real and whether the guess was right, then runs 200 interventions. |
| Conclusion | The four-question table, four takeaways, and what this means for systems that search at scale. |

The guess is the scenario's central interaction. It is required before advancing, there is no penalty for being wrong, and the text says why it is being asked: the point is what it feels like to decide from evidence that cannot decide. Which finalist is connected is not revealed anywhere in the interface — not in a label, a tone or an aria-label — until the validation stage, and an application test asserts this.

## Expected observation

With the default settings, the search returns an unrelated candidate first:

| | r | p as reported | p adjusted for the search |
| --- | --- | --- | --- |
| Feature 109 (unrelated) | −0.44 | < 0.001 | 0.070 |
| Feature 1 (connected) | 0.41 | 0.001 | 0.169 |

**14** of 200 candidates clear 0.05 against about 10 expected by chance. Then:

- 200 fresh tables: feature 109 → average r 0.01, significant 5.5%, prediction R² **−0.20**; feature 1 → average r **0.49**, significant **99.0%**, prediction R² **+0.21**;
- 200 interventions: feature 109 → 0.01 as found, −0.02 when set; feature 1 → **0.78** as found, **−0.02** when set.

The numbers move with the seed; the pattern does not. Which finalist the search ranks first does depend on the seed, and the scenario is written so that either ordering works.

## Explanation

Two explanations fit the original table equally well: a feature genuinely connected to the outcome, and the luckiest of two hundred unrelated ones. At 60 cases they produce the same correlation, the same p-value and the same plot. No statistic computed from those rows separates them, and looking harder does not help — the separating information is not in the table. It is in data the search has not seen.

That is not a failure of the search or of the system that ran it. The search did what it was asked and reported what it found. What it returned is a list of hypotheses; which of them are real is a question for other data.

And answering that question still leaves the last one open. A feature that shares an unmeasured cause with the outcome moves whenever the outcome moves, so it predicts perfectly and indefinitely. Acting on it changes nothing, because the arrow never ran that way.

## Validation

Three forms, in increasing strength — and the scenario is explicit that each answers a different question:

1. **Pricing the search** (Monte Carlo) — has this data set established the finding? No, for both finalists.
2. **Fresh cases** (frozen candidates, frozen line) — does it predict? Yes for one, no for the other. This is the only stage that separates them.
3. **Intervention** (the feature set rather than caused) — does changing it change the outcome? No, for both — including the one that predicts.

Stage 3 is the addition this scenario makes to the application. It is also the one that cannot be performed on collected data, and the interface says so rather than leaving the impression that a clever enough analysis substitutes for an experiment.

## Common misunderstanding

- **"Found by searching, so it's false."** One of the two finalists is real. The search is how it was found, and that is not a mark against it.
- **"The correction proved the finding wrong."** The correction rejected both finalists, one of which is real. It bounds what this data set established; it is not a verdict on the world.
- **"It replicates, so it's causal."** The connected feature replicates indefinitely and causes nothing. Replication establishes that an association is real, not that it is causal.
- **"A better model would have told them apart."** No model can, from those rows: both explanations imply the same distribution. More capable search does not create information the data do not contain.
- **"So AI systems are unreliable at this."** The system in this scenario made no error. The error would be in how its output is read — as confirmed evidence rather than as a ranked list of candidates.
- **"Then the intervention column is what we should always compute."** It is, where you can. Here it is computable only because the world is simulated; on collected data it requires an experiment, and the scenario says so.

## Implementation notes

```text
src/scenarios/07-ai-synthesis/
  Scenario.tsx                       stage machine, the guess, the reveal, the ladder
  model.ts                           table size, the loadings, the four questions
  simulation.ts                      true data-generating process and the intervention
  analysis.ts                        ranking, the finalists, Monte Carlo, prediction, intervention
  components/CandidateList.tsx       the system's ranked output
  components/StudyControls.tsx       candidates, cases, seed
  components/SearchGallery.tsx       the strongest candidates from empty worlds
  tests/                             simulation, analysis
```

This scenario adds **no new statistics**, which is appropriate for a synthesis: it reuses the correlation test from scenario 06, Welch's t-test from scenario 05, least squares and goodness of fit from scenario 02, and the Monte Carlo helpers from scenario 01.

**The shared scatter plot.** Scenario 06's `PairPlot` and what this scenario needed were the same chart, so it was promoted to `src/visualization/ScatterPlot.tsx` and both scenarios use it. It takes a `predict` function rather than a fitted model, so the visualization layer stays ignorant of the regression module.

**The intervention reuses the null.** `selectionNullStudy` is the observed world with the connected feature severed — which is exactly what `interveneOnFeature` does. A world with nothing to find and an intervened world are the same object, and the code says so rather than having two generators.

**Nothing leaks before the reveal.** The connected feature is at a fixed index, the finalists are displayed in the order the search ranked them, and the "really connected" / "unrelated" labels are rendered only from the validation stage onwards. An application test asserts that neither label appears on the observation or analysis stages.

**The ladder is data, not translated strings.** The four answers live in a `LADDER` constant in the component and drive both the badge text and its tone, so the table cannot drift out of step with the wording in either language.
