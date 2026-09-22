# Czech description

**Kreslení terče kolem šipek**

Stroj hází šipky na čtvercovou desku zcela náhodně — každá poloha je stejně pravděpodobná, skutečný efekt je přesně nulový. Ještě před hodem je stanoven jeden terč (modrý kruh uprostřed) a jedna otázka: zasahuje stroj tento kruh častěji, než odpovídá náhodě?

Po hodu dostane uživatel druhý, stejně velký kruh, který smí libovolně posouvat, dokud nezachytí co nejvíce šipek. Na oba kruhy se pak použije naprosto stejný statistický test. Terč zvolený dodatečně vyjde „významně“, terč určený předem nikoli. Teprve nová, nezávislá sada šipek ukáže, že šlo o artefakt hledání, nikoli o vlastnost stroje.

Hlavní pojmy: hypotéza stanovená dodatečně, explorativní analýza, konfirmace, replikace.

# English description

**Drawing the Target Around the Darts**

A machine throws darts at a square board completely at random — every position is equally likely and the true effect is exactly zero. Before the throw, one target is declared (the blue circle in the middle) together with one question: does the machine hit this circle more often than chance would explain?

After the throw the user gets a second circle of exactly the same size and may move it anywhere, capturing as many darts as possible. The identical statistical test is then applied to both circles. The target chosen afterwards comes out "significant"; the target fixed in advance does not. Only a new, independent set of darts shows that the difference was an artefact of the search, not a property of the machine.

Main concepts: post-hoc hypothesis, exploratory analysis, confirmation, replication.

## Pedagogical goal

The user should leave with one distinction, felt rather than memorised:

- a hypothesis fixed **before** the data can be evaluated with a standard test;
- a hypothesis selected **from** the data cannot, because the selection has already used up the evidence.

Secondary goals:

- see that "the strength of the evidence" depends on how many possibilities were examined, not only on the observed number;
- see that exploration is legitimate — it produces a hypothesis that still has to be tested;
- meet replication as the step that settles the question, not as an optional extra.

## Statistical mechanism

Two mechanisms are demonstrated separately and then combined.

**1. Selection inflates a test statistic.** For a fixed circle of radius r on a board of area 1, the number of hits is `X ~ Binomial(n, πr²)`. For the circle placed *best* over the whole board, the relevant statistic is `max over all placements`, whose distribution is shifted far to the right. With the defaults (n = 120, r = 0.12) the expectation for a fixed circle is 5.4 hits, while the best placement captures about 13.4 on average.

**2. A valid test answers the question it was given.** The one-sided exact binomial test `P(X ≥ k)` is applied to both circles, unchanged. It is a correct test; it simply has no way of knowing that one of the two circles was chosen after looking at the data.

The honest evaluation of the post-hoc circle requires a different null distribution — the distribution of the *search procedure*, obtained by Monte Carlo:

1. generate a fresh set of n uniform darts;
2. search it exhaustively for the best circle of radius r;
3. record how many darts that circle captures;
4. repeat (300 replications in the interface).

The selection-adjusted p-value is `(1 + #{simulated ≥ observed}) / (1 + replications)`. Because the simulated search is exhaustive and a user dragging a circle by hand is usually not, this p-value is **conservative** for the user's own result: it is an upper bound on the significance the manual search could legitimately claim. The interface says so.

## True data-generating process

```text
for each of n darts:
    x ~ Uniform(0, 1)
    y ~ Uniform(0, 1)

true effect = 0          (no aim, no cluster, no preferred region)
```

The board is the unit square, so a circle's hit probability is exactly its area, `πr²`. Target centres are constrained to `[r, 1-r]²` so that every circle lies fully inside the board; this keeps the hit probability identical for both circles at every position and makes the binomial test exact for a pre-registered target.

All randomness is seeded (`mulberry32`). Independent data sets are produced by deriving separate seeds per role — observed darts, selection-null simulation, validation replications, single fresh throws — so no sample is ever used both to find a target and to validate it.

Defaults: `n = 120`, `r = 0.12`, `seed = 777`.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the declared target and the declared question. Throws the darts. |
| Experiment | Changes the number of darts, the target radius and the seed; watches the pre-registered circle's count fluctuate around its expectation. |
| Observation | Places the red circle anywhere — dragging it, clicking the board, or using the arrow keys — while the identical binomial test runs on it live. The user is explicitly invited to hunt for the position with the lowest p-value. "Find the best position automatically" runs the exhaustive search. |
| Analysis | Applies the same test to both circles; runs 300 simulated searches, compares the observed result with that distribution, and sees the five best of those searches drawn on the random data they were found in. |
| Validation | Throws new independent sets with both circles frozen; runs 200 replications. The new darts are drawn in the "fresh data" colour, so the change of data set is visible and not only stated. |
| Conclusion | Reads the four takeaways and the note on why exploration itself is not the error. |

