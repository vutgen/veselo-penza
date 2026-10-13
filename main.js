(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // header + progress + parallax
  const header = $('#header'), bar = $('#progress');
  const par = $$('[data-parallax]');
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (y / h * 100) + '%';
    header.classList.toggle('scrolled', y > 40);
    if (!reduce && y < innerHeight * 1.2) {
      par.forEach(el => {
        const k = parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${-y * k * 3}px`;
      });
    }
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // mobile menu
  const burger = $('#burger'), nav = $('#nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  $$('a', nav).forEach(a => a.addEventListener('click', () => {
    burger.classList.remove('open'); nav.classList.remove('open');
  }));

  // reveal + counters
  const countUp = el => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0);
    const t0 = performance.now(), dur = 1400;
    const step = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec).replace('.', ',');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-count]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15 });
  $$('.reveal').forEach(el => io.observe(el));

  // card tilt
  if (!reduce && matchMedia('(hover:hover)').matches) {
    $$('.tilt').forEach(c => {
      c.addEventListener('mousemove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        c.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateY(-4px)`;
      });
      c.addEventListener('mouseleave', () => c.style.transform = '');
    });
  }

  // drag gallery
  const g = $('#gallery-track');
  let down = false, sx = 0, sl = 0;
  g.addEventListener('pointerdown', e => { down = true; sx = e.clientX; sl = g.scrollLeft; g.classList.add('drag'); });
  addEventListener('pointerup', () => { down = false; g.classList.remove('drag'); });
  addEventListener('pointermove', e => { if (down && e.pointerType === 'mouse') g.scrollLeft = sl - (e.clientX - sx); });

  // confetti
  const cv = $('#confetti'), ctx = cv.getContext('2d');
  let parts = [], running = false;
  const size = () => { cv.width = innerWidth; cv.height = innerHeight; };
  size(); addEventListener('resize', size);
  const colors = ['#ef7f5b', '#f6c453', '#7cb8e8', '#f4b6c2', '#6f9a86'];
  const burst = (x, y) => {
    if (reduce) return;
    for (let i = 0; i < 90; i++) {
      const a = Math.random() * Math.PI * 2, v = 4 + Math.random() * 9;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 5, s: 5 + Math.random() * 6,
        c: colors[i % colors.length], r: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 1 });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  };
  const tick = () => {
    ctx.clearRect(0, 0, cv.width, cv.height);
    parts = parts.filter(p => p.life > 0);
    parts.forEach(p => {
      p.vy += .3; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= .011;
      ctx.save(); ctx.globalAlpha = Math.max(p.life, 0); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * .6); ctx.restore();
    });
    if (parts.length) requestAnimationFrame(tick); else { running = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  };
  $$('.btn').forEach(b => b.addEventListener('click', e => burst(e.clientX, e.clientY)));
  $$('.balloon').forEach(b => b.addEventListener('click', e => burst(e.clientX, e.clientY)));

  // form -> WhatsApp
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const text = `Здравствуйте! Меня зовут ${f.get('name')}. Интересует: ${f.get('kind')}. Мой телефон: ${f.get('phone')}.`;
    const r = e.target.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2);
    setTimeout(() => open('https://wa.me/79093220252?text=' + encodeURIComponent(text), '_blank'), 700);
  });
})();
