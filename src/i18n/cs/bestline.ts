const bestline = {
  intro: {
    heading: 'Analýza stanovená předem',
    body1:
      'Stroj vytváří dvojice čísel. Obě souřadnice vznikají nezávisle na sobě: y je čistý šum, který nemá s x vůbec nic společného. Stejně jako v prvním scénáři to víme jistě, protože generátor jsme napsali sami — žádný skutečný vztah neexistuje.',
    body2:
      'Ještě než uvidíme jediný bod, zavazujeme se k jedné analýze. Proložíme vzorkem jednu přímku a zeptáme se, jestli body sleduje o tolik lépe než obyčejná vodorovná čára, že už to náhoda nevysvětlí.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že „jak dobře model sedí na datech“ a „jak dobře model něco vystihuje“ jsou dvě různé věci. Čím ohebnější křivku dovolíme, tím líp sedne — i když v datech není vůbec nic. A když si pak z nabídnutých modelů vybereme ten s nejhezčím číslem, vybíráme si vlastně jen to nejšťastnější losování.',
    goalStep1:
      'Vygenerujeme body a proložíme jimi přímku, ke které jsme se zavázali předem. Nic nenajde.',
    goalStep2:
      'Pak zkusíme ohebnější křivky a vybereme tu, která vyjde nejpřesvědčivěji. Ta už jako nález vypadá.',
    goalStep3:
      'Nakonec spočítáme, co takové hledání umí v čistém šumu, a necháme stroj vygenerovat nové body. Nezbude z toho nic.',
    question: 'Popisuje přímka tyto body lépe, než dovoluje pouhá náhoda?',
    body3:
      'Odpověď musí znít ne. Všechno zajímavé, co bude následovat, vzejde jen z toho, jak usilovně jsme ochotni hledat.',
    trueProcess:
      'x se losuje rovnoměrně, y se losuje úplně zvlášť jako šum kolem nuly. Mezi x a y není žádný vztah — ani přímý, ani zakřivený, ani žádný jiný.',
    action: 'Vygenerovat vzorek',
  },
  experiment: {
    heading: 'Vzorek čistého šumu',
    body1:
      'Tady je jeden vzorek. Body se rozbíhají, jak už to body dělají, a přímka stanovená předem jimi prochází, aniž by něco našla. To málo, co zachytí, zachytí i v čistém šumu.',
    body1Hit:
      'Tady je jeden vzorek a přímce stanovené předem tentokrát vyšlo p pod 0,05. Je to planý poplach: test na této hladině se mýlí asi u jednoho vzorku z dvaceti a tenhle je ten dvacátý. Žádný vztah v datech není. Přelosujte semínko a přímka zhasne.',
    body2:
      'Změňte velikost vzorku nebo semínko a sledujte, jak se přímka posouvá. Nic z toho nic neznamená — není tu co znamenat.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'R² říká, jaká část kolísání y je zachycená křivkou. Nula znamená, že křivka nepomáhá vůbec nic — stejně dobře byste hádali průměr. Jednička znamená, že křivka prochází přesně všemi body. Podstatné je, že ohebnější křivka má R² vždycky vyšší, i když v datech nic není: to číslo tedy samo o sobě není důkaz ničeho.',
    numbersBody2:
      'P-hodnota odpovídá na jinou otázku: kdyby mezi x a y nebyl žádný vztah, jak často by křivka stejně vyšla aspoň takhle dobře? Na rozdíl od R² si účtuje za každý parametr navíc, takže pouhou ohebností ji neošálíte. Ale i ona platí jen pro model zvolený předem, a s tím si za chvíli pohrajeme.',
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
    legendPoint: 'Datový bod',
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
      'Přímka není jediná možnost. Dejte modelu větší pružnost a začne se k bodům ohýbat, přičemž R² může jen růst.',
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
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    body2:
      'F-test si účtuje každý parametr, takže samotná pružnost ho neoklame. Oklame ho to, že jsme vyzkoušeli {{count}} modelů a uvedli ten, který vyšel nejlépe.',
    runFirst:
      'Oprava níže je smyslem tohoto kroku: bez ní je číslo v řádku výše tím, co by se uvedlo.',
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
        'p-hodnotu tohle neoklame — F-test si každý parametr odečte. Oklame ji hledání. Vyzkoušet {{count}} modelů a uvést ten nejlepší znamená {{count}} příležitostí mít smůlu a uvedená p-hodnota popisuje jen tu poslední.',
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
      'Proložit data je snadné, předpovídat nikoli. Pružný model kopíroval každé zavlnění původního vzorku. Žádné z nich se nevrátilo.',
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
      note: 'Na datech, která model neviděl, je každý z nich na nule nebo pod ní — v datech prostě není co předpovídat. Zvolený model ale není jen neužitečný: je spolehlivě horší než tvrzení, že žádný vztah neexistuje. A je horší proto, že původní vzorek popsal tak dobře.',
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
      'Hledání zatím probíhalo vždy jen v jedné věci: nejprve v poloze, potom v modelu. Další scénář pustí hledání do úseků záznamu sbíraného v čase, kde data sama vypadají strukturovaně a je mnohem těžší si vůbec všimnout, že nějaké hledání proběhlo.',
  },
}

export default bestline
