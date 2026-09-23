# Czech description

**Záhadná korelace**

Tabulka 60 proměnných po 40 řádcích, ve které je každý sloupec generován nezávisle na všech ostatních: skutečná korelace mezi každou dvojicí je přesně nulová.

Ještě před sběrem dat pojmenujeme jednu dvojici, protože někdo měl důvod tam vztah čekat. Ta nenajde nic. Pak tabulku předáme automatickému nástroji, který otestuje všech 1 770 dvojic a vrátí žebříček nejsilnějších. Scénář výsledek opravuje dvakrát: nejprve pohledem na celé prohledání — histogram p-hodnot všech dvojic je plochý a počet „významných“ nálezů sedí na očekávání z hranice 0,05 — a potom Monte Carlo simulací celého prohledání. Nové řádky nakonec ukážou, že nalezený vztah nejen zmizí, ale ani nepředpovídá.

Hlavní pojmy: dolování dat, korelace, mnohonásobná porovnání, replikace, predikce vs. vysvětlení.

# English description

**The Mysterious Correlation**

A table of 60 variables and 40 rows in which every column is generated independently of every other: the true correlation between every pair is exactly zero.

Before the data are collected we name one pair, because somebody had a reason to expect a relationship there. It finds nothing. Then the table is handed to an automated analyst which tests all 1,770 pairs and returns the strongest, ranked. The scenario corrects the result twice: first by looking at the whole sweep — the histogram of every pair's p-value is flat, and the number of "significant" findings matches what the 0.05 threshold predicts — and then by a Monte Carlo of the sweep itself. New rows finally show that the discovered relationship does not merely weaken; it does not predict.

Main concepts: data mining, correlation, multiple comparisons, replication, prediction versus explanation.

## Pedagogical goal

The first goal is **scale**. Every earlier scenario searched by hand over something a person could enumerate: positions, nine models, a few thousand windows, forty doctors, twenty outcomes. Here the search is automated and the family of tests grows as the square of the number of columns. "We checked all the data" sounds like diligence and describes the size of a family of tests.

The second is a defence the earlier scenarios do not offer: **look at the distribution of all the results, not the top of it.** When nothing is related to anything, p-values are uniform on [0, 1], so the histogram of the whole sweep is flat and the "discoveries" are simply its left-hand end. A table with something real in it looks different — a spike at the left that the flat part cannot account for. This is the one diagnostic in the application that a reader can apply to somebody else's data mining without re-running anything.

The third is **prediction versus explanation**, which is the concept list's own phrase. A discovered correlation implicitly claims that knowing one variable tells you something about the other. The validation stage carries the fitted line over to new rows unchanged, so it has to predict rather than describe — and its R² there is negative.

## Statistical mechanism

**1. Each test is exact.** Pearson's r is tested through `t = r·√(n−2)/√(1−r²)` with `n − 2` degrees of freedom, which is exact for normally distributed variables — what the simulation generates. The pair named in advance is therefore tested correctly, and the validation stage confirms it is wrong about 5% of the time.

**2. The bar is lower than it sounds.** With 40 rows, |r| = 0.312 already reaches p = 0.05. A correlation most people would describe as weak clears the threshold, which is why a sweep over many columns returns so much.

**3. The sweep.** Every unordered pair of distinct variables: `V(V−1)/2`, which is 1,770 for 60 variables. Doubling the columns roughly quadruples the family. Each correlation is one dot product of standardized columns, so the whole sweep costs milliseconds — the practical reason this is the default way to look at a table.

**4. The whole distribution, which is the centrepiece.** Under the null the p-value of each test is uniform, so 5% of 1,770 pairs — **88.5** — are expected below 0.05 by construction. The observed table produces **86**. The histogram of all 1,770 p-values is flat across [0, 1]. Nothing needs to be corrected to see this; it is visible before any adjustment is applied.

