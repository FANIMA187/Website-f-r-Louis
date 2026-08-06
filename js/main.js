/* =====================================================================
   L. Molitor Erd- & Tiefbau – main.js
   Kern-UI (Menü, Header, Formular, Jahr) läuft immer und ohne Libraries.
   Smooth-Scroll (Lenis) & Scroll-Reveals (GSAP) werden progressiv per
   dynamischem import() nachgeladen – fällt das CDN aus, bleibt die Seite
   voll bedienbar und der Inhalt sichtbar.
   ===================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------ Jahr im Footer ----------------------- */
function initYear() {
  const el = document.querySelector('[data-year]');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* ------------------------------ Header verdichten -------------------- */
function initHeaderScroll() {
  const header = document.querySelector('[data-header]');
  if (!header) return;

  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* ------------------------------ Mobiles Menü ------------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-mobile-menu]');
  if (!toggle || !menu) return;

  const setOpen = (open) => {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
    toggle.querySelector('use')?.setAttribute('href', open ? '#i-close' : '#i-menu');
  };

  toggle.addEventListener('click', () => setOpen(menu.hidden));

  // Beim Klick auf einen Menüpunkt schließen
  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  // Escape schließt das Menü
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
}

/* ------------------------------ Formular-UX -------------------------- */
function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;
  const note = form.querySelector('[data-form-note]');

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Versand noch nicht angebunden – siehe Plan §7
    let firstInvalid = null;

    // Pflichtfelder prüfen (name, contact)
    form.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.form__field');
      const empty = !field.value.trim();
      wrapper?.classList.toggle('form__field--invalid', empty);
      if (empty && !firstInvalid) firstInvalid = field;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      if (note) note.textContent = 'Bitte Name und Kontakt ausfüllen, damit wir uns bei Ihnen melden können.';
      return;
    }

    // Gültig, aber (noch) kein Backend: ehrliche Rückmeldung
    if (note) {
      note.textContent = 'Danke! Der Online-Versand ist noch nicht aktiv – bitte melden Sie sich vorerst telefonisch oder per WhatsApp.';
    }
  });

  // Fehler-Markierung entfernen, sobald getippt wird
  form.querySelectorAll('.form__input, .form__textarea').forEach((field) => {
    field.addEventListener('input', () => {
      field.closest('.form__field')?.classList.remove('form__field--invalid');
    });
  });
}

/* ------------------------------ Animationen (progressiv) ------------- */
async function initAnimations() {
  try {
    const [{ default: gsap }, { default: ScrollTrigger }, { default: Lenis }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
      import('lenis'),
    ]);

    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js-anim');

    // Sanftes Scrollen: lerp = gleichmäßiges, kontinuierliches Glätten.
    // Kein zeitbasiertes Nachgleiten (duration) -> kein Abbremsen/Beschleunigen.
    const lenis = new Lenis({
      lerp: 0.1,          // 1:1-Gefühl, aber weich; höher = direkter, niedriger = weicher
      smoothWheel: true,
      wheelMultiplier: 1, // Scroll-Distanz 1:1 zum Mausrad
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // In-Page-Anker sanft ansteuern (mit Header-Offset)
    const header = document.querySelector('[data-header]');
    const headerH = header ? header.offsetHeight : 0;
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      link.addEventListener('click', (e) => {
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -(headerH + 8) });
      });
    });

    // Scroll-Reveals: Initial-States NUR hier (JS aktiv) setzen.
    // .service-card ist ausgenommen - die bekommt in initHeroPin() einen
    // eigenen, enger an den Hero-Übergang gekoppelten Batch (siehe dort).
    // [data-hero-reveal] (der #leistungen-Kopf) ist ebenfalls ausgenommen -
    // der ist Teil der Hero-Pin-Crossfade-Timeline (initHeroPin), nicht des
    // generischen Batches hier (der würde viel zu früh feuern, siehe dort).
    const items = gsap.utils.toArray('[data-reveal]:not(.service-card):not([data-hero-reveal])');
    gsap.set(items, { opacity: 0, y: 24 });

    ScrollTrigger.batch(items, {
      start: 'top 88%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        stagger: 0.08,
      }),
    });

    initHeroPin(gsap, ScrollTrigger);

    ScrollTrigger.refresh();
  } catch (err) {
    // CDN nicht erreichbar o. Ä.: Inhalt bleibt sichtbar, kein Fehler für Nutzer
    console.warn('Animationen nicht geladen – Seite läuft ohne Effekte weiter.', err);
  }
}

