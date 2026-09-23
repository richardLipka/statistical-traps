const miracledrug = {
  intro: {
    heading: 'Jeden ukazatel, registrovaný dřív, než je kdokoli zařazen',
    body1:
      'Simulovaná studie. Pacienti se rozdělí do dvou skupin — jedna dostane léčbu, druhá ne — a u každého pacienta se na konci měří celá sada ukazatelů — všechno, co by léčba mohla zlepšit. Tato měření nejsou navzájem nezávislá: pacientovi, kterému se daří, vyjde dobře hned několik ukazatelů najednou, přesně jako u měření na témže člověku.',
    body2:
      'Léčba nedělá nic. Obě skupiny vznikají naprosto stejným postupem a při vytváření dat nikde nevstupuje do hry, ve které skupině pacient je. Skutečný účinek léčby na každý z nich je přesně nulový.',
    goalHeading: 'Co má tento pokus ukázat',
    goalBody:
      'Že test na hladině 5 % se má mýlit asi jednou z dvaceti — takže když u léčby, která nedělá nic, změříte {{outcomes}} ukazatelů a uvedete ten nejlepší, dostanete „nález“ prostě proto, že jste měřili {{outcomes}} věcí. A že ze zprávy o takovém nálezu to nepoznáte.',
    goalStep1:
      'Necháme studii proběhnout a otestujeme ukazatel, který jsme registrovali předem. Nic nenajde.',
    goalStep2:
      'Pak se podíváme na všechny ostatní a vybereme ten, který vyšel nejlíp. Ten už jako nález vypadá.',
    goalStep3:
      'Nakonec nález dvakrát opravíme a zopakujeme celou studii na nových pacientech. Nezbude z něj nic.',
    question:
      'Liší se u ukazatele č. {{outcome}}, na který je tato studie registrována, léčená skupina od neléčené víc, než dovoluje náhoda?',
    body3:
      'Tento ukazatel registrujeme teď, ještě než je kdokoli zařazen, takže nic z naměřených čísel nemohlo tuto volbu ovlivnit. Všechno, co bude následovat, pochází z ostatních ukazatelů — z těch, které jsme také shodou okolností měřili.',
    trueProcess:
      'Každý pacient dostane jedno sdílené skóre a každý ukazatel je toto skóre plus vlastní nezávislý šum. Obě skupiny vznikají naprosto stejným postupem. Skutečný účinek léčby na každý ukazatel: nulový.',
    fictionHeading: 'Nic zde není skutečné',
    fictionBody:
      'Studie, pacienti i měření vznikají ve vašem prohlížeči ze semínka. Nejde o žádnou skutečnou léčbu, diagnózu, studii ani pacienta a nepoužívá se ani nenaznačuje žádná reálná klinická statistika. Ukazatele jsou záměrně číslované, a ne pojmenované: pojmenovaný ukazatel svádí k příběhu a právě příběh dělá vybraný nález přesvědčivým.',
    action: 'Spustit studii',
  },
  experiment: {
    heading: 'Naměřeno',
    body1:
      'Každý řádek je jeden ukazatel. Tečka je rozdíl mezi léčenou a neléčenou skupinou; pruh kolem ní ukazuje, jak nepřesně je ten rozdíl změřený — se šedesáti pacienty na skupinu je nepřesnost velká. Svislá čára je nula, tedy žádný rozdíl.',
    body2:
      'Registrovaný ukazatel je vyznačen. Jeho pruh pohodlně přesahuje přes nulu a jeho test nenachází nic, což je správně, protože není co najít.',
    numbersTitle: 'Co znamenají tahle čísla?',
    numbersBody1:
      'P-hodnota odpovídá na jedinou otázku: kdyby léčba nedělala nic, jak často by u tohoto ukazatele i tak vyšel aspoň takhle velký rozdíl? Hodnota 0,765 znamená „takový rozdíl vznikne ve třech čtvrtinách studií jen náhodou“. Hodnota 0,004 znamená „takový rozdíl vznikne náhodou asi ve čtyřech studiích z tisíce“ — a právě tím se čísla začnou označovat za nález. Hranice 0,05 je jen dohoda, ne důkaz.',
    numbersBody2:
      'Písmeno t je jen ten samý rozdíl přepočtený na to, kolikrát je větší než vlastní nepřesnost měření: t kolem nuly znamená rozdíl utopený v šumu, t kolem tří rozdíl, který ze šumu vyčnívá. P-hodnota z něj vychází, takže obě čísla říkají totéž dvěma způsoby.',
    action: 'Teď se podívejte na ty ostatní',
  },
  controls: {
    heading: 'Nastavení experimentu',
    patientsPerArm: 'Pacientů na skupinu',
    outcomeCount: 'Měřených ukazatelů',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejnou studii, takže se tu dá všechno přesně zopakovat. Měřit víc ukazatelů nezpůsobí, že by léčba začala fungovat — způsobí jen to, že je pravděpodobnější nějaký nápadný nález.',
  },
  plot: {
    notStarted: 'Studie ještě neproběhla.',
    aria: 'Rozdíl mezi skupinami u každého z {{count}} ukazatelů, s intervaly spolehlivosti.',
    outcomeAria: 'Ukazatel č. {{outcome}}, rozdíl {{difference}}. Vyberte pro prohlédnutí.',
    legendOutcome: 'Jeden ukazatel',
    legendInterval: 'Tečka: rozdíl · pruh: nepřesnost měření',
  },
  outcomes: {
    primary: 'Ukazatel č. {{outcome}}, registrovaný předem',
    primaryShort: 'Registrován předem',
    chosen: 'Ukazatel č. {{outcome}}, vybraný dodatečně',
    chosenShort: 'Vybrán dodatečně',
  },
  stats: {
    outcomes: 'Ukazatele',
    patients: 'Pacienti',
    patientsHint: '{{perArm}} v každé skupině',
    significantCount: 'Pod 0,05',
    significantHint: 'z {{outcomes}} ukazatelů, každý testován zvlášť',
    difference: 'Rozdíl',
    differenceHint: 'Léčená skupina minus neléčená.',
    t: 't',
    pValue: 'p-hodnota, jak se běžně uvádí',
  },
  observation: {
    heading: 'Najděte ukazatel, který vyšel',
    body1:
      'Máte před sebou všech dvacet ukazatelů. Kliknutím na kterýkoli řádek si ho prohlédnete: rozdíl mezi skupinami a p-hodnotu, se kterou by se tento rozdíl běžně uvedl.',
    clickHint:
      'Každý ukazatel se testuje přesně tak jako ten registrovaný — stejný test, stejní pacienti, stejná studie. Mění se jedině to, o kterém z nich jsme se rozhodli mluvit.',
    body2:
      '{{count}} z {{outcomes}} ukazatelů vyšlo samo o sobě pod 0,05. Ve studii něčeho, co nedělá vůbec nic, to není překvapení čekající na vysvětlení: při dvaceti testech na hladině 5 % se v průměru jeden mýlí pokaždé. Tady jich vyšlo víc — a kolik studií takhle dopadne, si za chvíli spočítáme.',
    autoBest: 'Ukaž ten, který vyšel',
    reset: 'Zrušit výběr',
    autoBestNote:
      'To je nejpůsobivější z {{outcomes}} ukazatelů, nalezený tak, že jsme otestovali každý z nich a ponechali nejmenší p-hodnotu. Kdyby se uvedl sám za sebe, nic by na něm nevypadalo jako hledání.',
    selectFirst: 'Vyberte ukazatel, se kterým budeme pokračovat.',
    action: 'Sepsat to pořádně',
  },
  analysis: {
    heading: 'Stejný test, dva způsoby volby ukazatele',
    body1:
      'Oba řádky níže byly testovány totožně: stejný test na stejných pacientech z téže studie. Rozdíl je jen v tom, zda byl ukazatel pojmenován před studií, nebo vybrán z naměřených čísel až potom.',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint: 'Test porovnává léčenou a neléčenou skupinu, jen na tomto jednom ukazateli.',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    runFirst:
      'Obě opravy níže jsou smyslem tohoto kroku: bez nich je číslo v řádku výše tím, co by se uvedlo.',
    textbook: {
      heading: 'Oprava 1: ta učebnicová',
      body: 'Standardní odpověď na testování {{outcomes}} věcí najednou: nechat každou z nich překonat vyšší laťku, aby šance na jakýkoli falešný nález v celé sadě zůstala 5 %.',
      bonferroni: 'Bonferroni',
      bonferroniHint: 'P-hodnota vynásobená {{outcomes}}.',
      holm: 'Holm',
      holmHint: 'Sestupná varianta: nikdy přísnější než Bonferroni, často mírnější.',
      note: 'Násobit počtem testů je správný instinkt a hrubý nástroj. Předpokládá, že těch dvacet ukazatelů bylo dvacet nezávislých šancí — a ukazatele měřené na týchž pacientech nezávislé nikdy nejsou.',
    },
    selection: {
      heading: 'Oprava 2: simulovat to, co se doopravdy udělalo',
      body: 'Místo abychom počet šancí hledání odhadovali, simulujeme je: necháme proběhnout další studii léčby, která nedělá nic, otestujeme všech {{outcomes}} ukazatelů a ponecháme nejmenší p-hodnotu. A to {{replications}}krát.',
      run: 'Simulovat hledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejmenší p-hodnota ze všech ukazatelů, studie za studií, bez jakéhokoli účinku',
      histogramX: 'Nejmenší p-hodnota ve studii',
      histogramY: 'Počet simulovaných studií',
      marker: 'Váš ukazatel',
      adjusted: 'p-hodnota opravená o hledání',
      adjustedHint:
        'Simulovaná p-hodnota: jak často studie léčby, která nedělá nic, vytvoří nejlepší ukazatel aspoň tak působivý jako {{pValue}}.',
      shareSignificant:
        'V {{share}} simulovaných studií vyšel aspoň jeden ukazatel pod 0,05 a v průměru jich takto vyšlo {{average}} z {{outcomes}} — a to ve studiích, kde léčba nedělá vůbec nic.',
      versusBonferroni:
        'Všimněte si, že simulovaná oprava (p {{simulated}}) je mírnější než Bonferroni (p {{bonferroni}}). Bonferroni účtuje za {{outcomes}} nezávislých šancí; tyto ukazatele spolu ale souvisejí zhruba na {{correlation}}, takže hledání mělo méně skutečně oddělených šancí, než si Bonferroni myslí. Simulace skutečného postupu ho ocení správně, místo aby hádala.',
      conclusion:
        'Tentýž výsledek přečtený dvěma způsoby: p {{naive}} pro ukazatel registrovaný předem, p {{adjusted}} pro ukazatel nalezený hledáním. Pacienti jsou přitom titíž pacienti.',
      gallery: {
        heading: 'Pět nejpůsobivějších nálezů, které tyto simulace vytvořily',
        body: 'Každá studie níže je studií léčby, která nedělá vůbec nic. V každé z nich je vyznačený řádek tím ukazatelem, který náhodou vyšel nejlíp, a každý by se sám o sobě dal bez problémů publikovat.',
        caption: 'Simulovaná studie {{index}}',
        item: 'Ukazatel č. {{outcome}} · rozdíl {{difference}}',
        itemStats: 'p {{p}}',
        plotAria:
          'Simulovaná studie {{index}}: léčba, která nedělá nic, s ukazatelem č. {{outcome}} vyznačeným jako nejlepší nález té studie.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'Test na hladině 5 % se mýlí zhruba jednou z dvaceti, a to záměrně — právě to těch 5 % znamená. Spusťte jich dvacet na léčbu, která nedělá nic, a mýlit se asi jednou není smůla, ale očekávaný výsledek. Sada ani nemusí být velká: už pět nebo šest ukazatelů učiní nápadný nález za pár studií pravděpodobnějším než ne.',
      body2:
        'Těžko rozpoznatelné je to proto, že zpráva ty ostatní neukazuje. Jediný ukazatel se svou p-hodnotou a svým pruhem nepřesnosti vypadá úplně stejně, ať už byl jedinou měřenou věcí, nebo nejlepším z dvaceti. Nic v tom čísle nezaznamenává, co z toho platilo, a žádný výpočet to zpětně nezjistí.',
      body3:
        'Je to tatáž chyba jako kreslení terče kolem šipek, volba nejlépe sedícího modelu, vyznačení nejnápadnějšího období a vybrání nejhoršího lékaře z tabulky. Tady hledání probíhá přes ukazatele a zpráva přichází s p-hodnotou, intervalem i vysvětlením, proč to dává smysl — a právě proto se publikuje zrovna tahle verze.',
    },
    action: 'Spustit studii znovu',
  },
  validation: {
    heading: 'Nová studie, noví pacienti',
    body1:
      'Oba ukazatele jsou teď určeny ještě před studií, kterou spouštíme — jeden původní registrací, druhý výsledky té první studie. Zařadí se noví pacienti a oba se změří znovu.',
    body2:
      'Registrovaný ukazatel se chová jako předtím. A stejně tak ten, který „vyšel“, a právě o to jde: na pacientech, kteří se na jeho výběru nijak nepodíleli, je to obyčejný řádek mezi dvaceti dalšími.',
    firstTrial: 'První studie',
    nextDifference: 'Nová studie: rozdíl',
    nextPValue: 'Nová studie: p-hodnota',
    tableHint: 'Tytéž dva ukazatele, změřené na pacientech, kteří se na volbě ani jednoho z nich nepodíleli.',
    freshTrial: 'Nová studie',
    drawFresh: 'Spustit další nezávislou studii',
    replications: {
      heading: 'Zopakovat studii mnohokrát',
      body: 'Každá replikace je další nezávislá studie stejného uspořádání, změřená na týchž dvou předem určených ukazatelích.',
      run: 'Spustit {{replications}} studií',
      meanDifference: 'Průměrný rozdíl',
      shareSignificant: 'Významný ve studii',
      sameDirection: 'Znovu stejný směr',
      tableHint:
        'Oba ukazatele byly určeny dřív, než tyto studie vznikly, takže oba by měly být významné asi v 5 % případů — a oba jsou. Průměrný rozdíl kolem nuly je to, jak vypadá léčba bez účinku.',
      note: 'Když v každé nové studii spustíme hledání znovu, padne v {{share}} případů na jiný ukazatel. Každá studie této léčby vyprodukuje nějaký nejlepší ukazatel — a skoro nikdy to není tentýž. Přesně tak vypadá nález, který patří datům, a ne světu.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'P-hodnota popisuje jeden předem určený test. Změřte dvacet ukazatelů a uveďte ten nejlepší, a popisuje místo toho poslední krok hledání.',
    point2:
      'Počet měřených ukazatelů je součástí výsledku — a zpráva je místem, kde mizí. Vybraný ukazatel vypadá na papíře úplně stejně jako registrovaný.',
    point3:
      'Oprava na hledání není volitelný výpočet a násobení počtem testů je jen její hrubá podoba. Simulace toho, co se doopravdy udělalo, ho ocení správně.',
    point4:
      'Rozhodne opakovaná studie. Léčba, která funguje, funguje dál i na nových pacientech; vybraný ukazatel ne a pokaždé se přesune jinam.',
    legitimate: {
      heading: 'Měřit mnoho ukazatelů není ta chyba',
      body: 'Studie měří spoustu věcí z dobrých důvodů: bezpečnost, nežádoucí účinky, kvalitu života a skutečné hledání, které vygeneruje další hypotézu. Právě proto existuje registrace — hlavní ukazatel a způsob vyhodnocení se určí před daty a všechno ostatní se uvádí jako to, čím je, tedy jako hledání. Chybou je povýšit dodatečně nalezený ukazatel na titulek a o zbývajících devatenácti se nezmínit.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Hledání zatím probíhala přes polohy, modely, období, lidi a ukazatele, vždy ručně a vždy v jedné sadě. Další scénář předá hledání algoritmu, který zvládne tisíce dvojic proměnných za sekundu — což mění měřítko problému, a nic jiného na něm.',
  },
}

export default miracledrug
