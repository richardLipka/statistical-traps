const bestline = {
  intro: {
    heading: 'Analýza stanovená předem',
    body1:
      'Stroj vytváří dvojice čísel. Obě souřadnice vznikají nezávisle na sobě: y je čistý šum, který nemá s x vůbec nic společného. Stejně jako v prvním scénáři to víme jistě, protože generátor jsme napsali sami — žádný skutečný vztah neexistuje.',
    body2:
      'Ještě než uvidíme jediný bod, zavazujeme se k jedné analýze: proložit vzorkem jednu přímku a zeptat se, zda vysvětlí více než vodorovná čára.',
    question: 'Popisuje přímka tyto body lépe, než dovoluje pouhá náhoda?',
    body3:
      'Odpověď musí znít ne. Všechno zajímavé, co bude následovat, vzejde jen z toho, jak usilovně jsme ochotni hledat.',
    trueProcess: 'x rovnoměrně, y nezávislý šum kolem nuly. Skutečný vztah: žádný.',
    action: 'Vygenerovat vzorek',
  },
  experiment: {
    heading: 'Vzorek čistého šumu',
    body1:
      'Tady je jeden vzorek. Body se rozbíhají, jak už to body dělají, a přímka stanovená předem jimi prochází, aniž by cokoli našla: to málo rozptylu, které zachytí, zachytí přímka i v čistém šumu.',
    body2:
      'Změňte velikost vzorku nebo semínko a sledujte, jak se přímka posouvá. Nic z toho nic neznamená — není tu co znamenat.',
    action: 'Teď zkuste najít model, který sedí',
  },
  controls: {
    heading: 'Nastavení experimentu',
    pointCount: 'Počet bodů',
    seed: 'Semínko generátoru',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejný vzorek, takže každý výsledek lze přesně zopakovat.',
  },
  plot: {
    aria: 'Bodový graf s {{count}} body a právě zobrazenými modely.',
    xLabel: 'x',
    yLabel: 'y',
    legendPoint: 'Pozorování',
    handleAria: 'Konec vaší přímky u {{side}}, aktuálně {{value}}. Posunete jej šipkami na klávesnici.',
    sideLeft: 'levého okraje',
    sideRight: 'pravého okraje',
  },
  models: {
    flat: 'Vodorovná čára: žádný vztah',
    flatShort: 'Žádný vztah',
    preRegistered: 'Přímka stanovená předem',
    preRegisteredShort: 'Stanovena předem',
    manual: 'Vaše vlastní přímka',
    manualShort: 'Vaše přímka',
    chosen: 'Model zvolený po pohledu na data',
    chosenShort: 'Zvolen dodatečně',
    degree: 'Stupeň {{degree}}',
    degreeShort: 's{{degree}}',
  },
  stats: {
    points: 'Body',
    rSquared: 'R² na tomto vzorku',
    rSquaredHint: 'Podíl rozptylu y, který model zopakuje. Větší pružnost ho může jen zvýšit.',
    pValue: 'p-hodnota, jak se běžně uvádí',
    freshRSquared: 'R² na nových datech',
    rmse: 'Typická chyba predikce',
    rmseHint: 'Odmocnina střední kvadratické chyby v jednotkách y. Samotný šum má rozptyl {{noise}}.',
    notApplicable: 'není definována',
  },
  observation: {
    heading: 'Najděte model, který sedí nejlépe',
    body1:
      'Přetáhněte obě úchytky a umístěte svou vlastní přímku tam, kde podle vás body popisuje nejlépe. Hodnotí se přesně jako každý jiný model: R² je podíl rozptylu y, který model zopakuje.',
    manualHint:
      'R² ručně nakreslené přímky může být záporné. Pod nulou předpovídá hůř, než kdybychom prostě použili průměr y.',
    fitLine: 'Proložit nejlepší přímku',
    body2:
      'Přímka není jediná možnost. Dejte modelu větší pružnost a začne se k bodům ohýbat — a R² přitom může jen růst.',
    flexibility: 'Pružnost modelu',
    degreePickerHint:
      'Každý stupeň je proložen metodou nejmenších čtverců a ke každému patří p-hodnota, která by se o něm běžně uvedla. Vyberte si ten, který vypadá nejpřesvědčivěji.',
    autoBest: 'Vybrat nejpřesvědčivější model',
    resetManual: 'Zpět na mou přímku',
    testNote:
      'F-test předpokládá proložení metodou nejmenších čtverců, takže vaše ručně nakreslená přímka dostane R², ale ne p-hodnotu. Každý proložený stupeň dostane obojí.',
    action: 'Porovnat s analýzou stanovenou předem',
  },
  analysis: {
    heading: 'Stejný test, dva způsoby volby modelu',
    body1:
      'Oba řádky níže byly testovány stejně: standardním F-testem, který se ptá, zda model vysvětlí z y více než vodorovná čára. Jediný rozdíl je v tom, kdy byl model zvolen.',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint: 'Celkový F-test regrese.',
    verdictNothing: 'Není co hlásit',
    verdictStriking: 'Vypadá to jako objev',
    body2:
      'F-test si účtuje každý parametr, takže samotná pružnost ho neoklame. Oklame ho to, že jsme vyzkoušeli {{count}} modelů a uvedli ten, který vyšel nejlépe.',
    selection: {
      heading: 'Jakou hodnotu má samotné hledání',
      body: 'Abychom zvolený model posoudili poctivě, nasimulujeme celý postup: vygenerovat nový vzorek čistého šumu, proložit každý stupeň od 1 do {{maxDegree}} a ponechat si nejmenší p-hodnotu. A to {{replications}}krát.',
      run: 'Nasimulovat hledání {{replications}}×',
      running: 'Simuluji…',
      histogramTitle: 'Nejmenší p-hodnota nalezená stejným hledáním v čistém šumu',
      histogramX: 'Nejmenší p-hodnota hledání',
      histogramY: 'Počet simulovaných hledání',
      marker: 'Váš výsledek',
      adjusted: 'p-hodnota opravená na hledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často stejné hledání v čistém šumu vytvoří p-hodnotu alespoň tak malou jako {{pValue}}.',
      shareSignificant:
        'V {{share}} simulovaných vzorků našlo hledání něco pod 0,05 — a to v datech, kde nic není. Postup, který se má mýlit v 5 % případů, se mýlí v {{share}} případů, jakmile model vybíráme z dat.',
      conclusion:
        'Proti měřítku vlastního hledání je výsledek zcela obyčejný: p-hodnotu {{pValue}} tento postup v šumu běžně vytváří.',
      gallery: {
        heading: 'Pět nejpřesvědčivějších nálezů z těchto simulací',
        body: 'Každý vzorek níže je čistý šum a každá křivka je model, který v něm vyšel nejlépe. O každém z nich by se uvedla p-hodnota napsaná pod ním.',
        caption: 'Simulace {{index}}',
        item: 'Stupeň {{degree}} · R² {{rSquared}}',
        itemPValue: 'p {{p}}',
        plotAria: 'Simulace {{index}}: {{count}} náhodných bodů s nejpřesvědčivějším modelem, který v nich byl nalezen.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'Dějí se tu dvě různé věci a vyplatí se je oddělit. R² roste s pružností z čistě mechanického důvodu: pružnější model v sobě obsahuje ten jednodušší, takže nemůže sedět hůř. Vysoké R² na vzorku, ze kterého byl model postaven, proto samo o sobě není důkazem ničeho.',
      body2:
        'p-hodnotu tohle neoklame — F-test si každý parametr odečte. Oklame ji hledání. Vyzkoušet devět modelů a uvést ten nejlepší znamená devět příležitostí mít smůlu, a uvedená p-hodnota popisuje jen tu poslední z nich.',
      body3:
        'Je to stejný tah jako posunutí terče kolem šipek. Z kruhu se stala křivka a z desky prostor modelů, ale chyba je totožná: hypotéza vybraná z dat, prezentovaná, jako by byla stanovena předem.',
    },
    action: 'Otestovat na nových datech',
  },
  validation: {
    heading: 'Nové, nezávislé body',
    body1:
      'Modely jsou teď zafixované: vodorovná čára, přímka stanovená předem i model, který jste zvolili. Stroj vygeneruje zcela nový vzorek ze stejného procesu a všechny tři mají předpovědět jeho body.',
    body2:
      'Proložit data je snadné, předpovídat nikoli. Pružný model kopíroval každé zavlnění původního vzorku — a žádné z nich se nevrátilo.',
    drawFresh: 'Vygenerovat nový nezávislý vzorek',
    originalData: 'Původní vzorek',
    freshData: 'Nový vzorek',
    curve: {
      heading: 'Proložení proti predikci, stupeň po stupni',
      body: 'Stejná dvě čísla pro každou pružnost, kterou hledání mohlo zvolit: jak dobře model popisuje vzorek, na kterém byl proložen, a jak dobře předpovídá ten nový.',
      xLabel: 'Stupeň modelu',
      yLabel: 'R²',
      training: 'Na původním vzorku',
      fresh: 'Na novém vzorku',
      clipNote: 'Křivka predikce opouští graf pod hodnotou −2; přesné hodnoty jsou v tabulce výše.',
    },
    replications: {
      heading: 'Zopakovat na mnoha nezávislých vzorcích',
      body: 'Každá replikace je nový vzorek ze stejného procesu, který předpovídají tři zafixované modely.',
      run: 'Spustit {{replications}} replikací',
      running: 'Počítám…',
      meanRSquared: 'Průměrné R² na nových datech',
      meanRmse: 'Průměrná chyba predikce',
      worseThanFlat: 'Horší než netvrdit nic',
      note: 'Na datech, která model neviděl, je každý z nich na nule nebo pod ní — v datech prostě není co předpovídat. Zvolený model ale není jen neužitečný: je spolehlivě horší než tvrzení, že žádný vztah neexistuje. A je horší právě proto, že původní vzorek popsal tak dobře.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'To, jak dobře model popisuje data, ze kterých byl postaven, o něm vypovídá jen málo. Pružnost toto číslo zvyšuje mechanicky.',
    point2:
      'p-hodnota popisuje jeden předem stanovený test. Když proložíme několik modelů a uvedeme ten nejlepší, přestane popisovat to, co jsme skutečně udělali.',
    point3:
      'Cena za hledání se musí někde zaplatit: buď opravou na počet možností, nebo testem na datech, která se hledání vůbec neúčastnila.',
    point4:
      'Model, který sleduje šum v jednom vzorku, předpovídá ten další hůř než model, který netvrdí nic.',
    legitimate: {
      heading: 'Chyba není v pružných modelech',
      body: 'Pružné modely jsou nepostradatelné a zkoušet jich několik je přesně to, čemu se říká výběr modelu. Když se to dělá pořádně, srovnání probíhá na datech k tomu vyčleněných a vítěz se uvádí jako výsledek hledání — tedy jako hypotéza hodná testu, nikoli jako objev.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Zatím hledání probíhalo vždy v jedné věci: nejprve v poloze, potom v modelu. Další scénář pustí hledání do podskupin dat, kde je mnohem těžší si vůbec všimnout, že nějaké hledání proběhlo.',
  },
}

export default bestline