/* ------------------------------ Hero-Pin: Hero → Leistungen ---------- */
/* Pinnt den Hero für GENAU 1 Viewport-Höhe Scroll-Distanz (end:'+=100%')
   mit pinSpacing:false: Hintergrundbild + Primary-Text (Kicker/H1/Subline/
   Buttons) blenden aus, danach löst sich der Pin direkt - kein separater
   Zwischenschritt mehr, #leistungen (mit eigenem .section__head + Karten,
   siehe index.html) liegt schon in normaler Dokument-Position dahinter und
   wird beim Unpin sichtbar. Nur Compositor-Eigenschaften (opacity/transform)
   animiert, damit es auch auf Mobile ruckelfrei bleibt.

   ECHTER CROSSFADE, nicht nur zeitlich versetztes Ein-/Ausblenden (wichtig,
   nicht offensichtlich): .hero__pin selbst ist während des Pins blickdicht
   (background:var(--bg), z-index:5) - eine Fade-in-Animation auf
   #leistungen-Inhalten VOR dem strukturellen Unpin-Moment wäre für den
   Nutzer unsichtbar, egal wie ihr Timing gesetzt ist. Deshalb faded im
   letzten Timeline-Abschnitt .hero__pin SELBST (nicht nur Bild/Text) auf
   opacity:0, überlappend mit dem Einblenden von .section__head/den ersten
   Karten - erst dadurch scheint #leistungen sichtbar durch die zunehmend
   transparente Pin-Fläche, statt dass beides unsichtbar hintereinander
   abläuft und der Nutzer nur einen Hard-Cut sieht.

   WARUM end:'+=100%' UND pinSpacing:false ZUSAMMEN (nicht nur eins von
   beidem) - das ist kein beliebiger Wert:
   - pinSpacing:false verhindert, dass GSAP zusätzlich zur Pin-Distanz auch
     noch die natürliche Höhe des Elements als Nachlauf-Leerraum reserviert
     (Standardverhalten von pin:true/pinSpacing:true, siehe Memory
     reference_gsap_pin_trailing_viewport - führte in der vorletzten Runde zu
     einer vollen Viewport-Höhe schwarzer Leerlauf-Scrollstrecke). Ohne
     Spacer liegt #leistungen die ganze Zeit schon an seiner normalen
     Dokument-Position (gleich hinter dem Hero), nur vom fixierten,
     blickdichten .hero__pin verdeckt.
   - end MUSS dabei exakt '+=100%' sein (= .hero__pin ist genau 100svh
     hoch, siehe style.css .hero__pin), weil #leistungen NICHT künstlich
     verschoben wird: bei Unpin-Scroll-Position X zeigt der Viewport
     Dokument-Y [X, X+Viewporthöhe]; der (jetzt wieder normal
     positionierte) Hero liegt bei [0, Viewporthöhe]. Nur wenn X exakt
     Viewporthöhe entspricht, ist der Hero in genau diesem Moment
     VOLLSTÄNDIG durchgescrollt (kein halb abgeschnittenes "Zusammenpoppen")
     UND #leistungen schon lückenlos direkt darunter sichtbar. Kürzeres end
     = sichtbarer Sprung (nur der untere Hero-Ausschnitt bleibt beim Unpin
     im Bild). Längeres end = der (längst fertig ausgeblendete) Pin steht
     unnötig weiter fixiert - dieselbe Leerlauf-Problematik nur anders
     benannt.
   Der Header wird über einen Fortschritts-Schwellenwert kurz VOR Ende der
   primaryItems-Ausblendung gekoppelt (nicht über onLeave/onEnterBack an
   den äußeren Rändern der Pin-Strecke) – dadurch kippt er im selben Atemzug
   wie das Bild verblasst, nicht abgehackt danach, und exakt spiegelverkehrt
   beim Zurückscrollen. */
