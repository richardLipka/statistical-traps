const doctormortality = {
  intro: {
    heading: 'Jeden lékař, určený ještě před začátkem roku',
    body1:
      'Simulovaná nemocnice. Každý lékař rok léčí své pacienty a na konci spočítáme, kolik z nich zemřelo. Pacienti se od sebe liší: každý má vlastní riziko a některým lékařům chodí těžší pacienti než jiným, což je skutečný a naprosto běžný rozdíl mezi jednou praxí a druhou.',
    body2:
      'Lékaři se neliší. Když jsme data vytvářeli, nezadali jsme žádnému z nich lepší ani horší dovednost, péči ani pozornost. Každý lékař v téhle nemocnici je stejně dobrý jako kterýkoli jiný a jeho skutečný vliv na pacienty je nulový.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že když porovnáte {{doctors}} lékařů a vyberete toho nejhoršího, jeho nápadný výsledek neznamená nic. Stojí za tím dvě věci, které se snadno pletou dohromady: jeho pacienti byli těžší a vybírali jsme z mnoha lidí toho nejkrajnějšího.',
    goalStep1:
      'Necháme proběhnout rok a otestujeme lékaře, kterého jsme určili předem. Nic nenajde.',
    goalStep2:
      'Pak si z tabulky vybereme toho, kdo dopadl nejhůř, a otestujeme ho úplně stejným testem. Ten už jako nález vypadá.',
    goalStep3:
      'Nakonec ten nález dvakrát opravíme a oba lékaře budeme sledovat do dalších let. Nezbude z něj nic.',
    question:
      'Ztratil lékař č. {{doctor}}, kterého letos čeká pravidelný audit, víc pacientů, než předpovídala jejich vlastní rizika?',
    body3:
      'Tohoto lékaře určujeme teď, ještě než rok proběhne, takže nic z výsledku nemohlo tuto volbu ovlivnit. Všechno překvapivé, co bude následovat, pochází z toho, co uděláme až potom, co jsou čísla na stole.',
    trueProcess:
      'Každý lékař dostane skladbu pacientů, losovanou jednou. Každý pacient z ní dostane vlastní riziko, číslo mezi 0 a 1, a s touto pravděpodobností nezávisle umírá. Do toho čísla nikde nevstupuje, který lékař ho léčí: skutečný vliv každého lékaře je nulový.',
    fictionHeading: 'Nikdo zde není skutečný',
    fictionBody:
      'Nemocnice, lékaři i pacienti vznikají ve vašem prohlížeči ze semínka. Nejde o žádnou skutečnou instituci, lékaře, pacienta ani studii a nepoužívá se ani nenaznačuje žádná reálná statistika úmrtnosti. Ze stejného důvodu mají lékaři čísla, a ne jména.',
    recipeTitle: 'Jak přesně data vznikají',
    recipeStep1:
      'Každý lékař dostane svou skladbu pacientů a každému pacientovi se nalosuje vlastní riziko.',
    recipeStep2:
      'Každý pacient pak nezávisle na ostatních umírá s pravděpodobností, která se rovná jeho riziku.',
    recipeStep3:
      'Do toho losu nevstupuje, kdo pacienta léčí. Lékaři se liší jedině tím, jací pacienti jim přišli.',
    action: 'Spustit rok',
  },
  experiment: {
    heading: 'Rok výsledků',
    body1:
      'Tady je ten rok. Každý sloupec je jeden lékař a jeho výška je podíl jeho pacientů, kteří zemřeli; čárkovaná čára je nemocnice jako celek. Sloupce se hodně liší. Tak dopadne počítání několika desítek vzácných událostí na lékaře.',
    body2:
      'Auditovaný lékař je vyznačen. Jeho výsledek se porovnává s tím, co se čekalo od jeho vlastních pacientů, a nic nenachází. Tak to má být, protože není co najít.',
    body2Hit:
      'Auditovaný lékař je vyznačen a jeho výsledku tentokrát vyšlo p pod 0,05. Je to planý poplach: i úplně průměrnému lékaři to takhle vyjde asi v jednom roce z dvaceti. Tenhle rok je ten dvacátý. Odehrajte rok znovu s jiným semínkem a poplach zmizí.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'P-hodnota odpovídá na jedinou otázku: kdyby tento lékař byl úplně průměrný, jak často by mu i tak vyšlo aspoň tolik úmrtí jako letos? Hodnota 0,85 znamená „takhle nebo hůř to dopadne v 85 % let, na tom není nic zvláštního“. Hodnota 0,009 znamená „takhle by to dopadlo asi v jednom roce ze sta“; od takových hodnot se výsledky začnou označovat za nález. Hranice 0,05 je jen dohoda, ne důkaz.',
    numbersBody2:
      'Očekávaná úmrtí nejsou průměr nemocnice. Je to součet rizik konkrétních pacientů tohoto lékaře: na každých sto pacientů s rizikem kolem 15 % se čeká patnáct úmrtí. Porovnávat jeho úmrtí s tímto číslem je poctivější než s průměrem celé nemocnice, protože někomu chodí těžší pacienti než jinému.',
    action: 'Teď prohledejte celou tabulku',
  },
  controls: {
    heading: 'Nastavení experimentu',
    doctorCount: 'Počet lékařů',
    patientsPerDoctor: 'Pacientů na lékaře',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejnou nemocnici, takže každý výsledek se dá přesně zopakovat.',
  },
  chart: {
    notStarted: 'Rok ještě neproběhl.',
    ariaRate: 'Úmrtnost každého z {{count}} lékařů v porovnání s úmrtností nemocnice.',
    ariaRatio:
      'Úmrtí proti očekávaným úmrtím u každého z {{count}} lékařů v porovnání s poměrem jedna.',
    doctorAria: 'Lékař č. {{doctor}}, úmrtnost {{rate}}. Vyberte pro prohlédnutí.',
    legendDoctor: 'Jeden lékař',
    legendRate: 'Úmrtí na pacienta',
    legendRatio: 'Úmrtí ÷ očekávaná úmrtí',
  },
  doctors: {
    audited: 'Lékař č. {{doctor}}, auditovaný podle předchozí domluvy',
    auditedShort: 'Určen předem',
    flagged: 'Lékař č. {{doctor}}, vybraný z tabulky',
    flaggedShort: 'Vybrán dodatečně',
  },
  stats: {
    doctors: 'Lékaři',
    patients: 'Pacienti',
    hospitalRate: 'Úmrtnost nemocnice',
    deaths: 'Úmrtí',
    ofPatients: 'z {{patients}} pacientů',
    rate: 'Úmrtnost',
    againstHospital: 'Nemocnice jako celek: {{rate}}',
    expected: 'Očekávaná úmrtí',
    expectedHint: 'Součet rizik vlastních pacientů tohoto lékaře.',
    ratio: 'Úmrtí ÷ očekávaná',
    ratioHint: 'Nad 1 znamená víc úmrtí, než se u těchto konkrétních pacientů čekalo.',
    caseMix: 'Průměrné riziko pacienta',
    caseMixHint: 'Průměr nemocnice: {{rate}}',
    pValue: 'p-hodnota, jak se běžně uvádí',
    rawPValue: 'p-hodnota proti úmrtnosti nemocnice',
  },
  observation: {
    heading: 'Najděte lékaře s neobvykle vysokou úmrtností',
    body1:
      'Máte před sebou celou tabulku. Kliknutím na kterýkoli sloupec si lékaře prohlédnete: kolik jeho pacientů zemřelo, jak to vypadá proti nemocnici jako celku a s jakou p-hodnotou by se toto porovnání běžně uvedlo.',
    clickHint:
      'Každý lékař se hodnotí přesně stejným testem jako ten auditovaný podle předchozí domluvy. Mění se jedině to, na koho jsme se rozhodli podívat.',
    body2:
      'Nebo použijte zkratku, kvůli které tabulky vznikají, a jděte rovnou na lékaře, který vyšel nejhůř. Někdo takový být musí.',
    autoWorst: 'Ukaž nejhoršího lékaře',
    autoWorstNote:
      'To je nejkrajnější ze {{doctors}} lékařů, posuzováno až po zohlednění vlastních pacientů každého z nich — což není vždy nejvyšší sloupec v tabulce hrubé úmrtnosti.',
    reset: 'Zrušit výběr',
    selectFirst: 'Vyberte lékaře, se kterým budeme pokračovat.',
    action: 'Prošetřit tohoto lékaře pořádně',
  },
  analysis: {
    heading: 'Dvě opravy, jedna po druhé',
    body1:
      'První porovnání je to, ke kterému tabulka svádí: úmrtí tohoto lékaře proti celkové úmrtnosti nemocnice. Je špatně hned ze dvou nezávislých důvodů. Zaprvé jeho pacienti nebyli stejní jako pacienti ostatních. Zadruhé jsme si ho vybrali až potom, co jsme viděli čísla. Každý z těch důvodů se napravuje jinak, a proto jsou opravy dvě.',
    rawPValue: 'p proti úmrtnosti nemocnice',
    adjustedPValue: 'p proti vlastním pacientům',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    runFirst:
      'Obě opravy níže jsou smyslem tohoto kroku: bez nich je číslo v řádku výše tím, co by se uvedlo.',
    raw: {
      heading: 'První pohled: úmrtnost proti úmrtnosti nemocnice',
      body: 'Úmrtí každého lékaře testovaná proti míře pro celou nemocnici, jako by byl každý pacient stejný jako každý jiný.',
      caption: 'Test porovnává úmrtí každého lékaře s úmrtností celé nemocnice, tedy {{rate}}.',
    },
    adjustment: {
      heading: 'Oprava 1: pacienti nebyli stejní',
      body: 'Každý pacient nese vlastní riziko, takže číslem k porovnání není průměr nemocnice, ale součet rizik vlastních pacientů tohoto lékaře — úmrtí, která se od těchto konkrétních lidí čekala.',
      caption:
        'Test porovnává úmrtí s riziky jednotlivých pacientů, ne s průměrnou úmrtností nemocnice.',
      note: 'Riziková adjustace výsledkem pohne, protože část přebytku nikdy nebyla o lékaři: byla o tom, koho léčil. Zbývá p {{p}} — pořád dost málo na to, aby většina lidí pokračovala dál.',
      limit:
        'Adjustace tu dostala dárek. Používá skutečné riziko každého pacienta, které zná simulace a žádný reálný rizikový model nezná. Je to riziková adjustace v teoreticky nejlepší podobě, a pořád to nestačí.',
    },
    selection: {
      heading: 'Oprava 2: tento lékař nebyl vybrán náhodně',
      body: 'Druhá oprava je o tom, jak byl lékař nalezen. Změříme ji simulací celého postupu: odehrajeme další rok pro týchž {{doctors}} lékařů, z nichž se žádný od ostatních neliší. Každého rizikově adjustujeme a ponecháme toho, kdo vyjde nejhůř. A to {{replications}}krát.',
      run: 'Simulovat hledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejhorší rizikově adjustovaná p-hodnota mezi lékaři, rok co rok',
      histogramX: 'Nejmenší p-hodnota v nemocnici',
      histogramY: 'Počet simulovaných let',
      marker: 'Váš lékař',
      adjusted: 'p-hodnota opravená o hledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často rok, ve kterém jsou všichni lékaři totožní, vytvoří nejhoršího lékaře aspoň tak krajního jako {{pValue}}.',
      shareSignificant:
        'V {{share}} simulovaných let vyšel některý lékař významně na hladině 0,05 — a to v nemocnici, kde žádný lékař není lepší ani horší než ostatní. Při {{doctors}} lékařích není to, že někdo je nejhorší, nález. Je to aritmetika.',
      conclusion:
        'Tentýž výsledek přečtený dvěma způsoby: p {{naive}} pro lékaře určeného předem, p {{adjusted}} pro lékaře nalezeného hledáním. Úmrtí jsou přitom táž úmrtí.',
      gallery: {
        heading: 'Pět nejznepokojivějších lékařů, které tyto simulace vytvořily',
        body: 'Každá nemocnice níže je taková, kde jsou lékaři totožní. V každé z nich je vyznačený lékař tím nejhorším, jakého daný rok náhodou vytvořil, a každý by se uváděl s čísly pod ním.',
        caption: 'Simulovaný rok {{index}}',
        item: 'Lékař č. {{doctor}} · {{deaths}} úmrtí proti {{expected}} očekávaným',
        itemStats: 'poměr {{ratio}} · p {{p}}',
        plotAria:
          'Simulovaný rok {{index}}: nemocnice s totožnými lékaři, kde je lékař č. {{doctor}} vyznačen jako nejhorší toho roku.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'První číslo nafukují dvě různé věci a snadno se zamění. První je zkreslení skladbou: pacienti toho lékaře opravdu byli těžší, takže část přebytku způsobila skladba pacientů, ne lékař. Tato část je skutečná, vysvětlitelná a riziková adjustace ji odstraní.',
      body2:
        'Druhou věcí je výběr. Úmrtnost na lékaře je počet několika vzácných událostí, takže rok od roku hodně skáče; když vezmete nejvyšší z několika desítek takových počtů, díváte se na vrchol rozdělení, ne na člověka. Tohle žádná adjustace nespraví, protože na adjustaci není nic špatně. Špatně je, že otázka byla zvolena až po odpovědi.',
      body3:
        'Je to tatáž chyba jako kreslení terče kolem šipek, volba nejlépe sedícího modelu a vyznačení nejnápadnějšího období záznamu. Nové je tu to, že hledání probíhá přes lidi — a závěr z něj by byl o člověku.',
    },
    action: 'Sledovat tytéž lékaře do dalšího roku',
  },
  validation: {
    heading: 'Titíž lékaři o rok později',
    body1:
      'Oba lékaři jsou teď určeni ještě před rokem, který zkoumáme — jeden rozpisem auditů, druhý loňskou tabulkou. Nemocnice odehraje další rok: titíž lékaři a tytéž druhy pacientů, ale každý pacient i každý výsledek nový.',
    body2:
      'Označený lékař se vrací do středu pole, protože nikdy nebylo odkud se vracet. Jeho špatný rok byl vlastností toho roku, ne toho lékaře.',
    thisYear: 'Letos (poměr)',
    nextYearDeaths: 'Úmrtí příští rok',
    nextYearRatio: 'Poměr příští rok',
    nextYearPValue: 'P-hodnota příští rok',
    tableHint: 'Titíž dva lékaři, změření na roce, který se na jejich vybrání nijak nepodílel.',
    freshYear: 'Nový rok',
    drawFresh: 'Odehrát další nezávislý rok',
    replications: {
      heading: 'Sledovat je po mnoho let',
      body: 'Každá replikace je další nezávislý rok pro tytéž dva lékaře, rizikově adjustovaný přesně jako předtím.',
      run: 'Spustit {{replications}} let',
      meanRatio: 'Průměr úmrtí ÷ očekávaná',
      shareSignificant: 'Označen v roce',
      tableHint:
        'Oba lékaři byli určeni dřív, než tyto roky vznikly, takže oba by měli být označeni asi v 5 % let — a oba jsou. Poměr kolem 1 je to, jak vypadá lékař bez vlivu.',
      note: 'Když hledání spustíme každý rok znovu, padne v {{share}} případů na jiného lékaře. Nemocnice vyprodukuje nejhoršího lékaře každý jediný rok — a skoro nikdy to není tentýž. Nález, který se posune pokaždé, když se posunou data, byl vlastností dat.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'Porovnávání hrubých měr porovnává pacienty stejně jako lékaře. Rozdíl může být úplně skutečný a přitom úplně způsobený tím, kdo přišel do dveří.',
    point2:
      'Riziková adjustace tohle spraví — a jenom tohle. Neumí adjustovat na rizika, která nikdo nezaznamenal, a neumí vědět, že tato jednotka byla nejkrajnější z mnoha.',
    point3:
      'Při dostatečném počtu jednotek je krajní jednotka zaručená. Otázka nikdy nezní „je tento lékař neobvyklý?“, ale „je neobvyklejší, než jak neobvyklý má nejneobvyklejší z {{doctors}} být?“',
    point4:
      'Být na chvostu tabulky je důvod se podívat, ne závěr. Tady pořádné prohlédnutí zjistilo, že nebylo co najít.',
    legitimate: {
      heading: 'Monitorování není ta chyba — a prošetření také ne',
      body: 'Nemocnice mají výsledky sledovat a neobvyklý výsledek má vyvolat otázky: lepší rizikovou adjustaci, pohled do dokumentace, rozhovor. Na to poplach je. Chybou je považovat poplach za nález — vyhlásit závěr o člověku na základě čísla, které bylo vybráno právě pro svou krajnost a které příští rok nezopakuje. Škoda tu není abstraktní: kariéry i důvěra pacientů jsou skutečné, i když jsou data simulovaná.',
    },
    evidence: {
      heading:
        'Důkaz, že se lékaři opravdu neliší',
      body:
        'Odehrajeme {{replications}} nezávislých let a v každém změříme téhož předem určeného lékaře, rizikově adjustovaným testem proti rizikům jeho vlastních pacientů.',
      run:
        'Odehrát {{replications}} let',
      histogramX:
        'p-hodnota auditovaného lékaře',
      histogramY:
        'Počet let',
      ariaLabel:
        'Rozdělení p-hodnot auditovaného lékaře za {{replications}} nezávislých let.',
      caption:
        'Sloupce jsou zhruba stejně vysoké: v žádném roce není tenhle lékař zvýhodněný ani znevýhodněný. Poslední sloupec vpravo bývá vyšší, protože úmrtí se počítají po celých lidech a u malých počtů vrací test hodnoty blízké jedné.',
      note:
        'Pod 0,05 padl v {{share}} let. Čekaných je pět procent a při {{replications}} letech to kolísá zhruba o procento. Takhle ploché to je ale jen po rizikové adjustaci. Hrubé porovnání proti průměru nemocnice ploché není, protože pacienti se doopravdy liší; to je ten rozdíl, který scénář odděluje.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Hledání probíhalo přes polohy, modely, období a teď přes lidi, vždy přes jednu věc po druhé. Další scénář nechá zkoumaný subjekt na místě a bude místo toho hledat napříč mnoha různými výsledky — v podobě, jakou tato chyba má v klinické studii.',
  },
}

export default doctormortality
