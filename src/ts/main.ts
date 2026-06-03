import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════════
   CURSOR
══════════════════════════════════════════ */
function initCursor(): void {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;
  document.body.classList.add('cursor-active');

  let mx = 0, my = 0, cx = 0, cy = 0;
  document.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; });

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const tick = () => {
    cx = lerp(cx, mx, 0.13); cy = lerp(cy, my, 0.13);
    cursor.style.left = cx + 'px'; cursor.style.top = cy + 'px';
    requestAnimationFrame(tick);
  };
  tick();

  const INTERACTIVE = 'a, button, .svc-card, .project-item, input, textarea, select, .projects-page-dot, .projects-nav-btn, .exp-arrow, .exp-pip, .ab-ind, .ab-arrow, .distingue-item, .team-card';
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

function initAboutSlideshow(): void {
  const images = [
    '/assets/images/qui-sommes-nous/chantier1.jpg',
    '/assets/images/qui-sommes-nous/realisation1.2.jpg',
    '/assets/images/qui-sommes-nous/realisation1.3.jpg'
  ];
  const photo = document.getElementById('about-photo') as HTMLImageElement | null;
  if (!photo || images.length === 0) return;
  let index = 0;
  setInterval(() => {
    index = (index + 1) % images.length;
    gsap.to(photo, { opacity: 0, duration: 0.4, onComplete: () => {
      photo.src = images[index];
      gsap.to(photo, { opacity: 1, duration: 0.6 });
    }});
  }, 3000);
}

/* ══════════════════════════════════════════
   HERO CANVAS PARTICLES
══════════════════════════════════════════ */
function initHeroCanvas(): void {
  const hero = document.querySelector<HTMLElement>('.section-hero');
  if (!hero) return;
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;width:100%;height:100%;';
  hero.insertBefore(canvas, hero.firstChild);

  const ctx = canvas.getContext('2d')!;
  let W = 0, H = 0;
  function resize() {
    W = canvas.offsetWidth; H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  type P = { x:number;y:number;r:number;dx:number;dy:number;o:number };
  const pts: P[] = Array.from({ length: 65 }, () => ({
    x: Math.random() * (W || 1400),
    y: Math.random() * (H || 800),
    r: Math.random() * 1.5 + 0.3,
    dx: (Math.random() - 0.5) * 0.38,
    dy: (Math.random() - 0.5) * 0.38,
    o: Math.random() * 0.38 + 0.08
  }));

  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (const p of pts) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,99,10,${p.o})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(232,99,10,${0.07 * (1 - d/110)})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════
   SCROLL REVEAL
══════════════════════════════════════════ */
function initReveal(): void {
  // Set initial GSAP states immediately — prevents CSS/GSAP transform conflict
  const ups    = document.querySelectorAll<HTMLElement>('.reveal-up');
  const lefts  = document.querySelectorAll<HTMLElement>('.reveal-left');
  const rights = document.querySelectorAll<HTMLElement>('.reveal-right');
  const scales = document.querySelectorAll<HTMLElement>('.reveal-scale');

  gsap.set(Array.from(ups),    { opacity: 0, y: 36 });
  gsap.set(Array.from(lefts),  { opacity: 0, x: -44 });
  gsap.set(Array.from(rights), { opacity: 0, x: 44 });
  gsap.set(Array.from(scales), { opacity: 0, scale: 0.92 });

  const all = [...ups, ...lefts, ...rights, ...scales];

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      gsap.to(el, { opacity: 1, x: 0, y: 0, scale: 1, duration: .85, ease: 'power3.out', delay: 0.05 });
      el.classList.add('revealed');
      observer.unobserve(el);
    });
  }, { threshold: .06, rootMargin: '0px 0px -30px 0px' });

  all.forEach(el => observer.observe(el));

  gsap.utils.toArray<HTMLElement>('.projects-bg-text, .contact-bg-text').forEach(el => {
    gsap.to(el, {
      yPercent: 20, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
    });
  });
}

