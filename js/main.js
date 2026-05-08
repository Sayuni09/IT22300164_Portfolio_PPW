/* ════════════════════════════════════════
   MAIN.JS — Sayuni Ellepola Portfolio
   ════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Init Lucide icons ──
  if (window.lucide) lucide.createIcons();

  // ── Custom cursor ──
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursorDot');
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.left = mouseX + 'px';
    cursorDot.style.top  = mouseY + 'px';
    document.body.classList.add('cursor-ready');
  });

  function animCursor() {
    curX += (mouseX - curX) * 0.1;
    curY += (mouseY - curY) * 0.1;
    cursor.style.left = curX + 'px';
    cursor.style.top  = curY + 'px';
    requestAnimationFrame(animCursor);
  }
  animCursor();

  document.querySelectorAll('a, button, .wtab, .badge, .contact-chip').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.style.transform = 'translate(-50%,-50%) scale(1.6)');
    el.addEventListener('mouseleave', () => cursor.style.transform = 'translate(-50%,-50%) scale(1)');
  });

  // ── Animated mesh canvas ──
  const canvas = document.getElementById('meshCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, points;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
      initPoints();
    }

    function initPoints() {
      points = [];
      const cols = 8, rows = 5;
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          points.push({
            x: (c / cols) * W,
            y: (r / rows) * H,
            ox: (c / cols) * W,
            oy: (r / rows) * H,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            r:  Math.random() * 30 + 10,
          });
        }
      }
    }

    function drawMesh() {
      ctx.clearRect(0, 0, W, H);

      // Gradient blobs
      const blobs = [
        { x: W * 0.2, y: H * 0.3, r: W * 0.35, c1: 'rgba(124,58,237,0.25)', c2: 'transparent' },
        { x: W * 0.8, y: H * 0.6, r: W * 0.3,  c1: 'rgba(245,158,11,0.12)', c2: 'transparent' },
        { x: W * 0.5, y: H * 0.8, r: W * 0.25, c1: 'rgba(124,58,237,0.1)',  c2: 'transparent' },
      ];
      blobs.forEach(b => {
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        g.addColorStop(0, b.c1);
        g.addColorStop(1, b.c2);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Animate + draw mesh lines
      points.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.x - p.ox) > p.r) p.vx *= -1;
        if (Math.abs(p.y - p.oy) > p.r) p.vy *= -1;
      });

      // Connect nearby points
      ctx.strokeStyle = 'rgba(124,58,237,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 180) {
            ctx.globalAlpha = (1 - dist / 180) * 0.5;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      requestAnimationFrame(drawMesh);
    }

    window.addEventListener('resize', resize);
    resize();
    drawMesh();
  }

  // ── Side nav dots — active on scroll ──
  const sections = document.querySelectorAll('section[id]');
  const snDots   = document.querySelectorAll('.sn-dot');

  function updateSidenav() {
    const mid = window.scrollY + window.innerHeight / 2;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const bot = top + sec.offsetHeight;
      if (mid >= top && mid < bot) {
        snDots.forEach(d => d.classList.remove('active'));
        const dot = document.querySelector(`.sn-dot[href="#${sec.id}"]`);
        if (dot) dot.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', updateSidenav, { passive: true });
  updateSidenav();

  // ── Smooth scroll ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ── Journal week tabs ──
  const tabs   = document.querySelectorAll('.wtab');
  const panels = document.querySelectorAll('.jpanel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const week = tab.dataset.week;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.querySelector(`.jpanel[data-week="${week}"]`);
      if (panel) {
        panel.classList.add('active');
        // animate cards in
        const cards = panel.querySelectorAll('.gibbs-card');
        cards.forEach((c, i) => {
          c.style.opacity = '0';
          c.style.transform = 'translateY(14px)';
          setTimeout(() => {
            c.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
            c.style.opacity = '1';
            c.style.transform = 'translateY(0)';
          }, i * 50);
        });
      }
    });
  });

  // ── Skill bars — animate on scroll ──
  const fills = document.querySelectorAll('.sp-fill');
  let skillsDone = false;

  const skillObs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !skillsDone) {
      skillsDone = true;
      fills.forEach((f, i) => {
        const target = f.style.getPropertyValue('--w') || '0%';
        f.style.setProperty('--w', '0%');
        setTimeout(() => f.style.setProperty('--w', target), i * 120 + 200);
      });
    }
  }, { threshold: 0.3 });

  const careerSec = document.getElementById('career');
  if (careerSec) skillObs.observe(careerSec);

  // ── Reveal on scroll (cards, sections) ──
  const revealEls = document.querySelectorAll(
    '.badge, .stat-block, .swot-card, .tl-card, .sp-item, .cv-entry, .tl-item'
  );

  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });

  const revealObs = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 40);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObs.observe(el));

});