function initHeroPin(gsap, ScrollTrigger) {
  const pin = document.querySelector('[data-hero-pin]');
  const bg = pin?.querySelector('[data-hero-bg]');
  const primaryItems = gsap.utils.toArray('[data-hero-primary] [data-reveal]');
  // Leistungen-Kopf (Kicker/Titel/Intro) - siehe index.html, bewusst NICHT
  // im generischen Batch (main.js initAnimations), da er sonst weit vor dem
  // Unpin (schon fertig) einblenden würde, unsichtbar hinter dem blickdichten
  // .hero__pin. Hier Teil derselben Timeline wie das Hero-Ausblenden -
  // echter, sichtbarer Crossfade statt zweier unsichtbar hintereinander
  // laufender Vorgänge.
  const headItems = gsap.utils.toArray('[data-hero-reveal]');
  if (!pin || !bg || !primaryItems.length) return;

  gsap.set(headItems, { opacity: 0, y: 24 });

  // Erste Kartenreihe wird Teil der Pin-Timeline selbst (s. u.), Rest über
  // einen separaten Batch - beides schon hier vorbereiten (Initial-State).
  const cardItems = gsap.utils.toArray('.service-card[data-reveal]');
  const firstRowCards = cardItems.slice(0, 3);
  const restCards = cardItems.slice(3);
  gsap.set(cardItems, { opacity: 0, y: 24 });

  // Header: Icon-Logo + Hamburger, solange der Pin aktiv ist ------------
  const header = document.querySelector('[data-header]');
  const brandText = header?.querySelector('.brand__text');
  const navToggle = header?.querySelector('[data-nav-toggle]');
  const heroMenu = header?.querySelector('[data-hero-menu]');
  const mainNav = header?.querySelector('.main-nav');
  const navItems = mainNav
    ? gsap.utils.toArray(mainNav.querySelectorAll('.main-nav__item, .main-nav > .btn'))
    : [];

  const closeHeroMenu = () => {
    if (heroMenu && !heroMenu.hidden) heroMenu.hidden = true;
  };

  // Setzt den Zielzustand jedes Mal VOLLSTÄNDIG (opacity/x/inert/pointerEvents),
  // nicht nur relativ – dadurch bleibt bei schnellem Richtungswechsel nichts
  // in einem inkonsistenten Zwischenzustand hängen.
  const setHeaderHero = (active) => {
    // Der komplette Hero-Header-Umbau (Icon-Only-Logo, Hamburger-Fade,
    // Ausblenden von .main-nav) ist ein reiner Desktop-Mechanismus - auf
    // Mobile gibt es weder .main-nav noch .hero-menu, dort ist der Hamburger
    // die einzige Menü-Öffnung und muss immer sichtbar+klickbar bleiben.
    // Ohne diesen Guard setzt der else-Zweig unten navToggle per Inline-Style
    // dauerhaft auf opacity:0/pointer-events:none, sobald man den Hero-
    // Bereich verlässt - auf Mobile kommt danach nie wieder active:true, der
    // Hamburger bliebe für den Rest des Seitenbesuchs unerreichbar.
    if (!header || window.innerWidth < 900) return;
    header.classList.toggle('site-header--hero', active);
    if (active) {
      mainNav?.setAttribute('inert', '');
      gsap.set(navToggle, { pointerEvents: 'auto' });
      // navToggle per GSAP einblenden statt per CSS hart umschalten - sonst
      // poppt der Hamburger sofort auf, während main-nav noch 0.3s lang
      // ausfadet -> kurzer Moment, in dem beide Header-Varianten übereinander
      // sichtbar sind (genau das "verzerrt" wirkende Überlappen).
      gsap.to(navToggle, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(brandText, { opacity: 0, x: -12, duration: 0.4, ease: 'power2.out' });
      gsap.to(navItems, { opacity: 0, x: 16, duration: 0.3, ease: 'power2.out' });
    } else {
      closeHeroMenu();
      mainNav?.removeAttribute('inert');
      gsap.set(navToggle, { pointerEvents: 'none' });
      gsap.to(navToggle, { opacity: 0, duration: 0.25, ease: 'power2.out' });
      gsap.to(brandText, { opacity: 1, x: 0, duration: 0.45, ease: 'power2.out' });
      gsap.to(navItems, {
        opacity: 1, x: 0, duration: 0.45, stagger: 0.06, ease: 'power2.out',
        // Keine dauerhaften Inline-Styles auf Elementen hinterlassen, die
        // eigentlich vom normalen CSS-Hover-System des Mega-Menüs gesteuert
        // werden (main-nav__item--mega ist einer der navItems).
        onComplete: () => gsap.set(navItems, { clearProps: 'transform,opacity' }),
      });
    }
    navToggle?.setAttribute('aria-controls', active ? 'hero-menu' : 'mobile-menu');
  };

  // Mobile-Pendant zu setHeaderHero(): NUR die Optik wechselt (Icon-only-
  // Logo, Hamburger ohne Box/Rahmen via .site-header--hero, s. style.css) -
  // navToggle selbst wird hier NIE angefasst und bleibt damit immer beim
  // CSS-Default (sichtbar, klickbar). Eigenständige Funktion statt eines
  // Zweigs in setHeaderHero, damit die dort bewusst zusammengehörigen
  // navToggle-Opacity/PointerEvents-Tweens unter keinen Umständen versehentlich
  // auch auf Mobile ausgeführt werden können.
  const setHeaderCompactMobile = (active) => {
    if (!header || window.innerWidth >= 900) return;
    header.classList.toggle('site-header--hero', active);
    gsap.to(brandText, {
      opacity: active ? 0 : 1, x: active ? -12 : 0,
      duration: active ? 0.3 : 0.4, ease: 'power2.out',
    });
  };

  // Seite startet bei Scroll 0 = innerhalb des Pin-Bereichs: sofortiger
  // Initial-State ohne Fade (Claude.md §9: Initial-States per JS setzen).
  // .site-header--hero-capable wird EINMALIG und dauerhaft gesetzt (nur hier,
  // da initHeroPin auf anderen Seiten mangels [data-hero-pin] gar nicht erst
  // ausgeführt wird) - macht den Hamburger auf Desktop layout-technisch
  // dauerhaft verfügbar, ohne dass CSS "display" zwischen den Header-
  // Zuständen wechseln muss (siehe style.css). Nur Desktop bekommt diese
  // zusätzliche Klasse - sie ist es, die (nur ab 900px, s. style.css)
  // navToggle per CSS-Default auf opacity:0/pointer-events:none setzt.
  // Mobile bekommt unten im else-Zweig dieselbe Optik über .site-header--hero
  // allein, ohne --hero-capable, und rührt navToggle nie an.
  const isDesktopHeader = window.innerWidth >= 900;
  // Die Seite lädt immer im Hero, unabhängig vom Viewport.
  let headerIsHero = true;
  if (header) {
    if (isDesktopHeader) {
      header.classList.add('site-header--hero', 'site-header--hero-capable');
      mainNav?.setAttribute('inert', '');
      gsap.set(brandText, { opacity: 0, x: -12 });
      gsap.set(navToggle, { opacity: 1, pointerEvents: 'auto' });
      gsap.set(navItems, { opacity: 0, x: 16 });
    } else {
      header.classList.add('site-header--hero');
      gsap.set(brandText, { opacity: 0, x: -12 });
      // Explizit gesetzt, obwohl bereits CSS-Default - zusätzliche
      // Absicherung, dass der Hamburger auf Mobile nie unsichtbar/
      // unklickbar startet.
      gsap.set(navToggle, { opacity: 1, pointerEvents: 'auto' });
    }
  }

  initHeroMenuToggle(navToggle, heroMenu);

  const HEADER_FLIP = 0.4; // fällt mit dem Start des Crossfades zusammen (s. Timeline unten)

  gsap.timeline({
    scrollTrigger: {
      trigger: pin,
      start: 'top top',
      end: '+=100%', // exakt 1 Viewport-Höhe - siehe Begründung im Funktionskommentar oben
      pinSpacing: false, // kein reservierter Nachlauf-Leerraum - #leistungen liegt schon dahinter
      scrub: 0.4,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Beide Setter selbst-gegatet per Breite (s. o.) - pro Viewport
        // läuft immer nur einer der beiden wirklich etwas aus.
        if (headerIsHero && self.direction === 1 && self.progress > HEADER_FLIP) {
          headerIsHero = false;
          setHeaderHero(false);
          setHeaderCompactMobile(false);
        } else if (!headerIsHero && self.direction === -1 && self.progress < HEADER_FLIP) {
          headerIsHero = true;
          setHeaderHero(true);
          setHeaderCompactMobile(true);
        }
      },
      // WICHTIG (gemessen, nicht offensichtlich): GSAP lässt beim Unpin
      // trotz pinSpacing:false einen Kompensations-Transform auf pin stehen
      // (translate um genau die Pin-Distanz, hier 900px) - gedacht für
      // AUFEINANDERGESTAPELTE Pins, bei uns aber kontraproduktiv: dadurch
      // "rutscht" .hero__pin nach dem Unpin auf eine Position, die sich mit
      // #leistungen überlappt (860px Überlappung gemessen), statt an seiner
      // echten, natürlichen Dokument-Position (direkt vor #leistungen) zu
      // landen. onToggle räumt genau diesen Rest-Transform weg, sobald der
      // Pin inaktiv wird (vorwärts UND rückwärts) - danach sitzt .hero__pin
      // exakt dort, wo es im normalen Dokumentfluss ohnehin hingehört.
      onToggle: (self) => {
        if (!self.isActive) gsap.set(pin, { clearProps: 'transform' });
      },
      onLeave: () => closeHeroMenu(),
    },
  })
    .to(bg, { opacity: 0, scale: 1.08, duration: 0.4, ease: 'none' }, 0)
    .to(primaryItems, { opacity: 0, y: -16, duration: 0.3, stagger: 0.04, ease: 'none' }, 0.1)
    // WICHTIG (der eigentliche Fix für den sichtbaren Crossfade, nicht
    // offensichtlich): Bild und Primary-Text sind an dieser Stelle zwar
    // schon unsichtbar (Tweens oben), aber .hero__pin SELBST bleibt bis
    // hierhin blickdicht (background:var(--bg), dazu z-index:5) - jedes
    // Einblenden von #leistungen-Inhalten davor wäre für den Nutzer
    // unsichtbar, hinter dieser Fläche verborgen. Deshalb faded HIER die
    // Pin-Fläche selbst aus, überlappend mit dem Einblenden von
    // #leistungen unten - erst dadurch entsteht ein tatsächlich sichtbarer
    // Crossfade statt zweier unsichtbar hintereinander laufender Vorgänge.
    // Startet bewusst schon VOR Ende der primaryItems-Ausblendung (0.52) -
    // ohne diesen Vorlauf blieb zwischen "Text fertig weg" und "Crossfade
    // merklich sichtbar" eine kurze, optisch komplett ruhige Lücke stehen
    // (gemessen: ~70px ohne wahrnehmbare Veränderung, obwohl pin technisch
    // schon minimal fadete - eine Opacity-Änderung von 1.0 auf ~0.85 ist auf
    // dunklem Grund kaum sichtbar). Mit diesem Vorlauf überlappt die
    // Pin-Ausblendung durchgehend mit der Text-Ausblendung.
    // Dauer bewusst bis 1.0 (statt z. B. bis 0.85, wo der Hero-Rest ohnehin
    // fast unsichtbar wäre): DIESE Tween ist mit Abstand die längste und
    // verankert dadurch die Gesamtdauer der Timeline sauber bei 1.0 - jede
    // Positions-Zahl unten entspricht dadurch 1:1 self.progress, ohne
    // Umrechnungsfaktor. Würde sie verkürzt, würde eine andere (kürzere)
    // Tween die Gesamtdauer bestimmen und ALLE Positionswerte würden sich
    // relativ zu self.progress verschieben (Falle aus einer früheren Runde).
    .to(pin, { opacity: 0, duration: 0.6, ease: 'none' }, 0.4)
    // Leistungen-Kopf blendet EIN, überlappend mit dem Ausfaden von .pin
    // oben (gleiche Startzeit wie HEADER_FLIP - ein gemeinsamer Moment).
    // Endet bewusst bei 0.85 (statt erst bei 1.0 = dem strukturellen
    // Unpin-Punkt) - sonst ist der Inhalt erst im exakten Moment des Unpins
    // fertig eingeblendet und man scrollt beim normalen Tempo leicht daran
    // vorbei, bevor er komplett sichtbar ist. 15% Puffer vor dem Unpin.
    .to(headItems, { opacity: 1, y: 0, duration: 0.33, stagger: 0.05, ease: 'none' }, 0.42)
    // Erste Kartenreihe folgt kurz nach dem Kopf, noch im selben
    // Überlappungsfenster (kohärente Lesereihenfolge: Kopf, dann Karten).
    // Endet bei 0.90 - aus demselben Grund wie oben ebenfalls mit Puffer
    // vor dem Unpin-Punkt, statt wie vorher erst bei 0.94.
    .to(firstRowCards, { opacity: 1, y: 0, duration: 0.34, stagger: 0.02, ease: 'none' }, 0.52);

  // Restliche Karten (ab Reihe 2) weiterhin über einen eigenen, eng an den
  // Viewport-Eintritt gekoppelten Batch (100% statt 88% - löst aus, sobald
  // die Karte überhaupt erst die untere Kante des Viewports erreicht).
  if (restCards.length) {
    ScrollTrigger.batch(restCards, {
      start: 'top 100%',
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
        stagger: 0.08,
      }),
    });
  }
}

