# littlEye AI

Samostatná natívna aplikácia (iOS, iPadOS, macOS — jeden target) na **trénovanie AI modelov
z mikrofotografií HE farbených histologických preparátov** pre súdnych lekárov a patológov.
Nadväzuje na modul LittleEye v 4n6 Tools Pro a napĺňa **Fázu 1** z AI podkladov:
klasifikácia tkaniva (mozog, pľúca, srdce, pečeň, oblička, slezina, pankreas, koža)
+ diagnózy v rámci orgánu.

Všetko beží **on-device** — snímky ani modely nikdy neopúšťajú zariadenie
(žiadne sieťové volania v celej aplikácii).

Aplikácia je **plne dvojjazyčná (SK/EN)** s prepínačom **odbornej/laickej terminológie**
(globus v bočnom paneli alebo Nastavenia na Prehľade). Tréningové triedy používajú
**stabilné kľúče** (katalógové ID), takže model funguje nezávisle od zvoleného jazyka.

## Funkcie

1. **Dataset** — import mikrofotografií (JPEG/PNG/TIFF/HEIC, z Fotiek aj zo súborov)
   po orgánoch; správa diagnóz (tried) s predvolenou sadou pre súdnolekársku prax.
2. **Hodnotenie sklíčok** — kolegovia prechádzajú snímky a prikladajú diagnózy;
   každé hodnotenie sa ukladá s menom a dátumom (audit trail), finálny label
   určuje väčšina hlasov (ručné priradenie ju prepíše).
3. **Tréning** — Create ML `MLImageClassifier` (transfer learning, ScenePrint v1/v2)
   priamo v zariadení, s priebehom a možnosťou zrušenia (MLJob). Konfigurovateľné:
   iterácie (10–75), augmentácie (otočenie, preklopenie, orez, rozostrenie, expozícia, šum),
   **nezávislá testovacia množina** (10–20 % stratifikovaný holdout). Výstup: presnosť
   tréning/validácia/test, **konfúzna matica** a senzitivita/precíznosť per trieda.
   Dva typy modelov: *rozpoznanie tkaniva* (8 orgánov) a *diagnózy jedného orgánu*.
   Snímky nesú **zväčšenie mikroskopu** (10×/20×/100×/200×) — appka upozorní na
   zmiešané zväčšenia v tréningu.
4. **Export `.le3AI`** — jeden súbor s modelom + manifestom; import v ďalšej
   aplikácii littlEye AI (alebo tej istej u kolegu) cez Súbory/AirDrop/dvojklik.
5. **Vyhodnotenie snímky** — Vision + Core ML, výsledok vždy s istotou v %
   (neistota je povinná súčasť výsledku — metodika 4n6). Pri najistejšej triede appka
   ponúkne **prvotnú diagnózu** — mikroskopický opis + návrh záveru zo znalostnej
   bázy, s tlačidlom Kopírovať návrh nálezu.
6. **Atlas diagnóz** — znalostná báza ~40 diagnóz s mikroskopickými opismi, kľúčovými
   znakmi a návrhmi záverov ([Katalog.swift](LittleEyeAI/Core/Katalog.swift); Robbins & Cotran,
   Knight's Forensic Pathology, DiMaio). Dostupný aj priamo pri hodnotení (podržanie diagnózy).
   Pri relevantných diagnózach sekcia **Ďalšie kroky** — odporúčané špeciálne farbenia a IHC.
6b. **Edukácia** ([Edukacia.swift](LittleEyeAI/Core/Edukacia.swift)) — dvojjazyčný edukačný modul:
   *Sprievodca „čo ďalej po HE"* (12 klinických situácií: datovanie krvácania, vitalita rán,
   organizácia, nemý infarkt, DAI, tuková embólia, anafylaxia, nádor neznámeho pôvodu…),
   *špeciálne farbenia* (Van Gieson, trichróm, retikulín, Perls, PAS, Sudan/ORO, Kongo, ZN,
   Gram, Luxol, von Kossa, Giemsa), *IHC markery* (CD68, fibronektín, CD62P, tryptáza, C5b-9,
   troponín/myoglobín, β-APP, GFAP, CD31, cytokeratíny, CK7/CK20+orgánové, S100, CD45,
   vimentín, Ki-67), *bunkové elementy* (PMNL, eozinofil, bazofil, mastocyt, lymfocyt,
   plazmocyt, monocyt/makrofág, siderofág, fibroblast, obrovské bunky) a *pigmenty*
   (lipofuscín s forenzným využitím, hemosiderín, melanín, formalínový artefakt…).
   Zdroje: Bancroft, Dabbs, Knight, Robbins.