## Expected observation

With the default settings the user sees roughly this:

| | Hits | p-value as usually reported |
| --- | --- | --- |
| Target fixed in advance | 3 | 0.912 |
| Target chosen afterwards | 14 | 0.001 |

and then:

- best circle in purely random darts: **13.4 hits on average** (the observed 14 sits in the middle of that distribution);
- selection-adjusted p-value: **≈ 0.42**;
- the five best simulated searches captured **18 to 20 darts each, every one of them with p < 0.001** — in data generated with no effect at all;
- on new independent darts the red circle catches about 5 darts, like any other circle of that size;
- over 200 replications both circles average ≈ 5.4 hits and cross p < 0.05 in only a few percent of replications.

The exact numbers move with the seed; the pattern does not.

## Explanation

A p-value answers a conditional question: *if nothing were going on, how often would a result at least this extreme appear?* It bounds the error rate only for a result that was specified before the data were seen.

Moving the circle after the throw means the reported statistic is no longer "the count in a circle" but "the count in the best of very many circles". The maximum of many random values is not a typical random value, so the statistic is inflated before the test ever runs. The binomial test cannot detect this, because the search left no trace in the data handed to it.

This is the Texas sharpshooter: shoot at the wall, then paint the target around the tightest cluster.

## Validation

Two forms of validation appear, and they answer different questions:

1. **Adjusting for the search** (Monte Carlo, within the original data set) — what could this search have produced under pure randomness? Answers: about this much, so the finding is unremarkable.
2. **Independent replication** (new data sets, both circles frozen) — does the pattern hold where nothing could be selected? Answers: no; both circles behave identically, and the false-positive rate returns to the nominal level.

The second is the decisive one. Once the red circle can no longer move, it is just a circle of a given size at a given place — indistinguishable in behaviour from the pre-registered one.

## Common misunderstanding

- **"So the test is broken / statistics cannot be trusted."** The test is fine. It answered the question it was asked. The mismatch is between the question the test answers and the way the hypothesis was produced.
- **"So looking for patterns is cheating."** No. Exploration generates hypotheses and is a normal part of research. The error is presenting an exploratory finding as a confirmed one.
- **"p = 0.001 means the machine really does favour that spot."** A p-value is not the probability that the hypothesis is true. Here we know with certainty that the machine favours nothing.
- **"Replication proves the effect is real / unreal."** Replication on independent data is strong evidence about generalization. It is not, on its own, a statement about causes.
- **"A big enough sample removes the problem."** More darts do not help if the circle is still allowed to move afterwards; the search scales with the data.

## Implementation notes

```text
src/scenarios/01-dartboard/
  Scenario.tsx                     stage machine and layout
  model.ts                         board, targets, hit probability, defaults
  simulation.ts                    true data-generating process, seed roles
  analysis.ts                      binomial evaluation, exhaustive search, Monte Carlo, replication
  components/DartBoardView.tsx     SVG board, dragging, keyboard control
  components/ExperimentControls.tsx  sliders and seed
  components/SearchGallery.tsx     the best simulated searches, redrawn
  tests/                           model, simulation, analysis
```

**Exhaustive search.** `findBestTarget` does not use a grid. An optimal circle can always be translated until it is blocked, which leaves a small set of candidate centres: intersections of the distance-r circles around two darts, a dart's circle pressed against an edge of the allowed centre area, the corners of that area, and single darts. Counting uses a spatial hash with cell size r. For the defaults this is ~1 800 candidates and runs in well under a millisecond, which is what makes 300 simulated searches feasible in the browser.

Tests assert the search is at least as good as 400 random placements and as a 150×150 grid search, which is how exhaustiveness is checked empirically.

**Redrawing a simulated search.** Each simulated search records only its replication index and the circle it found. Because seeding is deterministic, `selectionNullDarts` regenerates exactly the data set that search ran on, so the gallery can redraw any of the 300 searches without storing 300 data sets. A test asserts the round-trip: the recorded circle still captures the recorded number of darts.

**Responsiveness.** The selection simulation runs in chunks (`runChunked`) so that the interface never freezes on large settings.

**Reuse.** Generic pieces live outside the scenario: `ScenarioShell`, `StepIndicator`, `ExplanationPanel`, `ReplicationPanel`, `ResultTable`, `Histogram`, and the statistics modules. Only the geometry, the board view and the dartboard-specific analysis live in this directory.