**5. Formal corrections.** Bonferroni puts the strongest pair at 0.204. Benjamini–Hochberg, which controls the false discovery rate rather than the chance of any false positive and is what data mining actually uses, yields **0 discoveries at a 5% FDR**; the false discovery rate would have to be set to 20% before anything in the table counted. Note that for the single smallest p-value the two coincide — BH at rank 1 is Bonferroni — so FDR is the more lenient procedure over a *set* of tests, not a softer verdict on a winner.

**6. Correcting by simulating the sweep.** Generate another table where nothing is related, sweep all pairs, keep the strongest, repeat 300 times. This turns p < 0.001 into **0.173**. Because every simulated table has the same number of rows, the strongest |r| and the smallest p order identically, so the histogram is binned on |r| — whose labels can be told apart, where four decimal places of p cannot.

## True data-generating process

```text
for every variable v and every row i:
    value_vi ~ Normal(0, 1), independently

true correlation between every pair = 0
```

Defaults: 60 variables, 40 rows, `seed = 1885122`.

Independence here is deliberate and does real work. Scenario 05 made its outcomes correlated on purpose, which is what made Bonferroni too severe there. Here the columns genuinely are independent, so Bonferroni is right, the p-values are exactly uniform, and the flat histogram means what it appears to mean. The two scenarios together say: the correction that fits depends on the structure of what was searched.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the pair named in advance and the question asked about it. Collects the data. |
| Experiment | Changes the number of variables — watching the pair count grow quadratically — the number of rows, or the seed, and watches the named pair find nothing. |
| Observation | Runs the sweep, then picks from the ranked list of the strongest relationships it returns. |
| Analysis | Compares the two pairs under the identical test; sees the whole sweep at once (count, expectation, FDR, flat histogram); simulates the sweep 300 times; sees the five strongest relationships those simulations produced. |
| Validation | Collects new rows with both pairs frozen and the fitted line carried over; collects more; runs 200 batches. |
| Conclusion | Four takeaways, plus why searching the data is not the error. |

The discoveries are hidden until the sweep is run, and advancing to the analysis requires picking one: the scenario is about what happens to a report once an automated search has produced a winner.

Variables are numbered rather than named, and the interface says why — in practice the two columns arrive with names, and the name supplies the mechanism. The introduction states that the table is generated in the browser and is not a real data set.

## Expected observation

With the default settings:

| | r | t | p-value as usually reported |
| --- | --- | --- | --- |
| Variables 1 and 2, named in advance | 0.02 | 0.12 | 0.905 |
| Variables 28 and 38, found by the sweep | **−0.57** | −4.30 | **< 0.001** |

and across the whole sweep:

- **86** of 1,770 pairs below 0.05, against **88.5** expected from the threshold alone;
- the p-value histogram is flat across [0, 1];
- **0** pairs survive at a 5% false discovery rate; the FDR would have to be set to **20%**;
- Bonferroni puts the strongest pair at **0.204**;
- adjusted by simulating the sweep: **0.173**, with the sweep calling **87.3** pairs significant on average in tables where nothing is related;
- the five strongest simulated finds: |r| from 0.63 to 0.68, every one of them p < 0.001;
- on new rows the discovered pair falls from −0.57 to −0.26 (p = 0.106);
- over 200 batches: average r **0.02**, significant in **6.5%** of batches, and R² predicting new rows **−0.29** — the fitted line is worse than ignoring the relationship;
- sweeping each new batch reports a different pair **100%** of the time.

The numbers move with the seed; the pattern does not.

## Explanation

A test at the 5% level is wrong one time in twenty. A sweep of 1,770 pairs is therefore wrong about 88 times, and the scenario does not have to arrange this: the expected and observed counts agree to within a couple of pairs. That is what "nothing is there" looks like when everything is tested.

Two things make the winner persuasive anyway. The first is the plot: forty points with a line through them look like a relationship whatever produced them, and the eye cannot see the 1,769 plots that were rejected to find this one. The second is the name. Real columns have names, and a named pair arrives with a story about why one might drive the other — supplied after the fact, and just as available for any other pair.

