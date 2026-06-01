import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
function initCursor(): void {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const tick = () => {
    cx = lerp(cx, mx, 0.13); cy = lerp(cy, my, 0.13);
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  const INTERACTIVE = 'a, button, .svc-card, .project-item, input, textarea, select, .projects-page-dot, .projects-nav-btn, .exp-arrow, .exp-pip, .ab-ind, .ab-arrow';
  function attachHover(el: HTMLElement) {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-active');
      if (el.matches('button, a.btn, .nav-cta')) document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-active', 'cursor-hover');
    });
  }
  document.querySelectorAll<HTMLElement>(INTERACTIVE).forEach(attachHover);
  (window as any).__attachCursorHover = attachHover;
}

/* ══════════════════════════════════════════
   LOADER
══════════════════════════════════════════ */
function initLoader(): void {
  const loader = document.getElementById('loader');
  if (!loader) return;
  let done = false;
  function hide() {
    if (done) return;
    done = true;
    const loaderEl = loader!;
    gsap.delayedCall(0.3, () => {
      loaderEl.classList.add('hidden');
      initReveal();
    });
  }
  window.addEventListener('load', () => gsap.delayedCall(0.4, hide));
  setTimeout(hide, 1800);
}


/* ══════════════════════════════════════════
   NAV
══════════════════════════════════════════ */
function initNav(): void {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobile-menu');
  if (!nav || !burger || !menu) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('active', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.style.overflow = open ? 'hidden' : '';
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Ouvrir le menu');
      document.body.style.overflow = '';
    });
  });
}

/* ══════════════════════════════════════════
   HERO ANIMATION
══════════════════════════════════════════ */
function initHeroAnim(): void {
  const lines = document.querySelectorAll<HTMLElement>('.hero-line');
  gsap.from(lines, { yPercent: 110, opacity: 0, stagger: .08, duration: 0.7, ease: 'power4.out', delay: 0.2 });
  gsap.from('.hero-tag',     { opacity: 0, y: 14, duration: .5, delay: 0.1 });
  gsap.from('.hero-sub',     { opacity: 0, y: 14, duration: .5, delay: 0.5 });
  gsap.from('.hero-actions', { opacity: 0, y: 14, duration: .5, delay: 0.7 });
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initReveal(): void {
  const elements = document.querySelectorAll<HTMLElement>('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: .9, ease: 'power3.out' });
      el.classList.add('revealed');
      observer.unobserve(el);
    });
  }, { threshold: .08, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));

  gsap.utils.toArray<HTMLElement>('.projects-bg-text, .contact-bg-text').forEach(el => {
    gsap.to(el, {
      yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
    });
  });
}

/* ══════════════════════════════════════════
   NOS EXPERTISES - pages de 3 cartes
   Auto-avance toutes les 10 secondes.
══════════════════════════════════════════ */
function initExpertises(): void {
  const wrap    = document.getElementById('exp-pages-wrap');
  const pipsEl  = document.getElementById('exp-pips');
  const prevBtn = document.getElementById('exp-prev') as HTMLButtonElement | null;
  const nextBtn = document.getElementById('exp-next') as HTMLButtonElement | null;
  const progBar = document.getElementById('exp-progress-bar');
  if (!wrap) return;

  const pages   = Array.from(wrap.querySelectorAll<HTMLElement>('.exp-page'));
  const TOTAL   = pages.length;
  if (!TOTAL) return;

  const AUTO_MS = 10000;
  let current   = 0;
  let busy      = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let progTween: gsap.core.Tween | null = null;

  /* ── Build pips ── */
  function buildPips() {
    if (!pipsEl) return;
    pipsEl.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const b = document.createElement('button');
      b.className = 'exp-pip' + (i === 0 ? ' active' : '');
      b.setAttribute('aria-label', `Page ${i + 1}`);
      b.addEventListener('click', () => goTo(i));
      pipsEl.appendChild(b);
      if ((window as any).__attachCursorHover) (window as any).__attachCursorHover(b);
    }
  }

  function updatePips() {
    pipsEl?.querySelectorAll('.exp-pip').forEach((p, i) => p.classList.toggle('active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === TOTAL - 1;
  }

  /* ── Progress ── */
  function startProgress() {
    if (!progBar) return;
    gsap.killTweensOf(progBar);
    gsap.set(progBar, { scaleX: 0, transformOrigin: 'left center' });
    progTween = gsap.to(progBar, { scaleX: 1, duration: AUTO_MS / 1000, ease: 'none', transformOrigin: 'left center' });
  }

  /* ── Timer ── */
  function startTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      const next = (current + 1) % TOTAL;
      goTo(next);
    }, AUTO_MS);
  }
  function stopTimer() {
    if (timer) clearTimeout(timer);
    timer = null;
  }

  /* ── Transition entre pages ── */
  function goTo(next: number) {
    if (busy || next === current) return;
    busy = true;
    stopTimer();
    progTween?.kill();

    const outPage = pages[current];
    const inPage  = pages[next];
    const dir     = next > current ? 1 : -1;

    // Fade + slight slide out
    gsap.to(outPage, {
      opacity: 0, x: dir * -40, duration: .4, ease: 'power2.in',
      onComplete: () => {
        outPage.classList.remove('active');
        outPage.style.opacity = '';
        outPage.style.transform = '';

        current = next;

        // Prepare in page
        gsap.set(inPage, { opacity: 0, x: dir * 40 });
        inPage.classList.add('active');

        gsap.to(inPage, {
          opacity: 1, x: 0, duration: .5, ease: 'power3.out',
          onComplete: () => {
            busy = false;
            updatePips();
            startProgress();
            startTimer();
          }
        });
      }
    });
  }

  /* ── Listeners ── */
  prevBtn?.addEventListener('click', () => { stopTimer(); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { stopTimer(); const next = (current + 1) % TOTAL; goTo(next); });

  /* ── Init ── */
  buildPips();
  pages.forEach((p, i) => {
    if (i !== 0) { p.classList.remove('active'); p.style.display = ''; }
  });
  updatePips();

  // Léger délai pour laisser la page se charger
  setTimeout(() => {
    // Animate cards on page 0 in
    const cards0 = pages[0].querySelectorAll<HTMLElement>('.svc-card');
    gsap.from(cards0, {
      opacity: 0, y: 32, scale: .97, stagger: .10,
      duration: .7, ease: 'power3.out', delay: .2
    });
    startProgress();
    startTimer();
  }, 2800);
}

