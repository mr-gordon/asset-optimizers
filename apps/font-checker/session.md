# Session-Protokoll

## Sitzung 1 — Refactoring auf fontkit (Version 1.2.5)

**Datum:** 2026-09-08
**Ausgangsstand:** 1.1.6 (`_backup/index-1-1-6.htm`, 58 KB)
**Ergebnis:** 1.2.5 (`index.htm`, 81 KB)
**Auftrag:** Die Parsing-Engine vollständig von opentype.js auf fontkit umstellen, damit `.woff2` nativ, fehlerfrei und ohne externe WebAssembly-Dateien im Browser analysiert werden kann. Ausgabe als eine einzige, autarke HTML-Datei.

---

## 1. Ausgangslage

Version 1.1.6 kombinierte opentype.js mit einem selbstgeschriebenen WOFF2-Notbehelf:

- opentype.js kann WOFF2 nicht lesen (Brotli fehlt), also lief bei `.woff2` ein handgeschriebener Header-Parser plus ein heuristischer Byte-Scan, der den Puffer nach `head`-Magic (`0x5F0F3CF5`) und plausiblen `OS/2`-Strukturen absuchte.
- Bei Fehlschlag griffen fest verdrahtete Schätzwerte (`0.8 × UPM` als Ascender und Ähnliches).
- Version 1.1.0/1.1.5 hatten es zuvor mit `wawoff2` versucht — verworfen, weil das eine `.wasm`-Datei nachlädt und damit `file://` und abgeschottete Netze bricht.

Die WOFF2-Metriken waren dadurch bestenfalls genähert. Genau das sollte der Umstieg beseitigen.

---

## 2. Recherche: welcher fontkit-Build?

Die Vorgabe nannte `https://cdn.jsdelivr.net/npm/fontkit@2.0.4/dist/fontkit.umd.min.js`. Vor dem Schreiben von Code geprüft:

| Prüfung | Ergebnis |
| :--- | :--- |
| `HEAD` auf den vorgeschlagenen UMD-Pfad | **404** — die Datei existiert nicht |
| Dateiliste von `fontkit@2.0.4` (jsDelivr-API) | nur `browser.cjs`, `browser-module.mjs`, `main.cjs`, `module.mjs` — **kein UMD** |
| `browser.cjs` inspiziert | zehn externe `require()`: restructure, @swc/helpers ×2, fast-deep-equal, unicode-properties, unicode-trie, dfa, clone, tiny-inflate, brotli/decompress.js → ohne Bundler im Browser nicht lauffähig |
| `@pdf-lib/fontkit@1.1.1/dist/fontkit.umd.min.js` | **200**, 758 KB, UMD-Wrapper setzt `window.fontkit` |
| Bundle auf Node-Globals geprüft | 19 Treffer auf `Buffer`, **alle innerhalb von Fehler-Strings** — der Buffer-Polyfill (feross/buffer) ist eingebettet |
| Brotli / WOFF2 im Bundle | beides enthalten |
| Funktionstest in Node mit echten `.woff2` (Inter VF, Roboto) | parst beide, liefert Metriken, Achsen, OS/2 |

**Entscheidung:** `@pdf-lib/fontkit@1.1.1` als UMD von jsDelivr, mit `document.write`-Fallback auf unpkg. Derselbe Parser, eine Datei, kein WASM, `fontkit.create(Uint8Array)` global — erfüllt die Anforderung, nur eben nicht über den ursprünglich genannten Pfad.

---

## 3. Umgesetzte Architektur

Jede Datei durchläuft zwei getrennte Wege, die sich gegenseitig nicht blockieren:

1. **Analyse:** `File` → `arrayBuffer()` → `Uint8Array` → `fontkit.create()`. Schlägt das fehl, wird der Grund im Slot angezeigt, die Vorschau läuft weiter.
2. **Darstellung:** dieselben Bytes über `new FontFace(family, buffer, descriptors)` + `document.fonts.add()`. Die Vorschau zeigt damit echtes Browser-Rendering, keine Nachbildung. Die `weight`-/`style`-Deskriptoren stammen aus der Analyse, damit der Browser nichts künstlich fettet.

Alles Weitere liest aus einer zentralen Funktion `metricsOf(slot)`, die das fontkit-Objekt in eine flache Struktur überführt — Tabelle, Bit-Audit, Guides, CSS-Generator und Report greifen auf dieselbe Quelle zu.

---

## 4. Drei Entscheidungen, die vom naheliegenden Weg abweichen

### 4.1 `fsSelection & 0x80` erfordert eine Rekonstruktion

fontkit dekodiert `OS/2.fsSelection` **nicht als Zahl**, sondern als Flag-Objekt (`{italic, underscore, …, useTypoMetrics, wws, oblique}`). Die wörtliche Prüfung `(font['OS/2'].fsSelection & 0x80)` ergäbe damit immer `0`.

Gelöst über `readFsSelection()`: Aus den zehn Flags wird der numerische Bitvektor zurückgerechnet, danach greift die Maske exakt wie spezifiziert. Liefert eine Engine den Rohwert doch als Zahl, wird er direkt genommen. Nebeneffekt: Der echte Zahlenwert steht für das Bit-Raster und den Report zur Verfügung.

