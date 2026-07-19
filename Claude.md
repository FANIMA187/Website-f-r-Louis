# CLAUDE.md – L. Molitor Erd- & Tiefbau (Website)

> Diese Datei wird von Claude bei jeder Aufgabe automatisch gelesen.
> Sie definiert, WIE in diesem Projekt gearbeitet wird. Bitte konsequent einhalten.

---

## 1. Über das Projekt

Neue Website für **L. Molitor**, ein **Einzelunternehmen für Erd- & Tiefbau**
unter Leitung von **Louis Molitor**. Frisch gegründet (**01.04.2026**) – aus dem
Traum vom eigenen Bagger und dem Wunsch, sich etwas Eigenes aufzubauen.

**Ziel:** Eine erste professionelle Website, die einem neu gegründeten Betrieb
sofort Seriosität, Vertrauen und Handwerks-Stolz verleiht. Der frische Start ist
dabei ein Vorteil, kein Nachteil: „frisch, motiviert, persönlicher Kontakt“.

**Werte der Marke:** ehrliche Handarbeit, Zuverlässigkeit, persönlicher Kontakt,
Bodenständigkeit, regionale Nähe. Ein Mann, seine Maschine, saubere Arbeit.

**Domain (Wunsch):** molitor-bau.de

> **Kundenbriefing:** Der vollständige Kunden-Kontext (Original-Antworten aus dem
> Fragebogen von Louis) liegt in **`KONTEXT.md`**. Dort stehen O-Ton-Angaben zu
> Leistungen, Zielgruppe, Look, typischem Wunsch-Auftrag und offenen Punkten.
> Diese CLAUDE.md ist die *aufbereitete Arbeits-Anweisung*, `KONTEXT.md` die
> *Rohquelle*. Bei Widersprüchen gilt CLAUDE.md – oder kurz nachfragen.

---

## 2. Marken-Identität (WICHTIG – das macht Molitor aus)

### Look & Richtung
**Rough / industriell** kombiniert mit **bodenständig / regional** – dunkel,
roh, ehrlich, aber aufgeräumt und wertig. Kein steriler Corporate-Look, sondern
der Charakter von Baustelle, Maschine und Erde. Handfest und nahbar.

Referenz, die dem Kunden gefällt: **dimaxbau.de** (als Richtungs-Orientierung,
nicht zum Nachbauen).

### Farbwelt (Bagger-Gelb/Ocker auf dunklem Anthrazit)
Leitfarbe ist das **warme Gelb/Ocker von Volvo-Baggern** als Akzent, kombiniert
mit tiefem Anthrazit/Fast-Schwarz und neutralen Grautönen. Das ergibt den
robusten, maschinenhaften „Baustellen“-Look.

```css
:root {
  /* Ground — tiefes Anthrazit, roh und maschinell */
  --bg:          #14140f;   /* fast schwarz, minimal warm */
  --surface:     #1c1c17;   /* Karten/Flächen, leicht heller */
  --surface-2:   #26261f;

  /* Akzent — Bagger-Gelb/Ocker (Volvo), edel und sparsam einsetzen */
  --primary:     #DA9343;   /* Bagger-Gelb/Ocker (vom Kunden gewählt) */
  --primary-hi:  #e9a95f;   /* helleres Ocker für Hover */
  --primary-dim: #9c6a2e;   /* gedämpft, für dezente Flächen/Ränder */

  /* Ink / Text */
  --ink:         #f2efe8;   /* warmes Off-White */
  --ink-2:       #b7b3a8;   /* gedämpft */
  --muted:       #77736a;

  --border:      #2c2c23;
}
```
> Hinweis: Werte sind ein moderner Startpunkt, kein Dogma. Feinschliff erlaubt,
> solange die Welt **Ocker/Gelb auf dunklem Anthrazit** klar erhalten bleibt.
> Das Gelb immer als **Akzent** (Buttons, Highlights, Linien, Hover) – nie
> großflächig als Hintergrund, sonst wird es fürs Auge anstrengend.

