# Czech description

**Lékař s neobvykle vysokou úmrtností**

Simulovaná nemocnice se 40 lékaři a 2 400 pacienty. Pacienti se liší: každý má vlastní riziko a některým lékařům chodí těžší pacienti než jiným. Lékaři se neliší — v generátoru není žádný člen pro dovednost, takže skutečný vliv každého z nich je nulový.

Ještě před během roku se zavazujeme k jedné analýze: prošetřit lékaře, kterého čeká pravidelný audit. Ten nenajde nic. Potom začne hledání v tabulce a lékař na jejím chvostu vypadá alarmujícím způsobem. Scénář jeho výsledek opravuje dvakrát za sebou: nejprve rizikovou adjustací na skladbu jeho pacientů, potom Monte Carlo simulací celého hledání napříč všemi lékaři. Další roky pak ukážou, co z nálezu zbylo.

Hlavní pojmy: mnohonásobná porovnání, extrémní hodnoty, matoucí proměnné, adjustace na riziko, podnět k prošetření vs. důkaz.

# English description

**The Doctor With Unusually High Mortality**

A simulated hospital of 40 doctors and 2,400 patients. The patients differ: each carries their own risk, and some doctors are sent sicker patients than others. The doctors do not differ — there is no term for skill anywhere in the generator, so the true effect of each of them is exactly zero.

Before the year runs we commit to one analysis: examine the doctor due for the routine audit. It finds nothing. Then the search through the league table begins, and the doctor at the bottom of it looks alarming. The scenario corrects that result twice over: first by risk-adjusting for the case mix of that doctor's own patients, then by a Monte Carlo simulation of the whole search across all the doctors. Later years show what survives.

Main concepts: multiple comparisons, extreme values, confounding, risk adjustment, investigation versus proof.

## Pedagogical goal

This is the first scenario where the search runs over **people**, and where the conclusion drawn from it would be about a person. It therefore has to separate three things that are routinely collapsed into one:

- **a real difference** — the doctor's patients really did die more often;
- **a difference caused by the doctor** — which requires the comparison to be against what those particular patients were expected to produce;
- **a difference worth reporting** — which requires accounting for the fact that this doctor was selected out of forty for being the most extreme.

Risk adjustment answers the second and cannot touch the third. The scenario makes that boundary explicit, because "we adjusted for case mix" is routinely offered as though it settled the whole question.

The secondary goal is the distinction the concepts call *investigation versus proof*. An unusual result is a legitimate reason to look. It is not a finding.

## Statistical mechanism

**1. Comparing raw rates compares patients too.** The first test is an exact binomial test of the doctor's deaths against the hospital's overall rate. It is valid arithmetic and the wrong question: it assumes every patient carries the hospital's average risk, which is false by construction here.

**2. Risk adjustment, done exactly.** Each patient has their own probability of dying, so the number of deaths a doctor's patients were expected to produce follows a **Poisson-binomial** distribution — the distribution of a sum of independent indicators with *different* probabilities — rather than a binomial one. The expected count is `Σ pᵢ`, the variance is `Σ pᵢ(1 - pᵢ)`, and the p-value is exact:

```text
p = P(X ≥ observed)   where X ~ PoissonBinomial(p₁ … p_k)
```

computed by convolving one patient at a time. On the default hospital this moves the flagged doctor from p < 0.001 to **p = 0.009** — weaker, and still "significant".

The scenario grants risk adjustment more than reality ever does: it adjusts using each patient's **true** risk, which the simulation knows and no real risk model can. This is deliberate. It makes the remaining problem impossible to blame on an imperfect adjustment.

**3. Correcting for the search.** The honest null distribution is that of the whole procedure: run another year for the same 40 doctors, none of whom differs from any other, risk-adjust every one, and keep the smallest p-value. Repeat 300 times. The adjusted p-value is `(1 + #{simulated ≤ observed}) / (1 + replications)`, which turns **0.009 into 0.206**. The same simulation shows some doctor reaching p < 0.05 in **72%** of years in which every doctor is identical.

