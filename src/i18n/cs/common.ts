const common = {
  app: {
    title: 'Statistické pasti',
    subtitle: 'Hledání vzorů v datech',
    skipToContent: 'Přejít na obsah',
  },
  language: {
    label: 'Jazyk',
    cs: 'Čeština',
    en: 'English',
  },
  nav: {
    overview: 'Přehled',
    backToOverview: 'Zpět na přehled',
  },
  status: {
    available: 'Hotovo',
    planned: 'Plánováno',
  },
  actions: {
    open: 'Otevřít scénář',
    next: 'Pokračovat',
    previous: 'Zpět',
    restart: 'Spustit znovu',
  },
  home: {
    heading: 'Jak snadno najdeme vzor, který tam není?',
    lead: 'Interaktivní simulace o rozdílu mezi objevením vzoru a doložením toho, že je vzor skutečný.',
    body1:
      'Data v každém scénáři generujeme sami, takže pravdu známe předem: není co najít. Přesto se do hledání pustíme — posuneme terč, zvolíme model, vybereme podskupinu nebo změříme mnoho výsledků najednou. Něco zajímavého se vždycky objeví.',
    body2:
      'Rozhodující je až další krok. Vzor nalezený hledáním je hypotéza, nikoli výsledek. Musí být otestován na datech, která k jeho nalezení nebyla použita.',
    cycleHeading: 'Opakující se schéma',
    cycle: {
      data: 'Data',
      search: 'Hledání zajímavého vzoru',
      result: 'Zdánlivě přesvědčivý výsledek',
      validate: 'Test na nových nezávislých datech',
      outcome: 'Vzor slábne nebo mizí',
    },
    disclaimerHeading: 'Není to argument proti statistice',
    disclaimerBody:
      'Problém není ve statistice, dolování dat ani ve strojovém učení a hledání vzorů v datech je běžnou součástí výzkumu. Problém nastává, když zaměníme objevení vzoru za potvrzení hypotézy — tedy když hypotézu, která vzešla z dat, prezentujeme, jako by byla stanovena před nimi.',
    scenariosHeading: 'Scénáře',
    scenariosLead:
      'Každý scénář je srozumitelný samostatně. Vznikají postupně a ty pozdější aplikují stejnou myšlenku na situace, které už nepůsobí jako hra.',
  },
  scenario: {
    stepOf: 'Krok {{current}} z {{total}}',
    conceptsHeading: 'Pojmy',
    trueProcessHeading: 'Skutečný mechanismus vzniku dat',
    planned: {
      heading: 'Zatím neimplementováno',
      body: 'Tento scénář je součástí plánované řady, ale zatím nebyl vytvořen. Scénáře vznikají po jednom, aby každý z nich bylo možné otestovat a zdokumentovat dříve, než začne další.',
    },
    notFound: {
      heading: 'Scénář nenalezen',
      body: 'Scénář s touto adresou neexistuje.',
    },
  },
  stages: {
    introduction: 'Úvod',
    experiment: 'Experiment',
    observation: 'Pozorování',
    analysis: 'Analýza',
    validation: 'Ověření',
    conclusion: 'Závěr',
  },
  explanation: {
    show: 'Proč se to děje?',
    hide: 'Skrýt vysvětlení',
  },
  concepts: {
    postHocHypothesis: 'hypotéza stanovená dodatečně',
    exploratoryAnalysis: 'explorativní analýza',
    confirmation: 'konfirmace',
    replication: 'replikace',
    overfitting: 'přeučení (overfitting)',
    modelSelection: 'výběr modelu',
    trainingData: 'trénovací data',
    testData: 'testovací data',
    generalization: 'generalizace',
    multipleComparisons: 'mnohonásobná porovnání',
    researcherDegreesOfFreedom: 'volnost výzkumníka',
    falseDiscoveries: 'falešné objevy',
    selection: 'výběr po pohledu na data',
    extremeValues: 'extrémní hodnoty',
    confounding: 'matoucí proměnné',
    riskAdjustment: 'adjustace na riziko',
    investigationVersusProof: 'podnět k prošetření vs. důkaz',
    multipleTesting: 'mnohonásobné testování',
    falsePositives: 'falešně pozitivní výsledky',
    independentReplication: 'nezávislá replikace',
    pValueInterpretation: 'interpretace p-hodnot',
    dataMining: 'dolování dat',
    correlation: 'korelace',
    predictionVersusExplanation: 'predikce vs. vysvětlení',
    patternDiscovery: 'objevování vzorů',
    hypothesisGeneration: 'generování hypotéz',
    causalInference: 'kauzální inference',
  },
  scenarios: {
    '01-dartboard': {
      title: 'Kreslení terče kolem šipek',
      summary:
        'Šipky dopadají zcela náhodně. Posuňte terč až po hodu a výsledek vypadá přesvědčivě — dokud stroj nehodí znovu.',
    },
    '02-best-line': {
      title: 'Najdi nejlepší přímku',
      summary:
        'Dvourozměrná pozorování bez skutečného vztahu. Dostatečně pružný model je popíše skvěle a nová data špatně.',
    },
    '03-interesting-region': {
      title: 'Najdi zajímavou oblast',
      summary:
        'Mezi kategoriemi není žádný skutečný rozdíl. Projděte dost oblastí dat a jedna z nich bude přesto vypadat neobvykle.',
    },
    '04-doctor-mortality': {
      title: 'Lékař s neobvykle vysokou úmrtností',
      summary:
        'Simulovaná nemocnice, kde mají všichni lékaři stejné základní riziko. Jeden z nich přesto skončí s nápadně vysokým počtem úmrtí.',
    },
    '05-miracle-drug': {
      title: 'Zázračný lék',
      summary:
        'Simulovaná studie léčby, která nemá žádný účinek, měřená na mnoha výsledcích. Jeden z nich vyjde významně.',
    },
    '06-mysterious-correlation': {
      title: 'Záhadná korelace',
      summary:
        'Automatický analytik prohledá mnoho proměnných a najde silný vztah. O jeho hodnotě rozhodnou až nová data.',
    },
    '07-ai-synthesis': {
      title: 'Co z toho plyne pro AI?',
      summary:
        'Shrnutí: objevování vzorů, predikce, generování hypotéz, testování, kauzální inference a generalizace jsou různé věci.',
    },
  },
  footer: {
    note: 'Všechna data v této aplikaci jsou simulovaná. Nejde o skutečné osoby, nemocnice, pacienty ani studie.',
    source: 'Výukový projekt',
  },
}

export default common
