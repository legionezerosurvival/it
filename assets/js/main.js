(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Nav: sfondo allo scroll
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menu mobile
  const burger = $('#burger');
  const links = $('#navLinks');
  const toggleMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    links.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => toggleMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', links).forEach(a => a.addEventListener('click', () => toggleMenu(false)));

  // Reveal on scroll (con piccolo stagger tra fratelli)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = $$('.reveal', e.target.parentElement);
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 6) * 90}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // Contatori
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const dur = 1800;
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = v.toLocaleString('it-IT') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counterIO.observe(el));

  // Parallax leggero sugli sfondi
  const parallax = $$('.band__bg, .camp__bg');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && parallax.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallax.forEach(bg => {
        const r = bg.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        bg.style.transform = `translate3d(0, ${p * -80}px, 0)`;
      });
      ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  // Tabs percorsi
  const tabs = $$('.tab');
  const ink = $('.tabs__ink');
  const moveInk = (btn) => {
    ink.style.width = `${btn.offsetWidth}px`;
    ink.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    tabs.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    $$('.panel').forEach(p => p.classList.toggle('is-active', p.id === `panel-${btn.dataset.tab}`));
    moveInk(btn);
  }));
  const syncInk = () => moveInk($('.tab.is-active'));
  window.addEventListener('resize', syncInk);
  document.fonts ? document.fonts.ready.then(syncInk) : window.addEventListener('load', syncInk);
  syncInk();

  // Slider recensioni
  const slider = $('#slider');
  const track = $('.slider__track', slider);
  const slides = $$('.review', track);
  const dots = $('.slider__dots', slider);
  let idx = 0, timer;
  const go = (i) => {
    idx = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    $$('button', dots).forEach((d, j) => d.classList.toggle('is-active', j === idx));
  };
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Recensione ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dots.appendChild(b);
  });
  const restart = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 6000); };
  // swipe su mobile
  let x0 = null;
  track.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    x0 = null;
  });
  go(0); restart();

  // Lightbox gallery
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  $$('.g').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    lbImg.src = a.getAttribute('href');
    lbImg.alt = $('img', a).alt;
    lb.hidden = false;
    document.body.classList.add('menu-open');
  }));
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('menu-open'); };
  lb.addEventListener('click', e => { if (e.target !== lbImg) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !lb.hidden) closeLb(); });

  // Form demo
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    $('#formOk').hidden = false;
    e.target.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