**4. Why per-doctor rates are so noisy.** A doctor's mortality is a count of a few rare events among a few dozen patients. Its standard deviation relative to its mean is large, so the extremes of a league table are dominated by sampling variation rather than by performance — and the smaller the unit, the more reliably it occupies the extremes.

## True data-generating process

```text
severity_j ~ Normal(0, 0.55)                       drawn once per doctor: the case mix

for each patient i of doctor j:
    logit(risk_i) = -2.4 + severity_j + Normal(0, 0.7)
    died_i ~ Bernoulli(risk_i)                     independent of everything else

true effect of every doctor = 0
```

Defaults: 40 doctors, 60 patients each, `seed = 118785`, giving a hospital mortality of about 11%.

No term in the model depends on which doctor is treating a patient. Doctors differ in exactly one respect — which patients they are sent — and that difference is a genuine confounder rather than noise: it makes raw mortality differ systematically between doctors while leaving every doctor's risk-adjusted effect at zero.

The case mix is generated from its own seed, separately from the patients, so that "the same hospital a year later" keeps the same doctors while every patient and every outcome is new.

## User interaction

| Stage | What the user does |
| --- | --- |
| Introduction | Reads the declared analysis (the doctor due for audit) and the declared question. Runs the year. |
| Experiment | Changes the number of doctors or patients, or the seed, and watches the audited doctor find nothing. |
| Observation | Clicks any column to inspect that doctor's raw mortality against the hospital rate, or takes the shortcut a league table is for and jumps to the worst. |
| Analysis | Sees the raw comparison, then correction 1 (risk adjustment against that doctor's own patients), then correction 2 (a Monte Carlo of the search across all doctors), then the five most alarming doctors those simulations produced. |
| Validation | Follows both doctors into a new year; draws further years; runs 200 replications. |
| Conclusion | Four takeaways, plus why monitoring and investigating are not the error. |

Advancing to the analysis requires choosing a doctor: the scenario is about what happens to a comparison once somebody has been singled out.

Doctors are numbered rather than named, and the introduction states plainly that the hospital, the doctors and the patients are generated in the browser and that no real institution, clinician, patient or study is involved.

## Expected observation

With the default settings, on a hospital whose overall mortality is 11.0%:

| | Deaths | Mortality | p against the hospital rate |
| --- | --- | --- | --- |
| Doctor 11, audited by prior arrangement | 7 of 60 | 11.7% | 0.490 |
| Doctor 19, picked out of the table | 16 of 60 | 26.7% | < 0.001 |

then, adjusting for who they were treating (doctor 19's patients averaged 14.5% risk against the hospital's 10.4%):

| | Deaths | Expected | Deaths ÷ expected | p against their own patients |
| --- | --- | --- | --- | --- |
| Doctor 11 | 7 | 9.3 | 0.76 | 0.848 |
| Doctor 19 | 16 | 8.7 | **1.84** | **0.009** |

and then:

- adjusted for the search: **p = 0.206**, with some doctor reaching p < 0.05 in **72%** of years where every doctor is identical;
- the five most alarming simulated doctors: ratios from 2.1 to 2.7, every one p < 0.001, all in hospitals where the doctors are interchangeable;
- next year, doctor 19 records 10 deaths against 8.9 expected — a ratio of 1.12, p = 0.402;
- over 200 years: average ratio **1.00** for the audited doctor and **1.03** for the flagged one, flagged in **4.0%** and **5.0%** of years respectively — both back at the error rate the test was always entitled to;
- re-running the search each year lands on a different doctor **98%** of the time.

The numbers move with the seed; the pattern does not.

## Explanation

Two separate things inflate the first number, and they fail in different ways.

The first is **confounding**. The doctor's patients really were sicker, so part of the excess is caused by the case mix rather than by the doctor. This part is real, explainable and removable: comparing against what those particular patients were expected to produce is exactly what risk adjustment does, and here it removes about half the excess.

The second is **selection**, and no adjustment touches it. Mortality per doctor is a count of a few rare events, which varies a great deal between years for reasons that have nothing to do with the doctor. Take the most extreme of forty such counts and you are looking at the top of a distribution. The test is not wrong; it answered the question "is this doctor's count unusual for a doctor fixed in advance?" — and this doctor was not fixed in advance.

The remedy is the same as everywhere else in this application: measure the result against the distribution of the procedure that produced it, or against data the procedure never saw.

## Validation

Two forms, answering different questions:

1. **Adjusting for the search** (Monte Carlo, on this year's hospital) — what does this procedure produce when every doctor is identical? Answer: an alarming doctor most years.
2. **Later years** (new patients, both doctors frozen) — is this doctor's record a property of the doctor? Answer: no. Both doctors converge on a ratio of 1 and on the nominal 5% error rate, and they become indistinguishable from each other.

The replication panel adds a third observation that neither p-value shows: next year's worst doctor is somebody else 98% of the time. The hospital produces a worst doctor every single year, and it is almost never the same one.

## Common misunderstanding

- **"The difference was real, so the doctor is responsible."** The difference in raw mortality is real. Its cause is the case mix and the play of chance, neither of which is the doctor.
- **"They risk-adjusted, so the comparison is fair now."** Risk adjustment makes the comparison fair with respect to the risks it was given. It cannot adjust for risks nobody recorded, and it knows nothing about how the doctor was chosen. Here it is handed the patients' *true* risks and still leaves a result that does not survive.
- **"p = 0.009 with 40 doctors is still impressive."** Among 40 independent tests, the smallest p-value is below 0.009 more often than not. That is what the Monte Carlo measures, and it returns 0.206.
- **"So league tables are useless."** They are a reasonable alarm and a terrible verdict. Monitoring outcomes is how problems get noticed; the error is stopping at the alarm.
- **"A bigger hospital would settle it."** More doctors means more chances for an extreme one. More patients per doctor would make each estimate steadier, which helps — but the selection correction is still needed.
- **"Nobody would really draw a conclusion from one year of data."** This is the scenario's reason for existing, and the reason the conclusion stage says plainly that careers and patient trust are real even when the data are simulated.

## Implementation notes

```text
src/scenarios/04-doctor-mortality/
  Scenario.tsx                        stage machine and layout
  model.ts                            risk model parameters, limits, the audited doctor
  simulation.ts                       true data-generating process, case mix, seed roles
  analysis.ts                         both tests per doctor, the search, Monte Carlo, validation
  components/DoctorChart.tsx          one column per doctor, raw rate or adjusted ratio
  components/HospitalControls.tsx     doctors, patients per doctor, seed
  components/SearchGallery.tsx        the most alarming simulated years, redrawn
  tests/                              model, simulation, analysis
```

New shared statistics, usable by later scenarios:

- `statistics/distributions/poissonBinomial.ts` — pmf, upper tail, mean and variance of a sum of independent indicators with different probabilities.
- `statistics/hypothesis/riskAdjustedTest.ts` — observed against expected for individuals with their own risks, with an exact p-value and a standardized excess.

**Why not a normal approximation.** The counts are small and the probabilities are unequal, which is where a normal approximation is least trustworthy — and the whole point of the scenario is that the first p-value is impeccable. The convolution costs `O(k²)` per doctor, about 3,600 operations for 60 patients, so 300 simulated years of 40 doctors run in roughly a third of a second.

**The same chart twice.** `DoctorChart` draws either the raw rate against the hospital rate or the adjusted ratio against 1, because the point of the scenario is that those are two different pictures of the same year. The stage decides which one is on screen.

**Redrawing a simulated year.** As in the earlier scenarios, a simulated search stores only its replication index and the doctor it flagged; `selectionNullHospital` regenerates the exact year from the seed. A test asserts the round-trip reproduces the recorded deaths and p-value.