7. **Označovanie miesta (výrez)** — model hodnotí celé zorné pole, preto sa miesto nálezu
   označuje výrezom: v detaile snímky tréner potiahnutím vyznačí oblasť a uloží ju ako
   samostatnú tréningovú snímku ([VyrezEditor.swift](LittleEyeAI/Views/VyrezEditor.swift)).
8. **Metodika pre trénerov** — pravidlá snímania a označovania v aplikácii,
   so ShareLink na rozoslanie kolegom.

**Ukážkový model:** v aplikácii je pribalený `Demo.le3AI` — skutočný Create ML model
10 diagnóz trénovaný na syntetických HE vzoroch (240 snímok, test 100 % na 60 snímkach).
Načíta sa tlačidlom na Prehľade; slúži na okamžité vyskúšanie vyhodnocovania, metrík
a konfúznej matice, kým sa nenatrénuje model z reálnych preparátov
(generátor: `scratchpad/gen_demo.swift`).

**Uvítacia obrazovka** pri prvom spustení prevedie nepočítačových používateľov
4 krokmi a nastaví jazyk a meno hodnotiteľa.

## Hardvér a kompatibilita

| Zariadenie | Minimum | Poznámka |
|---|---|---|
| Mac | macOS 14+ (odporúčané 26) | Apple Silicon ideálny na tréning |
| iPad | iPadOS 17+ | M-čipy trénujú on-device; staršie na zber/hodnotenie |
| iPhone | iOS 17+ | fotenie cez okulár, hodnotenie kolegami |

Snímky sa získavajú **súbormi** (JPEG/PNG/TIFF/HEIC) — appka nepotrebuje ovládače
skenerov: mikroskopová kamera → export → Súbory/iCloud/AirDrop; iPhone adaptér na
okulár; USB-C UVC kamery (natívne v macOS/iPadOS 17+); slide scanner s exportom do
TIFF/JPEG. **PrimeHisto XE** bez ovládačov pre aktuálne macOS: cez VueScan (overiť
trial verziou), alebo skenovať na staršom stroji a preniesť súbory (SMB/USB-C/iCloud).
Podrobnosti sú v aplikácii v sekcii *Hardvér a snímanie*.

## Pracovný workflow — Prípady

Sekcia **Prípady** (bočný panel hore): sklíčka zo skenera sa priraďujú k prípadu
(číslo protokolu), prezerajú so **zoomom** (pinch / dvojité ťuknutie), označujú
diagnózami a opismi. K prípadu sa dopĺňa kontext: **katamnéza, diagnostický záver
po pitve, toxikológia**. Tlačidlo **Zhodnotiť prípad** vyhodnotí všetky sklíčka
(diagnózy lekára + dostupné modely) a vygeneruje **stručný súhrn**: nálezy po
orgánoch, záver „len zo sklíčok" aj „s údajmi prípadu" (pravidlová
klinicko-patologická korelácia podľa kľúčových slov), s tlačidlom
**Kopírovať (do Wordu)**. Prípady sa dajú archivovať; sklíčka prípadov sa
zároveň počítajú do tréningového datasetu (ak majú priradenú diagnózu).