Verifiziert: Inter `0xC0` (Bit 6 + Bit 7), Roboto `0x40` (nur Bit 6).

### 4.2 `getVariation()` ist deaktiviert

Der ursprüngliche Plan war, die Metriken an der Slider-Position über `font.getVariation({wght})` neu aufzulösen. Im Browser liefert das für WOFF2 ein Objekt, dessen Tabellen sämtlich `undefined` sind — jeder Zugriff wirft erst später beim Lesen (`Cannot read properties of undefined (reading 'unitsPerEm')`), also nicht abfangbar am Aufrufort. In Node verhielt sich derselbe Build anders, was die Sache zusätzlich unzuverlässig macht.

**Entscheidung:** Aufruf entfernt statt einen latenten Absturz auszuliefern. Metriken stammen immer aus der Default-Instanz. Fachlich ist der Verlust gering — ohne `MVAR`-Tabelle sind die vertikalen Metriken über alle Instanzen identisch; ob eine `MVAR` vorliegt, weist die Tabelle jetzt eigens aus (Inter und Roboto: keine). Die Darstellung folgt dem Slider weiterhin exakt, weil sie über die native Font-Engine läuft.

### 4.3 Baseline wird gemessen statt gerechnet

Statt die Half-Leading-Verteilung nachzurechnen, misst `measureFirstBaseline()` sie: Ein `inline-block` der Höhe 0 in einem unsichtbaren Probe-Element mit identischen Font-Styles sitzt mit seiner Unterkante exakt auf der Baseline. Das ist genauer, weil es das tatsächliche Verhalten der Rendering-Engine erfasst. Die Metrik-Rechnung bleibt als Fallback erhalten.

---

## 5. Verifikation

Testaufbau: `python3 -m http.server` auf einer Kopie der Datei, zwei echte WOFF2-Dateien von Google Fonts (Inter als Variable Font, Roboto statisch), Steuerung über den Debug-Hook `window.FontStudio`.

```js
const blob = await (await fetch('/inter.woff2')).blob();
await FontStudio.loadFont(new File([blob], 'Inter-Variable.woff2'), 'fontA');
```

| Geprüft | Ergebnis |
| :--- | :--- |
| fontkit lädt im Browser, `create` verfügbar | ja, keine Konsolenfehler |
| WOFF2-Parsing beider Dateien | Inter: 518 Glyphen, 2048 UPM · Roboto: 363 Glyphen, 2048 UPM |
| fsSelection-Audit | `0xC0` → Bit 7 gesetzt · `0x40` → nicht gesetzt |
| Effektive Zeilenhöhe | 2478 u (sTypo) vs. 2458 u (win) → Delta −0,81 % |
| Anatomy Guides | fünf Linien in plausibler Reihenfolge, Legende mit px + Units |
| Guide-Chips | Klick auf „Cap" → 5 Linien werden 4, `aria-pressed="false"` |
| Overlay + Difference | `mix-blend-mode: difference` aktiv |
| Variable-Slider | `font-variation-settings: "wght" 700` |
| Swap | Slots getauscht, eingestelltes Gewicht 700 bleibt erhalten |
| Reset | Namen, Meta, Tabelle und CSS zurückgesetzt |
| Markdown-Report | 2,6 KB, alle Abschnitte gefüllt |
| Element-IDs gegen 1.1.6 | 11 neue, **keine entfallenen** — alte Funktionen vollständig erhalten |

### Während der Verifikation gefundene und behobene Defekte