/* ══════════════════════════════════════════
   PARALLAX SCROLLING
══════════════════════════════════════════ */
function initParallax(): void {
  // Hero background parallax
  gsap.to('.hero-gif-bg', {
    yPercent: 28,
    ease: 'none',
    scrollTrigger: {
      trigger: '.section-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 1.5
    }
  });

  // About portrait image parallax
  const portrait = document.querySelector<HTMLElement>('.about-portrait img');
  if (portrait) {
    gsap.fromTo(portrait, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: {
        trigger: '.about-portrait',
        start: 'top bottom', end: 'bottom top', scrub: 1
      }
    });
  }

  // Identity panel text parallax
  const identityCopy = document.querySelector<HTMLElement>('.identity-copy');
  if (identityCopy) {
    gsap.fromTo(identityCopy, { y: 20 }, {
      y: -20, ease: 'none',
      scrollTrigger: {
        trigger: '.identity-panel',
        start: 'top bottom', end: 'bottom top', scrub: 1.2
      }
    });
  }

  // Mission grid items subtle parallax
  const missionItems = document.querySelectorAll<HTMLElement>('.mission-grid article');
  missionItems.forEach((item, i) => {
    gsap.fromTo(item, { y: 0 }, {
      y: i % 2 === 0 ? -15 : -25, ease: 'none',
      scrollTrigger: {
        trigger: item,
        start: 'top bottom', end: 'bottom top', scrub: 1
      }
    });
  });
}

/* ══════════════════════════════════════════
   3D CARD TILT
══════════════════════════════════════════ */
function initCardTilt(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const cards = document.querySelectorAll<HTMLElement>('.team-card, .svc-item, .service-card, .distingue-item');
  cards.forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: x * 9,
        rotateX: -y * 9,
        transformPerspective: 900,
        ease: 'power2.out',
        duration: 0.3
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

/* ══════════════════════════════════════════
   MAGNETIC BUTTONS
══════════════════════════════════════════ */
function initMagneticBtns(): void {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const btns = document.querySelectorAll<HTMLElement>('.btn-primary, .btn-outline, .nav-cta, .btn-voir-projets, .proj-cta-btn');
  btns.forEach(btn => {
    btn.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.28;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
      gsap.to(btn, { x, y, duration: 0.38, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.75, ease: 'elastic.out(1, 0.3)' });
    });
  });
}

/* ══════════════════════════════════════════
   STAGGERED GRID REVEALS
══════════════════════════════════════════ */
function initGridReveals(): void {
  // Service grid items
  const svcItems = Array.from(document.querySelectorAll<HTMLElement>('.svc-item'));
  if (svcItems.length) {
    // Reset initial state
    gsap.set(svcItems, { opacity: 0, y: 28, scale: 0.97 });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(svcItems, { opacity: 1, y: 0, scale: 1, stagger: 0.065, duration: 0.75, ease: 'power3.out' });
        obs.disconnect();
      });
    }, { threshold: 0.08 });
    obs.observe(svcItems[0]);
  }

  // Team cards
  const teamCards = Array.from(document.querySelectorAll<HTMLElement>('.team-card'));
  if (teamCards.length) {
    gsap.set(teamCards, { opacity: 0, y: 45 });
    const obs2 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(teamCards, { opacity: 1, y: 0, stagger: 0.09, duration: 0.8, ease: 'power3.out' });
        obs2.disconnect();
      });
    }, { threshold: 0.05 });
    obs2.observe(teamCards[0]);
  }

  // Distingue items
  const distItems = Array.from(document.querySelectorAll<HTMLElement>('.distingue-item'));
  if (distItems.length) {
    gsap.set(distItems, { opacity: 0, x: -28 });
    const obs3 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(distItems, { opacity: 1, x: 0, stagger: 0.1, duration: 0.65, ease: 'power3.out' });
        obs3.disconnect();
      });
    }, { threshold: 0.15 });
    obs3.observe(distItems[0]);
  }

  // Project items
  const projItems = Array.from(document.querySelectorAll<HTMLElement>('.project-item'));
  if (projItems.length) {
    gsap.set(projItems, { opacity: 0, scale: 0.94 });
    const obs4 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(projItems, { opacity: 1, scale: 1, stagger: 0.1, duration: 0.8, ease: 'power3.out' });
        obs4.disconnect();
      });
    }, { threshold: 0.05 });
    obs4.observe(projItems[0]);
  }

  // About service cards
  const svcCards = Array.from(document.querySelectorAll<HTMLElement>('.service-card'));
  if (svcCards.length) {
    gsap.set(svcCards, { opacity: 0, y: 35 });
    const obs5 = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        gsap.to(svcCards, { opacity: 1, y: 0, stagger: 0.12, duration: 0.8, ease: 'power3.out' });
        obs5.disconnect();
      });
    }, { threshold: 0.15 });
    obs5.observe(svcCards[0]);
  }
}