### Typografie
Kräftig, industriell, gut lesbar – passend zum handfesten Charakter.
**Aktuell im Code gesetzt** (selbst gehostet als WOFF2, DSGVO-konform):

- **Display-Schrift `Archivo`** (Variable, 600–900) für Überschriften und die
  Wortmarke – breit, robust, „maschinell“. Die `wdth`-Achse wird für den
  plakativen Look genutzt (breite Versalien).
- **Body-Schrift `Barlow`** (400–700) für Fließtext.
- **Mono-Schrift `JetBrains Mono`** für Kicker, Codes, Labels, Platzhalter-Marker.

```css
--font-display: 'Archivo', system-ui, sans-serif;         /* Überschriften/Wortmarke */
--font-body:    'Barlow', system-ui, sans-serif;          /* Fließtext */
--font-mono:    'JetBrains Mono', ui-monospace, monospace; /* Kicker/Labels/Codes */
```
> Große Überschriften gern in **Versalien (GROSSBUCHSTABEN)** – unterstreicht
> den industriellen, plakativen Look (wie Beschriftung auf Baumaschinen).

### Logo / Wortmarke
Es gibt **noch kein fertiges Logo**, nur eine Idee. Wir bauen es als
**Inline-SVG-Wortmarke** (kein externes Bild), damit es sofort einsatzbereit,
skalierbar und rechtlich unbedenklich ist.

**Aufbau der Wortmarke** (inspiriert vom Bagger-Lettering des Referenz-Betriebs):
- **Vorname „Louis“ klein und schmal** oben drüber
- **Nachname „MOLITOR“ groß und breit** als Hauptelement (Versalien)
- darunter/daneben dezent: **„Erd- & Tiefbau“** als Claim

**Symbol:** eine **stilisierte, minimalistische Bagger-Kette / Kettenlaufwerk**
(klare Linien, ikonisch – nicht foto-realistisch). Sie ersetzt konzeptionell das,
was beim Referenz-Logo das Gehirn-Symbol war: ein einprägsames, branchentypisches
Icon, das die Wortmarke begleitet. Ebenfalls als Inline-SVG umsetzen.

> Kein echtes Fremd-Logo nachbauen. Die Kette ist eine eigenständige, abstrahierte
> Darstellung, keine Kopie eines bestehenden Logos.

### Tonalität
**Sie-Ansprache** – seriös und vertrauensvoll, da auch Gewerbe und Bauträger
angesprochen werden. Trotzdem nahbar, direkt und handwerklich-stolz. Kein
steifes Marketing-Deutsch, keine Übertreibungen. Klar, ehrlich, bodenständig.

---

## 3. Leistungen & Inhalte

**Angebot (laut Kunde):**
- Erd- & Tiefbauarbeiten (Kern)
- Abbrucharbeiten
- Wegebau
- Baggerarbeiten / Aushub
- Pflasterarbeiten
- Erstellen von Bodenplatten

**Besonders hervorheben (Startseiten-Botschaft):**
Erdarbeiten, insbesondere das **Ausschachten von Flächen für Fundamente, Pool
und Hausbau**, sowie **Pflasterarbeiten**.

**Zielgruppe:** Privatkunden (Hausbau, Garten, Grundstück) **und** Gewerbe /
Bauträger.

**Einzugsgebiet:** ca. **60 km** Umkreis. → Für lokale SEO nutzen.

---

## 4. Tech-Stack

- **HTML5** (semantisch), **CSS3** (Vanilla), **Vanilla JavaScript**
- **Erlaubt & gesetzt:** GSAP, ScrollTrigger und Lenis (Smooth Scroll) – sie
  liefern die hochwertigen Animationen.
- Optional wie im Vorprojekt: **Motion**-Library für Micro-Interactions.
- **Weitere externe Libraries nur nach Rückfrage.**
- Kein React/Vue/Next, kein Tailwind, kein jQuery.
- Einbindung der Libraries per ESM Import Map, **kein Build-Step**.
- **Deployment:** GitHub Pages.

