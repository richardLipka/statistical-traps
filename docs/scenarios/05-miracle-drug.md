# Czech description

**Zázračný lék**

Simulovaná studie se 120 pacienty ve dvou ramenech a baterií 20 výsledků měřených u každého z nich. Léčba nedělá nic: obě ramena vznikají ze stejného rozdělení a skutečný účinek na každý výsledek je přesně nulový. Měření navíc nejsou navzájem nezávislá — pacient, kterému se daří, má dobré skóre v několika z nich najednou.

Ještě před zařazením prvního pacienta se studie registruje na jeden výsledek. Ten nenajde nic. Pak se uživatel podívá na zbytek baterie a najde výsledek, který „vyšel“. Scénář jej opravuje dvakrát: nejprve učebnicově (Bonferroni a Holm), potom simulací celého hledání — která vyjde mírněji, protože výsledky spolu korelují a hledání tedy nemělo dvacet nezávislých šancí. Nová studie pak ukáže, co z nálezu zbylo.

Hlavní pojmy: mnohonásobné testování, falešně pozitivní výsledky, nezávislá replikace, interpretace p-hodnot.

# English description

**The Miracle Drug**

A simulated trial with 120 patients in two arms and a panel of 20 outcomes measured on each of them. The treatment does nothing: both arms are generated from the same distribution and the true effect on every outcome is exactly zero. The measurements are also not independent of each other — a patient who is doing well scores well on several of them at once.

Before the first patient is enrolled the trial registers one outcome. It finds nothing. Then the user looks at the rest of the panel and finds an outcome that "worked". The scenario corrects it twice: first with the textbook answer (Bonferroni and Holm), then by simulating the whole search — which comes out milder, because the outcomes are correlated and the search therefore did not have twenty independent chances. A new trial then shows what survives.

Main concepts: multiple testing, false positives, independent replication, interpretation of p-values.

## Pedagogical goal

The primary goal is the one the phrase "multiple testing" names but rarely makes vivid: **a test at the 5% level is designed to be wrong one time in twenty, so twenty tests on something inert produce about one false positive by construction.** Not through bad luck, not through malpractice — by arithmetic.

The second goal is subtler and is where this scenario differs from the earlier ones: **the correction people reach for is a rough instrument.** Multiplying by the number of tests assumes every test was an independent chance. Outcomes measured on the same patients never are. Simulating the procedure that was actually run prices the search correctly, and here it returns a smaller number than Bonferroni does — so the lesson is not "always multiply by twenty" but "measure what your procedure actually does".

The third is about reporting. A selected outcome and a registered one look identical on the page: same test, same interval, same p-value. The panel is part of the result, and the write-up is exactly where it vanishes.

## Statistical mechanism

**1. Each test is exactly the right test.** Welch's two-sample t-test compares the arms on one outcome, with no assumption that the two arms have equal variances. The p-value comes from Student's t distribution via the regularized incomplete beta function, the same machinery the F distribution uses. Applied to the registered outcome, this test is wrong exactly 5% of the time — which the validation stage confirms empirically.

**2. The search is over outcomes.** Twenty tests, the smallest p-value reported. The statistic that reaches the reader is `min p` over the panel, whose null distribution has nothing to do with the null distribution of a single test.

**3. The textbook correction, and why it is only approximately right.** Bonferroni multiplies by 20; Holm steps down through the sorted p-values and is never more severe. Both control the chance of any false positive across the panel, and both assume the tests are independent. They are not: every outcome loads on the same patient, so any two correlate at about 0.36 by construction. Bonferroni therefore charges for more separate chances than the search actually had.

**4. Correcting by simulating the procedure.** Generate another trial of a treatment that does nothing, with the same correlation structure, test all 20 outcomes, keep the smallest p-value, repeat 300 times. The adjusted p-value is `(1 + #{simulated ≤ observed}) / (1 + replications)`. On the default trial this turns p = 0.004 into **0.066** — still not significant, and **milder than Bonferroni's 0.080**, because the simulation knows about the correlation and Bonferroni does not.

**5. Why the panel does not have to be large.** The simulation also reports that at least one outcome reaches p < 0.05 in **56%** of trials of a treatment that does nothing, with **1.1** outcomes below 0.05 on average. Twenty is a normal-sized panel; five or six would already make a striking result more likely than not across a few trials.

## True data-generating process

```text
for each patient i in each arm:
    shared_i  ~ Normal(0, 1)
    for each outcome k:
        value_ik = LOADING · shared_i + sqrt(1 - LOADING²) · Normal(0, 1)

true effect of the treatment on every outcome = 0
```

Defaults: 60 patients per arm (120 in total), 20 outcomes, `LOADING = 0.6`, `seed = 3117499`.

Both arms are generated by the identical procedure, so the treatment label carries no information whatsoever. The shared factor makes the outcomes correlate at `LOADING² = 0.36` while leaving each outcome marginally standard normal — which is what keeps every individual t-test exactly valid. That combination is the point: the tests are impeccable, and the search is what breaks the report.

Seeding follows the discipline of the earlier scenarios: separate seed roles for the observed trial, the selection-null simulation, single fresh trials and validation replications, so the trial used to find an outcome is never reused to judge it.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the registered outcome and the registered question. Runs the trial. |
| Experiment | Changes the size of the trial, the size of the panel or the seed, and watches the registered outcome find nothing. |
| Observation | Clicks any row of the forest plot to inspect that outcome, or jumps straight to the one that came out best. |
| Analysis | Compares the registered and chosen outcomes under the identical test; sees Bonferroni and Holm; then simulates the search 300 times; then the five most impressive results those simulations produced. |
| Validation | Runs a new trial with both outcomes frozen; runs further trials; runs 200 replications. |
| Conclusion | Four takeaways, plus why measuring many outcomes is not the error. |