/* ══════════════════════════════════════════
   SECTION TITLE CLIP REVEAL
══════════════════════════════════════════ */
function initTitleAnimations(): void {
  const titles = document.querySelectorAll<HTMLElement>(
    '.about-kicker .section-title, #services-title, #projects-title, #team-title, #cta-title, #contact-title'
  );
  // Pre-hide immediately so there's no flash before animation
  gsap.set(Array.from(titles), { clipPath: 'inset(0 100% 0 0)' });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      gsap.to(el, { clipPath: 'inset(0 0% 0 0)', duration: 1.0, ease: 'power4.inOut' });
      obs.unobserve(el);
    });
  }, { threshold: 0.15 });
  titles.forEach(t => obs.observe(t));
}

/* ══════════════════════════════════════════
   SECTION ENTRANCE LINES
══════════════════════════════════════════ */
function initSectionLines(): void {
  gsap.utils.toArray<HTMLElement>('.section-services, .section-projects, .section-about, .team-block').forEach(section => {
    const line = document.createElement('div');
    line.style.cssText = 'position:absolute;top:0;left:0;width:0;height:2px;background:var(--orange);z-index:1;';
    (section as HTMLElement).style.position = 'relative';
    section.prepend(line);
    gsap.to(line, {
      width: '100%', duration: 1.2, ease: 'power4.inOut',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true }
    });
  });
}

/* ══════════════════════════════════════════
   ABOUT PILLARS COUNTER STAGGER
══════════════════════════════════════════ */
function initPillarsAnim(): void {
  const pillars = document.querySelectorAll<HTMLElement>('.about-pillars div');
  if (!pillars.length) return;
  gsap.set(pillars, { opacity: 0, y: 24 });
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      gsap.to(Array.from(pillars), { opacity: 1, y: 0, stagger: 0.13, duration: 0.7, ease: 'power3.out' });
      obs.disconnect();
    });
  }, { threshold: 0.4 });
  obs.observe(pillars[0]);
}