---

## 5. Projektstruktur

```
molitor-bau/
├── CLAUDE.md
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    ├── images/
    └── icons/
```
- CSS in `css/`, JS in `js/`, Bilder in `assets/images/`, SVG-Icons in `assets/icons/`.
- Keine Inline-Styles, kein Inline-JS (`onclick=...`). Events in `main.js`.

**Aktueller Stand (Juli 2026):** Die **Startseite (`index.html`)** steht im
Grundgerüst: Header/Nav, Hero, Leistungen, Über uns, Warum Molitor, Ablauf,
Einzugsgebiet, Kontaktformular, Footer. `style.css` und `main.js` sind
entsprechend aufgebaut (Icon-Sprite inline, Foto-Platzhalter, progressive
Animationen). Wir bauen von hier aus **weiter** – bestehende Struktur,
Klassen-Namen und Konventionen fortführen, nicht neu erfinden.

---

## 6. Arbeitsweise / Workflow

**Vor jeder Code-Aufgabe: erst einen kurzen Plan vorlegen (3–6 Stichpunkte),
auf mein OK warten, dann coden.** (Plan Mode.) Kleine, eindeutige Änderungen
(Tippfehler, Farbwert) direkt.

- Nutze die global installierten Skills für gestalterische Entscheidungen:
  `frontend-design`, `ui-ux-pro-max`, `ckm:design`, `ckm:design-system`,
  `ckm:ui-styling`, `ckm:brand`.
- Keine Platzhalter-Texte ohne Hinweis. Bei Unklarheit nachfragen.
- Nach Änderungen kurz zusammenfassen, was geändert wurde und warum.

---

## 7. CSS-Konventionen (BEM)

```css
.card { }            /* Block */
.card__title { }     /* Element */
.card--featured { }  /* Modifier */
```
- Klassennamen englisch, klein, mit Bindestrich (`hero-section`).
- Keine IDs fürs Styling (nur für JS/Anker).
- **Mobile-First**, dann `@media (min-width: …)`.
- Alle Farben/Schriften/Abstände als CSS-Variablen oben in der Datei.
- Vorsicht bei Selektor-Spezifität, damit sich Paddings/Margins nicht
  gegenseitig aufheben.

---

## 8. JavaScript-Konventionen

- `camelCase`, `const`/`let` (nie `var`), sprechende Namen.
- Kurze, kommentierte Funktionen. Kein `localStorage`/`sessionStorage`.

---

## 9. Animationen (das Herzstück des frischen Looks)

- **GSAP + ScrollTrigger** für Scroll-Reveals und orchestrierte Momente.
- **Lenis** für sanftes Scrollen.
- Ein orchestrierter Moment wirkt stärker als viele verstreute Effekte –
  dezent und elegant, nicht überladen (sonst wirkt es „AI-generiert“).
- **Inhalt muss ohne JavaScript voll sichtbar sein** (Initial-States per JS
  setzen, nicht im CSS verstecken) – wichtig für SEO & Barrierefreiheit.
- `prefers-reduced-motion` respektieren: Animationen dann abschalten.

---

## 10. Design-Prinzipien (Pflicht)

**Responsive:** Mobile-First, sauber auf Smartphone/Tablet/Desktop.

**Performance:** Bilder als WebP, `loading="lazy"` für nicht-sichtbare Bilder,
wenig externe Requests. Schnelle Ladezeit hat Vorrang.

**Barrierefreiheit:** semantisches HTML (`<header> <nav> <main> <section>
<footer>`), sinnvolle `alt`-Texte, ausreichende Kontraste (Ocker auf Anthrazit
prüfen!), sichtbarer Tastatur-Fokus.

**SEO – lokal besonders wichtig (Einzugsgebiet ~60 km):**
- `<title>` und `<meta name="description">` pro Seite.
- Eine `<h1>` pro Seite, saubere Überschriften-Hierarchie.
- **Schema.org `LocalBusiness`**: Name, Adresse, Telefon, Einzugsgebiet,
  Öffnungszeiten – wichtig für Google Maps & lokale Suche.