/* ------------------------------ Hero-Menü-Panel (Desktop) ------------ */
/* Eigenständig, unabhängig von initMobileMenu()/.mobile-menu (die bleibt für
   <900px unangetastet). Nur relevant, solange .site-header--hero-capable
   gesetzt ist (nur Startseite) - der Button ist außerhalb des Hero-Zustands
   auf Desktop ohnehin unsichtbar/nicht interaktiv (siehe style.css). */
function initHeroMenuToggle(navToggle, heroMenu) {
  if (!navToggle || !heroMenu) return;

  navToggle.addEventListener('click', () => {
    if (window.innerWidth < 900) return; // <900px: initMobileMenu() ist zuständig
    heroMenu.hidden = !heroMenu.hidden;
  });

  heroMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => { heroMenu.hidden = true; });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !heroMenu.hidden) {
      heroMenu.hidden = true;
      navToggle.focus();
    }
  });
}

/* ------------------------------ Desktop-Dropdowns ------------------- */
/* Hover/Fokus öffnet Leistungen/Über uns/Kontakt – mit kleiner Schließ-
   verzögerung, damit man zu den Einträgen wandern kann (Change #4). Die
   Hauptpunkte (Leistungen/Über uns) sind Links: ein Klick navigiert zur Seite.
   Ohne JS öffnet das Panel per CSS-Hover/Fokus (Hover-Brücke). */