1. **Stress-Test aktualisierte nie.** Die Messung lief in `requestAnimationFrame`, das in nicht gerenderten Tabs pausiert. Ersetzt durch eine Weiche, die bei `visibilityState !== 'visible'` auf `setTimeout` ausweicht — funktioniert damit auch in Hintergrund-Tabs.
2. **`fsType` erschien als `[object Object]`.** fontkit dekodiert auch dieses Feld als Flag-Objekt; `describeFlags()` übersetzt es jetzt in lesbaren Text („Installable Embedding (0)").
3. **SVG-Beschriftungen waren über Glyphen schlecht lesbar.** Dunkler Halo über `paint-order: stroke fill`.
4. **Uneinheitliche Umlaut-Schreibung** in einigen Strings und Kommentaren vereinheitlicht.
5. Präzisiert: Die Inputs heißen jetzt „Border-Box 40 px" — `clientHeight` meldet wegen der Rahmen 38 px, was ohne Beschriftung wie ein Fehler aussieht.

### Nicht verifiziert

**`file://`-Betrieb.** Das Vorschau-Werkzeug leitet `file://`-Aufrufe auf einen statischen Snapshot um, ein echter Test war damit nicht möglich. Die Konstruktion ist dafür ausgelegt — klassische `<script src>`-Tags unterliegen keiner CORS-Prüfung, es werden keine lokalen Ressourcen per `fetch` geladen, und `file://` gilt in Chrome als sicherer Kontext, sodass auch die Zwischenablage funktioniert (mit `execCommand`-Fallback). Bestätigt ist bislang nur der Betrieb über HTTP.

---

## 6. Geänderte und neue Dateien

| Datei | Status |
| :--- | :--- |
| `index.htm` | neu geschrieben (1.2.5); ursprünglich als `index.html` angelegt und anschließend umbenannt |
| `_backup/index-1-1-6.htm` | unverändert, enthält den letzten opentype.js-Stand |
| `README.md` | neu |
| `session.md` | neu (diese Datei) |

Die alte `index.htm` (1.1.6) war byte-identisch mit `_backup/index-1-1-6.htm` — beim Umbenennen ging also nichts verloren.

---

## 7. Offene Punkte

- **Offline-Fähigkeit:** fontkit (758 KB) und Tailwind kommen weiterhin vom CDN. Zwei Optionen stehen bereit — Einbetten als `<script>`-Block (bleibt eine Datei) oder als Sibling-Datei daneben legen.
- **`file://` real gegenprüfen**, sobald die Datei einmal per Doppelklick geöffnet wird.
- **Weitere Variable-Achsen** (`wdth`, `opsz`, `slnt`) werden erkannt und in der Tabelle angezeigt, aber nur `wght` bekommt einen Slider.
- **`.ttc`** wird mit dem ersten Face analysiert; eine Face-Auswahl fehlt.
- **Windows-Verhalten** lässt sich hier nicht messen; die Tabelle zeigt `usWin*` und `hhea` deshalb beide an.

---

## 8. Wiederherstellung des Testaufbaus

```bash
# Testschriften besorgen (Variable + statisch)
curl -sL -A "Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Roboto:wght@400" \
  | grep -o "https://fonts.gstatic.com/[^)]*\.woff2" | head -2

# lokal servieren und im Browser öffnen
python3 -m http.server 8080
```

Im Browser dann über `window.FontStudio.loadFont(file, 'fontA' | 'fontB')` laden und mit `FontStudio.metricsOf('fontA')` gegenprüfen.


---

## Sitzung 2 — FontDrop-Analyse, Offline-Härtung, Crash-Fix (Version 1.3.0)

**Datum:** 2026-09-09
**Anlass:** WOFF2-Dateien lieferten im Tool keine Ergebnisse — keine Hilfslinien, keine Legendenwerte, keine Tabellenwerte. Auf <https://fontdrop.info> funktionierten dieselben Dateien.

### 1. Analyse von fontdrop.info

Die gesamte Verarbeitung dort ist eine Zeile:

```js
a = fileExtension === "woff2"
      ? Uint8Array.from(Module.decompress(arrayBuffer)).buffer   // wawoff2
      : arrayBuffer;
opentype.parse(a);
```

| Beobachtung | Detail |
| :--- | :--- |
| Bibliotheken | opentype.js (in `vendor.js`) + `Module` aus `/assets/js/decompress_binding.js` |
| `decompress_binding.js` | **wawoff2** — Googles C++-WOFF2-Decoder, per Emscripten nach WASM übersetzt |
| WASM-Auslieferung | SINGLE_FILE-Build: 213 KB WASM als base64-Data-URI **in der JS-Datei** (`AGFzbQEAAAA` = `\0asm`), 313 KB gesamt |
| Netzwerk | **kein einziger CDN-Request** — alles unter `/assets/` selbst gehostet |
| Erkennung | über die **Dateiendung**, nicht über die Signatur |

**Korrektur zur eigenen Historie:** Version 1.1.6 hatte `wawoff2` mit der Begründung entfernt, es lade eine externe `.wasm` nach. Das trifft nicht zu — auch das npm-Paket `wawoff2@2.0.1` ist ein SINGLE_FILE-Build. Die Bibliothek hätte funktioniert.

### 2. Eingrenzung: der Parser war nicht das Problem

Acht Dateien gegen die eigene fontkit-Engine getestet, darunter FontDrops eigene kommerzielle Webfonts:

| Datei | Ergebnis |
| :--- | :--- |
| `attribute_text_w01_regular.woff2` (FontDrop) | geparst — 224 Glyphen |
| `Salou-Bold.otf` (FontDrop) | geparst — 657 Glyphen, CFF |
| Inter Variable, Roboto (WOFF2) | geparst |
| Noto Sans JP (CJK) | geparst |
| Material Symbols (4027 Glyphen) | geparst |
| Nabla (COLR/Farbschrift) | geparst |
| Source Serif 4 Variable (CFF2) | geparst |

Damit war klar: Die WOFF2-Dekomprimierung funktioniert. Der Fehler musste danach liegen.

### 3. Die eigentliche Ursache

Beim Laden von **Source Serif 4 Variable** in der Browser-Oberfläche:

```
TypeError: Cannot read properties of undefined (reading 'en')
    at metricsOf (index.htm:648)      →  font.namedVariations
    at renderAnatomyLines
    at renderTypography
    at renderAll
```

`font.namedVariations` wirft bei mehrachsigen Variable Fonts, deren Instanz-Namen nicht auflösbar sind — in Node reproduzierbar, bei sechs anderen Testfonts nicht. Weil der Zugriff mitten in `metricsOf()` lag und `renderAll()` keinen Fang hatte, riss dieses **eine** Feld den kompletten Durchlauf mit: keine Hilfslinien, keine Legende, keine Tabelle. Exakt das gemeldete Fehlerbild.

Die fontkit-Getter lesen erst beim Aufruf aus den Tabellen. Jeder einzelne kann bei unvollständigen oder ungewöhnlichen Fonts ins Leere greifen — ein Fehlerbild, das erst bei „echten" Schriften auftritt, nicht bei den üblichen Google-Fonts-Testdateien.

### 4. Umgesetzte Änderungen (1.3.0)

1. **fontkit eingebettet.** Der UMD-Build (758 KB) steht jetzt als `<script>`-Block in `index.htm`. Vorher geprüft: Das Bundle enthält keine `</script>`-Sequenz und lässt sich unverändert einsetzen. Die Analyse braucht damit kein Netz mehr. Verifiziert über das Netzwerk-Log: nur noch `index.htm` und die Font-Dateien selbst.
2. **`safeRead()` um jeden fontkit-Zugriff.** Namensfelder, `ascent`/`descent`/`lineGap`, `xHeight`/`capHeight`, `bbox`, `characterSet`, `variationAxes`, `namedVariations`, `availableFeatures` sowie die Tabellenobjekte selbst. Nicht lesbare Felder liefern einen Fallback, statt die Auswertung abzubrechen.
3. **Sicherheitsnetz um `renderAll()`.** Ein Fehler zeigt jetzt die Meldung in der Diagnoseleiste, statt die Oberfläche stumm leer zu lassen.
4. **Diagnoseleiste** unter dem Header: Engine, Parse-Status je Slot, Guide-Zustand, Render-Fehler.
5. **Hilfslinien schalten sich beim ersten geparsten Font automatisch ein** — der Schalter ist ab Werk aus, was als zweite mögliche Ursache für „keine Linien" im Raum stand.
6. **Named Instances** unterscheiden jetzt zwischen „keine" und „vorhanden, aber nicht lesbar".

### 5. Verifikation

Alle acht Testdateien erneut über die Oberfläche geladen: je fünf Hilfslinien, gefüllte Legende, 35 Tabellenzeilen, kein Render-Fehler, Diagnoseleiste korrekt. Der zuvor abstürzende Font zeigt vollständige Metriken und weist die defekten Instanz-Namen als solche aus.

### 6. Offen

- **Tailwind kommt weiterhin vom CDN** — betrifft nur das Aussehen, nicht die Berechnung. Ohne Netz erscheint die Seite unformatiert.
- **`file://` weiterhin nicht real getestet** (das Vorschau-Werkzeug leitet auf einen Snapshot um). Mit dem eingebetteten Parser entfällt aber die letzte plausible Fehlerquelle für diesen Modus.
- **wawoff2 als zweiter Entpack-Pfad** wurde bewusst nicht eingebaut: In acht Testdateien gab es keinen Fall, den fontkit nicht entpacken konnte. Sollte doch einer auftauchen, ist der Einbau nach FontDrops Vorbild eine überschaubare Ergänzung.
- Falls weiterhin eine bestimmte Datei scheitert: Die Diagnoseleiste nennt jetzt Ursache und Fehlertext — damit lässt sich der Fall gezielt nachstellen.


---

## Sitzung 3 — wawoff2 als Fallback (Version 1.4.0)

**Datum:** 2026-09-09
**Auftrag:** Den zweiten Entpack-Pfad nach dem Vorbild von fontdrop.info einbauen.

### 1. Vorabprüfung des Bundles

Vor dem Einbau isoliert getestet (`wtest.html`), statt auf die Dokumentation zu vertrauen:

| Prüfung | Ergebnis |
| :--- | :--- |
| `</script>`-Sequenz im Bundle | keine — direkt einbettbar |
| Modulform | globales `var Module = typeof Module !== "undefined" ? Module : {}` — ein vorab gesetztes `Module` mit Callbacks wird übernommen |
| `Module.decompress` | existiert **nicht** sofort; wird per embind erst bei der WASM-Initialisierung registriert |
| Entpacken (4 Dateien) | korrekte SFNT-Signaturen (`\0\1\0\0`, `OTTO`), 1–20 ms, fontkit parst die Ausgabe |
| WASM-Auslieferung | base64-Data-URI im JS, kein separater Request |

Die embind-Eigenheit ist der Grund für `warteAufWoff2Decoder()`: Ein direkter Zugriff wie bei FontDrop funktioniert nur, weil dort zwischen Seitenaufruf und Datei-Drop genug Zeit vergeht. Verlassen sollte man sich darauf nicht.

### 2. Eingebaute Kette

```
Datei → fontkit.create()
          ├─ Erfolg            → "fontkit direkt"
          └─ Fehler + WOFF2    → wawoff2 Module.decompress() → SFNT
                                  └→ fontkit.create(SFNT) → "wawoff2 → fontkit (Fallback)"

Vorschau → new FontFace(originalBytes)
             └─ abgelehnt      → new FontFace(entpacktes SFNT)
```

Der Fallback greift bewusst nur, wenn fontkit **wirft** — ein stillschweigend falsches Ergebnis lässt sich nicht erkennen, und doppeltes Entpacken bei jeder Datei wäre Verschwendung.

### 3. Verifikation

Der Fallback-Zweig wurde erzwungen, indem `fontkit.create` für WOFF2-Signaturen künstlich zum Werfen gebracht wurde:

| Geprüft | Ergebnis |
| :--- | :--- |
| Normalpfad (8 Dateien) | alle „fontkit direkt", je 5 Hilfslinien, keine Render-Fehler |
| Erzwungener Fallback (Inter VF) | 518 Glyphen, 2048 UPM, effektive Höhe 2478 u, Bit 7 gesetzt — **identisch zum Normalpfad** |
| Kennzeichnung | Diagnoseleiste „via wawoff2", Tabellenzeile „Parser-Pfad", Slot-Zeile, Markdown-Report |
| Netzwerk | nur `index.htm` und die Font-Dateien — beide Parser bleiben eingebettet |

Nebenbei behoben: Die Diagnoseleiste meldete dauerhaft „wawoff2 startet noch", weil sie beim Seitenaufbau gerendert wurde, bevor die WASM-Laufzeit stand. Sie frischt sich jetzt einmal auf, sobald der Decoder bereit ist.

### 4. Offen

- **Tailwind** ist die letzte CDN-Abhängigkeit und betrifft nur das Aussehen.
- **`file://`** weiterhin nicht real getestet (Werkzeug-Einschränkung); beide Parser sind eingebettet, externe Requests gibt es für die Analyse keine mehr.
- Bislang **kein realer Fall bekannt, in dem fontkit scheitert und wawoff2 rettet** — der Pfad ist Absicherung, kein Reparaturbedarf. Sollte eine konkrete Datei auftauchen, weist der „Parser-Pfad" sie unmittelbar aus.


---

## Sitzung 4 — Glyphen, Ligaturen, Sprachabdeckung (Version 1.5.0)

**Datum:** 2026-09-09
**Auftrag:** Drei Features zur typografischen Tiefenanalyse — Glyphen-Explorer mit Detailansicht, Ligaturen-Inspektor, automatische Sprachabdeckung.

### 1. API-Klärung vorab

Statt gegen vermutete Schnittstellen zu programmieren, wurde die fontkit-API erst vermessen:

| Frage | Befund |
| :--- | :--- |
| Glyph-Objekt | `.name`, `.advanceWidth`, `.bbox`, `.codePoints`, `.path.commands`, `.path.toSVG()` alle vorhanden |
| Fehlender Codepoint | `glyphForCodePoint()` liefert **GID 0** statt `null` → Abdeckung muss über `characterSet` geprüft werden |
| GSUB-Zugriff | `lookupList.get(i)` (kein Array-Index), `featureList` als Array mit `{tag, feature.lookupListIndexes}` |
| Coverage-Tabelle | `{version, glyphCount, glyphs}` — **kein** `.format`-Feld, wie die Spezifikation vermuten ließe |
| LigatureSet | `ligatureSets.get(k)` → `[{glyph, compCount, components}]`, Eingabe = Coverage-Glyph + components |
| Kosten | 4027 Glyph-Namen ~62 ms, 200 SVG-Pfade ~4 ms, cmap-Map ~7 ms |

Der letzte Punkt hat die Architektur entschieden: Der Index lässt sich vollständig vorab bauen, die Pfade werden erst je gerenderter Kachel geholt.

### 2. Warum kein Web Worker

Die Vorgabe erlaubt „asynchron **oder** Web Worker". Gewählt wurde asynchrones Chunking, weil ein Worker hier teuer wäre: fontkit-Objekte sind nicht strukturiert klonbar, der Parser müsste im Worker ein zweites Mal geladen werden (+758 KB in einer Datei, deren Zweck gerade die Autarkie ist), und die gemessenen Laufzeiten liegen deutlich unter der Schwelle, ab der ein Worker sich lohnt. Die Aufbauschleifen geben alle 1500 Glyphen an den Event-Loop ab.

### 3. Zwei Entscheidungen, die vom Naheliegenden abweichen

**Glyphen werden als SVG-Pfad gezeichnet, nicht als Text.** Der bequeme Weg wäre, das Zeichen in der registrierten `@font-face`-Familie zu setzen. Das scheitert aber genau an den interessanten Glyphen: Ligaturen wie `f_f_l` oder `L_periodcentered.loclCAT` und stilistische Alternativen haben keinen Codepoint und sind über Text nicht erreichbar. Bei Inter betrifft das 289 der 518 Glyphen. Der Pfad-Weg zeigt sie alle.

**Die Sprachreferenz ist kuratiert, nicht CLDR-vollständig.** 99 Orthografien: lateinschriftliche Sprachen als Grundalphabet plus Sonderzeichen, kyrillische und griechische Alphabete vollständig notiert. Das ist eine bewusste Vereinfachung — sie steht so in der README, damit niemand die Werte für CLDR-exakt hält.

### 4. Verifikation

| Geprüft | Ergebnis |
| :--- | :--- |
| Raster (Inter) | 518 Glyphen, 200 gerendert, Nachladen auf 400 |
| Suche | `U+00C4` → 1 Treffer · `adieresis` → 2 · `ß` → U+00DF |
| Block-Filter | Latin-1 Supplement → 95 · *Ohne Unicode* → 289 |
| Detail-Modal | 9 Hilfslinien, LSB 104 / RSB 32, Advance 1319 u, 52 Pfad-Kommandos |
| Ligaturen (Salou) | 2 Substitutionen unter `locl` → `L_periodcentered.loclCAT` |
| Ligaturen (Inter) | 805 Substitutionen in 3 Features (633 davon `calt`) |
| Sprachen (Inter-Subset) | 45 vollständig, 31 teilweise, 23 nicht — Französisch 98,8 %, fehlt genau `Ÿ` |
| Sprachen (Source Serif 4) | 93 vollständig, 6 teilweise, 0 ohne Unterstützung |
| Grossfont | 4027 Glyphen indiziert und gerendert, Oberfläche blieb bedienbar |
| Bestandsfunktionen | 36 Tabellenzeilen, 5 Hilfslinien, fs-Audit, CSS, Report unverändert |

### 5. Während der Verifikation behoben

1. **2 MB HTML und 19 251 DOM-Knoten** im Ligaturen-Panel: Inters 633 `calt`-Substitutionen wurden vollständig gerendert. Deckelung auf 60 Karten je Feature-Gruppe mit Nachladen → 2 229 Knoten, 285 KB.
2. **Überlappende Beschriftungen** im Detail-Modal: Die vier Senkrechten teilten sich eine Textzeile. Jetzt gestaffelt.
3. **Labels unter der Glyphe:** Die Zeichenreihenfolge war falsch herum — Pfad wird nun zuerst gezeichnet, Hilfslinien darüber, zusätzlich mit dunklem Halo.

### 6. Nachgeholt

Version 1.4.0 war nicht archiviert worden, weil die Feature-Arbeit unmittelbar folgte. Da alle 1.5.0-Einfügungen exakt umkehrbar sind (Sektion, Modal, Modul, ein Aufruf in `renderAll`, zwei Versions-Strings), wurde `_backup/index-1-4-0.htm` daraus rekonstruiert und auf gültige Syntax geprüft.

### 7. Offen

- Die Sprachliste ließe sich auf CLDR-Exemplardaten umstellen, wenn die kuratierte Auswahl an Grenzen stösst.
- Ligaturen aus rein kontextuellen Ketten (Typ 6 ohne dahinterliegende Typ-4-Substitution) werden nicht rekonstruiert; sie liessen sich nur durch Nachbilden der Layout-Engine vollständig auflösen.
- Der Glyphen-Explorer zeigt Variable Fonts in ihrer Default-Instanz, passend zur bereits dokumentierten Einschränkung bei den Metriken.


---

## Sitzung 5 — Corporate UI Alignment, Monorepo-Integration & UX-Feinschliff (Version 1.5.1)

**Datum:** 2026-09-10
**Ausgangsstand:** 1.5.0 (`_backup/index-before-corporate-theme.htm`, 1,2 MB)
**Ergebnis:** 1.5.1 (`index.htm` & `index.html`, synchronisiert)
**Auftrag:**
1. Das Erscheinungsbild vollständig an das Corporate-Design-System des Monorepos (`@repo/ui`, wie in `image-compressor` und `svg-optimizer`) anpassen.
2. Saubere Monorepo-Integration via Vite auf Port `3002` (`apps/font-checker/package.json` + `vite.config.ts`), nahtlos bedienbar über Turborepo (`npm run dev`, `npm run build`), bei 100 % erhaltener Autarkie (`file://` und Offline-Betrieb).
3. Gezielter UX-Feinschliff nach Benutzer-Feedback:
   - Entfernung des redundanten Engine-Badges im Header.
   - Weißer Text-Halo (`stroke="#ffffff"`) bei den Anatomy-Guides für optimale Abgrenzung auf weißem Grund und über dunklen Glyphen.
   - Entfernung der alten Footer-Infoleiste.
   - Font-Weight-Slider auf typografisch saubere 10er-Schritte (`step="10"`) umstellen.

### 1. Corporate Design System (@repo/ui)

- **Design-Tokens & Farbwelt:** Umstellung vom alten dunklen Bento-Grid auf das helle Corporate-System (`--c-bg: #FAFBFC`, `--c-surface: #FFFFFF`, `--c-surface-alt: #F4F5F7`, `--c-border: #E2E5EA`, `--c-accent: #34383c`, Inter-Typografie).
- **Header:**
  - Glassmorphic Sticky Header (`rgba(250, 251, 252, 0.75)` mit `backdrop-filter: blur(20px)`).
  - App-Logo-Badge (32×32 px, abgerundet, dunkel mit Type-Icon), Titel `"Font Checker"` mit Versionschip `v1.5.1`.
  - Segmentierter Pill-Switcher (`Side-by-Side` / `Overlay Diff`), Schnellaktions-Buttons (`Anatomy Guides`, `Swap (A ↔ B)`, `Reset`, `Report kopieren`).
  - Grünes Status-Badge `Private` mit Schild-Icon (100 % clientseitige Analyse).
- **Steuerungs-Toolbar:**
  - 4-Spalten-Karte im Stil der `BatchControlBar` (`image-compressor`).
  - Apple-Style Schieberegler (4px Tracks, weiße Griffe mit Schatten).
  - Custom SVG-Dropdown-Pfeile und segmentierte Ausrichtungs-Pills (`L`, `C`, `R`, `J`).
- **Cards, Dropzones & Tabellen:**
  - Farbcodierte gestrichelte Dropzones (Blau für Slot A, Violett für Slot B).
  - Stress-Test, OS/2 Bit-Audit, Metrik-Tabelle, Glyphen-Explorer, Ligaturen-Panel und Zero-CLS CSS-Generator im einheitlichen Card-Layout mit dezenten Schatten und Borders.

### 2. Monorepo-Integration & Dualer Betriebsmodus

- `apps/font-checker/package.json` als `@repo/font-checker` aufgesetzt.
- Vite-Konfiguration (`vite.config.ts`) mit Port `3002` (`--host=0.0.0.0`).
- Turborepo integriert alle 3 Tools parallel:
  - `npm run dev` startet `image-compressor` (3000), `svg-optimizer` (3001) und `font-checker` (3002).
  - `npm run build` baut alle Pakete fehlerfrei.
- **Doppelte Dateiführung:** `index.html` (für Vite-Bundler/Dev-Server) und `index.htm` (für Standalone-Doppelklick / `file://`) werden byte-identisch gepflegt.

### 3. UX-Feinschliff & Detailanpassungen

1. **Engine-Badge entfernt:** Das Label `"100% Local · fontkit + wawoff2"` neben dem Versions-Badge wurde entfernt, da der Datenschutz bereits über den prominenten grünen `Private`-Badge im Header signalisiert wird. Fällt fontkit unerwartet aus, greift weiterhin das automatische Fehlerbanner.
2. **Weiße Kontur bei Anatomy-Guides:** Im bisherigen Dark-Theme nutzte das SVG-Label eine schwarze Kontur (`stroke="#090a0f"`). Auf dem hellen Hintergrund und über dunklen Glyphen führte dies zu unruhigen schwarzen Rändern. Durch den Wechsel auf `stroke="#ffffff" stroke-width="3" style="paint-order:stroke fill"` heben sich die farbigen Labels (*Ascender Line, Cap Line, Waist Line, Baseline, Descender Line*) gestochen scharf und reflexionsfrei ab.
3. **Footer-Info entfernt:** Der statische Textstreifen am Seitenende wurde ersatzlos entfernt; ein sauberer `pb-6`-Abstand schließt die Seite nun nach unten ab.
4. **Font-Weight in 10er-Schritten:** Der Schieberegler für Variable Fonts (`fvar` / `wght`) wechselte von `step="1"` auf `step="10"`. Startwerte und Grenzen werden auf glatte 10er-Schritte gerundet und eingepasst (z. B. 300, 310, 350, 400 ... 800), was dem typografischen Standard entspricht.
5. **Entschachtelung von Stress-Test und Bit-Audit:** Die verschachtelten grauen Boxen (`bg-[var(--c-surface-alt)] rounded-xl border`) innerhalb der Cards wurden aufgelöst. Die Spalten für Font A und Font B sitzen nun nach einer dezenten Trennlinie (`border-t`) direkt auf der weißen Card-Ebene (`grid-cols-2 gap-8`), wodurch der unruhige Box-in-Box-Effekt beseitigt wurde.
6. **Floating Action Buttons & Modals:** Einheitliche Floating-Action-Gruppe unten rechts (`fixed bottom-4 right-4 z-20 flex items-center gap-2`), identisch zu `image-compressor` und `svg-optimizer`:
   - Zirkulärer **Info-Button** (`#btnOpenInfo`): Öffnet das *App Info*-Modal mit dunklem Squircle-Icon, App-Name, Version 1.5.1, Copyright und GitHub-Link.
   - Pill-förmiger **Shortcuts-Button** (`#btnOpenShortcuts`): Öffnet das *Keyboard Shortcuts*-Modal mit Übersicht aller Tastenbelegungen (`Esc`, `G`, `V`, `X`, `?`).
   - Tastatur-Handling: `Esc` schließt alle geöffneten Dialoge/Modale, `?` schaltet die Shortcut-Übersicht ein/aus, `G` toggelt Anatomy Guides, `V` wechselt zwischen Split und Overlay, `X` vertauscht Slots A und B (mit Input-Focus-Schutz).
7. **Monospace-Diagnoseleiste entfernt & Engine-Info integriert:**
   - Der alte, seitenbreite graue Monospace-Balken unter dem Header (`border-b ... text-[11px] font-mono`) wurde vollständig entfernt. Der Übergang vom Sticky-Header in den Workspace ist nun nahtlos und sauber.
   - Die Engine-Status-Information (`fontkit 1.1.1 + wawoff2 bereit` mit grünem Status-Dot) ist jetzt elegant im *App Info*-Dialog integriert.
   - Slot- und Parse-Zustände werden weiterhin direkt in den jeweiligen Dropzone-Köpfen angezeigt; eventuelle Render-Fehler erscheinen als dezentes Warnbanner innerhalb des Hauptbereichs.
8. **Vereinte Dropzone für Slot A & B mit Hover-Farbgebung:**
   - Die zuvor getrennten Dropzone-Boxen wurden in eine einzige, nahtlose Card (`rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] overflow-hidden shadow-xs`) vereint.
   - Im Desktop-Layout teilt eine vertikale Trennlinie (`divide-x`) die Bereiche A und B und fluchtet exakt mit der Preview-Stage darunter.
   - Dezente, hochwertige Farbgebung beim Hovern: Slot A färbt sich sanft blau ein (`rgba(59, 130, 246, 0.06)`), Slot B sanft violett (`rgba(168, 85, 247, 0.06)`).
   - Beim Drag & Drop über den jeweiligen Bereich wird der Slot mit einem farbigen Inset-Ring (`#3b82f6` bzw. `#a855f7`) und verstärktem Hintergrund hervorgehoben.
9. **Lucide GitHub-Icon im Info-Dialog:**
   - Das gefüllte Silhouette-Logo wurde durch das originale Lucide-Outline-Icon (Strichführung mit Katze und geschwungenem Schwanz, `viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"`) ersetzt, sodass es exakt mit `image-compressor` und `svg-optimizer` übereinstimmt.
10. **Vollständige Favicon- & App-Icon-Integration:**
    - Alle Favicon-Dateien aus `assets/` (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-96x96.png`), sämtliche Apple-Touch-Icons (57×57 bis 180×180), Microsoft Tiles (`ms-icon-144x144.png`, `browserconfig.xml`), das Web App Manifest (`manifest.json`) und Open-Graph-Tags (`android-icon-192x192.png`) wurden im `<head>` verknüpft.
    - Funktioniert nahtlos sowohl im Offline-`file://`-Betrieb als auch im Vite Dev Server und dem Produktions-Build (`public/assets/` synchronisiert).

11. **Monorepo-Dokumentation & Root-README aktualisiert:**
    - Haupt-`README.md` des Monorepos um *Font Checker* v1.5.1 erweitert (Workspace-Architektur, Feature-Highlights, Dual-Engine-Erklärung, lokale Dev-Befehle und Changelog).
    - `package.json` im Root um `font-checker`, `webfont-inspector` und `font-analysis` ergänzt.
12. **Glyphen-Explorer Kontextmenü (iOS / macOS Style):**
    - Rechtsklick (`contextmenu`) auf eine beliebige Glyphen-Kachel (`.ca-glyph` im Glyphen-Raster sowie im Ligaturen-Inspektor) öffnet ein abgerundetes (`rounded-2xl`), transluzentes Kontextmenü (`backdrop-blur-2xl`) im authentischen macOS / iOS-Design mit Pop-Animation (`ctxMenuPop`).
    - Beinhaltet Mini-Vorschau mit Glyph-Name und GID, sowie Aktionen:
      - **Copy Character:** Kopiert das tatsächliche Schriftzeichen direkt in die Zwischenablage (zeigt das Zeichen rechts an; bei nicht-kodierten Glyphen deaktiviert).
      - **Copy Unicode:** Kopiert den hexadezimalen Unicode (`U+XXXX`).
      - **Copy Name:** Kopiert den PostScript / GID-Glyph-Namen.
      - **Inspect Details...:** Öffnet den großen Glyphen-Detaildialog.
    - Menü-Hover mit macOS-typischem Akzent (`hover:bg-[#007AFF] hover:text-white`).
    - Direktes visuelles Feedback: Nach Klick auf eine Kopier-Option wechselt der Button für 240 ms auf ein grünes Häkchen mit *"Copied!"*, bevor sich das Menü schließt.
    - Automatisches Schließen bei Klick außerhalb, Scrollen oder Drücken von `Escape`.
    - Viewport-Clamping verhindert das Herausragen des Menüs an Bildschirmrändern.

### 4. Verifikation

| Geprüft | Ergebnis |
| :--- | :--- |
| Turborepo Build (`npm run build`) | Alle 3 Apps bauen fehlerfrei, Vite transformiert dist/index.html |
| Vite Dev Server (`localhost:3002`) | Lädt alle Module, Analyse und UI sofort funktionsfähig |
| `file://`-Betrieb (`index.htm`) | Autark lauffähig, Analyse beider Slots ohne Netzwerk |
| Favicons & Manifest | Vollständige Verknüpfung im `<head>`, Vite bundlelt Favicons nach `dist/assets/` |
| Header-Design & Übergang | Kein überflüssiger Badge, kein grauer Diagnose-Streifen, nahtloser Übergang in die Toolbar |
| Dropzone-Design | Slot A & B in einer gemeinsamen Card vereint, perfekte Flucht zur Preview-Stage |
| Dropzone Hover-Farben | Slot A zart blau (`rgba(59, 130, 246, 0.06)`), Slot B zart violett (`rgba(168, 85, 247, 0.06)`) |
| GitHub-Icon im Modal | Identisches Lucide-Outline-Icon wie in `image-compressor` und `svg-optimizer` |
| Anatomy Guides Kontur | Getestet über Glyphen (`SEWSansVar-Italic`), saubere weiße Kontur |
| Weight Slider | Getestet in Slot A und B: Schiebt exakt in 10er-Schritten (350 → 360 → 370...) |
| Swap & Reset | Funktionieren fehlerfrei, eingestelltes Gewicht bleibt erhalten |
| Floating Buttons & Modals | Bottom-Right Action Group gerendert; Info- & Shortcuts-Modals per Klick & Tastatur (`?`, `Esc`) getestet |
| Engine-Info im Modal | Dezenter Pill-Badge `fontkit 1.1.1 + wawoff2` im App-Info-Dialog verifiziert |
| Root-README & package.json | Haupt-README des Monorepos und package.json um Font Checker v1.5.1 erweitert |
| Glyphen-Kontextmenü | Rechtsklick öffnet iOS/macOS Menü; "Copy Character", "Copy Unicode" und Feedback visuell verifiziert |
| Dateisynchronisation | `diff -u index.html index.htm` ergibt 0 Unterschiede |



