const mysteriouscorrelation = {
  intro: {
    heading: 'Jeden vztah, pojmenovaný dřív, než data dorazí',
    body1:
      'Tabulka měření: jeden řádek na případ, jeden sloupec na proměnnou. Každý sloupec vzniká nezávisle na všech ostatních — žádná společná příčina, žádný řetězec vlivů, žádná skrytá třetí proměnná. Když si vezmete kteroukoli dvojici sloupců, nedozvíte se z jednoho o druhém vůbec nic.',
    body2:
      'Ještě před sběrem dat pojmenujeme jednu dvojici, na kterou se podíváme, protože někdo měl důvod tam vztah čekat. To je jeden test a ten odpoví poctivě.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že prohledat tabulku „na všechno“ je dnes otázka pár milisekund. A že počet dvojic roste tak rychle, že i v datech, kde spolu nic nesouvisí, jich vždycky několik desítek projde jako „významné“. A hlavně: že to jde poznat, když se místo na nejlepší nález podíváte na rozdělení všech výsledků.',
    goalStep1:
      'Otestujeme jednu dvojici, kterou jsme si pojmenovali předem. Nic nenajde.',
    goalStep2:
      'Pak necháme nástroj otestovat všechny dvojice, které v tabulce jsou, a vybereme tu nejsilnější. Ta už jako nález vypadá.',
    goalStep3:
      'Nakonec se podíváme na všechny p-hodnoty najednou a nález otestujeme na nových řádcích. Nezbude z něj nic.',
    question:
      'Souvisí spolu proměnná {{a}} a proměnná {{b}} silněji, než dovoluje náhoda?',
    body3:
      'Potom uděláme to, co se s takovou tabulkou doopravdy dělá: předáme ji nástroji, který otestuje všechny existující dvojice, a podíváme se, co se vrátí.',
    trueProcess:
      'Každá hodnota v tabulce je nezávislé losování z téhož rozdělení. Žádná proměnná neovlivňuje žádnou jinou a žádné dvě nemají společnou příčinu. Skutečná korelace mezi každou dvojicí: nulová.',
    fictionHeading: 'Nic zde není skutečné',
    fictionBody:
      'Tabulka vzniká ve vašem prohlížeči ze semínka. Není to skutečný datový soubor a proměnné nejsou skutečná měření. Jsou číslované, a ne pojmenované, a to je poctivá verze tohoto scénáře: v praxi obě proměnné přicházejí se jmény a vysvětlení se bere ze jmen.',
    action: 'Sebrat data',
  },
  experiment: {
    heading: 'Tabulka a dvojice, na kterou jsme se ptali',
    body1:
      'Trojúhelník nahoře je mapa všech dvojic naráz: každé políčko je jedna dvojice proměnných a jeho sytost říká, jak silně spolu ta dvojice souvisí. Červená znamená, že spolu rostou, modrá že jedna roste, když druhá klesá. Je to pole šumu, jak má být.',
    body2:
      'Předem určená dvojice je v mapě orámovaná a pod mapou vykreslená jako graf; každý bod je jeden případ. Body neleží kolem žádné čáry, korelace je blízko nule a test nic nenachází. Tak to má být.',
    body2Hit:
      'Předem určená dvojice je v mapě orámovaná a pod mapou vykreslená jako graf; každý bod je jeden případ. Tentokrát jí vyšlo p pod 0,05. Je to planý poplach: i dvojici určené předem to takhle vyjde asi jednou z dvaceti. Mezi těmi dvěma sloupci žádný vztah není. Přelosujte semínko a zhasne.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'Korelace r říká, jak těsně body leží kolem jedné přímky. Nula znamená beztvarý mrak, plus jedna dokonalý vzestup, minus jedna dokonalý pokles. Hodnota 0,02 je mrak; hodnota −0,57 už je viditelně protáhlý shluk, ze kterého oko samo dokreslí čáru.',
    numbersBody2:
      'P-hodnota odpovídá na otázku: kdyby ty dvě proměnné spolu nesouvisely vůbec, jak často by jejich korelace i tak vyšla aspoň takhle silná? Při {{rows}} řádcích stačí k hodnotě 0,05 korelace kolem {{threshold}}; přesně to ukazuje dlaždice „Laťka významnosti“. Je tak nízko, že ji při takovém množství dvojic spousta z nich přeskočí.',
    action: 'Teď pusťte nástroj na data',
  },
  controls: {
    heading: 'Nastavení experimentu',
    variableCount: 'Proměnných v tabulce',
    variablesValue: '{{variables}} → {{pairs}} dvojic',
    observationCount: 'Řádků dat',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejnou tabulku. Přidání proměnných nepřidává informaci — přidává dvojice, a těch přibývá zhruba s druhou mocninou počtu proměnných.',
  },
  plot: {
    notCollected: 'Data ještě nebyla sebrána.',
    matrixAria:
      'Mapa korelací mezi každou dvojicí z {{variables}} proměnných: {{pairs}} odstíněných políček.',
    pairAria: 'Proměnná {{a}} vynesená proti proměnné {{b}}, s proloženou přímkou.',
    legendRow: 'Jeden případ',
    legendMatrix: 'Mapa: všechny dvojice · graf: vybraná dvojice',
  },
  pairs: {
    label: 'Proměnné {{a}} a {{b}}',
    preRegistered: 'Proměnné {{a}} a {{b}}, určené předem',
    preRegisteredShort: 'Určeno předem',
    discovered: 'Proměnné {{a}} a {{b}}, nalezené prohledáním',
    discoveredShort: 'Nalezeno prohledáním',
  },
  stats: {
    variables: 'Proměnné',
    rows: 'po {{rows}} řádcích',
    pairs: 'Testovaných dvojic',
    pairsHint: 'každá kombinace dvou',
    threshold: 'Laťka významnosti',
    thresholdHint: 'od této korelace výš už test hlásí nález',
    correlation: 'Korelace r',
    t: 't',
    pValue: 'p-hodnota, jak se běžně uvádí',
  },
  observation: {
    heading: 'Co nástroj našel',
    body1:
      'Prohledání otestuje všech {{pairs}} dvojic v tabulce, každou kombinaci dvou proměnných, a seřadí je podle toho, jak silně vztah vypadá. Na tomto hardwaru to trvá pár milisekund, a to je praktický důvod, proč je tohle výchozí způsob, jak se na data dívat.',
    runSweep: 'Spustit prohledání',
    body2:
      'Našlo {{count}} dvojic pod 0,05 z celkových {{pairs}}. Tady jsou ty nejsilnější, tak jak je automatická analýza předává.',
    discoveries: 'Nejsilnější nalezené vztahy',
    discoveriesHint:
      'Vyberte si jeden a podívejte se na něj pořádně. Každý je skutečnou korelací v této tabulce, testovanou přesně tak jako dvojice určená předem.',
    namingNote:
      'Představte si, že by tyto dva sloupce měly jména. Vztah by přišel i s mechanismem a ten mechanismus by zněl rozumně. Tuhle část scénář záměrně vynechává.',
    selectFirst: 'Vyberte vztah, se kterým budeme pokračovat.',
    action: 'Sepsat to pořádně',
  },
  analysis: {
    heading: 'Stejný test, dva způsoby volby dvojice',
    body1:
      'Oba řádky níže byly testovány totožně: stejný korelační test na stejných řádcích téže tabulky. Rozdíl je jen v tom, zda byla dvojice pojmenována před daty, nebo z nich vybrána až potom.',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint: 'Přesný test, že korelace je nulová, jen pro tuto dvojici.',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    runFirst:
      'Obě opravy níže jsou smyslem tohoto kroku: bez nich je číslo v řádku výše tím, co by se uvedlo.',
    sweep: {
      heading: 'Oprava 1: dívat se na celé prohledání, ne na vítěze',
      body: 'Nejužitečnější, co se dá s {{pairs}} testy udělat, je přestat se dívat na ten nejlepší a podívat se na všechny najednou.',
      significant: 'Pod 0,05',
      expected: 'Očekáváno náhodou',
      expectedHint: '5 % z {{pairs}}',
      discoveries: 'Přežije při 5% FDR',
      discoveriesHint: 'Benjamini-Hochberg, oprava, kterou používá dolování dat',
      histogramTitle: 'P-hodnoty všech dvojic v tabulce',
      histogramX: 'p-hodnota',
      histogramY: 'Počet dvojic',
      flat: 'Tenhle histogram ukazuje celý scénář najednou. Když spolu nic nesouvisí, jsou p-hodnoty rozprostřené rovnoměrně mezi 0 a 1 — takže sloupec vlevo není shluk nálezů, je to levý konec plochého rozdělení. Tabulka, ve které něco skutečného je, vypadá jinak: má vlevo špičku, kterou zbytek rozsahu nevysvětlí.',
      corrections:
        'Formální opravy říkají totéž. Bonferroni dává nejsilnější dvojici p {{bonferroni}} a míru falešných objevů by bylo nutné nastavit až na {{fdr}}, než by se v této tabulce cokoli počítalo za objev.',
    },
    selection: {
      heading: 'Oprava 2: simulovat prohledání',
      body: 'Tatáž odpověď z druhé strany: vytvoříme další tabulku, kde spolu nic nesouvisí, prohledáme všech {{pairs}} dvojic a ponecháme nejsilnější. A to {{replications}}krát.',
      run: 'Simulovat prohledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejsilnější korelace nalezená stejným prohledáním, tabulka za tabulkou',
      histogramX: '|r| nejsilnější nalezené dvojice',
      histogramY: 'Počet simulovaných tabulek',
      marker: 'Vaše dvojice',
      adjusted: 'p-hodnota opravená o prohledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často tabulka, kde spolu nic nesouvisí, vytvoří nejsilnější dvojici aspoň tak silnou jako |r| = {{r}}.',
      meanSignificant:
        'V průměru označí prohledání za významných {{average}} z {{pairs}} dvojic v tabulce, kde je každá proměnná nezávislá na všech ostatních. To číslo není chyba prohledání. Hranice 0,05 nic jiného neslibuje.',
      conclusion:
        'Tentýž výsledek přečtený dvěma způsoby: p {{naive}} pro dvojici určenou předem, p {{adjusted}} pro dvojici nalezenou prohledáním. Řádky dat jsou přitom tytéž řádky.',
      gallery: {
        heading: 'Pět nejsilnějších vztahů, které tyto simulace vytvořily',
        body: 'Každá tabulka níže má nezávislé sloupce a nic jiného. V každé je vykreslena nejsilnější dvojice, jakou její prohledání našlo, a každá z nich by vypadala jako objev.',
        caption: 'Simulovaná tabulka {{index}}',
        itemStats: 'r {{r}} · p {{p}}',
        plotAria:
          'Simulovaná tabulka {{index}}: proměnné {{a}} a {{b}}, nejsilnější dvojice nalezená v tabulce, kde spolu nic nesouvisí.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'Korelační test na hladině 5 % se mýlí jednou z dvaceti, takže při {{pairs}} prohledaných dvojicích se splete asi {{expected}}krát. Scénář to nemusí nijak zařizovat: očekávaný a pozorovaný počet se shodují na pár dvojic. Takhle vypadá „nic tam není“, když otestujete všechno.',
      body2:
        'Přesvědčivý je ten výsledek stejně, a to ze dvou důvodů. Prvním je graf: {{rows}} bodů s proloženou přímkou vypadá jako vztah bez ohledu na to, co je vytvořilo, a oko netuší, kolik jiných grafů bylo zamítnuto, než se našel tenhle. Druhým jsou jména. Skutečné sloupce jména mají a pojmenovaná dvojice přichází s příběhem o tom, proč by jedno mohlo ovlivňovat druhé. Ten příběh se dodává až dodatečně a stejně ochotně by se dodal ke kterékoli z ostatních {{others}} dvojic.',
      body3:
        'Je to tatáž chyba jako ve všech předchozích scénářích a změnila se jen rychlost. Člověk posouvající terč vyzkouší pár desítek poloh; prohledání vyzkouší každou dvojici v tabulce dřív, než se stihne načíst stránka. Rozsah hledání je ta část výsledku, která se do zprávy nikdy nedostane.',
    },
    action: 'Otestovat na nových řádcích',
  },
  validation: {
    heading: 'Nové řádky, tytéž dvě dvojice',
    body1:
      'Obě dvojice jsou teď určeny ještě před sběrem dat — jedna původní otázkou, druhá prohledáním. Naměří se nové řádky a přímka proložená původními daty se přenese beze změny, takže teď musí předpovídat, a ne popisovat.',
    body2:
      'Právě na tohle se nález mlčky ptal: znalost jedné proměnné by měla něco říkat o druhé. Na řádcích, které se na nalezení dvojice nijak nepodílely, neříká nic. Proložená přímka je předpovídá hůř, než kdybychom ji ignorovali.',
    original: 'Původní řádky',
    freshCorrelation: 'Nové řádky: r',
    freshPValue: 'Nové řádky: p-hodnota',
    tableHint: 'Tytéž dvě dvojice, změřené na řádcích, které se na volbě ani jedné z nich nepodílely.',
    freshBatch: 'Nové řádky',
    drawFresh: 'Sebrat další nezávislou dávku',
    replications: {
      heading: 'Zopakovat na mnoha nezávislých dávkách',
      body: 'Každá replikace je nová dávka řádků pro tytéž proměnné, změřená na týchž dvou zmrazených dvojicích.',
      run: 'Spustit {{replications}} dávek',
      meanR: 'Průměrné r',
      shareSignificant: 'Významné v dávce',
      prediction: 'R² při předpovědi nových řádků',
      tableHint:
        'Obě dvojice byly určeny dřív, než tyto dávky vznikly, takže obě by měly být významné asi v 5 % případů — a obě jsou. Záporné R² znamená, že proložená přímka předpovídá nové řádky hůř, než kdybychom použili průměr.',
      note: 'Když prohledáme každou novou dávku, ohlásí v {{share}} případů jinou dvojici. Nalezená dvojice si ani nezachová směr své původní korelace víc než v {{direction}} případů — hod mincí. Každá dávka této tabulky vydá nějakou nejsilnější dvojici a nikdy to není tatáž.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'Otestovat všechno je levné a počet dvojic roste zhruba s druhou mocninou počtu proměnných. „Prověřili jsme všechna data“ popisuje velikost rodiny testů, ne důkladnost.',
    point2:
      'Nejlepší jednoduchá obrana je dívat se na celé rozdělení výsledků, a ne na jeho špičku. Bez efektu jsou p-hodnoty ploché; skutečný signál vytvoří vlevo špičku, kterou plochá část nevysvětlí.',
    point3:
      'Popsat data, která máte, a předpovědět data, která nemáte, jsou dvě různá tvrzení. Korelace nalezená hledáním zvládne první a na druhém selže.',
    point4:
      'Nalezený vztah je hypotéza s přiloženým grafem. Rozhodnou o něm nové řádky — a tady rozhodnou pokaždé proti němu.',
    legitimate: {
      heading: 'Prohledávat data není ta chyba',
      body: 'Prohledávání mnoha proměnných je způsob, jak vznikají hypotézy, a v oborech, kde jdou kandidáti do milionů, je to jediný praktický postup. Tyto obory přesně vědí, co to stojí. Uvádějí celé rozdělení výsledků a kontrolují míru falešných objevů, místo aby předstíraly, že každý test stál sám o sobě. S čímkoli nalezeným zacházejí jako s hypotézou, kterou je teprve třeba potvrdit na nových datech. Chybou je zkratka — uvést vítěze, jako by to byla jediná položená otázka.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'To jsou všechny mechanismy v této aplikaci: poloha, model, období, člověk, výsledek a teď celá tabulka proměnných prohledaná automaticky. Poslední scénář se ptá, co z toho plyne pro systémy, které tohle dělají v měřítku, jaké člověk nezvládne. Je to otázka po tom, co nalezený vzor je, ne po tom, jestli je stroj chytrý.',
  },
}

export default mysteriouscorrelation
