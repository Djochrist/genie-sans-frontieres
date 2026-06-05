/* ═══════════════════════════════════════════════════
   GÉNIE SANS FRONTIÈRES GROUP — Main JS v3
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Loader ── */
  const loader = document.querySelector('.loader');
  if (loader) setTimeout(() => loader.classList.add('hidden'), 1600);

  /* ── Navigation scroll ── */
  const nav = document.querySelector('.nav');
  if (nav) {
    const updateNav = () => {
      if (window.scrollY > 60) {
        nav.classList.remove('transparent');
        nav.classList.add('solid');
      } else {
        nav.classList.remove('solid');
        nav.classList.add('transparent');
      }
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ── Mobile burger ── */
  const burger    = document.querySelector('.nav__burger');
  const mobileNav = document.querySelector('.nav__mobile');

  if (burger && mobileNav) {
    const toggleMenu = (open) => {
      mobileNav.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = burger.querySelectorAll('span');
      if (open) {
        spans[0].style.transform = 'rotate(45deg) translateY(7px)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'rotate(-45deg) translateY(-7px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      }
    };
    burger.addEventListener('click', () => toggleMenu(!mobileNav.classList.contains('open')));
    document.querySelectorAll('.nav__mobile a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* ── Active nav link ── */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(link => {
    if (link.getAttribute('href') === page) link.classList.add('active');
  });

  /* ── Scroll reveal ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

  /* ── Hero parallax ── */
  const heroContent = document.querySelector('.hero__content');
  if (heroContent) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroContent.style.transform = `translateY(${y * 0.2}px)`;
      heroContent.style.opacity = Math.max(0, 1 - y / 580);
    }, { passive: true });
  }

  /* ── Realizations filter ── */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const realItems  = document.querySelectorAll('.real-item[data-cat]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;
      realItems.forEach(item => {
        const show = cat === 'all' || item.dataset.cat === cat;
        if (show) {
          item.style.display = '';
          setTimeout(() => { item.style.opacity = '1'; item.style.transform = ''; }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => { item.style.display = 'none'; }, 280);
        }
      });
    });
  });

  /* ── Team profile modal ── */
  const modalOverlay = document.querySelector('.modal-overlay');
  const modalClose   = document.querySelector('.modal__close');
  if (modalOverlay) {
    document.querySelectorAll('[data-profile]').forEach(btn => {
      btn.addEventListener('click', () => { modalOverlay.classList.add('open'); document.body.style.overflow = 'hidden'; });
    });
    const closeModal = () => { modalOverlay.classList.remove('open'); document.body.style.overflow = ''; };
    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
  }

  /* ── Contact form ── */
  const form = document.querySelector('.contact__form form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const orig = btn.innerHTML;
      btn.innerHTML = '<span>Message envoyé ✓</span>';
      btn.style.background = '#16a34a';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; form.reset(); }, 3500);
    });
  }

  /* ══════════════════════════════════════════
     CANVAS — Architectural grid + particles
     Clean, minimal, no buildings, no scan lines
     ══════════════════════════════════════════ */
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, animId, time = 0;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  /* Floating particles */
  const particles = Array.from({ length: 22 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.2,
    vy: 0.00012 + Math.random() * 0.00016,
    alpha: 0.04 + Math.random() * 0.07,
    phase: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.00006,
  }));

  /* Perspective grid lines (architectural feel) */
  function drawGrid() {
    const vp = { x: W * 0.5, y: H * 0.22 };
    const alpha = 0.028 + 0.008 * Math.sin(time * 0.25);

    ctx.strokeStyle = `rgba(232,99,10,${alpha})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    /* Horizontal lines from vanishing point */
    const rows = 7;
    for (let r = 1; r <= rows; r++) {
      const t = r / rows;
      const y  = vp.y + t * (H - vp.y) * 1.15;
      const hw = t * W * 0.7;
      ctx.moveTo(vp.x - hw, y);
      ctx.lineTo(vp.x + hw, y);
    }

    /* Converging vertical lines */
    const cols = 10;
    for (let c = 0; c <= cols; c++) {
      const t  = c / cols;
      const x0 = vp.x + (t - 0.5) * W * 1.4;
      ctx.moveTo(vp.x, vp.y);
      ctx.lineTo(x0, H * 1.1);
    }

    ctx.stroke();
  }

  /* Orange corner accent dots */
  function drawCornerAccents() {
    const alpha = 0.06 + 0.03 * Math.sin(time * 0.4);
    ctx.fillStyle = `rgba(232,99,10,${alpha})`;

    const dotSize = 2;
    const spacing = 18;
    const count   = 6;
    const margin  = 40;

    for (let i = 0; i < count; i++) {
      for (let j = 0; j < count; j++) {
        ctx.fillRect(margin + j * spacing, margin + i * spacing, dotSize, dotSize);
        ctx.fillRect(W - margin - dotSize - j * spacing, margin + i * spacing, dotSize, dotSize);
      }
    }
  }

  /* Floating particles */
  function drawParticles() {
    particles.forEach(p => {
      p.y -= p.vy;
      p.x += p.vx;
      if (p.y < -0.02) { p.y = 1.02; p.x = Math.random(); }
      if (p.x < 0) p.x = 1;
      if (p.x > 1) p.x = 0;

      const a = p.alpha * (0.5 + 0.5 * Math.sin(time * 1.5 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,99,10,${a})`;
      ctx.fill();
    });
  }

  function render() {
    ctx.clearRect(0, 0, W, H);
    time += 0.004;

    drawGrid();
    drawCornerAccents();
    drawParticles();

    animId = requestAnimationFrame(render);
  }

  render();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) cancelAnimationFrame(animId);
    else render();
  });

});
