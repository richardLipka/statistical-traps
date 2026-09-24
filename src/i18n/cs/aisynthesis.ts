const aisynthesis = {
  intro: {
    heading: 'Systém dostane otázku, co předpovídá výsledek',
    body1:
      'Tabulka případů: jeden výsledek, který se má předpovědět, a celá řada kandidátských příznaků, ze kterých se předpovídat dá. Tabulku dostane systém, který každého kandidáta ohodnotí a vrátí ty, co fungují nejlépe. Udělá to správně — není tu žádná chyba k nalezení ani naivní přešlap v metodě.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že tenhle pokus dopadne jinak než šest předchozích: hledání tentokrát najde i něco skutečného. A přesto z dat, ve kterých hledalo, nejde poznat, který z nálezů to je. A i když se to nakonec pozná, pořád z toho neplyne, že se podle něj dá jednat.',
    goalStep1:
      'Systém ohodnotí všechny kandidáty a vrátí ty nejsilnější. Dva z nich si vezmeme stranou: vypadají úplně stejně.',
    goalStep2:
      'Opravíme jejich p-hodnoty o to, že se hledalo. Zamítne to oba — i toho, který je skutečný.',
    goalStep3:
      'Teprve nové případy, které hledání nevidělo, ty dva oddělí. A poslední otázka, jestli se podle nálezu dá jednat, zůstane nezodpovězená i pak.',
    body2:
      'Jeden z kandidátů je s výsledkem skutečně spojený. Všichni ostatní s ním nesouvisejí vůbec. Nic v tabulce neoznačuje, který je který, a systému to nikdo neřekne.',
    questionsHeading: 'Čtyři otázky, které položíme tomu, co se vrátí',
    body3:
      'Znějí jako jedna otázka a mají různé odpovědi. Jejich oddělení je celý tento poslední scénář a je to místo, ke kterému šest předchozích mířilo.',
    trueProcess:
      'V pozadí je jedna veličina, kterou nikdo nezměřil a která se do tabulky nedostala. Určuje výsledek a zároveň určuje jeden z kandidátských příznaků — ten se proto s výsledkem hýbe společně a jejich korelace vychází kolem {{correlation}}. Všechny ostatní příznaky se losují úplně samostatně. Žádný příznak ale výsledek nezpůsobuje: když jím pohnete, výsledek se nepohne, protože ten závisí jedině na té nezměřené veličině.',
    fictionHeading: 'Nic zde není skutečné',
    fictionBody:
      'Tabulka, výsledek i systém vznikají ve vašem prohlížeči ze semínka. Nejde o žádný skutečný datový soubor, model ani produkt. Ta nezměřená veličina je viditelná pro simulaci a pro nikoho ve scénáři — přesně jako příčina, kterou nikdo nezaznamenal, chybí ve skutečných datech.',
    action: 'Předat data',
  },
  experiment: {
    heading: 'Co se vrátilo',
    body1:
      'Systém ohodnotil všech {{candidates}} kandidátů proti výsledku a seřadil je. Tohle je výstup, jaký takový systém vytváří: užší výběr a čísla, která ho podpírají.',
    shortlist: 'Nejsilnější kandidáti',
    shortlistHint:
      'Ti dva, které bude scénář sledovat, jsou vyznačeni. Je to ten, kterého mělo hledání nejraději, a jeden další. Otázka zní, který je který a proč.',
    body2:
      '{{count}} kandidátů samo o sobě překonalo 0,05. Změňte počet kandidátů a sledujte, jak se toto číslo hýbe s ním, a ne s čímkoli ve světě.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'Korelace r říká, jak těsně případy leží kolem jedné přímky: nula je beztvarý mrak, plus jedna dokonalý vzestup, minus jedna dokonalý pokles. P-hodnota vedle ní odpovídá na jinou otázku: kdyby ten příznak s výsledkem vůbec nesouvisel, jak často by jeho korelace i tak vyšla aspoň takhle silná?',
    numbersBody2:
      'Obojí ale platí pro příznak, na který se někdo zeptal předem. Tady systém ohodnotil {{candidates}} kandidátů a vrací z nich ty nejlepší, což je jiná situace. P-hodnota 0,05 znamená „takhle silné to vyjde u jednoho příznaku z dvaceti“. Z {{candidates}} nesouvisejících příznaků jich tedy laťku přeskočí asi {{expected}}, aniž by za nimi cokoli bylo. Stejné číslo stojí pod dlaždicí „Pod 0,05“.',
    action: 'Podívat se na oba finalisty',
  },
  controls: {
    heading: 'Nastavení experimentu',
    candidateCount: 'Kandidátských příznaků',
    rowCount: 'Případů v tabulce',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejnou tabulku. Víc kandidátů systém nezlepší v hledání toho skutečného — dá mu víc způsobů, jak se splést.',
  },
  plot: {
    notHandedOver: 'Data ještě nebyla předána.',
    searching: 'Systém se dívá na užší výběr.',
    candidateAria: 'Příznak {{feature}} vynesený proti výsledku, s proloženou přímkou.',
    candidateStats: 'r {{r}}',
    legendCase: 'Jeden případ',
    legendAxes: 'Příznak proti výsledku',
  },
  features: {
    label: 'Příznak {{feature}}',
    connected: 'Skutečně spojený',
    unconnected: 'S výsledkem nesouvisí',
    unknown: 'Zatím nevíme',
  },
  questions: {
    describes: 'Popisuje data, ve kterých byl nalezen?',
    distinguishes: 'Umí tato data odlišit ho od druhého kandidáta?',
    predicts: 'Předpovídá případy, které nikdo neviděl?',
    changes: 'Když ho změníme, změní se výsledek?',
  },
  answers: {
    yes: 'Ano',
    no: 'Ne',
  },
  stats: {
    candidates: 'Kandidáti',
    candidatesHint: 'ohodnoceno proti výsledku',
    rows: 'Případy',
    significant: 'Pod 0,05',
    significantHint: 'náhodou očekáváno asi {{expected}}',
    correlation: 'Korelace r',
    pValue: 'p-hodnota, jak se běžně uvádí',
  },
  observation: {
    heading: 'Dva finalisté a žádný způsob, jak je odlišit',
    body1:
      'Tady jsou, vedle sebe: stejný počet případů, stejný druh grafu, stejný test. Jeden z nich je s výsledkem spojený a druhý je šum.',
    tableHint: 'Přesný test, že korelace je nulová, pro každého kandidáta zvlášť.',
    body2:
      'Všechno, co hledání vytvořilo, je na této obrazovce. Další krok položí datům těžší otázku a odpovědi jim začnou docházet.',
    guessHeading: 'Který z nich je skutečný?',
    guessBody:
      'Zavažte se k odpovědi. Za omyl není žádný postih a smyslem otázky je to, jaké je rozhodovat se z tohoto podkladu.',
    guessRecorded: 'Zaznamenáno. Dozvíte se to až ve fázi ověření, ne dřív.',
    guessFirst: 'Vyberte jednoho, abyste mohli pokračovat.',
    action: 'Nechat to rozhodnout data',
  },
  analysis: {
    heading: 'Co tato data mohou a nemohou říct',
    body1:
      'Oba finalisté jsou významní, oba byli vybráni z dlouhého seznamu a oba byli nalezeni týmž správně provedeným hledáním. Nejdřív to hledání oceníme a potom se podíváme, co nám jeho ocenění neřekne.',
    naivePValue: 'p, jak se uvádí',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    runFirst:
      'Oprava níže je smyslem tohoto kroku: bez ní jsou čísla výše tím, co by se uvedlo.',
    selection: {
      heading: 'Co samo o sobě znamená hledání',
      body: 'Simulujeme celý postup ve světě, kde není co najít: vytvoříme tabulku, kde žádný příznak není s výsledkem spojený, ohodnotíme všech {{candidates}} kandidátů a ponecháme nejsilnějšího. A to {{replications}}krát.',
      run: 'Simulovat hledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejsilnější korelace, kterou stejné hledání najde, když nic spojené není',
      histogramX: '|r| nejsilnějšího nalezeného kandidáta',
      histogramY: 'Počet simulovaných hledání',
      marker: 'Nejlepší finalista',
      adjusted: 'p opravené o hledání',
      tableHint:
        'Monte Carlo p-hodnoty: jak často prohledání tabulky, ve které nic není, vytvoří kandidáta aspoň takto silného.',
      bothFail:
        'Opravu nepřežil ani jeden finalista a jejich opravené hodnoty leží blízko sebe. Oddělit je oprava neumí: měří hledání, a oba vzešli z téhož hledání.',
      notFalse:
        'Oprava neříká, že nález je nepravdivý. Říká, že ho tahle data neprokázala. Jeden z těch dvou je skutečný a oprava zamítá oba.',
      oneSurvives:
        'Aspoň jeden finalista opravou prošel; tabulka výše říká který. Skutečný tím není. Oprava měří, kolik se hledalo, a proti tomu vyšel tenhle vztah dost silně.',
      notProven:
        'Oprava neříká, že nález je pravdivý. Říká, že ho tahle data unesou. To je něco jiného a který z těch dvou finalistů je ten pravý, se odsud pořád nepozná.',
      gallery: {
        heading: 'Pět nejsilnějších kandidátů, které tyto simulace vytvořily',
        body: 'V každé tabulce níže není s výsledkem spojeno vůbec nic a každý graf je nejlepším kandidátem, jakého její hledání našlo. Postavte je vedle obou finalistů a není z čeho vybírat.',
        caption: 'Simulované hledání {{index}}',
        itemStats: 'r {{r}} · p {{p}}',
        plotAria:
          'Simulované hledání {{index}}: příznak {{feature}}, nejsilnější kandidát nalezený v tabulce, kde nic spojené není.',
      },
    },
    explanation: {
      title: 'Proč to data nemohou rozhodnout?',
      body1:
        'Protože jim obě vysvětlení sedí stejně dobře. Skutečně spojený příznak a nejšťastnější z {{candidates}} nesouvisejících vytvoří v tabulce této velikosti tentýž obrázek. Stejnou korelaci, stejnou p-hodnotu, stejný graf. Z těchto řádků nelze spočítat žádnou statistiku, která by je oddělila, a dívat se na ně pozorněji nepomůže.',
      body2:
        'Není to selhání hledání ani systému, který ho provedl. Hledání udělalo, oč bylo požádáno, a ohlásilo, co našlo. Informace, která by ty dva oddělila, v této tabulce nikdy nebyla — je v datech, která hledání nevidělo.',
      body3:
        'K tomuhle šest předchozích scénářů mířilo. Každý z nich ukázal hledání, které z ničeho vytvoří něco přesvědčivého; tenhle přidává případ, kdy má hledání pravdu. Poučení není, že hledání vytváří nepravdy. Je to, že výstupem hledání je seznam hypotéz. Které z nich jsou skutečné, je otázka pro jiná data.',
    },
    action: 'Získat nové případy',
  },
  validation: {
    heading: 'Případy, které hledání nevidělo',
    body1:
      'Oba finalisté jsou teď zmrazeni a přímka proložená původní tabulkou se přenáší beze změny — takže musí předpovídat, a ne popisovat. Z téhož světa vzniknou nové případy.',
    freshCases: 'Nové případy',
    replications: {
      heading: 'Otázka tři: předpovídá?',
      body: 'Každá replikace je nová tabulka případů z téhož světa, na které se změří oba finalisté.',
      run: 'Spustit {{replications}} nových tabulek',
      meanR: 'Průměrné r na nových případech',
      shareSignificant: 'Znovu významné',
      prediction: 'R² při předpovědi nových případů',
      tableHint:
        'Záporné R² znamená, že zmrazená přímka předpovídá nové případy hůř než jejich vlastní průměr. Kladné znamená, že nese skutečnou informaci.',
      note: 'Jeden finalista spadne na nulu a druhý se drží přesně tam, kde byl. Data, která to rozhodla, nebyla lepší — byla to prostě data, která se na volbě ani jednoho z kandidátů nijak nepodílela.',
    },
    guessRight:
      'Vybrali jste příznak {{feature}} a je to ten spojený. Měli jste k dispozici velmi málo: oba vypadali stejně, protože v té tabulce stejní byli.',
    guessWrong:
      'Vybrali jste příznak {{feature}} a je to jeden z těch nesouvisejících. Není to selhání úsudku. Nic na té obrazovce vám to nemohlo prozradit, a proto jsme se ptali.',
    body2:
      'Ten skutečný tedy spolehlivě předpovídá případy, které nikdo neviděl. Tím je otázka tři zodpovězena a tady analýza často končí. Neměla by. Zbývá ještě jedna otázka a u té se odpověď mění.',
    intervention: {
      heading: 'Otázka čtyři: změní se něco, když ho změníme?',
      body: 'Každá tabulka se změří dvakrát — jednou tak, jak ji svět vytvoří, a jednou s příznakem nastaveným námi místo toho, aby ho něco způsobilo. Výsledek vzniká v obou případech stejně.',
      run: 'Spustit {{replications}} zásahů',
      observed: 'Rozdíl, jak jsme ho našli',
      set: 'Rozdíl, když ho nastavíme',
      tableHint:
        'Výsledek u případů vysoko na daném příznaku minus u případů nízko, zprůměrováno přes replikace.',
      note: 'Spojený příznak výsledek předpovídá a neovlivňuje ho. Nese informaci proto, že sdílí s výsledkem neměřenou příčinu, takže se hýbe, když se hýbe výsledek — a když jím pohneme my, nenásleduje nic. Zasáhnout do něj by nepřineslo vůbec nic.',
      caveat:
        'Tenhle zásah je možný jen proto, že jsme svět napsali my a umíme v něm přerušit vazbu. U dat, která někdo sebral, se tento sloupec spočítat nedá — je to experiment, který nikdo neprovedl, a sebevětší pečlivost u zbylých tří otázek ho nenahradí.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Čtyři otázky, čtyři odpovědi',
    ladderHeading: 'Oba finalisté vedle sebe',
    ladderHint:
      'Odděluje je jedině třetí řádek a vyplnit ho mohla jedině data, která hledání nevidělo. Čtvrtý řádek je „ne“ u obou.',
    point1:
      'Najít vzor, předpovídat s ním, potvrdit ho a jednat podle něj jsou čtyři různá tvrzení. Jediná p-hodnota sama o sobě nemluví ani o jednom z nich.',
    point2:
      'Hledání, které najde něco skutečného, a hledání, které nenajde nic, vypadají zevnitř prohledaných dat úplně stejně. Není to vada hledání; rozlišující informace je jinde.',
    point3:
      'Oprava na hledání vám řekne, že výsledek není prokázaný. Neřekne vám, že je nepravdivý — tady zamítá i ten skutečný nález.',
    point4:
      'Predikce není kauzalita a ta mezera není akademická. Příznak může výsledek předpovídat dokonale a být naprosto nepoužitelný k tomu, aby ho změnil.',
    aiHeading: 'Co z toho plyne pro systémy, které tohle dělají ve velkém',
    aiBody1:
      'Prohledávat data kvůli vzorům je legitimní a dělat to ve velkém je často jediný způsob, jak získat hypotézy, které stojí za to. Systém, který prozkoumá miliony kandidátů, se tím zkoumáním nedopouští statistické chyby. Chybou je předložit to, co hledání vrátilo, jako by to bylo potvrzené. Ve velkém měřítku se ta chyba dělá snáz a hůř se pozná: výstup přichází seřazený, naformátovaný a věrohodný.',
    aiLine:
      'Schopnost nacházet vzory není totéž co schopnost určit, které vzory jsou skutečné.',
    aiBody2:
      'K tomu druhému jsou potřeba data, kterých se hledání nedotklo, a k tomu, aby se dalo podle vzoru jednat, je potřeba zásah. Ani jedno nedokáže dodat schopnější hledání, protože ani jedno není otázkou o datech, která dostalo.',
    endHeading: 'Konec celé řady',
    endBody:
      'Terč posunutý až po hodu, model vybraný proto, že nejlépe sedí, období vyznačené na náhodné procházce, nejhorší lékař v tabulce, nejlepší výsledek ve studii, nejsilnější dvojice v prohledávání. A nakonec skutečný nález, který vám stejně neřekne, co dělat. Všemi sedmi prochází táž otázka: jak byl tento vzor nalezen a přežil by odpovídající test na nových datech?',
  },
}

export default aisynthesis
