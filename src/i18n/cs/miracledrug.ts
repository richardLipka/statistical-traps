const miracledrug = {
  intro: {
    heading: 'Jeden výsledek, registrovaný dřív, než je kdokoli zařazen',
    body1:
      'Simulovaná studie. Pacienti se rozdělí do dvou ramen, jedno dostane léčbu a druhé ne, a u každého pacienta se na konci měří celá baterie výsledků. Tato měření nejsou navzájem nezávislá: pacient, kterému se daří, mívá dobré skóre hned v několika z nich najednou — přesně jako měření na témže člověku.',
    body2:
      'Léčba nedělá nic. Obě ramena vznikají ze stejného rozdělení a žádný člen nikde nezávisí na tom, ve kterém rameni pacient je, takže skutečný účinek na každý výsledek v baterii je přesně nulový.',
    question:
      'Liší se u výsledku č. {{outcome}}, na který je tato studie registrována, léčené rameno od neléčeného víc, než dovoluje náhoda?',
    body3:
      'Tento výsledek registrujeme teď, ještě než je kdokoli zařazen, takže nic z výsledků nemohlo tuto volbu ovlivnit. Všechno, co bude následovat, pochází z ostatních výsledků — z těch, které jsme také shodou okolností měřili.',
    trueProcess:
      'Každý pacient dostane sdílené skóre a každý výsledek je toto sdílené skóre plus vlastní nezávislý šum. Obě ramena vznikají naprosto stejným postupem. Skutečný účinek léčby na každý výsledek: nulový.',
    fictionHeading: 'Nic zde není skutečné',
    fictionBody:
      'Studie, pacienti i měření vznikají ve vašem prohlížeči ze semínka. Nejde o žádnou skutečnou léčbu, diagnózu, studii ani pacienta a nepoužívá se ani nenaznačuje žádná reálná klinická statistika. Výsledky jsou záměrně číslované, a ne pojmenované: pojmenovaný výsledek svádí k příběhu a právě příběh dělá vybraný nález přesvědčivým.',
    action: 'Spustit studii',
  },
  experiment: {
    heading: 'Výsledky jsou na stole',
    body1:
      'Každý řádek je jeden výsledek: tečka je rozdíl mezi rameny a pruh kolem ní je rozmezí, od kterého studie tento rozdíl neumí odlišit. Svislá čára je nula — žádný rozdíl.',
    body2:
      'Registrovaný výsledek je vyznačen. Jeho interval pohodlně obsahuje nulu a jeho test nenachází nic, což je správně, protože není co najít.',
    action: 'Teď se podívejte na zbytek baterie',
  },
  controls: {
    heading: 'Nastavení experimentu',
    patientsPerArm: 'Pacientů na rameno',
    outcomeCount: 'Měřených výsledků',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejnou studii, takže každý výsledek se dá přesně zopakovat. Měřit víc výsledků nezpůsobí, že by léčba začala fungovat — způsobí, že je pravděpodobnější nápadný výsledek.',
  },
  plot: {
    notStarted: 'Studie ještě neproběhla.',
    aria: 'Rozdíl mezi rameny u každého z {{count}} výsledků, s intervaly spolehlivosti.',
    outcomeAria: 'Výsledek č. {{outcome}}, rozdíl {{difference}}. Vyberte pro prohlédnutí.',
    legendOutcome: 'Jeden výsledek',
    legendInterval: 'Tečka: rozdíl · pruh: 95% interval',
  },
  outcomes: {
    primary: 'Výsledek č. {{outcome}}, registrovaný předem',
    primaryShort: 'Registrován předem',
    chosen: 'Výsledek č. {{outcome}}, vybraný z baterie',
    chosenShort: 'Vybrán dodatečně',
  },
  stats: {
    outcomes: 'Výsledky',
    patients: 'Pacienti',
    patientsHint: '{{perArm}} v každém rameni',
    significantCount: 'Pod 0,05',
    significantHint: 'z {{outcomes}} výsledků, každý testován zvlášť',
    difference: 'Rozdíl',
    differenceHint: 'Léčené rameno minus neléčené.',
    t: 't',
    pValue: 'p-hodnota, jak se běžně uvádí',
  },
  observation: {
    heading: 'Najděte výsledek, který vyšel',
    body1:
      'Máte před sebou celou baterii. Kliknutím na kterýkoli řádek si výsledek prohlédnete: rozdíl mezi rameny a p-hodnotu, se kterou by se tento rozdíl běžně uvedl.',
    clickHint:
      'Každý výsledek se testuje přesně tak jako ten registrovaný — stejný dvouvýběrový test, stejní pacienti, stejná studie. Mění se jedině to, o kterém výsledku jsme se rozhodli mluvit.',
    body2:
      '{{count}} z {{outcomes}} výsledků vyšlo samo o sobě pod 0,05. Ve studii něčeho, co nedělá nic, to není překvapení čekající na vysvětlení; je to aritmetika měření mnoha věcí najednou.',
    autoBest: 'Ukaž výsledek, který vyšel',
    reset: 'Zrušit výběr',
    autoBestNote:
      'To je nejpůsobivější z {{outcomes}} výsledků, nalezený tak, že jsme otestovali každý z nich a ponechali nejmenší p-hodnotu. Kdyby se uvedl sám za sebe, nic by na něm nevypadalo jako hledání.',
    selectFirst: 'Vyberte výsledek, se kterým budeme pokračovat.',
    action: 'Sepsat to pořádně',
  },
  analysis: {
    heading: 'Stejný test, dva způsoby volby výsledku',
    body1:
      'Oba řádky níže byly testovány totožně: stejný dvouvýběrový test na stejných pacientech z téže studie. Rozdíl je jen v tom, zda byl výsledek pojmenován před studií, nebo vybrán z jejích výsledků až potom.',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint: 'Dvouvýběrový t-test léčených proti neléčeným, jen na tomto výsledku.',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    runFirst:
      'Obě opravy níže jsou smyslem tohoto kroku: bez nich je číslo v řádku výše tím, co by se uvedlo.',
    textbook: {
      heading: 'Oprava 1: ta učebnicová',
      body: 'Standardní odpověď na testování {{outcomes}} věcí najednou: nechat každou z nich překonat vyšší laťku, aby šance na jakýkoli falešný nález v celé baterii zůstala 5 %.',
      bonferroni: 'Bonferroni',
      bonferroniHint: 'P-hodnota vynásobená {{outcomes}}.',
      holm: 'Holm',
      holmHint: 'Sestupná varianta: nikdy přísnější než Bonferroni, často mírnější.',
      note: 'Násobit počtem testů je správný instinkt a hrubý nástroj. Předpokládá, že výsledky byly nezávislé šance, a výsledky měřené na týchž pacientech nikdy nejsou.',
    },
    selection: {
      heading: 'Oprava 2: simulovat to, co se doopravdy udělalo',
      body: 'Místo abychom počet šancí hledání odhadovali, simulujeme je: necháme proběhnout další studii léčby, která nedělá nic, otestujeme všech {{outcomes}} výsledků a ponecháme nejmenší p-hodnotu. A to {{replications}}krát.',
      run: 'Simulovat hledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejmenší p-hodnota v baterii, studie za studií, bez jakéhokoli účinku',
      histogramX: 'Nejmenší p-hodnota ve studii',
      histogramY: 'Počet simulovaných studií',
      marker: 'Váš výsledek',
      adjusted: 'p-hodnota opravená o hledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často studie léčby, která nedělá nic, vytvoří nejlepší výsledek aspoň tak působivý jako {{pValue}}.',
      shareSignificant:
        'V {{share}} simulovaných studií vyšel aspoň jeden výsledek pod 0,05 a v průměru jich takto vyšlo {{average}} z {{outcomes}} — a to ve studiích, kde léčba nedělá vůbec nic.',
      versusBonferroni:
        'Všimněte si, že simulovaná oprava ({{simulated}}) je mírnější než Bonferroni ({{bonferroni}}). Bonferroni účtuje za {{outcomes}} nezávislých šancí; tyto výsledky spolu korelují zhruba na {{correlation}}, takže hledání mělo méně skutečně oddělených šancí. Simulace skutečného postupu ho ocení správně, místo aby hádala.',
      conclusion:
        'Tentýž výsledek přečtený dvěma způsoby: {{naive}} pro výsledek registrovaný předem, {{adjusted}} pro výsledek nalezený hledáním. Pacienti jsou přitom titíž pacienti.',
      gallery: {
        heading: 'Pět nejpůsobivějších výsledků, které tyto simulace vytvořily',
        body: 'Každá studie níže je studií léčby, která nedělá vůbec nic. V každé z nich je vyznačený řádek tím výsledkem, který náhodou vyšel nejlíp, a každý by se sám o sobě dal bez problémů publikovat.',
        caption: 'Simulovaná studie {{index}}',
        item: 'Výsledek č. {{outcome}} · rozdíl {{difference}}',
        itemStats: 'p {{p}}',
        plotAria:
          'Simulovaná studie {{index}}: léčba, která nedělá nic, s výsledkem č. {{outcome}} vyznačeným jako nejlepší výsledek té studie.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'Test na hladině 5 % se mýlí zhruba jednou z dvaceti, a to záměrně — právě to těch 5 % znamená. Spusťte jich dvacet na léčbu, která nedělá nic, a mýlit se asi jednou není smůla, ale očekávaný výsledek. Baterie k tomu ani nemusí být velká: už pět nebo šest výsledků učiní nápadný nález za pár studií pravděpodobnějším než ne.',
      body2:
        'Těžko rozpoznatelné je to proto, že zpráva baterii neukazuje. Jediný výsledek se svou p-hodnotou a intervalem spolehlivosti vypadá úplně stejně, ať už byl jedinou měřenou věcí, nebo nejlepším z dvaceti. Nic v tom čísle nezaznamenává, co z toho platilo, a žádný výpočet to zpětně nezjistí.',
      body3:
        'Je to tatáž chyba jako kreslení terče kolem šipek, volba nejlépe sedícího modelu, vyznačení nejnápadnějšího období a vybrání nejhoršího lékaře z tabulky. Tady hledání probíhá přes výsledky a zpráva přichází s p-hodnotou, intervalem i mechanismem — a právě proto se publikuje zrovna tahle verze.',
    },
    action: 'Spustit studii znovu',
  },
  validation: {
    heading: 'Nová studie, noví pacienti',
    body1:
      'Oba výsledky jsou teď určeny ještě před studií, kterou spouštíme — jeden původní registrací, druhý výsledky té první studie. Zařadí se noví pacienti a oba výsledky se změří znovu.',
    body2:
      'Registrovaný výsledek se chová jako předtím. A stejně tak ten, který „vyšel“, a právě o to jde: na pacientech, kteří se na jeho výběru nijak nepodíleli, je to obyčejný řádek v obyčejné baterii.',
    firstTrial: 'První studie',
    nextDifference: 'Nová studie: rozdíl',
    nextPValue: 'Nová studie: p-hodnota',
    tableHint: 'Tytéž dva výsledky, změřené na pacientech, kteří se na volbě ani jednoho z nich nepodíleli.',
    freshTrial: 'Nová studie',
    drawFresh: 'Spustit další nezávislou studii',
    replications: {
      heading: 'Zopakovat studii mnohokrát',
      body: 'Každá replikace je další nezávislá studie stejného uspořádání, změřená na týchž dvou zmrazených výsledcích.',
      run: 'Spustit {{replications}} studií',
      meanDifference: 'Průměrný rozdíl',
      shareSignificant: 'Významný ve studii',
      sameDirection: 'Znovu stejný směr',
      tableHint:
        'Oba výsledky byly určeny dřív, než tyto studie vznikly, takže oba by měly být významné asi v 5 % případů — a oba jsou. Průměrný rozdíl kolem nuly je to, jak vypadá léčba bez účinku.',
      note: 'Když v každé nové studii spustíme hledání znovu, padne v {{share}} případů na jiný výsledek. Každá studie této léčby vyprodukuje nějaký nejlepší výsledek — a skoro nikdy to není tentýž. Přesně tak vypadá nález, který patří datům, a ne světu.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'P-hodnota popisuje jeden předem určený test. Změřte dvacet výsledků a uveďte ten nejlepší, a popisuje místo toho poslední krok hledání.',
    point2:
      'Baterie je součástí výsledku — a zpráva je místem, kde mizí. Vybraný výsledek vypadá na papíře úplně stejně jako registrovaný.',
    point3:
      'Oprava na hledání není volitelný výpočet a násobení počtem testů je jen její hrubá podoba. Simulace toho, co se doopravdy udělalo, ho ocení správně.',
    point4:
      'Rozhodne replikační studie. Léčba, která funguje, funguje dál i na nových pacientech; vybraný výsledek ne a pokaždé se přesune jinam.',
    legitimate: {
      heading: 'Měřit mnoho výsledků není ta chyba',
      body: 'Studie měří spoustu věcí z dobrých důvodů: bezpečnost, nežádoucí účinky, kvalitu života a skutečné hledání, které vygeneruje další hypotézu. Právě proto existuje registrace — primární výsledek a analýza se určí před daty a všechno ostatní se uvádí jako to, čím je, tedy explorativní. Chybou je povýšit explorativní výsledek dodatečně na titulek a o zbývajících devatenácti se nezmínit.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Hledání zatím probíhala přes polohy, modely, období, lidi a výsledky, vždy ručně a vždy v jedné baterii. Další scénář předá hledání algoritmu, který zvládne tisíce dvojic proměnných za sekundu — což mění měřítko problému, a nic jiného na něm.',
  },
}

export default miracledrug
