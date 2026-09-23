const aisynthesis = {
  intro: {
    heading: 'A system is asked what predicts the outcome',
    body1:
      'A table of cases: one outcome to predict, and a few hundred candidate features to predict it from. The table is handed to a system that will score every candidate and return the ones that work best. It will do this correctly — there is no bug to find here, and no naive mistake in the method.',
    goalHeading: 'What this experiment is meant to show',
    goalBody:
      'That this one ends differently from the six before it: this time the search does find something real. And yet the data it searched cannot tell you which of the findings that is — and once you do find out, it still does not follow that you can act on it.',
    goalStep1:
      'The system scores every candidate and returns the strongest. We take two of them aside: they look exactly alike.',
    goalStep2:
      'We correct their p-values for the fact that a search took place. It rejects both — including the one that is real.',
    goalStep3:
      'Only new cases, ones the search never saw, separate the two. And the last question, whether the finding can be acted on, stays unanswered even then.',
    body2:
      'One of the candidates really is connected to the outcome. The rest are unrelated to it entirely. Nothing in the table marks which is which, and the system is not told.',
    questionsHeading: 'Four questions we will ask of whatever comes back',
    body3:
      'They sound like one question, and they have different answers. Separating them is the whole of this last scenario, and it is where the six before it were heading.',
    trueProcess:
      'Behind the table there is one quantity nobody measured and nothing recorded. It drives the outcome, and it also drives one of the candidate features — so that feature moves together with the outcome, and their correlation comes out around {{correlation}}. Every other feature is drawn entirely on its own. No feature causes the outcome, though: move one and the outcome does not move, because the outcome depends on that unmeasured quantity alone.',
    fictionHeading: 'Nothing here is real',
    fictionBody:
      'The table, the outcome and the system are generated in your browser from a seed. No real data set, model or product is involved. That unmeasured quantity is visible to the simulation and to nobody in the scenario, exactly as a cause nobody recorded is absent from real data.',
    action: 'Hand over the data',
  },
  experiment: {
    heading: 'What came back',
    body1:
      'The system scored all {{candidates}} candidates against the outcome and ranked them. This is the output such a system produces: a shortlist, with the numbers that support it.',
    shortlist: 'The strongest candidates',
    shortlistHint:
      'The two the scenario will follow are marked. They are the one the search liked best and one other — which one, and why, is the question.',
    body2:
      '{{count}} candidates cleared 0.05 on their own. Change the number of candidates and watch that count move with it rather than with anything about the world.',
    numbersTitle: 'What do these numbers mean?',
    numbersBody1:
      'The correlation r says how tightly the cases lie around a single straight line: zero is a shapeless cloud, plus one a perfect rise, minus one a perfect fall. The p-value beside it answers a different question: if this feature had nothing to do with the outcome, how often would its correlation come out at least this strong anyway?',
    numbersBody2:
      'Both of those are about a feature somebody asked about in advance. The system scored {{candidates}} of them and returns the best ones, which is a different situation: a p-value of 0.05 means “this strong turns up for one feature in twenty” — so out of {{candidates}} unrelated features about {{expected}} clear that bar with nothing behind them at all. That is the number written under the “Below 0.05” tile.',
    action: 'Look at the two finalists',
  },
  controls: {
    heading: 'Experiment settings',
    candidateCount: 'Candidate features',
    rowCount: 'Cases in the table',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same table. More candidates do not make the system better at finding the real one — they give it more ways to be wrong.',
  },
  plot: {
    notHandedOver: 'The data have not been handed over yet.',
    searching: 'The system is looking at the shortlist.',
    candidateAria: 'Feature {{feature}} plotted against the outcome, with the line fitted to it.',
    candidateStats: 'r {{r}}',
    legendCase: 'One case',
    legendAxes: 'Feature against outcome',
  },
  features: {
    label: 'Feature {{feature}}',
    connected: 'Really connected',
    unconnected: 'Unrelated to the outcome',
    unknown: 'Unknown so far',
  },
  questions: {
    describes: 'Does it describe the data it was found in?',
    distinguishes: 'Can that data tell it apart from the other candidate?',
    predicts: 'Does it predict cases nobody has seen?',
    changes: 'If we change it, does the outcome change?',
  },
  answers: {
    yes: 'Yes',
    no: 'No',
  },
  stats: {
    candidates: 'Candidates',
    candidatesHint: 'scored against the outcome',
    rows: 'Cases',
    significant: 'Below 0.05',
    significantHint: 'about {{expected}} expected by chance',
    correlation: 'Correlation r',
    pValue: 'p-value as usually reported',
  },
  observation: {
    heading: 'Two finalists, and no way to tell them apart',
    body1:
      'Here they are, side by side: the same number of cases, the same kind of plot, the same test. One of them is connected to the outcome and one of them is noise.',
    tableHint: 'Exact test that the correlation is zero, for each candidate on its own.',
    body2:
      'Everything the search produced is on this screen. Take a moment with it before going on, because the next stage asks the data a harder question and the data are about to run out of answers.',
    guessHeading: 'Which one is real?',
    guessBody:
      'Commit to an answer. There is no penalty for being wrong, and the point of asking is what it feels like to decide from this evidence.',
    guessRecorded: 'Recorded. You will find out at the validation stage, not before.',
    guessFirst: 'Choose one to continue.',
    action: 'Ask the data to settle it',
  },
  analysis: {
    heading: 'What this data set can and cannot say',
    body1:
      'Both finalists are significant, both were selected out of a few hundred, and both were found by the same correctly executed search. The first thing to do is price that search — and then to notice what pricing it does not tell us.',
    naivePValue: 'p as reported',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    runFirst:
      'The correction below is the point of this stage: without it, the numbers above are what would be reported.',
    selection: {
      heading: 'What the search alone is worth',
      body: 'Simulate the whole procedure in a world with nothing to find: generate a table where no feature is connected to the outcome, score all {{candidates}} candidates, keep the strongest. Repeat {{replications}} times.',
      run: 'Simulate the search {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Strongest correlation the same search finds when nothing is connected',
      histogramX: '|r| of the strongest candidate found',
      histogramY: 'Number of simulated searches',
      marker: 'Top finalist',
      adjusted: 'p adjusted for the search',
      tableHint:
        'Monte Carlo p-values: how often a search of a table with nothing in it produces a candidate at least this strong.',
      bothFail:
        'Neither finalist survives the correction, and their adjusted values are close together. The correction cannot separate them, because it is not the kind of question it answers: it prices the search, and both were found by the same search.',
      notFalse:
        'This is the sentence to keep. The correction does not say a finding is false — it says this data set has not established it. One of these two is real, and the correction rejects both.',
      gallery: {
        heading: 'The five strongest candidates those simulations produced',
        body: 'Every table below has nothing connected to the outcome at all, and each plot is the best candidate its search could find. Put them beside the two finalists and there is nothing to choose between them.',
        caption: 'Simulated search {{index}}',
        itemStats: 'r {{r}} · p {{p}}',
        plotAria:
          'Simulated search {{index}}: feature {{feature}}, the strongest candidate found in a table where nothing is connected.',
      },
    },
    explanation: {
      title: 'Why can the data not settle it?',
      body1:
        'Because both explanations fit it equally well. A feature that is genuinely connected to the outcome and the luckiest of {{candidates}} unrelated ones produce the same picture in a table this size: the same correlation, the same p-value, the same plot. There is no statistic computable from these rows that separates them, and looking harder at them will not help.',
      body2:
        'That is not a failure of the search, and it is not a failure of the system that ran it. The search did what it was asked and reported what it found. The information that would separate the two was never in this table — it is in data the search has not seen.',
      body3:
        'This is what the six earlier scenarios were building towards. Each of them showed a search producing something convincing from nothing; this one adds the case where the search is right. The lesson is not that searching produces falsehoods. It is that the output of a search is a list of hypotheses, and which of them are real is a question for other data.',
    },
    action: 'Get new cases',
  },
  validation: {
    heading: 'Cases the search never saw',
    body1:
      'Both finalists are now frozen, and the line fitted to the original table is carried over unchanged — so it has to predict rather than describe. New cases are generated from the same world.',
    freshCases: 'New cases',
    replications: {
      heading: 'Question three: does it predict?',
      body: 'Each replication is a fresh table of cases from the same world, with both finalists measured on it.',
      run: 'Run {{replications}} fresh tables',
      meanR: 'Average r on new cases',
      shareSignificant: 'Significant again',
      prediction: 'R² predicting new cases',
      tableHint:
        'A negative R² means the frozen line predicts new cases worse than their own average would. A positive one means it carries real information.',
      note: 'One finalist collapses to nothing and the other holds exactly where it was. The data that decided this were not better data — they were simply data that took no part in choosing either candidate.',
    },
    guessRight:
      'You picked feature {{feature}}, and it is the connected one. Worth noting how little you had to go on: the two looked the same, and they looked the same because in that table they were the same.',
    guessWrong:
      'You picked feature {{feature}}, and it is one of the unrelated ones. That is not a failure of judgement — nothing on that screen could have told you, which is the point of having asked.',
    body2:
      'So the real one predicts, reliably, on cases nobody has seen. That settles question three, and it is often where an analysis stops. It should not be, because there is one more question and the answer changes.',
    intervention: {
      heading: 'Question four: does changing it change anything?',
      body: 'Each table is measured twice — once as the world produces it, and once with the feature set by us instead of caused by anything. The outcome is generated the same way both times.',
      run: 'Run {{replications}} interventions',
      observed: 'Difference, as found',
      set: 'Difference, when we set it',
      tableHint:
        'The outcome for cases high on the feature minus cases low on it, averaged over the replications.',
      note: 'The connected feature predicts the outcome and does not affect it. It carries information because it shares an unmeasured cause with the outcome, so it moves when the outcome moves — and when we move it ourselves, nothing follows. Acting on it would achieve exactly nothing.',
      caveat:
        'This intervention is only possible because we wrote the world and can sever a link inside it. With data somebody collected, this column cannot be computed at all — it is the experiment that has not been run, and no amount of care with the other three questions substitutes for it.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'Four questions, four answers',
    ladderHeading: 'The two finalists, side by side',
    ladderHint:
      'Only the third row separates them, and only data the search never saw could fill it in. The fourth row is "no" for both.',
    point1:
      'Finding a pattern, predicting with it, confirming it and acting on it are four different claims. A single p-value speaks to none of them on its own.',
    point2:
      'A search that finds something real and a search that finds nothing look identical from inside the data they searched. That is not a flaw in the search; the separating information is elsewhere.',
    point3:
      'Correcting for a search tells you that a result is not established. It does not tell you the result is false — here it rejects the real finding too.',
    point4:
      'Prediction is not causation, and the gap is not academic. A feature can predict an outcome perfectly and be completely useless for changing it.',
    aiHeading: 'What this means for systems that do this at scale',
    aiBody1:
      'Searching data for patterns is legitimate, and doing it at scale is often the only way to generate hypotheses worth having. A system that examines millions of candidates is not making a statistical error by examining them. The error is presenting what the search returned as though it had been confirmed — and the scale makes that error easier to make and harder to notice, because the output arrives ranked, formatted and plausible.',
    aiLine:
      'The ability to find patterns is not the same as the ability to establish which patterns are real.',
    aiBody2:
      'Establishing that takes data the search did not touch, and establishing that a pattern is worth acting on takes an intervention. Neither is something a more capable search can supply, because neither is a question about the data it was given.',
    endHeading: 'The end of the sequence',
    endBody:
      'A target moved after the throw, a model chosen for fitting best, a period marked on a random walk, the worst doctor in a table, the best outcome in a trial, the strongest pair in a sweep, and finally a real finding that still cannot tell you what to do. The same question runs through all seven: how was this found, and would it survive an appropriate test on new data?',
  },
}

export default aisynthesis