**Záloha archívu:** Prípady → ⋯ → *Zálohovať archív na disk* — vyberie sa
priečinok (externý disk/USB-C/SMB) a zapíše sa `littlEyeAI-zaloha-<čas>/`
s `manifest.json` (verziovaná schéma — príprava na budúci server), `store.json`,
`Slides/` a `Models/` ([Zaloha.swift](LittleEyeAI/Core/Zaloha.swift)).

## Formát súboru `.le3AI` (verzia 2)

Jeden **binárny property list** (Codable `LE3Balik`, [LE3File.swift](LittleEyeAI/Core/LE3File.swift)):

| Kľúč | Typ | Význam |
|---|---|---|
| `format` | String | vždy `"le3AI"` |
| `formatVersion` | Int | `1` |
| `id` | UUID | identita modelu (reimport nahradí starší) |
| `nazov` | String | názov modelu |
| `typ` | String | `"organ"` \| `"diagnozy"` |
| `organ` | String? | rawValue orgánu (`mozog`/`pluca`/`srdce`/`pecen`/`oblicka`) |
| `labely` | [String] | triedy klasifikátora |
| `vytvoreny` | Date | dátum tréningu |
| `autor` | String | audit trail |
| `appVerzia` | String | verzia aplikácie, ktorá model vytvorila |
| `presnostTrening` / `presnostValidacia` | Double? | v % |
| `pocetSnimok` | Int | veľkosť tréningového datasetu |
| `sha256` | String | kontrolný súčet `modelData` (overuje sa pri importe) |
| `modelData` | Data | Core ML `.mlmodel` (pri načítaní sa kompiluje na `.mlmodelc`) |
| `presnostTest`, `pocetTest` | Double?, Int? | v2 — metriky na nezávislom teste |
| `konfuzia` | [{skutocna, predikovana, pocet}]? | v2 — konfúzna matica testu |
| `extraktor`, `iteracie`, `augmentacie` | String?, Int?, [String]? | v2 — parametre tréningu |
| `labelNazvySK/EN` | [String: String]? | v2 — zobrazovacie názvy label kľúčov |

Verzia 1 (labely = slovenské názvy) sa naďalej dá importovať. V2 `labely` sú stabilné
kľúče: `Organ.rawValue`, katalógové ID (`pluca.antrakoza`) alebo `custom.<uuid>`.

UTI: `eu.forensika.littleeyeai.le3ai` (deklarované v Info.plist, prípona `.le3ai`/`.le3AI`).

## Build

```bash
xcodegen generate
xcodebuild -project LittleEyeAI.xcodeproj -scheme LittleEyeAI \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' build
```

Projekt sa generuje z [project.yml](project.yml) (XcodeGen); po pridaní súborov stačí
`xcodegen generate` znova. macOS build: `-destination 'platform=macOS'`.
Podpisovanie: tím `QS4A9TCFAU`, bundle `eu.forensika.littleeyeai`.

## Architektúra

```
LittleEyeAI/
├── App/            vstupný bod, onOpenURL import .le3AI
├── Core/
│   ├── Models      Organ, Diagnoza, Sklicko, Hodnotenie, ModelZaznam
│   ├── DataStore   súborové úložisko (Application Support/LittleEyeAI:
│   │               store.json + Slides/*.jpg + Models/*.mlmodel)
│   ├── ImageUtil   ImageIO downsampling (TIFF/HEIC/PNG -> JPEG max 2048 px)
│   ├── LE3File     formát .le3AI + FileDocument na export
│   ├── Trainer     Create ML tréning (dočasné labelované priečinky)
│   └── Classifier  kompilácia modelu + Vision inferencia
└── Views/          SwiftUI (NavigationSplitView, spoločné pre iOS aj macOS)
```

## Regulačná poznámka

Aplikácia je **výskumný a podporný nástroj, nie zdravotnícka pomôcka** — finálne
posúdenie vždy patrí patológovi. Táto formulácia je v UI (komponent `Upozornenie`),
v metadátach modelov aj v exportoch a musí zostať aj v App Store popise.
Pred praktickým nasadením modelu: validácia na nezávislom súbore
(senzitivita/špecificita, zhoda s patológom).