function initNavDropdowns() {
  const items = Array.from(document.querySelectorAll('[data-nav-dropdown]'));
  if (!items.length) return;
  const CLOSE_DELAY = 220;
  const timers = new Map();

  const setOpen = (item, open) => {
    item.classList.toggle('is-open', open);
    item.querySelector('[data-nav-trigger]')?.setAttribute('aria-expanded', String(open));
  };

  items.forEach((item) => {
    const trigger = item.querySelector('[data-nav-trigger]');
    let suppressFocusOpen = false;

    const open = () => {
      clearTimeout(timers.get(item));
      // immer nur eins offen – andere sofort schließen (kein Überlappen)
      items.forEach((other) => {
        if (other !== item) { clearTimeout(timers.get(other)); setOpen(other, false); }
      });
      setOpen(item, true);
    };
    const closeSoon = () => {
      clearTimeout(timers.get(item));
      timers.set(item, setTimeout(() => setOpen(item, false), CLOSE_DELAY));
    };

    item.addEventListener('mouseenter', open);
    item.addEventListener('mouseleave', closeSoon);
    item.addEventListener('focusin', () => { if (!suppressFocusOpen) open(); });
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) setOpen(item, false);
    });

    // Escape schließt und gibt den Fokus zurück (ohne sofort wieder zu öffnen)
    item.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape' || !item.classList.contains('is-open')) return;
      setOpen(item, false);
      suppressFocusOpen = true;
      trigger?.focus();
      setTimeout(() => { suppressFocusOpen = false; }, 0);
    });
  });
}