The remedy that scales is not a different formula but a different object to look at. One p-value cannot tell you how many were computed; the distribution of all of them can.

## Validation

Two forms, answering different questions:

1. **The sweep as a whole** (on the observed table) — does this table contain anything at all? Answer: the p-values are flat and nothing survives at a 5% FDR.
2. **New rows** (both pairs frozen, the fitted line carried over) — does knowing one variable predict the other? Answer: no, and worse than no. The out-of-sample R² is negative, meaning the line is worse than the mean of the new rows.

The replication panel adds the observation that neither correction shows: sweeping a new batch reports a different pair every single time, and the discovered pair keeps the direction of its original correlation about half the time — a coin flip.

## Common misunderstanding

- **"r = −0.57 with p < 0.001 is a strong result."** For a pair named in advance it is. As the strongest of 1,770, it is what the procedure produces routinely: the simulation returns 0.173.
- **"86 significant pairs is a lot — something must be going on."** 88.5 were expected from the threshold alone. The count is evidence *against* there being anything, not for it.
- **"Then p-values are useless at scale."** They are informative at scale in a way they are not one at a time: the shape of their distribution answers the question. Flat means nothing is there; a spike at the left that the flat part cannot explain means something is.
- **"Use the false discovery rate and the problem goes away."** FDR is the right tool and it finds nothing here, which is correct. It bounds the proportion of reported discoveries that are wrong; it does not rescue a winner selected from a table with no signal.
- **"More rows would settle it."** More rows lower the bar each pair must clear, which helps. More columns raise the number of pairs quadratically, which does not.
- **"A correlation that replicates proves one variable causes the other."** Replication establishes that the association is real, not that it is causal. This scenario does not reach that question, because its association does not survive replication in the first place.

## Implementation notes

```text
src/scenarios/06-mysterious-correlation/
  Scenario.tsx                          stage machine and layout
  model.ts                              table size, the pair named in advance, the pair count
  simulation.ts                         true data-generating process, seed roles
  analysis.ts                           the sweep, corrections, Monte Carlo, validation
  components/CorrelationMatrix.tsx      every pair at once, shaded by correlation
  components/PairPlot.tsx               one pair as a scatter, with the fitted line
  components/DiscoveryList.tsx          the ranked output of the sweep
  components/DatasetControls.tsx        variables, rows, seed
  components/SearchGallery.tsx          the strongest simulated finds, redrawn
  tests/                                model, simulation, analysis
```

New shared statistics, usable by later scenarios:

- `statistics/hypothesis/correlationTest.ts` — the exact test that a correlation is zero, and `criticalCorrelation`, which inverts it to say how low the bar is for a given sample size.
- `statistics/hypothesis/multiplicity.ts` — `benjaminiHochberg` added beside Bonferroni and Holm.

**Two sweeps.** `sweepAllPairs` keeps every pair, which the interface needs once for the histogram and the ranked list. `sweepSummary` computes the same winner and count without allocating per pair or sorting for the FDR, and is what the Monte Carlo runs 300 times. A test asserts the two agree.

**The matrix is not interactive.** At 60 variables a cell is about three pixels, so the picture conveys the scale of the search rather than any one cell, and everything the user selects is selected from the ranked list — which is also what an automated analysis actually hands over, and is reachable by keyboard.

**Binning the simulation on |r|.** The smallest p-value of a 1,770-pair sweep is routinely below 0.001, so binning the Monte Carlo on p produced twenty bins whose labels all read "0.000". Every simulated table has the same number of rows, so |r| and p order identically and the correction is unchanged; the histogram is binned on |r|, whose labels are legible.

**A shared formatting fix.** This scenario's replication table was the first place an average landed just below zero, printing "−0.00". `formatNumber` now normalizes a value that rounds to zero, with a test: a direction the data do not contain should not appear in a table.
