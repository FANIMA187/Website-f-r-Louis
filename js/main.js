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

    // Scroll-Reveals: Initial-States NUR hier (JS aktiv) setzen
    const items = gsap.utils.toArray('[data-reveal]');
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

    ScrollTrigger.refresh();
  } catch (err) {
    // CDN nicht erreichbar o. Ä.: Inhalt bleibt sichtbar, kein Fehler für Nutzer
    console.warn('Animationen nicht geladen – Seite läuft ohne Effekte weiter.', err);
  }
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
initNavDropdowns();
initDisabledLinks();
initForm();

if (!prefersReducedMotion) {
  initAnimations();
}