/* ══════════════════════════════════════════
   EXPERTISES - pages de 3 cartes
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

  function startProgress() {
    if (!progBar) return;
    gsap.killTweensOf(progBar);
    gsap.set(progBar, { scaleX: 0, transformOrigin: 'left center' });
    progTween = gsap.to(progBar, { scaleX: 1, duration: AUTO_MS / 1000, ease: 'none', transformOrigin: 'left center' });
  }

  function startTimer() {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => { const next = (current + 1) % TOTAL; goTo(next); }, AUTO_MS);
  }
  function stopTimer() { if (timer) clearTimeout(timer); timer = null; }

  function goTo(next: number) {
    if (busy || next === current) return;
    busy = true;
    stopTimer();
    progTween?.kill();

    const outPage = pages[current];
    const inPage  = pages[next];
    const dir     = next > current ? 1 : -1;

    gsap.to(outPage, {
      opacity: 0, x: dir * -40, duration: .4, ease: 'power2.in',
      onComplete: () => {
        outPage.classList.remove('active');
        outPage.style.opacity = '';
        outPage.style.transform = '';
        current = next;
        gsap.set(inPage, { opacity: 0, x: dir * 40 });
        inPage.classList.add('active');
        gsap.to(inPage, {
          opacity: 1, x: 0, duration: .5, ease: 'power3.out',
          onComplete: () => { busy = false; updatePips(); startProgress(); startTimer(); }
        });
      }
    });
  }

  prevBtn?.addEventListener('click', () => { stopTimer(); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { stopTimer(); const next = (current + 1) % TOTAL; goTo(next); });

  buildPips();
  pages.forEach((p, i) => { if (i !== 0) { p.classList.remove('active'); p.style.display = ''; } });
  updatePips();

  setTimeout(() => {
    const cards0 = pages[0].querySelectorAll<HTMLElement>('.svc-card');
    gsap.from(cards0, { opacity: 0, y: 32, scale: .97, stagger: .10, duration: .7, ease: 'power3.out', delay: .2 });
    startProgress();
    startTimer();
  }, 2800);
}

/* ══════════════════════════════════════════
   PROJECTS
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

  const STEP    = 120;
  const TOTAL   = 3;
  const AUTO_MS = 5000;
  let cumRot    = 0;
  let current   = 0;
  let risen     = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

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
    name: "Coordonateur adjoint",
    role: "Support au pilotage",
    photo: "/assets/images/team/Coordonateur%20adjoint.jpg",
    bio: ["Il accompagne la coordination des chantiers et garantit le suivi opérationnel.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "03",
    name: "Maika Maika David",
    role: "Conception - Design",
    photo: "/assets/images/team/maika.png",
    bio: ["Il transforme les idées en formes. Il donne une âme aux structures.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "04",
    name: "Bitota Kabeya Israella",
    role: "Communication",
    photo: "/assets/images/team/bitota.png",
    bio: ["Elle est la voix du projet. Quand elle explique, on voit déjà le bâtiment debout.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "05",
    name: "Pierrot",
    role: "Technique - Structure",
    photo: "/assets/images/team/pierrot.png",
    bio: ["Il calcule l'équilibre invisible. Ce que l'on ne voit pas, c'est ce qui tient tout.", "Les informations complètes de ce membre seront disponibles prochainement."]
  },
  {
    number: "06",
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
    gsap.fromTo(modal.querySelector('.team-modal-panel'),
      { scale: 0.92, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' }
    );
    closeBtn?.focus();
  };

  const close = () => {
    gsap.to(modal.querySelector('.team-modal-panel'), {
      scale: 0.94, opacity: 0, duration: 0.3, ease: 'power2.in',
      onComplete: () => {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
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

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) close();
  });
}

/* ══════════════════════════════════════════
   ARCHITECTURAL SVG BACKGROUNDS
══════════════════════════════════════════ */
function initArchitecturalBgs(): void {

  const FLOOR_PLAN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice">
    <rect x="120" y="80" width="760" height="540" fill="none" stroke="currentColor" stroke-width="4"/>
    <line x1="420" y1="80" x2="420" y2="390" stroke="currentColor" stroke-width="3"/>
    <line x1="420" y1="390" x2="120" y2="390" stroke="currentColor" stroke-width="3"/>
    <line x1="120" y1="260" x2="420" y2="260" stroke="currentColor" stroke-width="2.5"/>
    <line x1="640" y1="80" x2="640" y2="620" stroke="currentColor" stroke-width="3"/>
    <line x1="420" y1="490" x2="640" y2="490" stroke="currentColor" stroke-width="2.5"/>
    <line x1="420" y1="390" x2="640" y2="390" stroke="currentColor" stroke-width="2"/>
    <path d="M420,185 A48,48 0 0 0 372,185" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="420" y1="137" x2="420" y2="185" stroke="currentColor" stroke-width="1.5"/>
    <path d="M340,390 A44,44 0 0 1 340,434" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="296" y1="390" x2="340" y2="390" stroke="currentColor" stroke-width="1.5"/>
    <line x1="175" y1="80" x2="305" y2="80" stroke="currentColor" stroke-width="7"/>
    <line x1="465" y1="80" x2="595" y2="80" stroke="currentColor" stroke-width="7"/>
    <line x1="680" y1="80" x2="820" y2="80" stroke="currentColor" stroke-width="7"/>
    <line x1="120" y1="145" x2="120" y2="215" stroke="currentColor" stroke-width="7"/>
    <line x1="120" y1="440" x2="120" y2="555" stroke="currentColor" stroke-width="7"/>
    <line x1="880" y1="160" x2="880" y2="250" stroke="currentColor" stroke-width="7"/>
    <line x1="880" y1="390" x2="880" y2="510" stroke="currentColor" stroke-width="7"/>
    <line x1="120" y1="38" x2="880" y2="38" stroke="currentColor" stroke-width="1" stroke-dasharray="8,4"/>
    <line x1="76" y1="80" x2="76" y2="620" stroke="currentColor" stroke-width="1" stroke-dasharray="8,4"/>
    <polygon points="120,38 138,32 138,44" fill="currentColor"/>
    <polygon points="880,38 862,32 862,44" fill="currentColor"/>
    <polygon points="76,80 70,98 82,98" fill="currentColor"/>
    <polygon points="76,620 70,602 82,602" fill="currentColor"/>
    <line x1="120" y1="33" x2="120" y2="43" stroke="currentColor" stroke-width="1.5"/>
    <line x1="420" y1="33" x2="420" y2="43" stroke="currentColor" stroke-width="1.5"/>
    <line x1="640" y1="33" x2="640" y2="43" stroke="currentColor" stroke-width="1.5"/>
    <line x1="880" y1="33" x2="880" y2="43" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="120" cy="640" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="420" cy="640" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="640" cy="640" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <circle cx="880" cy="640" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="416" y1="76" x2="424" y2="84" stroke="currentColor" stroke-width="2"/>
    <line x1="424" y1="76" x2="416" y2="84" stroke="currentColor" stroke-width="2"/>
    <line x1="636" y1="76" x2="644" y2="84" stroke="currentColor" stroke-width="2"/>
    <line x1="644" y1="76" x2="636" y2="84" stroke="currentColor" stroke-width="2"/>
    <text x="240" y="185" font-family="monospace" font-size="14" fill="currentColor" text-anchor="middle">SÉJOUR</text>
    <text x="240" y="330" font-family="monospace" font-size="14" fill="currentColor" text-anchor="middle">CHAMBRE 01</text>
    <text x="500" y="250" font-family="monospace" font-size="14" fill="currentColor" text-anchor="middle">CUISINE</text>
    <text x="760" y="320" font-family="monospace" font-size="14" fill="currentColor" text-anchor="middle">CHAMBRE 02</text>
  </svg>`;

  const ELEVATION = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 550" preserveAspectRatio="xMidYMid slice">
    <line x1="60" y1="480" x2="1340" y2="480" stroke="currentColor" stroke-width="3.5"/>
    <rect x="130" y="110" width="1140" height="370" fill="none" stroke="currentColor" stroke-width="3"/>
    <line x1="110" y1="110" x2="1290" y2="110" stroke="currentColor" stroke-width="2.5"/>
    <line x1="110" y1="92" x2="1290" y2="92" stroke="currentColor" stroke-width="1.5"/>
    <line x1="110" y1="92" x2="110" y2="110" stroke="currentColor" stroke-width="1.5"/>
    <line x1="1290" y1="92" x2="1290" y2="110" stroke="currentColor" stroke-width="1.5"/>
    <line x1="130" y1="220" x2="1270" y2="220" stroke="currentColor" stroke-width="1.5"/>
    <line x1="130" y1="330" x2="1270" y2="330" stroke="currentColor" stroke-width="1.5"/>
    <line x1="130" y1="415" x2="1270" y2="415" stroke="currentColor" stroke-width="1.5"/>
    <line x1="305" y1="92" x2="305" y2="480" stroke="currentColor" stroke-width="1.5"/>
    <line x1="555" y1="92" x2="555" y2="480" stroke="currentColor" stroke-width="1.5"/>
    <line x1="805" y1="92" x2="805" y2="480" stroke="currentColor" stroke-width="1.5"/>
    <line x1="1055" y1="92" x2="1055" y2="480" stroke="currentColor" stroke-width="1.5"/>
    <rect x="155" y="130" width="105" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="207" y1="130" x2="207" y2="198" stroke="currentColor" stroke-width="0.8"/>
    <rect x="325" y="130" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="407" y1="130" x2="407" y2="198" stroke="currentColor" stroke-width="0.8"/>
    <rect x="575" y="130" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="657" y1="130" x2="657" y2="198" stroke="currentColor" stroke-width="0.8"/>
    <rect x="825" y="130" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="907" y1="130" x2="907" y2="198" stroke="currentColor" stroke-width="0.8"/>
    <rect x="1075" y="130" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="1157" y1="130" x2="1157" y2="198" stroke="currentColor" stroke-width="0.8"/>
    <rect x="155" y="242" width="105" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="207" y1="242" x2="207" y2="310" stroke="currentColor" stroke-width="0.8"/>
    <rect x="325" y="242" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="825" y="242" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="1075" y="242" width="165" height="68" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="155" y="350" width="105" height="55" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="825" y="350" width="105" height="55" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="1075" y="350" width="165" height="55" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <rect x="610" y="355" width="180" height="125" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <line x1="700" y1="355" x2="700" y2="480" stroke="currentColor" stroke-width="1.5"/>
    <path d="M610,420 A44,44 0 0 1 654,420" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="130" y1="520" x2="1270" y2="520" stroke="currentColor" stroke-width="0.8" stroke-dasharray="6,3"/>
    <polygon points="130,520 148,514 148,526" fill="currentColor"/>
    <polygon points="1270,520 1252,514 1252,526" fill="currentColor"/>
    <line x1="68" y1="110" x2="105" y2="110" stroke="currentColor" stroke-width="1"/>
    <line x1="68" y1="220" x2="105" y2="220" stroke="currentColor" stroke-width="1"/>
    <line x1="68" y1="330" x2="105" y2="330" stroke="currentColor" stroke-width="1"/>
    <line x1="68" y1="415" x2="105" y2="415" stroke="currentColor" stroke-width="1"/>
    <line x1="68" y1="480" x2="105" y2="480" stroke="currentColor" stroke-width="1"/>
    <line x1="68" y1="110" x2="68" y2="480" stroke="currentColor" stroke-width="0.8"/>
    <text x="700" y="72" font-family="monospace" font-size="13" fill="currentColor" text-anchor="middle">FAÇADE PRINCIPALE — ÉCHELLE 1:100</text>
  </svg>`;

  const SITE_PLAN = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
    <rect x="60" y="60" width="1080" height="680" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="12,6"/>
    <rect x="200" y="160" width="800" height="480" fill="none" stroke="currentColor" stroke-width="3"/>
    <rect x="260" y="220" width="200" height="160" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="520" y="220" width="200" height="160" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="780" y="220" width="160" height="360" fill="none" stroke="currentColor" stroke-width="2"/>
    <rect x="260" y="460" width="440" height="120" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="200" y1="400" x2="780" y2="400" stroke="currentColor" stroke-width="1.5"/>
    <line x1="460" y1="160" x2="460" y2="640" stroke="currentColor" stroke-width="1.5"/>
    <line x1="720" y1="160" x2="720" y2="640" stroke="currentColor" stroke-width="1.5"/>
    <line x1="60" y1="400" x2="200" y2="400" stroke="currentColor" stroke-width="3"/>
    <path d="M200,360 L140,360 L140,440 L200,440" fill="none" stroke="currentColor" stroke-width="2"/>
    <line x1="140" y1="380" x2="60" y2="380" stroke="currentColor" stroke-width="2" stroke-dasharray="8,4"/>
    <circle cx="360" cy="730" r="35" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <line x1="360" y1="695" x2="360" y2="730" stroke="currentColor" stroke-width="2"/>
    <polygon points="360,698 354,720 366,720" fill="currentColor"/>
    <text x="360" y="746" font-family="monospace" font-size="11" fill="currentColor" text-anchor="middle">N</text>
    <line x1="200" y1="120" x2="1000" y2="120" stroke="currentColor" stroke-width="0.8" stroke-dasharray="6,3"/>
    <polygon points="200,120 218,114 218,126" fill="currentColor"/>
    <polygon points="1000,120 982,114 982,126" fill="currentColor"/>
    <line x1="1080" y1="160" x2="1080" y2="640" stroke="currentColor" stroke-width="0.8" stroke-dasharray="6,3"/>
    <polygon points="1080,160 1074,178 1086,178" fill="currentColor"/>
    <polygon points="1080,640 1074,622 1086,622" fill="currentColor"/>
    <text x="600" y="44" font-family="monospace" font-size="13" fill="currentColor" text-anchor="middle">PLAN DE SITUATION — ÉCHELLE 1:200</text>
  </svg>`;

  function injectArch(selector: string, svg: string, opacity = 0.042): void {
    const section = document.querySelector<HTMLElement>(selector);
    if (!section) return;
    const wrap = document.createElement('div');
    wrap.className = 'arch-bg';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.opacity = String(opacity);
    wrap.innerHTML = svg;
    section.insertBefore(wrap, section.firstChild);
  }

  injectArch('.section-about',    FLOOR_PLAN, 0.038);
  injectArch('.section-services', ELEVATION,  0.04);
  injectArch('.section-projects', SITE_PLAN,  0.038);

  // Parallax drift on arch drawings as user scrolls
  document.querySelectorAll<HTMLElement>('.arch-bg').forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    gsap.to(el, {
      y: 60 * dir,
      ease: 'none',
      scrollTrigger: {
        trigger: el.parentElement,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      }
    });
  });
}

/* ══════════════════════════════════════════
   3D PERSPECTIVE GRID CANVAS
══════════════════════════════════════════ */
function init3DPerspective(): void {
  const servicesSection = document.querySelector<HTMLElement>('.section-services');
  if (!servicesSection) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'svc-3d-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  servicesSection.insertBefore(canvas, servicesSection.firstChild);

  const ctxRaw = canvas.getContext('2d');
  if (!ctxRaw) return;
  const ctx: CanvasRenderingContext2D = ctxRaw;

  let W = 0, H = 0, raf = 0;
  let offset = 0;

  function resize() {
    W = canvas.offsetWidth;
    H = canvas.offsetHeight;
    canvas.width  = W * devicePixelRatio;
    canvas.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
  }
  resize();
  window.addEventListener('resize', () => { resize(); }, { passive: true });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    const VP_X  = W / 2;
    const VP_Y  = H * 0.42;
    const COLS  = 14;
    const ROWS  = 18;
    const SPEED = 0.18;

    offset = (offset + SPEED) % (H / ROWS);

    ctx.strokeStyle = 'rgba(13,27,42,1)';
    ctx.lineWidth   = 0.9;

    for (let c = 0; c <= COLS; c++) {
      const t    = c / COLS;
      const botX = t * W;
      ctx.beginPath();
      ctx.moveTo(botX, H);
      ctx.lineTo(VP_X + (botX - VP_X) * 0.04, VP_Y);
      ctx.stroke();
    }

    for (let r = 0; r <= ROWS; r++) {
      const pct = ((r / ROWS) + offset / H) % 1;
      const t   = Math.pow(pct, 2.5);
      const y   = VP_Y + (H - VP_Y) * t;
      const xL  = VP_X - (VP_X - 0) * t;
      const xR  = VP_X + (W - VP_X) * t;
      ctx.beginPath();
      ctx.moveTo(xL, y);
      ctx.lineTo(xR, y);
      ctx.stroke();
    }

    raf = requestAnimationFrame(draw);
  }
  draw();

  // Pause when section off screen
  ScrollTrigger.create({
    trigger: servicesSection,
    start: 'top bottom',
    end: 'bottom top',
    onEnter: ()  => { if (!raf) draw(); },
    onLeave: ()  => { cancelAnimationFrame(raf); raf = 0; },
    onEnterBack: () => { if (!raf) draw(); },
    onLeaveBack: () => { cancelAnimationFrame(raf); raf = 0; },
  });
}

/* ══════════════════════════════════════════
   FLOATING SECTION DOTS (living feel)
══════════════════════════════════════════ */
function initFloatingDots(): void {
  const sections = ['.section-about', '.section-services', '.section-projects'];
  sections.forEach(sel => {
    const section = document.querySelector<HTMLElement>(sel);
    if (!section) return;
    for (let i = 0; i < 6; i++) {
      const dot = document.createElement('div');
      const size = 3 + Math.random() * 5;
      dot.className = 'section-float-dot';
      dot.style.cssText = `
        width:${size}px; height:${size}px;
        left:${5 + Math.random() * 90}%;
        top:${10 + Math.random() * 80}%;
        opacity:${0.15 + Math.random() * 0.25};
        animation-duration:${5 + Math.random() * 7}s;
        animation-delay:${-Math.random() * 6}s;
      `;
      section.appendChild(dot);
    }
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
  initHeroCanvas();
  initAboutSlideshow();
  initAboutBuilding();
  initExpertises();
  initProjects();
  initMarquee();
  initForm();
  initSmoothLinks();
  initActiveNav();
  initStatsCounter();
  initTeamModal();
  initParallax();
  initCardTilt();
  initMagneticBtns();
  initGridReveals();
  initTitleAnimations();
  initSectionLines();
  initPillarsAnim();
  initArchitecturalBgs();
  init3DPerspective();
  initFloatingDots();
});