/* ------------------------------ Mobile-Akkordeons ------------------- */
function initMobileAccordions() {
  document.querySelectorAll('[data-acc-trigger]').forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });
}

/* ------------------------------ Ablauf: Schritte-Umschalter ---------- */
function initProcessSteps() {
  const wrapper = document.querySelector('[data-process]');
  if (!wrapper) return;
  const triggers = Array.from(wrapper.querySelectorAll('[data-process-trigger]'));
  const panels = Array.from(wrapper.querySelectorAll('[data-process-panel]'));
  const connectors = Array.from(wrapper.querySelectorAll('[data-process-connector]'));
  const allDots = connectors.flatMap((c) => Array.from(c.querySelectorAll('[data-process-connector-dot]')));
  if (!triggers.length || !panels.length) return;

  let currentStep = triggers.find((t) => t.classList.contains('process-step--active'))?.dataset.step || triggers[0].dataset.step;
  let pendingTimers = [];

  // Dauerhafte, dezente Loop-Pulsierung auf dem Connector zum jeweils nächsten
  // Schritt – läuft, solange dieser Schritt aktiv ist (nicht nur beim Klick).
  const updateLoop = (step) => {
    if (prefersReducedMotion) return;
    connectors.forEach((connector) => {
      connector.classList.toggle('process-connector--loop', connector.dataset.processConnector === step);
    });
  };

  const activate = (step) => {
    triggers.forEach((trigger) => {
      const isActive = trigger.dataset.step === step;
      trigger.classList.toggle('process-step--active', isActive);
      if (isActive) trigger.setAttribute('aria-current', 'step');
      else trigger.removeAttribute('aria-current');
    });
    panels.forEach((panel) => {
      const isActive = panel.dataset.step === step;
      panel.hidden = !isActive;
      if (isActive) {
        panel.classList.remove('process-panel--enter');
        void panel.offsetWidth; // Reflow erzwingen, damit die Animation neu startet
        panel.classList.add('process-panel--enter');
      } else {
        panel.classList.remove('process-panel--enter');
      }
    });
    updateLoop(step);
  };

  updateLoop(currentStep); // Loop läuft schon beim Laden auf dem Default-Schritt

  // Rein dekorativ: lässt die Verbindungs-Punkte zwischen dem alten und dem neuen
  // Schritt kurz nacheinander aufleuchten. Blockiert nie activate() oben.
  const lightConnectors = (fromStep, toStep) => {
    pendingTimers.forEach(clearTimeout);
    pendingTimers = [];
    allDots.forEach((dot) => dot.classList.remove('process-connector__dot--lit'));

    const from = Number(fromStep);
    const to = Number(toStep);
    const dir = to > from ? 1 : -1;
    const lower = Math.min(from, to);
    const upper = Math.max(from, to);

    const segments = [];
    for (let s = lower; s < upper; s++) segments.push(s);
    if (dir < 0) segments.reverse();

    const dots = segments.flatMap((segFrom) => {
      const connector = connectors.find((c) => Number(c.dataset.processConnector) === segFrom);
      if (!connector) return [];
      const d = Array.from(connector.querySelectorAll('[data-process-connector-dot]'));
      return dir > 0 ? d : d.slice().reverse();
    });

    dots.forEach((dot, i) => {
      const onId = setTimeout(() => {
        dot.classList.add('process-connector__dot--lit');
        const offId = setTimeout(() => dot.classList.remove('process-connector__dot--lit'), 220);
        pendingTimers.push(offId);
      }, i * 70);
      pendingTimers.push(onId);
    });
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const targetStep = trigger.dataset.step;
      if (targetStep === currentStep) return;
      if (!prefersReducedMotion && connectors.length) lightConnectors(currentStep, targetStep);
      activate(targetStep); // sofort, unverändert wie bisher – keine Verzögerung
      currentStep = targetStep;
    });
  });
}

/* ------------------------------ Platzhalter-Links ------------------- */
/* aria-disabled-Links (Socials, Impressum, Datenschutz) führen nirgends hin. */
function initDisabledLinks() {
  document.querySelectorAll('a[aria-disabled="true"]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });
}

/* ------------------------------ Init --------------------------------- */
document.documentElement.classList.add('js-nav'); // CSS: JS-gesteuertes Öffnen statt Hover-Fallback
initYear();
initHeaderScroll();
initMobileMenu();
initMobileAccordions();
initProcessSteps();
initNavDropdowns();
initDisabledLinks();
initForm();

if (!prefersReducedMotion) {
  initAnimations();
}