- Keywords natürlich einsetzen: Erdbau, Tiefbau, Baggerarbeiten, Aushub,
  Pflasterarbeiten, + Region/Städte im 60-km-Umkreis.
- Open-Graph-Tags fürs Teilen.

---

## 11. Kontakt & Funktion

- **Anfragen sollen ankommen über:** Anfrageformular, Telefon, WhatsApp.
  *(Genaue Kanäle beim Kunden final bestätigen.)*
- **Formularfelder (laut Kunde):** Kontakt, Projektart, Ort, gewünschter
  Zeitraum. (Ergänzend: Name, Nachricht.)
- Formular zunächst funktional vorbereiten; Versand-Anbindung (z. B. per
  Formspree o. Ä.) klären, bevor es live geht.

---

## 12. Bilder & rechtliche Vorgaben

Der Kunde hat aktuell **nur wenige eigene Fotos** (nach eigener Einschätzung
kaum brauchbar). Start daher mit Platzhaltern/Stock, später Austausch gegen
echte Aufnahmen (eigene Kamera vorhanden, Fotoshooting möglich).

- Verwende für Demos **NIEMALS** echte Bilder fremder Personen, echte
  Markenlogos oder echte Fremd-Arbeiten, solange ich nicht ausdrücklich sage,
  dass die Rechte geklärt sind oder ich die Dateien selbst bereitstelle.
- **Wichtig:** Die Marken **Volvo**, **CAT** o. Ä. sowie Fotos fremder Betriebe
  (z. B. aus Instagram) nicht verwenden. Das Volvo-Gelb dient nur als
  **Farb-Inspiration**, nicht als Markenbezug – Volvo nirgends nennen/zeigen.
- Setze an Stellen, wo echte Fotos stünden, standardmäßig **Icons/SVGs aus einer
  freien Icon-Library (Lucide oder Tabler, MIT-Lizenz)** als Platzhalter ein –
  passend zu Stil und Thema (Bagger, Erde, Werkzeug, Kette). Style sie zum
  Design (Ocker-Akzent auf dunklem Anthrazit).
- Für flächige Platzhalter hochwertige, lizenzfreie Stock-Fotos
  (Unsplash/Pexels) verwenden und als Platzhalter kennzeichnen.
- Schreib für jedes Bild/Icon einen neutralen, konkreten **Alt-Text**.
- **Erfinde keine rechtlich relevanten Angaben** (Impressum, Datenschutz,
  Adressen, USt-IdNr.). Impressum ist laut Kunde **noch nicht vollständig** –
  alles als deutlich gekennzeichnete Platzhalter lassen.
- Weise mich aktiv auf mögliche rechtliche Probleme hin (Urheberrecht,
  Markenrecht, DSGVO), **bevor** du sie umsetzt.
- Diese Regeln gelten, bis ich für den konkreten Fall ausdrücklich das
  Gegenteil bestätige.

---

## 13. Kommunikation mit mir

- Antworten und Code-Kommentare auf **Deutsch**.
- Direkt und ehrlich – wenn etwas eine schlechte Idee ist, sag es.
- Technische Entscheidungen kurz erklären, damit ich dazulerne.

---

## 14. Offene Punkte (beim Kunden klären)

- Genaue Kontakt-Kanäle (Formular/Telefon/WhatsApp/E-Mail/Rückruf) final
  bestätigen.
- Impressums-Daten vervollständigen (was fehlt, ab wann verfügbar).
- Datenschutzerklärung: Inhalte/Zuständigkeit klären.
- Budget-Rahmen und Wunsch-Launch-Termin.
- Ob Louis selbst als Ansprechpartner (Foto/Name) auftauchen möchte (noch
  unsicher).
- Logo final abstimmen, sobald die SVG-Wortmarke steht.