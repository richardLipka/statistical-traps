const bestline = {
  intro: {
    heading: 'An analysis fixed in advance',
    body1:
      'A machine produces pairs of numbers. The two coordinates are drawn independently: y is pure noise that has nothing whatsoever to do with x. As in the first scenario, we know this because we wrote the generator — the true relationship is none at all.',
    body2:
      'Before seeing a single point we commit to one analysis: fit one straight line through the sample and ask whether it explains more than a flat line does.',
    question: 'Does a straight line describe these points better than chance alone would allow?',
    body3:
      'The answer must be no. Everything interesting that follows comes from how hard we are willing to look afterwards.',
    trueProcess: 'x uniform, y independent noise around zero. True relationship: none.',
    action: 'Draw the sample',
  },
  experiment: {
    heading: 'A sample of pure noise',
    body1:
      'Here is one sample. The points wander, as points do, and the straight line fixed in advance runs through them without finding anything: the small amount of variation it reproduces is what a line reproduces in noise.',
    body2:
      'Change the sample size or the seed and watch the line move around. None of that movement means anything — there is nothing for it to mean.',
    action: 'Now look for a model that fits',
  },
  controls: {
    heading: 'Experiment settings',
    pointCount: 'Number of points',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same sample, so any result here can be reproduced exactly.',
  },
  plot: {
    aria: 'Scatter plot of {{count}} points with the models currently shown.',
    xLabel: 'x',
    yLabel: 'y',
    legendPoint: 'Observation',
    handleAria: 'End of your line at {{side}}, currently {{value}}. Move it with the arrow keys.',
    sideLeft: 'the left edge',
    sideRight: 'the right edge',
  },
  models: {
    flat: 'Flat line: no relationship',
    flatShort: 'No relationship',
    preRegistered: 'Straight line, decided in advance',
    preRegisteredShort: 'Decided in advance',
    manual: 'Your own line',
    manualShort: 'Your line',
    chosen: 'Model chosen after seeing the data',
    chosenShort: 'Chosen afterwards',
    degree: 'Degree {{degree}}',
    degreeShort: 'd{{degree}}',
  },
  stats: {
    points: 'Points',
    rSquared: 'R² on this sample',
    rSquaredHint: 'The share of the variation in y that the model reproduces. More flexibility can only raise it.',
    pValue: 'p-value as usually reported',
    freshRSquared: 'R² on new data',
    rmse: 'Typical prediction error',
    rmseHint: 'Root mean squared error, in the units of y. The noise itself has a spread of {{noise}}.',
    notApplicable: 'not defined',
  },
  observation: {
    heading: 'Find the model that fits best',
    body1:
      'Drag the two handles and put your own line wherever it seems to describe the points best. It is scored exactly as any model is: R² is the share of the variation in y that it reproduces.',
    manualHint:
      'R² of a hand-drawn line can be negative. Below zero it predicts worse than simply using the average of y.',
    fitLine: 'Fit the best straight line',
    body2:
      'A straight line is not the only thing we could have fitted. Give the model more flexibility and it starts to bend towards the points — and R² can only go up as it does.',
    flexibility: 'Flexibility of the model',
    degreePickerHint:
      'Each degree is fitted by least squares, and each comes with the p-value that would normally be reported for it. Pick whichever looks most convincing.',
    autoBest: 'Pick the most convincing model',
    resetManual: 'Back to my own line',
    testNote:
      'The F-test assumes a least-squares fit, so your hand-drawn line gets an R² but no p-value. Every fitted degree gets both.',
    action: 'Compare it with the analysis fixed in advance',
  },
  analysis: {
    heading: 'The same test, two ways of choosing a model',
    body1:
      'Both rows below were tested identically: the standard F-test, asking whether the model explains more of y than a flat line does. The only difference is when the model was chosen.',
    naivePValue: 'p-value as usually reported',
    naiveHint: 'Overall F-test of the regression.',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    body2:
      'The F-test already charges for every parameter, so flexibility alone does not fool it. What fools it is that we tried {{count}} models and reported the one that came out best.',
    selection: {
      heading: 'What the search alone is worth',
      body: 'To judge the chosen model honestly we simulate the entire procedure: draw a fresh sample of pure noise, fit every degree from 1 to {{maxDegree}}, keep the smallest p-value. Repeat {{replications}} times.',
      run: 'Simulate the search {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Smallest p-value found by the same search in pure noise',
      histogramX: 'Smallest p-value of the search',
      histogramY: 'Number of simulated searches',
      marker: 'Your result',
      adjusted: 'p-value adjusted for the search',
      adjustedHint:
        'Monte Carlo p-value: how often the same search of pure noise produces a p-value at least as small as {{pValue}}.',
      shareSignificant:
        'In {{share}} of the simulated samples the search found something below 0.05 — in data where nothing is there. A procedure meant to be wrong 5% of the time is wrong {{share}} of the time once the model is chosen from the data.',
      conclusion:
        'Measured against its own search, the result is ordinary: a p-value of {{pValue}} is what this procedure produces in noise.',
      gallery: {
        heading: 'The five most convincing finds from those simulations',
        body: 'Every sample below is pure noise, and every curve is the model that came out best in it. Each one would be reported with the p-value shown underneath.',
        caption: 'Simulation {{index}}',
        item: 'Degree {{degree}} · R² {{rSquared}}',
        itemPValue: 'p {{p}}',
        plotAria: 'Simulation {{index}}: {{count}} random points with the most convincing model found in them.',
      },
    },
    explanation: {
      title: 'Why does this happen?',
      body1:
        'Two different things are going on, and they are worth separating. R² rises with flexibility for a purely mechanical reason: a more flexible model contains the simpler one, so it can never fit worse. A high R² on the sample the model was built from is therefore not evidence of anything by itself.',
      body2:
        'The p-value is not fooled that way — the F-test discounts every parameter. It is fooled by the search. Trying nine models and reporting the best one is nine chances to be unlucky, and the reported p-value describes only the last of them.',
      body3:
        'This is the same move as dragging the target around the darts. The circle became a curve, and the board became a model space, but the mistake is identical: a hypothesis picked out of the data, presented as though it had been fixed before.',
    },
    action: 'Test it on new data',
  },
  validation: {
    heading: 'New, independent points',
    body1:
      'The models are now frozen: the flat line, the straight line fixed in advance and the model you chose. The machine draws a completely new sample from the same process, and all three are asked to predict it.',
    body2:
      'Fitting is easy and prediction is not. The flexible model followed every wobble of the original sample, and none of those wobbles came back.',
    drawFresh: 'Draw a new independent sample',
    originalData: 'Original sample',
    freshData: 'New sample',
    curve: {
      heading: 'Fit against prediction, degree by degree',
      body: 'The same two numbers for every flexibility the search could have chosen: how well the model describes the sample it was fitted to, and how well it predicts the new one.',
      xLabel: 'Degree of the model',
      yLabel: 'R²',
      training: 'On the original sample',
      fresh: 'On the new sample',
      clipNote: 'The prediction curve leaves the chart below −2; the exact values are in the table above.',
    },
    replications: {
      heading: 'Repeat on many independent samples',
      body: 'Each replication is a new sample from the same process, predicted by the three frozen models.',
      run: 'Run {{replications}} replications',
      running: 'Running…',
      meanRSquared: 'Average R² on new data',
      meanRmse: 'Average prediction error',
      worseThanFlat: 'Worse than claiming nothing',
      note: 'Every model is at or below zero on data it has not seen, because there is nothing in the data to predict. The chosen model is not merely useless: it is reliably worse than claiming no relationship at all, and it is worse precisely because it fitted the original sample so well.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'What this scenario shows',
    point1:
      'How well a model describes the data it was built from says little about the model. Flexibility raises that number mechanically.',
    point2:
      'A p-value describes one pre-specified test. Fit several models and report the best, and it no longer describes what you did.',
    point3:
      'The cost of a search has to be paid somewhere: either by correcting for it, or by testing the result on data that had no part in the search.',
    point4:
      'A model that follows the noise in one sample predicts the next one worse than a model that claims nothing.',
    legitimate: {
      heading: 'Flexible models are not the error',
      body: 'Flexible models are indispensable, and trying several of them is how model selection works. Done properly the comparison is made on data held out for that purpose, and the winner is reported as the outcome of a search — which is a hypothesis worth testing, not a finding.',
    },
    nextHeading: 'Where this goes next',
    nextBody:
      'So far the search has been over one thing at a time: a position, then a model. The next scenario lets the search run over subgroups of the data, where it is much harder to notice that a search happened at all.',
  },
}

export default bestline
