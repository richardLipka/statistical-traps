const interestingregion = {
  intro: {
    heading: 'Období určené předem',
    body1:
      'Stroj zaznamenává jednu hodnotu za období. V každém období se hodnota posune nahoru nebo dolů o nezávislou náhodnou veličinu — hod mincí, který má navíc velikost, losovaný pokaždé znovu a nezávisle na všem, co bylo předtím. Není tu žádný trend, žádný cyklus, žádný zlom ani zajímavé období, protože generátor jsme napsali my a nic takového jsme do něj nedali.',
    body2:
      'Stroj ale neukazuje jednotlivé kroky, nýbrž jejich průběžný součet, a v tom je celá potíž. Každá hodnota v sobě nese celou historii těch předchozích, takže záznam stoupá, zastavuje se a obrací. Vypadá to, že se s ním něco děje.',
    question: 'Změnila se hodnota za prostřední třetinu záznamu víc, než dovoluje náhoda?',
    body3:
      'Prostřední třetinu určujeme teď, ještě než se stroj zapne, takže nic z dat nemohlo tuto volbu ovlivnit. Jedině díky tomu je otázka zodpověditelná.',
    trueProcess:
      'Každé období: nezávislý krok z normálního rozdělení se střední hodnotou 0 a směrodatnou odchylkou {{sd}}. Graf ukazuje průběžný součet těchto kroků. Skutečný trend: žádný, a to nikde v záznamu.',
    action: 'Spustit stroj',
  },
  experiment: {
    heading: 'Záznam',
    body1:
      'Tady je jeden celý záznam. Úsek určený předem je vyznačen a test se ho ptá na to nasnadě ležící: je změna za tato období větší, než by nezávislé kroky věrohodně vytvořily?',
    body2:
      'Není. Změňte délku záznamu nebo semínko a sledujte, jak odpověď zůstává nezajímavá — ve stroji není nic, co by test mohl najít.',
    action: 'Teď hledejte zajímavé období',
  },
  controls: {
    heading: 'Nastavení experimentu',
    periodCount: 'Délka záznamu',
    seed: 'Semínko',
    newSeed: 'Nové semínko',
    hint: 'Stejné semínko vždy vytvoří stejný záznam, takže každý výsledek se dá přesně zopakovat.',
  },
  plot: {
    notStarted: 'Stroj ještě nebyl spuštěn.',
    aria: 'Záznam o {{count}} obdobích, vykreslený jako průběžný součet jednotlivých kroků.',
    legendRecord: 'Záznam',
    edgeAria: 'Váš {{edge}} období, právě na hodnotě {{period}}. Posouvejte jej šipkami doleva a doprava.',
    edgeStart: 'začátek',
    edgeEnd: 'konec',
  },
  windows: {
    preRegisteredRange: 'Období {{start}}–{{end}}, určeno předem ({{length}} kroků)',
    preRegisteredShort: 'Určeno předem',
    chosenRange: 'Období {{start}}–{{end}}, vybráno vámi ({{length}} kroků)',
    chosenShort: 'Vybráno dodatečně',
  },
  stats: {
    periods: 'Období',
    change: 'Změna za úsek',
    z: 'z',
    pValue: 'p-hodnota, jak se běžně uvádí',
  },
  observation: {
    heading: 'Najděte zajímavé období',
    body1:
      'Teď si vyberte vlastní úsek záznamu. Táhněte za kterýkoli okraj a sledujte, jak se čísla mění: změna z jednoho konce vašeho období na druhý a p-hodnota, se kterou by se tato změna běžně uváděla.',
    dragHint:
      'Nejkratší úsek, který můžete vyznačit, má pět kroků. Každá poloha i každá délka se hodnotí přesně stejným testem jako úsek určený předem.',
    body2:
      'Zkoušejte. Období, kdy hodnota vytrvale stoupala, nebo naopak prudce spadla — cokoli, o čem by stálo za to napsat větu. Stroj vám vyhoví, protože úseků je na výběr velmi mnoho.',
    autoBest: 'Najít nejnápadnější období',
    reset: 'Začít znovu',
    autoBestNote:
      'To je nejnápadnější úsek v tomto záznamu, vybraný ze všech {{candidates}} tak, že jsme vyzkoušeli každý z nich a ponechali nejlepší.',
    action: 'Porovnat s obdobím určeným předem',
  },
  analysis: {
    heading: 'Stejný test, dva způsoby volby období',
    body1:
      'Oba řádky byly testovány totožně, stejným vzorcem a se stejnou známou směrodatnou odchylkou. Ani jeden test není chybný. Rozdíl je jen v tom, zda byl úsek pojmenován dřív, než data vznikla, nebo z nich vybrán až potom.',
    naivePValue: 'p-hodnota, jak se běžně uvádí',
    naiveHint:
      'Oboustranný test, že celková změna za dané období je nulová, pro kroky se známou směrodatnou odchylkou.',
    verdictNothing: 'Nic k hlášení',
    verdictStriking: 'Vypadá to jako nález',
    body2:
      'Test odpovídá přesně na jednu otázku: jak neobvyklá je tato změna pro období určené předem? Vaše období předem určeno nebylo. Bylo nejnápadnější z {{candidates}} úseků a p-hodnota o tom nemá jak vědět.',
    runFirst:
      'Oprava níže je smyslem tohoto kroku: bez ní je číslo v řádku výše tím, co by se uvedlo.',
    selection: {
      heading: 'Co samo o sobě znamená hledání',
      body: 'Abychom období posoudili poctivě, simulujeme celý postup: vytvoříme nový záznam bez jakéhokoli trendu, otestujeme všech {{candidates}} úseků a ponecháme ten nejnápadnější. A to {{replications}}krát.',
      run: 'Simulovat hledání {{replications}}krát',
      running: 'Simuluji…',
      histogramTitle: 'Nejnápadnější období, které stejné hledání našlo v záznamech bez trendu',
      histogramX: '|z| nejnápadnějšího nalezeného období',
      histogramY: 'Počet simulovaných hledání',
      marker: 'Vaše období',
      adjusted: 'p-hodnota opravená o hledání',
      adjustedHint:
        'Monte Carlo p-hodnota: jak často stejné prohledání záznamu bez trendu najde období alespoň tak nápadné jako |z| = {{z}}.',
      shareSignificant:
        'V {{share}} simulovaných záznamů našlo hledání období pod hranicí 0,05 — a to v datech, kde žádný trend není. Při dostatečném počtu prohledaných úseků není nápadný nález šťastnou náhodou, ale jistotou.',
      conclusion:
        'Tentýž výsledek přečtený dvěma způsoby: {{naive}}, jak by se číslo běžně uvedlo, a {{adjusted}}, jakmile započítáme hledání, které jej vytvořilo. Na datech se mezi těmi dvěma čísly nezměnilo nic.',
      gallery: {
        heading: 'Pět nejnápadnějších období z těchto simulací',
        body: 'Každý záznam níže pochází ze stroje bez trendu a každý zvýrazněný úsek je v něm tím nejnápadnějším obdobím. Každý z nich by se uváděl s čísly pod ním.',
        caption: 'Simulace {{index}}',
        item: 'Období {{start}}–{{end}} · změna {{change}}',
        itemStats: '|z| {{z}} · p {{p}}',
        plotAria:
          'Simulace {{index}}: záznam bez trendu s vyznačenými obdobími {{start}} až {{end}} jako nejnápadnějším nalezeným úsekem.',
      },
    },
    explanation: {
      title: 'Proč se to děje?',
      body1:
        'Kroky jsou nezávislé, ale záznam je jejich průběžný součet, a průběžný součet nezávislých kroků bloudí. Vzdálí se daleko od místa, kde začal, obrátí se a bloudí znovu. Nic z toho není trend: takhle vypadá nezávislost, když ji sečteme. Oko v obrázku čte příběh proto, že obrázek dlouhé hladké úseky opravdu obsahuje.',
      body2:
        'Úsek vybraný po zhlédnutí záznamu je vítězem soutěže, o které se p-hodnota nikdy nedozvěděla. Jeden test na hladině 5 % se mýlí asi jednou z dvaceti; tisíce překrývajících se testů, z nichž se uvede ten největší, se mýlí téměř vždy. Opravou tu není jiný vzorec, ale poctivé nulové rozdělení — rozdělení vítěze, ne jednoho ze soutěžících.',
      body3:
        'Je to tatáž chyba jako kreslení terče kolem šipek a jako volba modelu, který nejlépe sedí. Poloha, model, období: ať hledání probíhá přes cokoli, uvedené číslo popisuje poslední krok postupu, a ne postup samotný.',
    },
    action: 'Otestovat na novém záznamu',
  },
  validation: {
    heading: 'Nový, nezávislý záznam',
    body1:
      'Obě období jsou teď zmrazena jako data v kalendáři — tytéž úseky, pojmenované dřív, než tato data vznikla. Stroj vytvoří zcela nový záznam, který se na žádné volbě nepodílel, a obě období se na něm změří.',
    body2:
      'Období určené předem se chová přesně jako dřív. A stejně tak to vaše, a právě o to jde: na datech, která si nepomohlo vybrat, je to obyčejný úsek obyčejného záznamu. Cokoli je činilo pozoruhodným, patřilo starému záznamu, ne těm datům v kalendáři.',
    originalRecord: 'Původní záznam',
    freshChange: 'Změna na novém záznamu',
    freshPValue: 'p-hodnota na novém záznamu',
    tableHint: 'Tytéž dva úseky období, změřené na záznamu, který se na jejich volbě nijak nepodílel.',
    freshData: 'Nový záznam',
    drawFresh: 'Vytvořit další nezávislý záznam',
    replications: {
      heading: 'Zopakovat na mnoha nezávislých záznamech',
      body: 'Každá replikace je nový záznam z téhož stroje, změřený na týchž dvou zmrazených úsecích období.',
      run: 'Spustit {{replications}} replikací',
      meanAbsZ: 'Průměrné |z| na nových záznamech',
      shareSignificant: 'Označeno za významné',
      tableHint:
        'Oba úseky byly určeny dřív, než tyto záznamy vznikly, takže oba by měly být označeny za významné asi v 5 % případů — a oba jsou.',
      note: 'Když na každém novém záznamu spustíme hledání znovu, vybere v {{share}} případů období, které se s tím vaším ani nepřekrývá, a jeho vítěz má v průměru |z| = {{z}}. Hledání spolehlivě najde něco nápadného — a pokaždé jinde. Přesně to znamená, že je nález výtvorem hledání.',
    },
    action: 'Co si z toho odnést?',
  },
  conclusion: {
    heading: 'Co tento scénář ukazuje',
    point1:
      'Průběžný součet nezávislých kroků vypadá, jako by měl trendy a zlomy. Struktura v obrázku není dokladem struktury v procesu.',
    point2:
      'P-hodnota je správná pro otázku, která jí byla položena. Volba úseku až po zhlédnutí dat mění otázku, aniž by změnila výpočet.',
    point3:
      'Rozsah hledání je součástí výsledku. P-hodnota 0,001 z jednoho předem určeného testu a tatáž p-hodnota jako nejlepší z několika tisíc nejsou stejný doklad.',
    point4:
      'Období nalezené hledáním je hypotéza o těchto datech v kalendáři. Rozhodnou o ní nové záznamy — a tady rozhodnou proti ní.',
    legitimate: {
      heading: 'Prohledávání dat není ta chyba',
      body: 'Hledat v záznamu neobvyklé úseky je přesně to, jak má fungovat detekce epidemií, řízení kvality i monitorování, a statistika pro to je dobře propracovaná — skenovací statistiky opravují na celou rodinu prohledávaných oken právě proto, aby se vítěz dal posoudit spravedlivě. Chybou je skenování provést a pak vítěze uvést, jako by to jediné okno bylo určeno předem.',
    },
    nextHeading: 'Kam to vede dál',
    nextBody:
      'Hledání zatím probíhalo přes polohu, přes model a teď přes úsek času a data byla pokaždé zjevně simulovaná. Další scénář zasadí totéž hledání do situace, kde čísla vypadají, že jsou o lidech — a tam už ta chyba přestává být neškodná.',
  },
}

export default interestingregion
