const doctormortality = {
  intro: {
    heading: 'One doctor, named before the year begins',
    body1:
      'A simulated hospital. Every doctor treats their own patients for a year, and at the end of it we count how many of those patients died. The patients differ from one another: each carries their own risk, and some doctors are sent sicker patients than others, which is a real and ordinary difference between one practice and the next.',
    body2:
      'The doctors do not differ. When we built the data we gave none of them better or worse skill, care or attention — every doctor in this hospital is exactly as good as every other, and the true effect of any of them on their patients is zero.',
    goalHeading: 'What this experiment is meant to show',
    goalBody:
      'That when you compare {{doctors}} doctors and pick out the worst one, their striking result means nothing — and that two separate things are behind it, which are easily run together: their patients were sicker, and we chose the most extreme of many people.',
    goalStep1:
      'Run a year and test the doctor we named in advance. It finds nothing.',
    goalStep2:
      'Then pick the one who came out worst and test them with exactly the same test. That one looks like a finding.',
    goalStep3:
      'Then correct that finding twice over, and follow both doctors into later years. Nothing of it survives.',
    question:
      'Did doctor {{doctor}}, who is due for the routine audit this year, lose more patients than their patients’ own risks predicted?',
    body3:
      'That doctor is named now, before the year runs, so nothing about the outcome can have influenced the choice. Everything surprising that follows comes from what we do after the numbers are in.',
    trueProcess:
      'Each doctor is given a case mix, drawn once. Each patient gets their own risk from it — a number between 0 and 1 — and dies independently with exactly that probability. Which doctor is treating them enters that number nowhere: the true effect of every doctor is zero.',
    fictionHeading: 'Nobody here is real',
    fictionBody:
      'The hospital, the doctors and the patients are generated in your browser from a seed. No real institution, clinician, patient or study is involved, and no real mortality statistic is used or implied. The doctors are numbered rather than named for the same reason.',
    action: 'Run the year',
  },
  experiment: {
    heading: 'A year of outcomes',
    body1:
      'Here is the year. Each column is one doctor and its height is the share of their patients who died; the dashed line is the hospital as a whole. The columns vary a great deal, which is what counting a few dozen rare events per doctor looks like.',
    body2:
      'The audited doctor is marked. Their result is compared with what their own patients were expected to produce, and it finds nothing — as it should, because there is nothing there.',
    numbersTitle: 'What do these numbers mean?',
    numbersBody1:
      'A p-value answers one question: if this doctor were entirely average, how often would they end up with at least this many deaths anyway? 0.85 means "this or worse happens in 85% of years, there is nothing unusual here". 0.009 means "this would happen in about one year in a hundred" — which is where results start being called findings. The 0.05 threshold is a convention, not a proof.',
    numbersBody2:
      'Expected deaths are not the hospital average. They are the sum of the risks of this doctor’s own patients: every hundred patients carrying about 15% risk each are expected to produce about fifteen deaths. Comparing their deaths against that is fairer than comparing them against the whole hospital, because some doctors are sent sicker patients than others.',
    action: 'Now search the whole table',
  },
  controls: {
    heading: 'Experiment settings',
    doctorCount: 'Number of doctors',
    patientsPerDoctor: 'Patients per doctor',
    seed: 'Seed',
    newSeed: 'New seed',
    hint: 'The same seed always produces the same hospital, so any result here can be reproduced exactly.',
  },
  chart: {
    notStarted: 'The year has not been run yet.',
    ariaRate: 'Mortality rate of each of {{count}} doctors, against the hospital rate.',
    ariaRatio:
      'Deaths against expected deaths for each of {{count}} doctors, against a ratio of one.',
    doctorAria: 'Doctor {{doctor}}, mortality {{rate}}. Select to inspect.',
    legendDoctor: 'One doctor',
    legendRate: 'Deaths per patient',
    legendRatio: 'Deaths ÷ expected deaths',
  },
  doctors: {
    audited: 'Doctor {{doctor}}, audited by prior arrangement',
    auditedShort: 'Named in advance',
    flagged: 'Doctor {{doctor}}, picked out of the table',
    flaggedShort: 'Picked out afterwards',
  },
  stats: {
    doctors: 'Doctors',
    patients: 'Patients',
    hospitalRate: 'Hospital mortality',
    deaths: 'Deaths',
    ofPatients: 'of {{patients}} patients',
    rate: 'Mortality',
    againstHospital: 'Hospital as a whole: {{rate}}',
    expected: 'Expected deaths',
    expectedHint: 'The sum of this doctor’s own patients’ risks.',
    ratio: 'Deaths ÷ expected',
    ratioHint: 'Above 1 means more deaths than these particular patients were expected to have.',
    caseMix: 'Average patient risk',
    caseMixHint: 'Hospital average: {{rate}}',
    pValue: 'p-value as usually reported',
    rawPValue: 'p-value against the hospital rate',
  },
  observation: {
    heading: 'Find the doctor with unusually high mortality',
    body1:
      'The whole league table is in front of you. Click any column to inspect that doctor: how many of their patients died, how that compares with the hospital as a whole, and the p-value that comparison would normally be reported with.',
    clickHint:
      'Every doctor is scored by exactly the same test as the one audited by prior arrangement. The only thing that changes is who we decided to look at.',
    body2:
      'Or take the shortcut a league table is for, and go straight to the doctor who comes out worst. Somebody has to.',
    autoWorst: 'Show me the worst doctor',
    autoWorstNote:
      'That is the most extreme of the {{doctors}}, judged after accounting for each doctor’s own patients — which is not always the tallest column in a table of raw mortality.',
    reset: 'Clear the selection',
    selectFirst: 'Choose a doctor to take further.',
    action: 'Investigate this doctor properly',
  },
  analysis: {
    heading: 'Two corrections, one after the other',
    body1:
      'The first comparison is the one a league table invites: this doctor’s deaths against the hospital’s overall rate. It is wrong for two independent reasons. First, their patients were not the same as everyone else’s. Second, we picked them out after seeing the numbers. Each reason is fixed differently, which is why there are two corrections.',
    rawPValue: 'p against the hospital rate',
    adjustedPValue: 'p against their own patients',
    verdictNothing: 'Nothing to report',
    verdictStriking: 'Looks like a finding',
    runFirst:
      'Both corrections below are the point of this stage: without them, the row above is the number that would be reported.',
    raw: {
      heading: 'First look: mortality against the hospital rate',
      body: 'Each doctor’s deaths tested against the rate for the hospital as a whole, as though every patient were the same as every other.',
      caption: 'The test compares each doctor’s deaths against the mortality of the whole hospital, which is {{rate}}.',
    },
    adjustment: {
      heading: 'Correction 1: the patients were not the same',
      body: 'Every patient carries their own risk, so the number to compare against is not the hospital average but the sum of this doctor’s own patients’ risks — the deaths those particular people were expected to have.',
      caption:
        'The test compares the deaths against the risks of the individual patients, not against the hospital’s average mortality.',
      note: 'Risk adjustment moves the result, because part of the excess was never about the doctor: it was about who they were treating. What is left is p {{p}} — still small enough that most people would keep going.',
      limit:
        'Note how much has been granted here. The adjustment uses each patient’s true risk, which the simulation knows and no real risk model ever does. This is risk adjustment at its theoretical best, and it is still not enough.',
    },
    selection: {
      heading: 'Correction 2: this doctor was not chosen at random',
      body: 'The second correction is about how the doctor was found. To measure it we simulate the whole procedure: run another year for the same {{doctors}} doctors, none of whom differs from any other, risk-adjust every one of them, and keep whichever comes out worst. Repeat {{replications}} times.',
      run: 'Simulate the search {{replications}} times',
      running: 'Simulating…',
      histogramTitle: 'Worst risk-adjusted p-value found among the doctors, year after year',
      histogramX: 'Smallest p-value in the hospital',
      histogramY: 'Number of simulated years',
      marker: 'Your doctor',
      adjusted: 'p-value adjusted for the search',
      adjustedHint:
        'Monte Carlo p-value: how often a year in which every doctor is identical produces a worst doctor at least as extreme as {{pValue}}.',
      shareSignificant:
        'In {{share}} of the simulated years, some doctor came out significant at 0.05 — in a hospital where no doctor is any better or worse than any other. With {{doctors}} doctors, having a worst one is not a finding. It is arithmetic.',
      conclusion:
        'The same result read two ways: p {{naive}} for a doctor named in advance, p {{adjusted}} for a doctor found by looking. The deaths are the same deaths.',
      gallery: {
        heading: 'The five most alarming doctors those simulations produced',
        body: 'Every hospital below is one where the doctors are identical. In each one, the marked doctor is the worst that year’s numbers happened to produce, and each would have been reported with the figures shown underneath.',
        caption: 'Simulated year {{index}}',
        item: 'Doctor {{doctor}} · {{deaths}} deaths against {{expected}} expected',
        itemStats: 'ratio {{ratio}} · p {{p}}',
        plotAria:
          'Simulated year {{index}}: a hospital of identical doctors, with doctor {{doctor}} marked as the worst that year.',
      },
    },
    explanation: {
      title: 'Why does this happen?',
      body1:
        'Two different things inflate the first number, and they are easy to confuse. The first is confounding: the doctor’s patients really were sicker, so part of the excess is caused by the case mix rather than by the doctor. That part is real, it is explainable, and risk adjustment removes it.',
      body2:
        'The second is selection. Mortality per doctor is a count of a few rare events, so it bounces around a great deal from year to year; take the highest of several dozen such counts and you are looking at the top of a distribution, not at a person. No amount of adjustment fixes this, because nothing is wrong with the adjustment. What is wrong is that the question was chosen after the answer.',
      body3:
        'This is the same mistake as drawing the target around the darts, choosing the model that fits best, and marking the most striking period of a record. What is new here is that the search runs over people, and the conclusion drawn from it would be about a person.',
    },
    action: 'Follow the same doctors into next year',
  },
  validation: {
    heading: 'The same doctors, a year later',
    body1:
      'Both doctors are now named in advance of the year being examined — one by the audit rota, one by last year’s table. The hospital runs another year: the same doctors and the same kinds of patients, but every patient and every outcome new.',
    body2:
      'The doctor who was flagged returns to the middle of the pack, because there was never anything to return from. Their high year was the year, not the doctor.',
    thisYear: 'This year (ratio)',
    nextYearDeaths: 'Next year’s deaths',
    nextYearRatio: 'Next year’s ratio',
    nextYearPValue: 'Next year’s p-value',
    tableHint: 'The same two doctors, measured on a year that took no part in singling either of them out.',
    freshYear: 'A new year',
    drawFresh: 'Run another independent year',
    replications: {
      heading: 'Follow them for many years',
      body: 'Each replication is another independent year for the same two doctors, risk-adjusted exactly as before.',
      run: 'Run {{replications}} years',
      meanRatio: 'Average deaths ÷ expected',
      shareSignificant: 'Flagged in a year',
      tableHint:
        'Both doctors were named before these years existed, so both should be flagged about 5% of the time — and both are. A ratio near 1 is what a doctor with no effect looks like.',
      note: 'Run the search again each year and it lands on a different doctor {{share}} of the time. The hospital produces a worst doctor every single year, and it is almost never the same one. A finding that moves each time the data move was a property of the data.',
    },
    action: 'What should we take away?',
  },
  conclusion: {
    heading: 'What this scenario shows',
    point1:
      'Comparing raw rates compares patients as much as it compares doctors. A difference can be entirely real and entirely caused by who walked through the door.',
    point2:
      'Risk adjustment fixes that, and only that. It cannot adjust for risks nobody recorded, and it cannot know that this unit was the most extreme of many.',
    point3:
      'With enough units, an extreme one is guaranteed. The question is never "is this doctor unusual?" but "is this doctor more unusual than the most unusual of forty ought to be?"',
    point4:
      'Being at the bottom of a table is a reason to look, not a conclusion. Here, looking properly finds that there was nothing to find.',
    legitimate: {
      heading: 'Monitoring is not the error — and neither is investigating',
      body: 'Hospitals should monitor outcomes, and an unusual result should prompt questions: better risk adjustment, a look at the records, a conversation. That is what an alarm is for. The error is treating the alarm as the finding — announcing a conclusion about a person on the strength of a number that was selected for being extreme, and that the next year will not reproduce. Harm here is not abstract: careers and patient trust are real even when the data are simulated.',
    },
    nextHeading: 'Where this goes next',
    nextBody:
      'The search has run over positions, models, periods and now people, always over one thing at a time. The next scenario keeps the subject fixed and searches across many different outcomes instead — the form the mistake takes in a clinical trial.',
  },
}

export default doctormortality
