const mysteriouscorrelation = {
  intro: {
    heading: 'One relationship, named before the data arrive',
    body1:
      'A table of measurements: one row per case, one column per variable. Every column is generated independently of every other one — no shared cause, no chain of influence, no lurking third variable. Take any two columns and one tells you nothing whatsoever about the other.',
    body2:
      'Before the data are collected we name one pair to look at, because somebody had a reason to expect a relationship there. That is one test, and it will answer honestly.',
    goalHeading: 'What this experiment is meant to show',
    goalBody:
      'That sweeping a table for everything now costs a few milliseconds — and that the number of pairs grows so fast that even in data where nothing is related, dozens of them come back "significant". And above all: that you can see this, if you look at the distribution of all the results instead of at the best one.',
    goalStep1:
      'Test one pair we named for ourselves in advance. It finds nothing.',
    goalStep2:
      'Then let the tool test every pair in the table and take the strongest. That one looks like a finding.',
    goalStep3:
      'Then look at every p-value at once, and test the finding on new rows. Nothing of it survives.',
    question:
      'Are variable {{a}} and variable {{b}} related more strongly than chance allows?',
    body3:
      'Then we will do what is actually done with a table like this: hand it to an analyst that tests every pair there is, and see what comes back.',
    trueProcess:
      'Every value in the table is an independent draw from the same distribution. No variable influences any other, and none of them share a cause. True correlation between every pair: zero.',
    fictionHeading: 'Nothing here is real',
    fictionBody:
      'The table is generated in your browser from a seed. It is not a real data set and the variables are not real measurements. They are numbered rather than named, and that is the honest version of this scenario: in practice the two variables arrive with names, and the names are where the explanation comes from.',
    action: 'Collect the data',
  },
  experiment: {
    heading: 'The table, and the pair we asked about',
    body1:
      'The triangle at the top is a map of every pair at once: each cell is one pair of variables, and how strongly it is shaded says how closely that pair moves together. Red means they rise together, blue that one rises as the other falls. It is a field of noise, which is exactly what it should be.',
    body2:
      'The pair named in advance is outlined in the map and plotted underneath, one dot per case. The dots lie around no line at all, the correlation is near zero, and the test finds nothing — which is correct.',
    numbersTitle: 'What do these numbers mean?',
    numbersBody1:
      'The correlation r says how tightly the dots lie around a single straight line. Zero is a shapeless cloud, plus one a perfect rise, minus one a perfect fall. 0.02 is a cloud; −0.57 is a visibly stretched cluster that the eye finishes into a line by itself.',
    numbersBody2:
      'The p-value answers: if those two variables were unrelated, how often would their correlation come out at least this strong anyway? With a few dozen rows, a correlation of only about 0.3 already reaches 0.05 — which is why that bar is so low, and why so many of thousands of pairs clear it.',
    action: 'Now let the analyst loose',
  },
  controls: {
    heading: 'Experiment settings',
    variableCount: 'Variables in the table',
    variablesValue: '{{variables}} → {{pairs}} pairs',
    observationCount: 'Rows of data',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same table. Adding variables does not add information — it adds pairs, and pairs grow roughly as the square of the variables.',
  },
  plot: {
    notCollected: 'The data have not been collected yet.',
    matrixAria:
      'Map of the correlation between every pair of {{variables}} variables: {{pairs}} shaded cells.',
    pairAria: 'Variable {{a}} plotted against variable {{b}}, with the line fitted to them.',
    legendRow: 'One case',
    legendMatrix: 'Map: every pair · plot: the selected pair',
  },
  pairs: {
    label: 'Variables {{a}} and {{b}}',
    preRegistered: 'Variables {{a}} and {{b}}, named in advance',
    preRegisteredShort: 'Named in advance',
    discovered: 'Variables {{a}} and {{b}}, found by the sweep',
    discoveredShort: 'Found by the sweep',
  },
  stats: {
    variables: 'Variables',
    rows: '{{rows}} rows each',
    pairs: 'Pairs tested',
    pairsHint: 'every combination of two',
    threshold: 'Significance bar',
    thresholdHint: 'from this correlation up, the test reports a finding',
    correlation: 'Correlation r',
    t: 't',
    pValue: 'p-value as usually reported',
  },
  observation: {
    heading: 'What the analyst found',
    body1:
      'The sweep tests all {{pairs}} pairs in the table — every combination of two variables — and ranks them by how strong the relationship looks. On this hardware it takes a few milliseconds, which is the practical reason this is the default way to look at data.',
    runSweep: 'Run the sweep',
    body2:
      'It found {{count}} pairs below 0.05 out of {{pairs}}. Here are the strongest, the way an automated analysis hands them over.',
    discoveries: 'Strongest relationships found',
    discoveriesHint:
      'Pick one to look at properly. Each is a genuine correlation in this table, tested exactly as the pair named in advance was.',
    namingNote:
      'Imagine these two columns had names. The relationship would arrive with a mechanism attached, and the mechanism would sound reasonable — that is the part this scenario leaves out on purpose.',
    selectFirst: 'Choose a relationship to take further.',
    action: 'Write it up properly',
  },
  analysis: {
    heading: 'The same test, two ways of choosing a pair',
    body1:
      'Both rows below were tested identically: the same correlation test on the same rows of the same table. The only difference is whether the pair was named before the data or chosen from them afterwards.',
    naivePValue: 'p-value as usually reported',
    naiveHint: 'Exact test that the correlation is zero, for that pair alone.',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    runFirst:
      'Both corrections below are the point of this stage: without them, the row above is the number that would be reported.',
    sweep: {
      heading: 'Correction 1: look at the whole sweep, not the winner',
      body: 'The single most useful thing to do with {{pairs}} tests is to stop looking at the best one and look at all of them together.',
      significant: 'Below 0.05',
      expected: 'Expected by chance',
      expectedHint: '5% of {{pairs}}',
      discoveries: 'Survive at 5% FDR',
      discoveriesHint: 'Benjamini-Hochberg, the correction data mining uses',
      histogramTitle: 'The p-values of every pair in the table',
      histogramX: 'p-value',
      histogramY: 'Number of pairs',
      flat: 'That histogram is the scenario in one picture. When nothing is related to anything, p-values are spread evenly between 0 and 1 — so the bar at the left is not a cluster of discoveries, it is the left-hand end of a flat distribution. A table with something real in it looks different: a spike at the left that the rest of the range cannot account for.',
      corrections:
        'The formal corrections agree. Bonferroni puts the strongest pair at p {{bonferroni}}, and the false discovery rate would have to be set as high as {{fdr}} before anything in this table counted as a discovery at all.',
    },
    selection: {
      heading: 'Correction 2: simulate the sweep',
      body: 'The same answer from the other direction: generate another table where nothing is related, sweep all {{pairs}} pairs, keep the strongest. Repeat {{replications}} times.',
      run: 'Simulate the sweep {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Strongest correlation found by the same sweep, table after table',
      histogramX: '|r| of the strongest pair found',
      histogramY: 'Number of simulated tables',
      marker: 'Your pair',
      adjusted: 'p-value adjusted for the sweep',
      adjustedHint:
        'Monte Carlo p-value: how often a table where nothing is related produces a strongest pair at least as strong as |r| = {{r}}.',
      meanSignificant:
        'On average the sweep calls {{average}} of the {{pairs}} pairs significant in a table where every variable is independent of every other. That number is not a bug in the sweep; it is what the threshold promises.',
      conclusion:
        'The same result read two ways: p {{naive}} for a pair named in advance, p {{adjusted}} for a pair found by sweeping. The rows of data are the same rows.',
      gallery: {
        heading: 'The five strongest relationships those simulations produced',
        body: 'Every table below has independent columns and nothing else. In each, the plot is the strongest pair its sweep could find, and every one of them would look like a discovery.',
        caption: 'Simulated table {{index}}',
        itemStats: 'r {{r}} · p {{p}}',
        plotAria:
          'Simulated table {{index}}: variables {{a}} and {{b}}, the strongest pair found in a table where nothing is related.',
      },
    },
    explanation: {
      title: 'Why does this happen?',
      body1:
        'A correlation test at the 5% level is wrong one time in twenty, so a sweep of 1,770 pairs is wrong about 88 times. The scenario does not have to arrange this: the expected count and the observed count agree to within a couple of pairs, which is what "nothing is there" looks like when you test everything.',
      body2:
        'Two things make the result persuasive anyway. The first is the plot: forty points with a line through them look like a relationship regardless of what produced them, and the eye does not know how many other plots were rejected to find this one. The second is the name. Real columns have names, and a named pair arrives with a story about why one might drive the other — which is supplied after the fact, and would have been supplied just as readily for any of the other 1,769 pairs.',
      body3:
        'This is the same mistake as every earlier scenario, and the only thing that has changed is the speed. A person moving a target can try a few dozen positions; a sweep tries every pair in the table before the page finishes loading. The size of a search is the part of a result that never appears in the report.',
    },
    action: 'Test it on new rows',
  },
  validation: {
    heading: 'New rows, the same two pairs',
    body1:
      'Both pairs are now fixed in advance of the data being collected — one by the original question, one by the sweep. New rows are measured, and the line fitted to the original data is carried over unchanged, so it now has to predict rather than describe.',
    body2:
      'This is the question the discovery was implicitly making: knowing one variable should tell you something about the other. On rows that took no part in finding the pair, it tells you nothing — and the fitted line predicts them worse than ignoring it would.',
    original: 'Original rows',
    freshCorrelation: 'New rows: r',
    freshPValue: 'New rows: p-value',
    tableHint: 'The same two pairs, measured on rows that took no part in choosing either of them.',
    freshBatch: 'New rows',
    drawFresh: 'Collect another independent batch',
    replications: {
      heading: 'Repeat on many independent batches',
      body: 'Each replication is a new batch of rows for the same variables, measured on the same two frozen pairs.',
      run: 'Run {{replications}} batches',
      meanR: 'Average r',
      shareSignificant: 'Significant in a batch',
      prediction: 'R² predicting new rows',
      tableHint:
        'Both pairs were fixed before these batches existed, so both should be significant about 5% of the time — and both are. A negative R² means the fitted line predicts new rows worse than using the average would.',
      note: 'Sweep each new batch and it reports a different pair {{share}} of the time. The discovered pair does not even keep the direction of its original correlation more than {{direction}} of the time — a coin flip. Every batch of this table yields a strongest pair, and it is never the same one.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'What this scenario shows',
    point1:
      'Testing everything is cheap, and the number of pairs grows roughly as the square of the number of variables. "We checked all the data" describes the size of a family of tests, not thoroughness.',
    point2:
      'The best single defence is to look at the whole distribution of results rather than the top of it. Under no effect, p-values are flat; a real signal makes a spike that the flat part cannot account for.',
    point3:
      'Describing the data you have and predicting data you do not have are different claims. A correlation found by searching does the first and fails the second.',
    point4:
      'A discovered relationship is a hypothesis with a plot attached. Fresh rows decide it, and here they decide against it every time.',
    legitimate: {
      heading: 'Searching the data is not the error',
      body: 'Sweeping many variables is how hypotheses get generated, and in fields where the candidates run into the millions it is the only practical approach. Those fields know exactly what it costs: they report the whole distribution of results, control the false discovery rate rather than pretending each test stood alone, and treat anything found as something to be confirmed on new data. The error is the shortcut — reporting the winner as though it had been the only question asked.',
    },
    nextHeading: 'Where this goes next',
    nextBody:
      'That is every mechanism in this application: a position, a model, a period, a person, an outcome and now a whole table of variables searched automatically. The last scenario asks what follows for systems that do this at a scale no person could — which is a question about what a found pattern is, not about whether the machine is clever.',
  },
}

export default mysteriouscorrelation
