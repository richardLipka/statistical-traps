const dartboard = {
  intro: {
    heading: 'Terč určený předem',
    body1:
      'Stroj hází šipky na čtvercovou desku zcela náhodně. Každá poloha je stejně pravděpodobná: žádné míření, žádná dovednost, žádné oblíbené místo. Víme to jistě, protože generátor jsme napsali sami — žádné místo na desce není pro stroj lepší než kterékoli jiné.',
    body2:
      'Ještě před prvním hodem si stanovíme jeden terč: modrý kruh uprostřed. Spolu s ním stanovíme i otázku, kterou o něm budeme klást.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že stačí nakreslit terč až potom, co šipky dopadnou, a z naprosto náhodných hodů se stane „nález“. Stroj přitom nemíří — my jen změníme otázku, a to až ve chvíli, kdy už známe odpověď.',
    goalStep1:
      'Stroj hodí šipky a my otestujeme modrý terč, který jsme určili předem. Nic nenajde.',
    goalStep2:
      'Pak si červeným kruhem sami najdeme místo, kde je šipek nejvíc, a použijeme na něj úplně stejný test. Ten už jako nález vypadá.',
    goalStep3:
      'Nakonec spočítáme, co takové hledání umí v čistě náhodných datech, a necháme stroj hodit znovu. Nezbude z toho nic.',
    question: 'Zasahuje stroj tento kruh častěji, než lze vysvětlit pouhou náhodou?',
    body3:
      'Nic z toho, co bude následovat, nemůže změnit pravdu o stroji. Mění se jen způsob, jakým se na jeho výsledky díváme.',
    trueProcess:
      'Poloha každé šipky se losuje rovnoměrně po celé desce, nezávisle na všech ostatních. Žádné místo není zvýhodněné: skutečný vliv čehokoli na desce je přesně nulový.',
    action: 'Hodit šipky',
  },
  experiment: {
    heading: 'Náhodné hody',
    body1:
      'V těchto šipkách není žádný vzor. Modrý kruh jich několik zachytí, zhruba tolik, kolik odpovídá jeho ploše — někdy o něco více, někdy o něco méně.',
    body2:
      'Zkuste změnit nastavení a sledujte, jak počet kolísá. Z tohoto kolísání je postavená každá past v téhle aplikaci.',
    verdictBody:
      'Modrý terč dostal svůj test a nic nenašel. Tak to má být, protože v těch šipkách není co najít.',
    verdictBodyHit:
      'Modrý terč dostal svůj test a vyšlo mu p pod 0,05. Je to planý poplach: i terči určenému předem to takhle vyjde nejvýš jednou z dvaceti. Tenhle je ten dvacátý. Hoďte znovu s jiným semínkem a zmizí to.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'Kruh zabírá {{share}} plochy desky, takže při náhodných hodech do něj padne zhruba tentýž podíl šipek — z {{darts}} hodů tedy asi {{expected}}. Tomu se říká očekávaný počet zásahů. Skutečný počet kolem něj kolísá nahoru a dolů, a celý zbytek scénáře stojí na tom, jak velké to kolísání je.',
    numbersBody2:
      'P-hodnota u modrého terče odpovídá na jedinou otázku: kdyby stroj házel úplně náhodně, jak často by do tohoto kruhu trefil aspoň tolik šipek jako teď? Hodnota 0,9 znamená „tohle nebo lepší se stane v devíti případech z deseti, nic zvláštního“. Hodnota 0,001 znamená „tohle by se stalo asi jednou z tisíce“ — a takové výsledky se začnou označovat za nález. Hranice 0,05 je jen dohoda, ne důkaz.',
    action: 'Teď zkuste najít vzor',
  },
  controls: {
    heading: 'Nastavení experimentu',
    dartCount: 'Počet šipek',
    radius: 'Poloměr terče',
    seed: 'Semínko generátoru',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejné šipky, takže každý výsledek lze přesně zopakovat.',
  },
  board: {
    aria: 'Čtvercová deska s {{count}} náhodně hozenými šipkami.',
    legendDart: 'Šipka',
  },
  targets: {
    preset: 'Terč určený předem',
    presetShort: 'Určen předem',
    postHoc: 'Terč zvolený po pohledu na data',
    postHocShort: 'Zvolen dodatečně',
    postHocAria:
      'Terč zvolený po pohledu na data. Vodorovná poloha {{x}} procent, svislá poloha {{y}} procent. Posunete jej šipkami na klávesnici.',
    dragHint: 'Přetáhněte červený kruh myší nebo prstem, případně jej vyberte a použijte šipky na klávesnici.',
  },
  stats: {
    dartsThrown: 'Hozených šipek',
    hitProbability: 'Pravděpodobnost zásahu kruhu této velikosti',
    hitProbabilityHint: 'Plocha kruhu dělená plochou desky. Pro oba kruhy stejná.',
    expected: 'Očekávaný počet zásahů při náhodě',
    hits: 'Zásahy',
    hitsOf: '{{hits}} z {{total}} šipek',
    capturedNow: 'Aktuálně zachyceno',
    best: 'Nejlepší možný výsledek',
  },
  observation: {
    heading: 'Nakreslete terč kolem šipek',
    body1:
      'Přetáhněte červený kruh kamkoli po desce a zachyťte co nejvíce šipek. Je přesně stejně velký jako modrý; jediný rozdíl je v tom, že jeho polohu volíte teď, když už data vidíte.',
    body2:
      'Není to podvod v žádném zjevném smyslu. Tím v praxi často bývá podskupina, hranice, časové okno nebo „oblast zájmu“: volbou, která padla až po datech.',
    testBody:
      'Na váš kruh se průběžně počítá úplně stejný test, jaký byl připraven pro ten modrý. Zkuste najít polohu, ve které p-hodnota klesne co nejníže. O tohle hledání v celém scénáři jde.',
    livePValue: 'p-hodnota vašeho kruhu',
    auto: 'Najít nejlepší polohu automaticky',
    autoHint:
      'Hledání prozkoumá každou polohu, která může být optimální — pro tyto šipky {{count}} kandidátních poloh.',
    reset: 'Vrátit červený kruh',
    action: 'Použít na oba kruhy stejný test',
  },
  analysis: {
    heading: 'Stejný test použitý na oba kruhy',
    body1:
      'Oba kruhy mají stejnou plochu, takže při čisté náhodě je pravděpodobnost jejich zásahu totožná: {{probability}}. U obou se teď zeptáme na stejnou věc: jak pravděpodobné je, že pouhá náhoda vytvoří alespoň tolik zásahů?',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint: 'Jednostranný exaktní binomický test.',
    runFirst:
      'Oprava níže je smyslem tohoto kroku: bez ní je číslo v řádku výše tím, co by se uvedlo.',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    body2:
      'Test neví, jak byl kruh zvolen. Odpovídá na otázku, kterou dostal, a odpovídá na ni správně — pro červený kruh je to však špatná otázka.',
    selection: {
      heading: 'Jakou hodnotu má samotné hledání',
      body: 'Červený kruh nebyl zvolen předem. Byl zvolen proto, že dobře vypadal. Poctivě se dá posoudit jedině tak, že nasimulujeme celý postup: vygenerovat nové náhodné šipky, stejně důkladně je prohledat a zaznamenat, kolik šipek zachytí nejlepší kruh. A to {{replications}}krát.',
      run: 'Nasimulovat hledání {{replications}}×',
      running: 'Simuluji…',
      histogramTitle: 'Nejlepší kruh nalezený v čistě náhodných šipkách',
      histogramX: 'Šipky zachycené nejlepším kruhem',
      histogramY: 'Počet simulovaných hledání',
      marker: 'Váš výsledek: {{hits}}',
      adjusted: 'p-hodnota opravená na hledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často vyčerpávající hledání v čistě náhodných šipkách zachytí alespoň {{hits}} šipek. Vaše hledání mohlo být méně důkladné než simulované, proto je tato hodnota konzervativní.',
      conclusion:
        'Při čisté náhodě zachytí nejlepší kruh na této desce v průměru {{mean}} šipky. Proti tomuto měřítku není {{hits}} nijak pozoruhodné číslo.',
      conclusionStrong:
        'Při čisté náhodě zachytí nejlepší kruh na této desce v průměru {{mean}} šipky. Vašich {{hits}} je na horní hranici toho, co vytvoří samotné hledání — ale pořád je to jen to, co vytvoří samotné hledání.',
      gallery: {
        heading: 'Pět nejlepších nálezů z těchto simulací',
        body: 'Každá deska níže obsahuje jinou sadu zcela náhodných šipek a kruh je vždy ten nejlepší, jaký v ní hledání našlo. Test z tabulky výše by u každého z nich hlásil objev. Skutečný efekt je přitom ve všech případech přesně nulový.',
        caption: 'Simulace {{index}}',
        item: 'Zásahy: {{hits}}',
        itemPValue: 'p {{p}}',
        boardAria: 'Simulace {{index}}: {{count}} náhodných šipek s nejlepším kruhem, který v nich byl nalezen.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'p-hodnota odpovídá na podmíněnou otázku: kdyby se nic nedělo, jak často bychom viděli výsledek alespoň takto extrémní? Tato odpověď ohraničuje chybovost jen tehdy, když byl testovaný výsledek stanoven dříve, než jsme viděli data.',
      body2:
        'Když kruhem po hodu pohneme, nedíváme se už na jeden kruh. Díváme se na nejlepší z obrovského množství kruhů, a maximum z mnoha náhodných hodnot není typická náhodná hodnota. Testová statistika je nafouknutá samotným hledáním a binomická p-hodnota to nemá jak zohlednit.',
      body3:
        'Obvykle se tomu říká „texaský ostrostřelec“: nejdřív se střílí do stěny a teprve potom se kolem nejhustšího shluku namaluje terč.',
    },
    action: 'Otestovat na nových datech',
  },
  validation: {
    heading: 'Nové, nezávislé šipky',
    body1:
      'Oba kruhy jsou nyní zafixované — včetně toho červeného. Stroj hází zcela novou, nezávislou sadu šipek. Nic jiného se nemění.',
    body2:
      'Toto jediné omezení sebere červenému kruhu celou jeho výhodu. Stanoven předem je to prostě kruh určité velikosti na určitém místě, úplně stejně jako ten modrý.',
    throwFresh: 'Hodit novou nezávislou sadu',
    originalData: 'Původní šipky',
    freshData: 'Nové šipky',
    replications: {
      heading: 'Zopakovat celý test mnohokrát',
      body: 'Každá replikace je nezávislá sada šipek vyhodnocená oběma kruhy ponechanými na místě.',
      run: 'Spustit {{replications}} replikací',
      running: 'Počítám…',
      meanHits: 'Průměrný počet zásahů',
      significantShare: 'Replikace s p < 0,05',
      note: 'Oba kruhy se teď chovají stejně a oba překročí hranici 0,05 jen v malém podílu replikací. Tak vypadá správně fungující test na datech, ve kterých není co najít.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'Hypotézu zvolenou po pohledu na data nelze hodnotit testem, který předpokládá, že byla zvolena předem.',
    point2:
      'Síla důkazu závisí na tom, kolik možností jsme prozkoumali, nejen na tom, kolik jich nakonec vyšlo.',
    point3:
      'Stejný počet zásahů znamená něco jiného u kruhu určeného předem a u kruhu vybraného z dat.',
    point4:
      'Rozhodnou až nezávislá data. Jakmile se kruh nesmí pohnout, zdánlivý efekt zmizí — protože v šipkách nikdy nebyl.',
    legitimate: {
      heading: 'Chyba není v hledání',
      body: 'Hledat v datech vzory je běžné a často nutné. Červený kruh je zcela seriózní hypotéza: tvrdí, že „stroj zvýhodňuje toto místo“, a lze ji teď otestovat na nové sadě hodů. Chyba je až ve zkratce — v tom, že hypotézu vzešlou z dat prezentujeme, jako by už nějakým testem prošla.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Stejná struktura se vrací v každém dalším scénáři. Mění se jen to, čím posunujeme: místo kruhu přímka, místo oblasti podskupina, místo terče sledovaný výsledek, místo místa na desce dvojice proměnných.',
  },
}

export default dartboard