/* ══════════════════════════════════════════
   PROJECTS - paginated grid
══════════════════════════════════════════ */
function initProjects(): void {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  const items = Array.from(grid.querySelectorAll<HTMLElement>('.project-item'));
  items.forEach(item => item.classList.remove('hidden'));
}

/* ══════════════════════════════════════════
   MARQUEE
══════════════════════════════════════════ */
function initMarquee(): void {
  const track = document.querySelector<HTMLElement>('.marquee-track');
  if (!track) return;
  track.addEventListener('mouseenter', () => { track.style.animationPlayState = 'paused'; });
  track.addEventListener('mouseleave', () => { track.style.animationPlayState = 'running'; });
}

/* ══════════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════════ */
function initForm(): void {
  const form = document.getElementById('contact-form') as HTMLFormElement | null;
  const msg  = document.getElementById('form-msg');
  if (!form || !msg) return;

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const name    = (form.elements.namedItem('name')    as HTMLInputElement).value.trim();
    const email   = (form.elements.namedItem('email')   as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name || !email || !message) {
      msg.className = 'form-msg error';
      msg.textContent = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    if (!emailRe.test(email)) {
      msg.className = 'form-msg error';
      msg.textContent = 'Adresse email invalide.';
      return;
    }

    const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]')!;
    btn.disabled = true;
    btn.querySelector('span')!.textContent = 'Envoi en cours…';

    setTimeout(() => {
      msg.className = 'form-msg success';
      msg.textContent = 'Message envoyé ! Nous vous répondrons rapidement.';
      form.reset();
      btn.disabled = false;
      btn.querySelector('span')!.textContent = 'Envoyer le Message';
    }, 1400);
  });
}

/* ══════════════════════════════════════════
   SMOOTH LINKS
══════════════════════════════════════════ */
function initSmoothLinks(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href')!.slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ══════════════════════════════════════════
   ABOUT - IMMEUBLE 3D
══════════════════════════════════════════ */
function initAboutBuilding(): void {
  const building = document.getElementById('ab-building');
  const prevBtn  = document.getElementById('ab-prev');
  const nextBtn  = document.getElementById('ab-next');
  const inds     = Array.from(document.querySelectorAll<HTMLElement>('.ab-ind'));
  const aboutEl  = document.getElementById('about');
  if (!building || !aboutEl) return;

  // Prisme triangulaire : 3 faces à 120° d'intervalle
  // Rotation cumulative pour toujours tourner dans le même sens
  const STEP    = 120;   // degrés entre chaque face
  const TOTAL   = 3;
  const AUTO_MS = 5000;  // 5s par face
  let cumRot    = 0;     // angle cumulatif (décroissant = rotation gauche)
  let current   = 0;     // indice de la face visible (0=Mission, 1=Approche, 2=Engagement)
  let risen     = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  // Initialise l'immeuble en dessous de la vue, invisible
  gsap.set(building, { y: 140, opacity: 0, rotateY: 0 });

  function updateIndicators(idx: number): void {
    inds.forEach((ind, i) => {
      const active = i === idx;
      ind.classList.toggle('active', active);
      ind.setAttribute('aria-selected', String(active));
    });
  }

  function rotateTo(newCum: number): void {
    cumRot  = newCum;
    current = (((Math.round(-cumRot / STEP)) % TOTAL) + TOTAL) % TOTAL;
    gsap.to(building, { rotateY: cumRot, duration: 0.95, ease: 'power3.inOut' });
    updateIndicators(current);
  }

  function next(): void { rotateTo(cumRot - STEP); }
  function prev(): void { rotateTo(cumRot + STEP); }

  function startTimer(): void { timer = setTimeout(() => { next(); startTimer(); }, AUTO_MS); }
  function resetTimer(): void { if (timer) clearTimeout(timer); startTimer(); }

  // Animation de lever : l'immeuble monte du sol
  const observer = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting || risen) return;
    risen = true;
    observer.disconnect();
    gsap.to(building, {
      y: 0, opacity: 1, duration: 1.6, ease: 'power3.out', delay: 0.2,
      onComplete: () => startTimer()
    });
  }, { threshold: 0.2 });
  observer.observe(aboutEl);

  prevBtn?.addEventListener('click', () => { prev(); resetTimer(); });
  nextBtn?.addEventListener('click', () => { next(); resetTimer(); });

  inds.forEach((ind, i) => {
    ind.addEventListener('click', () => {
      if (i === current) return;
      // Chemin le plus court (≤1 pas pour un prisme à 3 faces)
      const fwd = ((i - current) % TOTAL + TOTAL) % TOTAL;
      if (fwd === 1) rotateTo(cumRot - STEP);
      else           rotateTo(cumRot + STEP);
      resetTimer();
    });
  });
}

