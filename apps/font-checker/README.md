# Font Studio Pro

**Precision WebFont Inspector & Comparison Studio** — ein lokales Werkzeug, um zwei Webfonts nebeneinander zu stellen, ihre binären Metriken auszulesen und die typischen Layout-Fallen (Zeilenhöhen-Drift, Descender-Clipping, CLS beim Font-Swap) sichtbar zu machen, bevor sie in Produktion auffallen.

| | |
| :--- | :--- |
| **Version** | 1.5.1 |
| **Datei** | `index.htm` / `index.html` (eine Datei: HTML, CSS, JS, beide Parser — ca. 1,2 MB) |
| **Parsing-Engine** | fontkit (**eingebettet**), bei Bedarf wawoff2 als WOFF2-Fallback (**eingebettet**) |
| **Formate** | `.woff2`, `.woff`, `.ttf`, `.otf`, `.ttc` |
| **Offline** | vollständig — für die Analyse wird nichts nachgeladen |
| **Datenschutz** | 100 % lokal — keine Datei verlässt den Browser |

---

## Inhalt

- [Schnellstart](#schnellstart)
- [Features](#features)
- [Wie die Zahlen zustande kommen](#wie-die-zahlen-zustande-kommen)
- [Technik & Abhängigkeiten](#technik--abhängigkeiten)
- [Bekannte Einschränkungen](#bekannte-einschränkungen)
- [Debug-Hook](#debug-hook)
- [Projektstruktur & Versionierung](#projektstruktur--versionierung)
- [Changelog](#changelog)
- [Ideen für später](#ideen-für-später)
- [Lizenz & Credits](#lizenz--credits)

---

## Schnellstart

`index.htm` im Browser öffnen — per Doppelklick (`file://`) oder über einen beliebigen Webserver. Kein Build, kein `npm install`, kein Server nötig.

```bash
# Standalone-Betrieb (optional über einfachen HTTP-Server)
python3 -m http.server 8080

# Oder im Monorepo über Turborepo / Vite (Port 3002)
npm run dev
```

Dann zwei Schriften in die Drop-Zonen **A** und **B** ziehen (oder klicken und auswählen). Alles Weitere passiert live.

> **Der Parser steckt in der Datei** — die Font-Analyse funktioniert offline, hinter Firmen-Proxys, mit aktivem Content-Blocker und per Doppelklick über `file://`. Ohne Netz fehlt lediglich Tailwind: Die Seite sieht dann unformatiert aus, rechnet aber korrekt.

---

## Features

### Import & Engine

- **Vereinte Dropzone:** Beide Slots (Primär A & Vergleich B) sitzen in einer gemeinsamen Card mit vertikaler Trennung, die exakt mit der Vorschau-Bühne fluchtet. Beim Überfahren mit der Maus färbt sich der jeweilige Bereich dezent ein (zartes Blau für A, zartes Violett für B), beim Ziehen einer Datei hebt sich der Slot zusätzlich mit einem farbigen Rand hervor.
- **Doppelte Verarbeitung jeder Datei:** fontkit liest die Binärstruktur (Tabellen, Metriken, Achsen), parallel registriert die native `FontFace`-API dieselben Bytes im Dokument — die Vorschau zeigt also exakt das, was der Browser rendert, nicht eine Nachbildung.
- **WOFF2 wird nativ dekomprimiert** (Brotli in reinem JavaScript). Kein `.wasm`-Nachladen, damit die Datei auch über `file://` und in abgeschotteten Netzen läuft.
- **Zweistufiger WOFF2-Pfad:** Kommt fontkit mit einer Datei nicht zurecht, entpackt **wawoff2** — Googles C++-Referenzdecoder als WebAssembly, dieselbe Bibliothek, die fontdrop.info einsetzt — sie zu unkomprimiertem SFNT, das fontkit anschliessend liest. Scheitert die Vorschau, weil der Browser die WOFF2-Datei ablehnt, wird ebenfalls das entpackte SFNT registriert. Welcher Weg zum Zug kam, steht als **Parser-Pfad** in der Vergleichstabelle.
- **Statusanzeige pro Slot:** Format, Dateigröße, Glyphenzahl, UPM direkt im Kopfbereich jeder Dropzone. Schlägt das Parsing fehl, steht der Grund dort — die Vorschau läuft trotzdem weiter.
- **Header im Corporate Design:** Glassmorphic Sticky-Header mit App-Badge, View-Switcher, Aktionsleiste und grünem **Private-Badge** (100 % clientseitige Verarbeitung). Scheitert das Laden von fontkit, erscheint automatisch ein klares Fehlerbanner. Die Engine-Info (`fontkit 1.1.1 + wawoff2 bereit`) ist dezent im App-Info-Dialog integriert.
- **Favicons & PWA-Manifest:** Vollständiger Satz an Favicons, Apple-Touch-Icons, Microsoft Tiles und Web App Manifest im `<head>` verknüpft.

### Workspace

- **Side-by-Side** — beide Schriften in getrennten Bühnen, mit direkt im Text editierbarem Beispiel (`contenteditable`, wird zwischen A und B synchron gehalten).
- **Overlay Diff** — beide Schriften übereinander, mit Deckkraft-Regler und optionalem `mix-blend-mode: difference`; Unterschiede in Breite und Achshöhe leuchten dann als Kanten auf.
- **Live-Steuerung:** Schriftgröße (12–140 px), Line-Height (0,8–2,5), Letter-Spacing (−0,08–0,3 em), Ausrichtung (links/zentriert/rechts/Blocksatz), Ligaturen an/aus, Baseline-Raster.
- **Text-Presets:** Anatomie-Satz, deutsches und englisches Pangramm, Ziffern & Währung, Fließtext, UI-Strings — oder freier Text.
- **Variable Fonts:** `fvar`-Erkennung mit Schieberegler über die `wght`-Achse in typografisch sauberen **10er-Schritten** (`step="10"`), inklusive gerundeter Startwerte.
- **Swap (A ↔ B)** vertauscht beide Slots inklusive eingestelltem Gewicht, **Reset** räumt vollständig auf (auch die registrierten `FontFace`-Objekte).

### Anatomy Guides

Fünf farbcodierte Hilfslinien über der ersten Zeile, einzeln zuschaltbar:

| Linie | Farbe | Quelle |
| :--- | :--- | :--- |
| Ascender Line | Blau | effektiver Ascender (sTypo oder hhea, je nach Bit 7) |
| Cap Line | Violett | `OS/2.sCapHeight`, ersatzweise aus der Glyph-BBox von `H` |
| Waist Line (x-Height) | Grün | `OS/2.sxHeight`, ersatzweise aus der Glyph-BBox von `x` |
| Baseline | Rot | im Browser **gemessen**, nicht gerechnet |
| Descender Line | Bernstein | effektiver Descender |

Beim ersten erfolgreich geparsten Font schalten sich die Hilfslinien einmalig automatisch ein — der Schalter ist ab Werk aus, und ohne ihn bleibt das Kernfeature unsichtbar. Danach entscheidest du.

Die **interaktive Legende** unter jeder Bühne zeigt für jede Linie den Wert doppelt — in `px` bei der aktuellen Schriftgröße und in Font-Units — und dient gleichzeitig als Schalter: Klick auf einen Chip blendet die zugehörige Linie aus. Die Beschriftungen auf der Bühne besitzen eine weiße Kontur (`stroke="#ffffff"`), um auch bei Überdeckung dunkler Glyphen reflexionsfrei und gestochen scharf lesbar zu bleiben. Ein Hinweis am Ende nennt die verwendete Metrik-Quelle und den UPM-Wert.

### UI-Component Stress-Test

Zwei Text-Inputs mit fixer Border-Box von 40 px und Descender-Text (`Typografie Agpjq 123`), beide in der jeweiligen Schrift gesetzt. Zwei unabhängige Warnungen:

- **`OVERFLOW DETECTED`** (rot) — wenn `scrollHeight > clientHeight`, der Input also intern scrollt.
- **`CLIPPING RISK`** (bernstein) — wenn die aus den Font-Metriken berechnete benötigte Texthöhe die Content-Box überschreitet. Diese Prüfung schlägt an, wo `scrollHeight` schweigt: Bei starren Inputs wird der Text nämlich meist einfach abgeschnitten, statt scrollbar zu werden. Genau das ist der Fall, den man in der Praxis übersieht.

Dazu ein Badge mit dem **Effective-Height-Shift** zwischen A und B in Prozent — die Kennzahl dafür, wie stark ein Font-Wechsel das vertikale Layout verschiebt.

### OS/2 · fsSelection Bit-Audit

Eigener Abschnitt pro Schrift mit allen zehn `fsSelection`-Bits als Raster, dem Rohwert in Hex und Dezimal und der ausgeschriebenen Rechnung `Wert & 0x80`. **Bit 7 (`USE_TYPO_METRICS`)** ist farblich hervorgehoben, weil es die Frage entscheidet, ob Browser die `sTypo`-Werte oder die Windows-Bounds für die Zeilenbox heranziehen. Darunter steht im Klartext, welche Metriken dadurch gelten und wie hoch die effektive Zeilenhöhe in Units und em ausfällt.

### Metriken-Deep-Dive

Vergleichstabelle A/B in vier Blöcken, abweichende Werte farblich markiert:

- **Identität & Datei** — Dateiname, Container-Format, Größe, PostScript-Name, Family/Subfamily, Version, UPM, `numGlyphs`, Zeichenumfang der cmap
- **Typografische Metriken** — `ascent`, `descent`, `lineGap`, x-Height, Cap-Height, x-Height/UPM-Verhältnis, Italic Angle, Fixed Pitch, Glyph-Bounding-Box
- **OS/2 & Windows-Bounds** — OS/2-Version, Vendor-ID, `USE_TYPO_METRICS`, `sTypoAscender`/`sTypoDescender`/`sTypoLineGap` samt Summe, `usWinAscent`/`usWinDescent`, `hhea`-Werte, effektive Zeilenhöhe in Units und em, `fsType`-Embedding-Rechte
- **Weight & Variable Achsen** — `usWeightClass`/`usWidthClass`, alle `fvar`-Achsen mit Min/Max/Default, ob eine `MVAR`-Tabelle vorliegt, Named Instances, aktives Render-Gewicht, verfügbare OpenType-Features

### Font-Weight & Variable Fonts

Erkennt die `wght`-Achse und blendet dann einen Slider über den echten Achsbereich ein (`font-variation-settings: 'wght' …`), inklusive `VARIABLE`-Badge. Statische Schriften zeigen stattdessen ihre `usWeightClass`. Die `FontFace`-Registrierung bekommt den passenden `weight`-Deskriptor, damit der Browser nichts künstlich fettet.

### Glyphen-Explorer

Rasteransicht **aller** Glyphen der gewählten Schrift — nicht nur der über die cmap erreichbaren, sondern auch Ligatur- und Alternativglyphen ohne eigenen Codepoint. Jede Kachel zeichnet die Glyphe als SVG-Pfad direkt aus den Konturdaten, in einer für alle Kacheln identischen Zeichenfläche, sodass Größenverhältnisse stimmen. Darunter steht der Unicode (`U+00C4`) oder ersatzweise der Glyph-Index.

- **Suche** über Zeichen (`ß`), Codepoint (`U+00C4`, `00C4`, `0x00C4`) und Glyph-Name (`adieresis`), entprellt.
- **Block-Filter** über 25 gängige Unicode-Blöcke plus die Kategorie *Ohne Unicode-Zuordnung*, die genau die Glyphen zeigt, an die man über die Tastatur nicht herankommt.
- **Nachladen in Schritten von 200 Kacheln** — ein Icon-Font mit 4027 Glyphen baut die Oberfläche sonst mit tausenden SVG-Knoten zu.
- **iOS / macOS Kontextmenü per Rechtsklick:** Ein Rechtsklick auf eine beliebige Glyphen-Kachel öffnet ein abgerundetes, glassmorphes Kontextmenü mit Optionen für **Copy Character**, **Copy Unicode**, **Copy Name** und **Inspect Details...**, ohne dass zuvor der große Detaildialog geöffnet werden muss. Mit interaktivem visuellem Feedback (*"Copied!"* mit Häkchen) und automatischer Viewport-Kantenanpassung.

### Glyphen-Detailansicht

Klick auf eine Kachel öffnet ein Modal mit großer SVG-Vorschau und den fünf typografischen Hilfslinien, dazu Senkrechten für `x=0`, Advance Width sowie **Left und Right Side Bearing**. Beschriftungen sind gestaffelt und mit dunklem Halo hinterlegt, damit sie über der Glyphe lesbar bleiben.

Metadaten: Glyph-Name, Zeichen, Unicode in Hex und Dezimal, GID, Advance Width in Units und em, Bounding Box, LSB/RSB, Anzahl der Pfad-Kommandos, Unicode-Block. Dazu **Copy Character** und **Copy Unicode (Hex)**.

### Ligaturen-Inspektor

Liest die **GSUB-Tabelle** aus und wertet alle Ligature-Substitutions (Lookup-Typ 4) aus, inklusive der in Extension-Lookups (Typ 7) verpackten. Jede Karte zeigt die Eingabesequenz als Glyphen-Badges, den Pfeil, die resultierende Ligatur und deren Glyph-Namen.

Gruppiert nach OpenType-Feature mit Chip und Klartext-Beschreibung (`liga` Standard, `dlig` optional, `hlig` historisch, `calt` kontextuell …). Feature-Zuordnung erfolgt über die Feature-Liste; kontextuelle Lookups (Typ 5/6) werden eine Ebene tief aufgelöst, damit auch die von ihnen aufgerufenen Substitutionen ihr Feature-Tag erhalten. Große Gruppen laden in Schritten von 60 nach — Inter allein bringt 633 `calt`-Substitutionen mit. Fehlen Ligaturen, unterscheidet der Empty-State, ob die Schrift gar keine GSUB-Tabelle hat oder nur keine Ligature-Substitution.

Die Ligatur selbst wird als SVG-Pfad gezeichnet, nicht als Text — anders wären Glyphen wie `f_f_l` oder `L_periodcentered.loclCAT` gar nicht darstellbar, da sie keinen Codepoint besitzen. Ein Klick auf das Ergebnis öffnet dessen Detailansicht.

### Sprachabdeckung

Gleicht den Zeichenvorrat gegen 99 Orthografien ab (Latein, Kyrillisch, Griechisch) und berechnet je Sprache `vorhandene / benötigte Zeichen`.

- **Zusammenfassung** als Badge: *„X Sprachen vollständig unterstützt (100 % Abdeckung)"*.
- **Drei Reiter:** Vollständig (100 %), Teilweise (≥ Schwelle) und Nicht unterstützt, jeweils mit Fortschrittsbalken und Quote.
- **Detail per Klick:** listet exakt die **fehlenden Zeichen** auf — bei Inters Google-Fonts-Subset etwa Französisch mit 98,8 %, dem genau das `Ÿ` fehlt.
- **Schwelle konfigurierbar** (50–90 %).

Die Referenz ist bewusst kuratiert statt vollständig CLDR-basiert: Lateinschriftliche Sprachen setzen auf dem Grundalphabet A–Z/a–z auf und ergänzen ihre Sonderzeichen, kyrillische und griechische Alphabete sind vollständig notiert. Ziffern und Interpunktion bleiben außen vor, weil sie nicht sprachbestimmend sind.

### Zero-CLS CSS-Generator

Erzeugt zwei `@font-face`-Blöcke: den echten Webfont und einen metrisch kompensierten Fallback mit `size-adjust`, `ascent-override`, `descent-override` und `line-gap-override`, dazu die passende `font-family`-Kette. Kommentare im generierten CSS nennen die Berechnungsbasis. Copy-Button daneben.

### Markdown-Report

Ein Klick auf **Report kopieren** legt den kompletten Analysestand als Markdown in die Zwischenablage: Dateiübersicht, Achsen, alle vertikalen Metriken, das Bit-7-Audit, die Stress-Test-Ergebnisse mit Messwerten, das aktuelle Render-Setup und das generierte CSS. Gedacht zum Einkleben in Tickets, PR-Beschreibungen oder Font-Entscheidungsprotokolle.

### Floating Action Group & Shortcuts

Unten rechts sitzt eine schwebende Aktionsgruppe (`fixed bottom-4 right-4 z-20 flex items-center gap-2`), identisch aufgebaut wie in `image-compressor` und `svg-optimizer`:

- **Info-Button (rund):** Öffnet das *App Info*-Modal mit App-Icon, Version 1.5.1, Copyright und Link zum GitHub-Profil.
- **Shortcuts-Button (Pill):** Öffnet eine kompakte Übersicht aller Tastaturkürzel:
  - <kbd>Esc</kbd> — Schließt alle geöffneten Modale oder Glyphen-Inspektoren.
  - <kbd>G</kbd> — Schaltet die Anatomy Guides ein oder aus.
  - <kbd>V</kbd> — Wechselt zwischen Split- und Overlay-Diff-Ansicht.
  - <kbd>X</kbd> — Vertauscht Slot A und B (Swap).
  - <kbd>?</kbd> — Öffnet die Shortcut-Hilfe direkt per Tastatur.
- Die Shortcuts sind gegen unbeabsichtigtes Auslösen geschützt, wenn der Fokus in einem Textfeld oder `contenteditable`-Bereich liegt.

---

## Wie die Zahlen zustande kommen

Damit die Ausgabe nachvollziehbar bleibt, hier die drei nicht offensichtlichen Rechnungen:

**Effektive Zeilenhöhe.** Ist Bit 7 gesetzt, gilt `sTypoAscender + |sTypoDescender| + sTypoLineGap`. Ist es nicht gesetzt, gilt `usWinAscent + usWinDescent` (Windows) bzw. `hhea` (macOS/Chrome) — beide Werte werden angezeigt, damit der Plattformunterschied sichtbar bleibt. Der Prozentvergleich zwischen A und B erfolgt auf den **UPM-normalisierten** Werten, sonst wären Schriften mit 1000 und 2048 Units nicht vergleichbar.

**Baseline.** Wird nicht aus den Metriken geschätzt, sondern gemessen: Ein `inline-block` der Höhe 0 sitzt mit seiner Unterkante exakt auf der Baseline. Das erfasst auch die Half-Leading-Verteilung der Rendering-Engine, die eine reine Metrik-Rechnung nur annähern könnte. Die berechnete Variante existiert als Fallback.

**size-adjust.** Das Verhältnis der mittleren Glyphenbreiten (`OS/2.xAvgCharWidth`, jeweils durch UPM geteilt); fehlt der Wert, wird auf das x-Height-Verhältnis ausgewichen. Weil `ascent-override` und Co. sich laut CSS-Spezifikation auf die **bereits size-adjusted** em-Größe beziehen, werden sie durch dieses Verhältnis geteilt — ein häufiger Fehler in selbstgebauten Rechnern.

---

## Technik & Abhängigkeiten

Eine Datei, kein Build-Schritt, kein Framework. Vanilla JS in einer IIFE, Tailwind für das Layout, SVG für die Hilfslinien.

| Abhängigkeit | Bezug | Zweck |
| :--- | :--- | :--- |
| fontkit 1.1.1 | **in `index.htm` eingebettet** (758 KB) | Binär-Parsing |
| wawoff2 2.0.1 | **in `index.htm` eingebettet** (322 KB, WASM als base64 enthalten) | WOFF2-Fallback-Decoder |
| Tailwind CSS | `cdn.tailwindcss.com` | ausschließlich Styling |

Beide Bibliotheken sind SINGLE_FILE-Builds ohne separate `.wasm`-Datei. `Module.decompress` von wawoff2 wird erst per embind zur Laufzeit registriert; das Tool wartet deshalb auf die Initialisierung, statt blind zuzugreifen.

**Warum `@pdf-lib/fontkit` und nicht `fontkit` selbst?** fontkit 2.x veröffentlicht keinen Standalone-Build: Der oft zitierte Pfad `fontkit@2.0.4/dist/fontkit.umd.min.js` existiert nicht (404), und die tatsächlich ausgelieferten Bundles (`browser.cjs`, `browser-module.mjs`) enthalten zehn externe `require()`-Aufrufe (restructure, brotli, unicode-trie, dfa, …) — ohne Bundler im Browser nicht lauffähig. Der pdf-lib-Fork ist derselbe Parser als eine einzelne UMD-Datei mit eingebettetem Brotli-Decoder und Buffer-Polyfill, stellt global `fontkit.create(Uint8Array)` bereit und kommt ohne WebAssembly aus.

**Offline-Betrieb.** Seit 1.3.0 steht der komplette Parser als `<script>`-Block in `index.htm` — daher die Dateigröße von rund 845 KB. Für die Analyse wird nichts mehr nachgeladen. Nur Tailwind kommt weiterhin vom CDN und betrifft ausschließlich das Aussehen; wer auch das lokal will, ersetzt den Script-Tag durch eine gebaute CSS-Datei.

**Bibliotheken aktualisieren.** fontkit: Inhalt von `https://cdn.jsdelivr.net/npm/@pdf-lib/fontkit@<version>/dist/fontkit.umd.min.js` herunterladen; wawoff2: `https://unpkg.com/wawoff2@<version>/build/decompress_binding.js`. Jeweils den eingebetteten Block ersetzen. Keines der Bundles enthält eine `</script>`-Sequenz, beide lassen sich also unverändert einsetzen.

**Warum kein Web Worker?** fontkit-Objekte sind nicht strukturiert klonbar, und der Parser müsste im Worker ein zweites Mal geladen werden (+758 KB in einer Datei, die genau das vermeiden soll). Stattdessen laufen die teuren Schleifen — Glyphen-Index, Sprachabgleich — in Häppchen und geben regelmäßig an den Event-Loop ab. Gemessen: 4027 Glyphen-Namen in ~60 ms, 200 SVG-Pfade in ~4 ms, der Sprachabgleich über 99 Orthografien liegt im einstelligen Millisekundenbereich.

**Browser.** Getestet in aktuellen Chromium-Browsern. Vorausgesetzt werden `FontFace` mit `ArrayBuffer`, `File.arrayBuffer()`, CSS-`size-adjust`/`*-override` (nur für die Nutzung des generierten CSS, nicht für das Tool selbst) und `navigator.clipboard`; für Letzteres existiert ein `execCommand`-Fallback, falls der Kontext als unsicher gilt.

---

## Bekannte Einschränkungen

- **Metriken variabler Schriften stammen von der Default-Instanz.** fontkits `getVariation()` liefert in diesem Build für WOFF2 ein Face mit undefinierten Tabellen, der Aufruf ist deshalb entfernt. In der Praxis fällt das kaum ins Gewicht: Ohne `MVAR`-Tabelle sind die vertikalen Metriken über alle Instanzen identisch — die Tabelle weist eigens aus, ob eine `MVAR` vorliegt. Die **Darstellung** folgt dem Slider selbstverständlich exakt, sie läuft über die native Font-Engine.
- **Einzelne fontkit-Getter werfen bei ungewöhnlichen Fonts.** Bekannt: `namedVariations` bei mehrachsigen Variable Fonts mit nicht auflösbaren Instanz-Namen. Seit 1.3.0 ist jeder Lesezugriff einzeln gekapselt — betroffene Felder melden „nicht lesbar", alles andere wird normal ausgewertet.
- **TrueType-Collections (`.ttc`)** werden mit ihrem ersten Face analysiert; eine Face-Auswahl gibt es nicht.
- **Tailwind kommt vom Play-CDN**, das für Produktivseiten nicht gedacht ist. Für dieses interne Werkzeug ist das in Ordnung, es erzeugt aber eine Konsolenwarnung.
- **Der Stress-Test misst im aktuellen Browser auf dieser Plattform.** Windows-Ergebnisse können abweichen, gerade wenn Bit 7 nicht gesetzt ist — dafür stehen `usWin*` und `hhea` beide in der Tabelle.
- **Sehr große Schriften** (CJK, mehrere MB) brauchen beim Parsen spürbar Zeit, weil die Dekomprimierung in JavaScript läuft.
- Die Hilfslinien beziehen sich auf die **erste Zeile** der Vorschau.

---

## Debug-Hook

Für Tests ohne Drag & Drop stellt die App `window.FontStudio` bereit:

```js
// Datei aus einem Fetch heraus in Slot A laden
const blob = await (await fetch('/inter.woff2')).blob();
await FontStudio.loadFont(new File([blob], 'Inter.woff2'), 'fontA');

FontStudio.metricsOf('fontA');  // alle ausgelesenen Metriken als Objekt
FontStudio.state;               // kompletter UI-Zustand
FontStudio.report();            // Markdown-Report als String
FontStudio.parserPfad('fontA'); // "fontkit direkt" oder "wawoff2 → fontkit (Fallback)"
FontStudio.decoderBereit();     // ist der wawoff2-Decoder initialisiert?
FontStudio.entpackeWoff2(u8);   // WOFF2 → SFNT (Uint8Array), unabhängig vom Rest
```

Die Zeichensatz-Analyse hängt am selben Zustand: Der Glyphen-Index je Font wird einmalig gebaut und danach von Explorer, Ligaturen-Inspektor und Sprachabdeckung gemeinsam genutzt.

Den Fallback gezielt testen, indem fontkit für WOFF2 künstlich zum Scheitern gebracht wird:

```js
const orig = fontkit.create;
fontkit.create = function (u8) {
  if (String.fromCharCode(u8[0], u8[1], u8[2], u8[3]) === 'wOF2') throw new Error('Test');
  return orig.apply(this, arguments);
};
// Datei laden -> FontStudio.parserPfad(...) muss "wawoff2 → fontkit (Fallback)" melden
fontkit.create = orig;
```

---

## Projektstruktur & Versionierung

```
font-checker/
├── index.htm          aktuelle Version (1.5.0)
├── README.md          diese Datei
├── session.md         Arbeitsprotokoll des fontkit-Refactorings
└── _backup/
    ├── index-0-5-0.htm
    ├── index-0-7-0.htm
    ├── index-0-8-0.htm
    ├── index-1-0-0.htm
    ├── index-1-1-0.htm
    ├── index-1-1-5.htm
    ├── index-1-1-6.htm
    ├── index-1-2-5.htm
    ├── index-1-3-0.htm
    └── index-1-4-0.htm
```

Konvention: Vor einem größeren Eingriff wandert der Stand als `index-<major>-<minor>-<patch>.htm` nach `_backup/`. Die Versionsnummer steht im Dateikopf von `index.htm` und als Chip neben dem Titel in der Kopfzeile.

---

## Changelog

### 1.5.1 — Corporate UI Alignment & UX-Feinschliff

- **Corporate UI Alignment:** Vollständige Angleichung des Designs an das Monorepo-Designsystem (`@repo/ui` wie in Image Compressor & SVG Optimizer):
  - Helles Farb- und Token-System (`--c-bg: #FAFBFC`, `--c-surface: #FFFFFF`, `--c-border: #E2E5EA`, Inter-Typografie).
  - Glassmorphic Sticky-Header mit Logo-Badge, segmentiertem View-Switcher (`Side-by-Side` / `Overlay Diff`), Schnellaktionen und grünem `Private`-Badge.
  - 4-Spalten-Steuerungs-Toolbar im Corporate Card-Stil, Apple-Style Schieberegler, segmentierte Ausrichtungs-Pills (`L`, `C`, `R`, `J`) und Custom Dropdown-Chevrons.
  - Dropzones (Slot A/B), Bühnen, Stress-Test, fsSelection Bit-Audit, Metrik-Tabellen, Zeichensatz-Explorer und Zero-CLS Fallback CSS Generator visuell vereinheitlicht.
- **Monorepo-Integration:**
  - `apps/font-checker` als `@repo/font-checker` im Monorepo mit Vite-Dev-Server auf Port `3002` eingebunden.
  - Turborepo-Support für parallele Entwicklung (`npm run dev`) und Build (`npm run build`).
  - `index.html` und `index.htm` synchronisiert für dualen Betrieb (Vite-Dev-Server und autarke Einzeldatei/`file://`).
- **Typografische Hilfslinien (Anatomy Guides):**
  - Textkontur der Labels (*Ascender Line, Cap Line, Waist Line, Baseline, Descender Line*) auf sauberes Weiß (`stroke="#ffffff"`) umgestellt, sodass farbige Beschriftungen über dunklen Glyphen und weißem Hintergrund gestochen scharf lesbar sind.
- **Variable Font Weight Slider:**
  - Schrittweite auf **10er-Schritte** (`step="10"`) umgestellt (statt 1er-Schritte), inklusive Rundung der Startwerte auf glatte Zehner.
- **Bereinigung & Entschachtelung:**
  - Redundanter Engine-Badge im Header entfernt (durch `Private`-Badge und Fehlerbanner abgedeckt).
  - Obsolete Footer-Infoleiste am Seitenende entfernt.
  - Verschachtelte graue Boxen im **UI Component Stress-Test** und **OS/2 fsSelection Bit-Audit** entfernt — Spalten für Font A & B sitzen nun mit dezentem `border-t` direkt auf der Card-Ebene.

### 1.5.0 — Glyphen, Ligaturen, Sprachen

- **Glyphen-Explorer** mit SVG-Raster über alle Glyphen, Suche nach Zeichen/Codepoint/Name, Filter über 25 Unicode-Blöcke und Nachladen in 200er-Schritten.
- **Glyphen-Detailansicht** als Modal mit Hilfslinien, Side Bearings, vollständigen Metadaten und Copy-Buttons.
- **Ligaturen-Inspektor** über die GSUB-Tabelle, gruppiert nach OpenType-Feature, mit Auflösung von Extension- und kontextuellen Lookups.
- **Sprachabdeckung** gegen 99 Orthografien mit Quote, Reitern, konfigurierbarer Schwelle und Auflistung der fehlenden Zeichen.
- **Font-A/B-Umschalter** für alle drei Analysen.
- Alle drei Panels arbeiten auf einem gemeinsamen, je Font einmalig gebauten Glyphen-Index; die Aufbauschleifen geben regelmäßig an den Event-Loop ab.

### 1.4.0 — wawoff2 als Fallback

- **Zweiter Entpack-Pfad nach dem Vorbild von fontdrop.info.** Scheitert `fontkit.create()` an einer WOFF2-Datei, entpackt wawoff2 sie zu SFNT und fontkit liest das Ergebnis. In den Tests entpackt wawoff2 in 1–20 ms.
- **Auch die Vorschau hat jetzt einen Fallback:** Lehnt der Browser die WOFF2-Datei bei `FontFace.load()` ab, wird das entpackte SFNT registriert.
- **wawoff2 ebenfalls eingebettet** (322 KB inklusive WASM als base64-Data-URI) — die Offline-Fähigkeit bleibt vollständig erhalten. Datei dadurch ca. 1,17 MB.
- **Neu: „Parser-Pfad"** in der Vergleichstabelle, in der Diagnoseleiste, in der Slot-Zeile und im Markdown-Report — sichtbar, ob fontkit direkt gelesen hat oder wawoff2 einspringen musste.
- Debug-Hook erweitert um `FontStudio.entpackeWoff2()`, `FontStudio.decoderBereit()` und `FontStudio.parserPfad()`.

### 1.3.0 — Offline-fähig und absturzsicher

- **fontkit vollständig eingebettet.** Der Parser steht als `<script>`-Block in der Datei, für die Analyse wird kein CDN mehr abgerufen. Das Tool läuft damit offline, hinter Proxys, mit Content-Blockern und per Doppelklick über `file://`.
- **Absturz behoben, der die gesamte Auswertung lahmlegte.** `font.namedVariations` wirft bei manchen mehrachsigen Variable Fonts (`Cannot read properties of undefined (reading 'en')`). Weil der Zugriff mitten in der Metrik-Auswertung lag, riss ein einziges defektes Namensfeld den kompletten Render-Durchlauf mit — **keine Hilfslinien, keine Legende, keine Tabellenwerte**. Jeder fontkit-Lesezugriff läuft jetzt über `safeRead()`; nicht lesbare Felder werden als solche ausgewiesen, der Rest normal ausgewertet.
- **Neue Diagnoseleiste** unter dem Header: Engine-Zustand, Parse-Status je Slot, Guide-Zustand, Render-Fehler im Klartext.
- **Sicherheitsnetz um den Render-Durchlauf:** Ein Fehler blendet jetzt eine Meldung ein, statt die Oberfläche stumm leer zu lassen.
- **Hilfslinien schalten sich beim ersten geparsten Font automatisch ein.**
- Korrektur zur Historie: Das in 1.1.6 entfernte `wawoff2` lädt **keine** externe `.wasm` — es ist ein SINGLE_FILE-Build mit eingebettetem WASM als base64-Data-URI. Die damalige Begründung für den Ausbau war sachlich falsch (Details in `session.md`).

### 1.2.5 — Umstieg auf fontkit

- **Parsing-Engine komplett ersetzt:** opentype.js und der selbstgebaute WOFF2-Header-Scanner sind raus, fontkit liest jetzt alle Formate über denselben Pfad. WOFF2-Metriken sind damit erstmals exakt statt geschätzt.
- Neu: **fsSelection-Bit-Audit** als eigener Abschnitt mit allen zehn Bits, Hex-/Dezimalwert und ausgeschriebener `& 0x80`-Rechnung.
- Neu: **Zweite Stress-Test-Warnung `CLIPPING RISK`**, die den aus den Metriken berechneten Platzbedarf gegen die Content-Box prüft — der Fall, den `scrollHeight` bei starren Inputs nicht meldet.
- Neu: **Statuszeile pro Slot** (Format, Größe, Glyphen, UPM) und **Engine-Badge** mit Fehlerbanner, falls fontkit nicht geladen werden kann.
- Neu: **Legende ist interaktiv** — jede der fünf Hilfslinien lässt sich einzeln zuschalten.
- **Baseline wird jetzt gemessen** statt gerechnet; die Metrik-Rechnung bleibt als Fallback.
- Metriken-Tabelle deutlich erweitert (Zeichenumfang, Glyph-BBox, Vendor-ID, `fsType`, Named Instances, OpenType-Features, `MVAR`-Hinweis) und in vier Blöcke gegliedert.
- Zero-CLS-Generator rechnet `size-adjust` nun über `xAvgCharWidth` und normalisiert die Overrides korrekt auf die size-adjusted em-Größe; `line-gap-override` kommt hinzu.
- Markdown-Report um Achsen, Render-Setup, Rohwerte und Zeitstempel erweitert; Clipboard mit Fallback für unsichere Kontexte.
- Effective-Height-Vergleich rechnet UPM-normalisiert — Schriften mit unterschiedlichem UPM werden dadurch erst korrekt vergleichbar.
- `FontFace` bekommt passende `weight`-/`style`-Deskriptoren, Reset räumt registrierte Faces wieder ab.
- Aufräumarbeiten: Debug-Hook `window.FontStudio`, Messung unabhängig von `requestAnimationFrame` (funktioniert dadurch auch in Hintergrund-Tabs), SVG-Beschriftungen mit dunklem Halo.

### 1.1.6 — Eigener WOFF2-Reader

- `wawoff2` wieder entfernt, weil es eine WebAssembly-Datei nachlädt und damit `file://` und abgeschottete Netze bricht.
- Stattdessen ein handgeschriebener WOFF2-Header-Parser plus heuristischer Binär-Scan nach `head`- und `OS/2`-Signaturen. Funktionierte, lieferte aber nur genäherte Werte — der Auslöser für 1.2.5.

### 1.1.5 — Variable Fonts

- `fvar`-Erkennung mit Weight-Slider über den echten Achsbereich; statische Schriften zeigen `usWeightClass`.

### 1.1.0 — WOFF2-Versuch mit wawoff2

- Einbindung von `wawoff2` (WASM) zur WOFF2-Dekomprimierung, damit opentype.js die Tabellen lesen kann.

### 1.0.0 — Anatomy Guides

- SVG-Hilfslinien für Ascender, Cap, x-Height, Baseline und Descender, mit Legende und Toggle in der Kopfzeile.

### 0.8.0 — Report-Export

- Markdown-Export aller Analysedaten in die Zwischenablage.

### 0.7.0 — Stress-Test

- UI-Component-Stress-Test mit zwei 40-px-Inputs, `OVERFLOW DETECTED`-Badge und Typo-Height-Shift-Anzeige.

### 0.5.0 — Grundgerüst

- Bento-Grid-Dark-Interface, Side-by-Side und Overlay-Diff, editierbarer Beispieltext, Größen-/Line-Height-/Tracking-Regler, Metriken-Tabelle und erster CLS-Fallback-Generator auf Basis von opentype.js.

> Die Einträge bis 1.1.6 sind aus den Dateien in `_backup/` rekonstruiert. Zwischen 1.1.6 und 1.2.5 liegen dort keine weiteren Stände.

---

## Ideen für später

- Tailwind lokal einbetten, damit auch die Darstellung ohne Netz stimmt
- Weitere Variable-Achsen unterstützen (`wdth`, `opsz`, `slnt`) statt nur `wght`
- Vergleich gegen die Metriken echter System-Fallbacks (Arial, Helvetica, Georgia) für praxisnähere `size-adjust`-Werte
- Report zusätzlich als `.md`-Datei herunterladen statt nur in die Zwischenablage
- Kerning-/Ligatur-Inspektor über die vorhandenen `availableFeatures`

---

## Lizenz & Credits

Internes Werkzeug. Verwendete Bibliotheken: [fontkit](https://github.com/foliojs/fontkit) (MIT, hier als `@pdf-lib/fontkit`-UMD-Build) und [Tailwind CSS](https://tailwindcss.com) (MIT).

Analysierte Schriftdateien bleiben vollständig im Browser — es findet kein Upload statt. Für die Nutzung der Schriften selbst gelten deren jeweilige Lizenzbedingungen; die im Tool angezeigten `fsType`-Embedding-Rechte sind ein technischer Hinweis, keine Rechtsauskunft.
