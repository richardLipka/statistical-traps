const interestingregion = {
  intro: {
    heading: 'One period, fixed in advance',
    body1:
      'A machine records one value per period. Each period the value moves up or down by an independent random amount — a coin flip with a size, drawn fresh every time and owing nothing to what came before. There is no trend, no cycle, no turning point and no interesting period, because we wrote the generator and put none of those things in it.',
    body2:
      'What the machine shows is not the steps but the running total, and that is the whole difficulty. Each value carries the entire history of the ones before it, so the record climbs, stalls and reverses. It looks like something is happening to it.',
    goalHeading: 'What this experiment is meant to show',
    goalBody:
      'That a record whose every number is drawn independently of the last still looks as though it has periods of rise and collapse. And that picking the most striking stretch out of it gives you a "finding" — simply because there are several thousand stretches to choose from.',
    goalStep1:
      'Run the machine and test the stretch we fixed in advance. It finds nothing.',
    goalStep2:
      'Then mark the stretch that looks most striking to us, and apply the same test to it. That one looks like a finding.',
    goalStep3:
      'Then measure what such a search can do in a record with no trend, and run the machine again. Nothing of it survives.',
    question: 'Did the value change over the middle third of the record by more than chance allows?',
    body3:
      'The middle third is fixed now, before the machine is switched on, so nothing about the data can have influenced the choice. That is the only thing that makes the question answerable.',
    trueProcess:
      'Each period the value moves by an independently drawn step: zero on average, typically about {{sd}} in size, as often up as down. The chart shows the running total of those steps. True trend: none, anywhere in the record.',
    action: 'Start the machine',
  },
  experiment: {
    heading: 'The record',
    body1:
      'Here is one complete record. The stretch fixed in advance is marked, and the test asks the obvious question about it: is the change across those periods larger than independent steps would plausibly produce?',
    body2:
      'It is not. Change the length of the record or the seed and watch the answer stay uninteresting — there is nothing in the machine for it to find.',
    numbersTitle: 'What do these numbers mean?',
    numbersBody1:
      'The change across a stretch is simply the difference between its two ends — how far the value rose or fell in total. On its own it says nothing: a longer stretch accumulates more steps, so even a purely random change tends to be larger.',
    numbersBody2:
      'That is what z is for. It expresses the change as a multiple of the random wobble a stretch that long is expected to produce: a z near zero is an ordinary stretch, a z near three is one that stands out of the noise. The p-value then says how often a z that large would turn up for a stretch fixed in advance — and 0.05 is a convention, not a proof.',
    action: 'Now look for an interesting period',
  },
  controls: {
    heading: 'Experiment settings',
    periodCount: 'Length of the record',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same record, so any result here can be reproduced exactly.',
  },
  plot: {
    notStarted: 'The machine has not been started yet.',
    aria: 'A record of {{count}} periods, drawn as the running total of the individual steps.',
    legendRecord: 'The record',
    edgeAria: 'The {{edge}} of your period, currently at {{period}}. Move it with the left and right arrow keys.',
    edgeStart: 'start',
    edgeEnd: 'end',
  },
  windows: {
    preRegisteredRange: 'Periods {{start}}–{{end}}, fixed in advance ({{length}} steps)',
    preRegisteredShort: 'Fixed in advance',
    chosenRange: 'Periods {{start}}–{{end}}, chosen by you ({{length}} steps)',
    chosenShort: 'Chosen afterwards',
  },
  stats: {
    periods: 'Periods',
    change: 'Change across it',
    z: 'z',
    pValue: 'p-value as usually reported',
  },
  observation: {
    heading: 'Find the interesting period',
    body1:
      'Now choose your own stretch of the record. Drag either edge and watch the numbers follow: the change from one end of your period to the other, and the p-value that this change would normally be reported with.',
    dragHint:
      'The shortest period you may mark is five steps. Every position and every length is scored by exactly the same test as the stretch fixed in advance.',
    body2:
      'Hunt around. A period where the value climbed steadily, or fell off a cliff — anything that would be worth writing a sentence about. The machine will oblige, because there are a great many stretches to choose between.',
    autoBest: 'Find the most striking period',
    reset: 'Start over',
    autoBestNote:
      'That is the most striking stretch in this record, chosen out of all {{candidates}} of them by trying every one and keeping the best.',
    action: 'Compare it with the period fixed in advance',
  },
  analysis: {
    heading: 'The same test, two ways of choosing a period',
    body1:
      'Both rows were tested identically, with the same formula and the same known standard deviation. Neither test is wrong. The only difference is whether the stretch was named before the data existed or picked out of them afterwards.',
    naivePValue: 'p-value as usually reported',
    naiveHint:
      'Two-sided test that the total change across the period is zero, for steps of known standard deviation.',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    body2:
      'The test answers exactly one question: how unusual is this change, for a period fixed in advance? Your period was not fixed in advance. It was the most striking of {{candidates}} stretches, and the p-value has no way of knowing that.',
    runFirst:
      'The correction below is the point of this stage: without it, the row above is the number that would be reported.',
    selection: {
      heading: 'What the search alone is worth',
      body: 'To judge the period honestly we simulate the entire procedure: generate a fresh record with no trend in it, test all {{candidates}} stretches, and keep the most striking one. Repeat {{replications}} times.',
      run: 'Simulate the search {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Most striking period found by the same search in records with no trend',
      histogramX: '|z| of the most striking period found',
      histogramY: 'Number of simulated searches',
      marker: 'Your period',
      adjusted: 'p-value adjusted for the search',
      adjustedHint:
        'Monte Carlo p-value: how often the same search of a record with no trend turns up a period at least as striking as |z| = {{z}}.',
      shareSignificant:
        'In {{share}} of the simulated records the search found a period below 0.05 — in data with no trend at all. Search enough stretches and a striking one is not a lucky find but a certainty.',
      conclusion:
        'The same result read two ways: p {{naive}} as the number would normally be reported, p {{adjusted}} once the search that produced it is counted. Nothing about the data changed between those two numbers.',
      gallery: {
        heading: 'The five most striking periods those simulations found',
        body: 'Every record below is a machine with no trend, and every highlighted stretch is the most striking period in it. Each one would be reported with the numbers shown underneath.',
        caption: 'Simulation {{index}}',
        item: 'Periods {{start}}–{{end}} · change {{change}}',
        itemStats: '|z| {{z}} · p {{p}}',
        plotAria:
          'Simulation {{index}}: a record with no trend, with periods {{start}} to {{end}} marked as the most striking stretch found in it.',
      },
    },
    explanation: {
      title: 'Why does this happen?',
      body1:
        'The steps are independent, but the record is their running total, and a running total of independent steps wanders. It drifts a long way from where it started, turns around, and drifts again. None of that is a trend: it is what independence looks like once you add it up. The eye reads the picture as a story because the picture genuinely has long smooth stretches in it.',
      body2:
        'A stretch chosen after seeing the record is the winner of a competition that the p-value was never told about. One test at the 5% level is wrong about one time in twenty; thousands of overlapping tests, with the largest reported, are wrong almost always. The correction here is not a different formula but the honest null distribution — the distribution of the winner, not of a single contestant.',
      body3:
        'This is the same mistake as drawing the target around the darts and as choosing the model that fits best. A position, a model, a period: whatever the search runs over, the reported number describes the last step of the procedure and not the procedure.',
    },
    action: 'Test it on a new record',
  },
  validation: {
    heading: 'A new, independent record',
    body1:
      'Both periods are now frozen as dates — the same stretches, named before these data existed. The machine produces a completely new record, which took no part in choosing anything, and both are measured on it.',
    body2:
      'The period fixed in advance behaves exactly as it did before. So does the one you found, and that is the point: on data it did not help to select, it is an ordinary stretch of an ordinary record. Whatever made it remarkable belonged to the old record, not to those dates.',
    originalRecord: 'Original record',
    freshChange: 'Change on the new record',
    freshPValue: 'p-value on the new record',
    tableHint: 'The same two stretches of periods, measured on a record that had no part in choosing them.',
    freshData: 'New record',
    drawFresh: 'Draw another independent record',
    replications: {
      heading: 'Repeat on many independent records',
      body: 'Each replication is a new record from the same machine, measured over the same two frozen stretches of periods.',
      run: 'Run {{replications}} replications',
      meanAbsZ: 'Average |z| on new records',
      shareSignificant: 'Called significant',
      tableHint:
        'Both stretches were fixed before these records existed, so both should be called significant about 5% of the time — and both are.',
      note: 'Running the search again on each new record picks a period that does not even overlap yours in {{share}} of them, and its winner averages |z| = {{z}}. The search reliably finds something striking, and it is somewhere else every time. That is what it means for a finding to be an artefact of the search.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'What this scenario shows',
    point1:
      'A running total of independent steps looks like it has trends and turning points. Structure in the picture is not evidence of structure in the process.',
    point2:
      'The p-value is correct for the question it was asked. Choosing which stretch to ask about, after seeing the data, changes the question without changing the arithmetic.',
    point3:
      'The size of the search is part of the result. A p-value of 0.001 from one pre-specified test and the same p-value from the best of several thousand are not the same evidence.',
    point4:
      'A period found by searching is a hypothesis about those dates. New records settle it, and here they settle it against.',
    legitimate: {
      heading: 'Scanning data is not the error',
      body: 'Searching a record for unusual stretches is exactly how outbreak detection, quality control and monitoring are supposed to work, and the statistics for it are well developed — scan statistics correct for the family of windows being searched, precisely so that the winner can be judged fairly. The error is running the scan and then reporting the winner as though that single window had been specified in advance.',
    },
    nextHeading: 'Where this goes next',
    nextBody:
      'The search has run over a position, a model and now a stretch of time, and each time the data were obviously simulated. The next scenario puts the same search into a setting where the numbers look like they are about people — which is where the mistake stops being harmless.',
  },
}

export default interestingregion