/* ══════════════════════════════════════════
   STATS COUNTER ANIMATION
══════════════════════════════════════════ */
function initStatsCounter(): void {
  const statNums = document.querySelectorAll<HTMLElement>('.stat-number');
  if (!statNums.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      const target = parseInt(el.dataset.target || '0', 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - elapsed, 3);
        el.textContent = Math.round(ease * target) + suffix;
        if (elapsed < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => observer.observe(el));
}

/* ══════════════════════════════════════════
   ACTIVE NAV
══════════════════════════════════════════ */
function initActiveNav(): void {
  const sections = document.querySelectorAll<HTMLElement>('section[id], #team');
  const links    = document.querySelectorAll<HTMLAnchorElement>('#nav nav a');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(link => link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`));
    });
  }, { threshold: .35 });

  sections.forEach(s => observer.observe(s));
}

/* ══════════════════════════════════════════
   TEAM MODAL
══════════════════════════════════════════ */
const TEAM_DATA = [
  {
    number: "01",
    name: "Benjelingo Nsenge Néhémie",
    role: "Coordinateur - Vision",
    photo: "/assets/images/team/benjelingo.jpg",
    bio: ["Il trace la première ligne. Il voit le bâtiment avant même qu'il n'existe.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "02",
    name: "Maika Maika David",
    role: "Conception - Design",
    photo: "/assets/images/team/maika.png",
    bio: ["Il transforme les idées en formes. Il donne une âme aux structures.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "03",
    name: "Bitota Kabeya Israella",
    role: "Communication",
    photo: "/assets/images/team/bitota.png",
    bio: ["Elle est la voix du projet. Quand elle explique, on voit déjà le bâtiment debout.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "04",
    name: "Pierrot",
    role: "Technique - Structure",
    photo: "/assets/images/team/pierrot.png",
    bio: ["Il calcule l'équilibre invisible. Ce que l'on ne voit pas, c'est ce qui tient tout.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "05",
    name: "Kuma-Kuma Djo Christ",
    role: "Développeur Informatique",
    photo: "/assets/images/team/djochrist.jpg",
    bio: ["Passionné par la technologie, il participe à la transformation digitale du collectif.", "Les informations complètes de ce membre seront disponibles prochainement."]
  }
];

function initTeamModal(): void {
  const modal    = document.getElementById('team-modal');
  const backdrop = modal?.querySelector('.team-modal-backdrop');
  const closeBtn = document.getElementById('team-modal-close');
  const photo    = document.getElementById('modal-photo') as HTMLImageElement | null;
  const number   = document.getElementById('modal-number');
  const name     = document.getElementById('modal-name');
  const role     = document.getElementById('modal-role');
  const bio      = document.getElementById('modal-bio');
  const contactBtn = document.getElementById('modal-contact-btn');

  if (!modal) return;

  const open = (idx: number) => {
    const d = TEAM_DATA[idx];
    if (!d) return;
    if (photo)  { photo.src = d.photo; photo.alt = d.name; }
    if (number) number.textContent = d.number;
    if (name)   name.textContent   = d.name;
    if (role)   role.textContent   = d.role;
    if (bio)    bio.innerHTML = d.bio.map(p => `<p>${p}</p>`).join('');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeBtn?.focus();
  };

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.querySelectorAll<HTMLElement>('.team-card').forEach(card => {
    const btn = card.querySelector('.team-profile-btn');
    const handler = () => {
      const idx = parseInt(card.dataset.member ?? '0', 10);
      open(idx);
    };
    card.addEventListener('click', handler);
    btn?.addEventListener('click', (e) => { e.stopPropagation(); handler(); });
  });

  closeBtn?.addEventListener('click', close);
  backdrop?.addEventListener('click', close);
  contactBtn?.addEventListener('click', () => { close(); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

/* ══════════════════════════════════════════
   INIT
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initHeroAnim();
  initAboutBuilding();
  initExpertises();
  initProjects();
  initMarquee();
  initForm();
  initSmoothLinks();
  initActiveNav();
  initStatsCounter();
  initTeamModal();
});