Advancing to the analysis requires choosing an outcome: the scenario is about what happens to a report once somebody has picked a winner.

Outcomes are numbered rather than named, and the introduction says why — a named outcome invites a story, and the story is what makes a selected result persuasive. The introduction also states that the trial, the patients and the measurements are generated in the browser and that no real treatment, condition, study or patient is involved.

## Expected observation

With the default settings, on a trial where the treatment does nothing:

| | Difference | t | p-value as usually reported |
| --- | --- | --- | --- |
| Outcome 1, registered in advance | 0.05 | 0.30 | 0.765 |
| Outcome 3, picked out of the panel | 0.49 | 2.93 | **0.004** |

**5 of the 20 outcomes** come out below 0.05 on their own. Then:

- Bonferroni: **0.080**. Holm: **0.080**. Neither is significant.
- adjusted by simulating the search: **0.066** — smaller than Bonferroni, because the outcomes correlate at about 0.39 in this trial;
- at least one outcome below 0.05 in **56%** of simulated trials, and **1.1** of the 20 below 0.05 on average;
- the five most impressive simulated results: every one p < 0.001, all in trials of a treatment that does nothing;
- in a new trial the chosen outcome's difference goes from +0.49 to **−0.33**: not merely smaller, the other way round;
- over 200 trials: average difference **0.01** and **0.00**, significant in **4.0%** and **4.5%** of trials, and the chosen outcome points the same way again only **48%** of the time — a coin flip;
- re-running the search on each new trial lands on a different outcome **97%** of the time.

The numbers move with the seed; the pattern does not.

## Explanation

A 5% test is a promise about how often it will be wrong when nothing is there: one time in twenty. Twenty such tests on a treatment that does nothing therefore produce about one false positive, and the trial above produced five, which is on the high side of normal rather than remarkable.

What makes this hard to see from the outside is that the report does not contain the panel. A single outcome with its difference, its interval and its p-value looks exactly the same whether it was the only thing measured or the best of twenty. No amount of care with that one number recovers the missing information, because the information was never in the number.

The correction is not a different formula either — or rather, the familiar formula is only an approximation of the right idea. The right idea is the null distribution of the procedure that produced the result. Bonferroni approximates it by assuming independence; simulating the procedure measures it.

## Validation

Two forms, answering different questions:

1. **Adjusting for the search** (Monte Carlo, on the observed trial) — what does this procedure produce when the treatment does nothing? Answer: a positive trial more often than not.
2. **A new trial** (new patients, both outcomes frozen) — does the finding belong to the treatment? Answer: no. Both outcomes settle at a difference of zero and at the nominal 5% error rate, and become indistinguishable from each other.

The replication panel adds two observations that neither p-value shows: the chosen outcome does not even keep the *direction* of its original difference more often than chance, and re-running the search lands on a different outcome 97% of the time.

## Common misunderstanding

- **"p = 0.004 is strong evidence."** For one outcome registered in advance, it is. For the best of twenty, it is what the procedure produces routinely — the simulation returns 0.066 for exactly this result.
- **"They should have used Bonferroni."** Bonferroni would have withdrawn this finding, so in that sense yes. But it is a blunt instrument that assumes independent tests, and correlated outcomes make it too severe. It is a safe default, not the right answer.
- **"Five significant outcomes out of twenty can't be chance."** About one is expected; five is on the high side of normal, and the correlation between outcomes makes clusters like this more likely than independent tests would.
- **"The confidence interval didn't contain zero, so the effect is real."** The interval is the same statement as the p-value, and it was selected the same way.
- **"Measuring fewer outcomes would fix it."** It would reduce the problem and lose real information. Registration fixes it: measure everything, state in advance which outcome decides the question, and report the rest as exploratory.
- **"A replication that also comes out positive would settle it."** It would be much stronger evidence, because the outcome is now fixed in advance — which is exactly what this scenario's validation stage does, and exactly what it fails.

## Implementation notes

```text
src/scenarios/05-miracle-drug/
  Scenario.tsx                     stage machine and layout
  model.ts                         panel size, the registered outcome, the correlation loading
  simulation.ts                    true data-generating process, seed roles
  analysis.ts                      per-outcome tests, corrections, the search, Monte Carlo, validation
  components/ForestPlot.tsx        one row per outcome: difference and interval, against zero
  components/TrialControls.tsx     patients per arm, outcomes measured, seed
  components/SearchGallery.tsx     the most impressive simulated trials, redrawn
  tests/                           model, simulation, analysis
```

New shared statistics, usable by later scenarios:

- `statistics/distributions/studentT.ts` — two-sided and one-sided t tails, and the distribution function, built on the regularized incomplete beta function that `fDistribution.ts` already provides.
- `statistics/hypothesis/tTest.ts` — Welch's two-sample t-test with a group summary and a 95% interval.
- `statistics/hypothesis/multiplicity.ts` — Bonferroni and Holm adjustments.

**The forest plot.** A new chart rather than a reuse: a trial's natural picture is one row per outcome showing the estimate and the interval it cannot be told apart from, with zero as the reference. It is the same component in the gallery, drawn compactly.

**Redrawing a simulated trial.** As in the earlier scenarios, a simulated search stores only its replication index and the outcome it picked; `selectionNullTrial` regenerates the exact trial from the seed. A test asserts the round-trip reproduces the recorded difference and p-value.

**A guard against unfilled placeholders.** Building this scenario produced a string that rendered as a literal `{{outcomes}}` because the component forgot to pass that value. The localization parity test cannot catch this — both languages are equally wrong — so `src/i18n/index.ts` now records missing interpolations through i18next's `missingInterpolationHandler`, and an application test walks this scenario as far as the panels that only exist after a simulation has run and asserts the list is empty.
