const dartboard = {
  intro: {
    heading: 'A target fixed in advance',
    body1:
      'A machine throws darts at a square board completely at random. Every position is equally likely: there is no aim, no skill, no preferred spot. We know this because we wrote the generator — no place on the board is any better for the machine than any other.',
    body2:
      'Before the first throw we declare one target: the blue circle in the middle. We also declare the question we are going to ask about it.',
    goalHeading: 'What this experiment is meant to show',
    goalBody:
      'That drawing the target after the darts have landed is enough to turn completely random throws into a "finding". The machine is not aiming — we simply change the question, and we change it once we already know the answer.',
    goalStep1:
      'The machine throws, and we test the blue target we fixed in advance. It finds nothing.',
    goalStep2:
      'Then we move the red circle ourselves to wherever the darts are densest, and apply exactly the same test. That one looks like a finding.',
    goalStep3:
      'Then we measure what such a search can do in purely random data, and let the machine throw again. Nothing of it survives.',
    question: 'Does the machine hit this circle more often than chance alone would explain?',
    body3:
      'Nothing that follows can change the truth about the machine. Everything that follows changes only how we look at its output.',
    trueProcess:
      'Every dart’s position is drawn uniformly across the whole board, independently of every other. No place is favoured: the true effect of anything on the board is exactly zero.',
    action: 'Throw the darts',
  },
  experiment: {
    heading: 'Random throws',
    body1:
      'There is no pattern in these darts. The blue circle catches a few of them, roughly as many as its area predicts — sometimes a little more, sometimes a little less.',
    body2:
      'Change the settings and watch how the count moves around. That movement is the raw material every trap in this application is built from.',
    numbersTitle: 'What do these numbers mean?',
    numbersBody1:
      'The circle covers {{share}} of the board, so random throws put about that same share of the darts inside it — roughly {{expected}} out of {{darts}}. That is the expected number of hits. The actual number wobbles up and down around it, and everything else in this scenario rests on how large that wobble is.',
    numbersBody2:
      'When a p-value appears shortly, it will answer one question: if the machine were throwing completely at random, how often would it land at least this many darts in this circle? 0.9 means "this or better happens nine times in ten, nothing unusual". 0.001 means "this would happen about once in a thousand" — and results like that start being called findings. The 0.05 threshold is a convention, not a proof.',
    action: 'Now go looking for a pattern',
  },
  controls: {
    heading: 'Experiment settings',
    dartCount: 'Number of darts',
    radius: 'Target radius',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same darts, so any result here can be reproduced exactly.',
  },
  board: {
    aria: 'Square dartboard with {{count}} randomly thrown darts.',
    legendDart: 'Dart',
  },
  targets: {
    preset: 'Target fixed in advance',
    presetShort: 'Fixed in advance',
    postHoc: 'Target chosen after seeing the data',
    postHocShort: 'Chosen afterwards',
    postHocAria:
      'Target chosen after seeing the data. Horizontal position {{x}} percent, vertical position {{y}} percent. Move it with the arrow keys.',
    dragHint: 'Drag the red circle with the mouse or touch, or select it and use the arrow keys.',
  },
  stats: {
    dartsThrown: 'Darts thrown',
    hitProbability: 'Chance of hitting a circle this size',
    hitProbabilityHint: 'Circle area divided by board area. The same for both circles.',
    expected: 'Expected hits by chance',
    hits: 'Hits',
    hitsOf: '{{hits}} of {{total}} darts',
    capturedNow: 'Currently captured',
    best: 'Best possible here',
  },
  observation: {
    heading: 'Draw the target around the darts',
    body1:
      'Drag the red circle anywhere on the board and capture as many darts as you can. It is exactly the same size as the blue one; the only difference is that you are choosing its position now, with the data already in front of you.',
    body2:
      'This is not cheating in any obvious sense. It is what a subgroup, a threshold, a time window or a region of interest often is in practice: a choice made after the data arrived.',
    testBody:
      'Exactly the same test that was prepared for the blue circle is now running on yours, live. Hunt for the position that pushes the p-value as low as you can — that hunt is the whole point of this scenario.',
    livePValue: 'p-value of your circle',
    auto: 'Find the best position automatically',
    autoHint:
      'The search examines every placement that could possibly be optimal — {{count}} candidate positions for these darts.',
    reset: 'Reset the red circle',
    action: 'Apply the same test to both circles',
  },
  analysis: {
    heading: 'The same test applied to both circles',
    body1:
      'Both circles have the same area, so under pure randomness each has the same probability of being hit: {{probability}}. We now ask the identical question about both: how likely is it that chance alone produces at least this many hits?',
    naivePValue: 'p-value as usually reported',
    naiveHint: 'One-sided exact binomial test.',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    body2:
      'The test does not know how the circle was chosen. It answers the question it was given, and it answers it correctly — the question is simply the wrong one for the red circle.',
    selection: {
      heading: 'What the search alone is worth',
      body: 'The red circle was not chosen in advance. It was chosen because it looked good, and the honest way to judge it is to simulate that entire procedure: generate fresh random darts, search them just as thoroughly, and record how many darts the best circle captures. Repeat {{replications}} times.',
      run: 'Simulate the search {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Best circle found in purely random darts',
      histogramX: 'Darts captured by the best circle',
      histogramY: 'Number of simulated searches',
      marker: 'Your result: {{hits}}',
      adjusted: 'p-value adjusted for the search',
      adjustedHint:
        'Monte Carlo p-value: how often an exhaustive search of purely random darts captures at least {{hits}} darts. Your own search may have been less thorough than the simulated one, so this value is conservative.',
      conclusion:
        'Under pure randomness, the best circle on this board captures {{mean}} darts on average. Against that yardstick, {{hits}} is unremarkable.',
      conclusionStrong:
        'Under pure randomness, the best circle on this board captures {{mean}} darts on average. Your {{hits}} is at the upper edge of what the search alone produces — but that is still what the search alone produces.',
      gallery: {
        heading: 'The five best finds from those simulations',
        body: 'Each board below holds a different set of completely random darts, and each circle is the best one the search found in that set. The test from the table above calls every one of them a discovery — and in every one of them the true effect is exactly zero.',
        caption: 'Simulation {{index}}',
        item: 'Hits: {{hits}}',
        itemPValue: 'p {{p}}',
        boardAria: 'Simulation {{index}}: {{count}} random darts with the best circle found in them.',
      },
    },
    explanation: {
      title: 'Why does this happen?',
      body1:
        'A p-value answers a conditional question: if nothing were going on, how often would we see a result at least this extreme? That answer only bounds the error rate if the result being tested was fixed before the data were seen.',
      body2:
        'When the circle is moved after the throw, we are no longer looking at one circle. We are looking at the best of a very large number of circles, and the largest of many random values is not a typical random value. The test statistic is inflated by the search itself, and the binomial p-value has no way to account for it.',
      body3:
        'The usual name for this is the Texas sharpshooter: fire at the wall first, paint the target around the tightest cluster afterwards.',
    },
    action: 'Test it on new data',
  },
  validation: {
    heading: 'New, independent darts',
    body1:
      'Both circles are now frozen — including the red one. The machine throws a completely new, independent set of darts. Nothing else changes.',
    body2:
      'This single restriction removes the entire advantage of the red circle. Fixed in advance, it is just a circle of a certain size in a certain place, exactly like the blue one.',
    throwFresh: 'Throw a new independent set',
    originalData: 'Original darts',
    freshData: 'New darts',
    replications: {
      heading: 'Repeat the whole test many times',
      body: 'Each replication is an independent set of darts, evaluated with both circles left where they are.',
      run: 'Run {{replications}} replications',
      running: 'Running…',
      meanHits: 'Average hits',
      significantShare: 'Replications with p < 0.05',
      note: 'Both circles now behave the same way, and both cross the 0.05 threshold in only a small share of replications. That is a correctly working test reporting on data where there is nothing to find.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'What this scenario shows',
    point1:
      'A hypothesis chosen after seeing the data cannot be evaluated with a test that assumes it was chosen before.',
    point2:
      'The strength of the evidence depends on how many possibilities were examined, not only on the number that came out.',
    point3:
      'The same number of hits means something different for a circle fixed in advance and for a circle selected from the data.',
    point4:
      'Independent data settle it. Once the circle can no longer move, the apparent effect disappears — because it was never in the darts.',
    legitimate: {
      heading: 'Exploration is not the error',
      body: 'Searching data for patterns is normal and often necessary. The red circle is a perfectly respectable hypothesis: it says "the machine favours this spot", and it can now be tested on a new set of throws. The error is only in the shortcut — presenting a hypothesis that came out of the data as if it had already survived a test.',
    },
    nextHeading: 'Where this goes next',
    nextBody:
      'The same structure returns in every later scenario. Only the thing being moved changes: a line instead of a circle, a subgroup instead of a region, an outcome instead of a target, a variable pair instead of a spot on the board.',
  },
}

export default dartboard
