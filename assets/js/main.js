(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = () => matchMedia('(max-width: 640px)').matches;

  // ---------- Nav: sfondo allo scroll + FAB ----------
  const nav = $('#nav');
  const fab = $('.fab');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 40);
    fab.classList.toggle('is-on', y > window.innerHeight * 0.8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Menu overlay ----------
  const burger = $('#burger');
  const menu = $('#menu');
  const toggleMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Chiudi menu' : 'Apri menu');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('no-scroll', open);
  };
  burger.addEventListener('click', () => toggleMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('is-open')) toggleMenu(false); });
  matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) toggleMenu(false); });

  // ---------- Scrollspy sul menu desktop ----------
  const navLinks = $$('.nav__links a');
  const spyIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === `#${e.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach(a => { const s = $(a.getAttribute('href')); if (s) spyIO.observe(s); });

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const siblings = $$(':scope > .reveal', e.target.parentElement);
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 6) * 80}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  // ---------- Contatori ----------
  const counterIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / 1600, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(el => counterIO.observe(el));

  // ---------- Parallax leggero ----------
  const parallax = $$('.band__bg, .camp__bg');
  if (!reduce && parallax.length) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      parallax.forEach(bg => {
        const r = bg.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh;
        bg.style.transform = `translate3d(0, ${p * -70}px, 0)`;
      });
      ticking = false;
    };
    update();
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }

  // ---------- Tabs percorsi (cambia anche il titolo rilasciato nei livelli) ----------
  const tabs = $$('.tab');
  const ink = $('.tabs__ink');
  const moveInk = (btn) => {
    ink.style.width = `${btn.offsetWidth}px`;
    ink.style.transform = `translateX(${btn.offsetLeft - 6}px)`;
  };
  tabs.forEach(btn => btn.addEventListener('click', () => {
    const key = btn.dataset.tab;
    tabs.forEach(b => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-selected', b === btn); });
    $$('.panel').forEach(p => p.classList.toggle('is-active', p.id === `panel-${key}`));
    $$('[data-lz]').forEach(s => { s.textContent = s.dataset[key]; });
    moveInk(btn);
  }));
  const syncInk = () => moveInk($('.tab.is-active'));
  window.addEventListener('resize', syncInk);
  if (document.fonts) document.fonts.ready.then(syncInk);
  syncInk();

  // ---------- Livelli: fisarmonica su mobile ----------
  $$('.lvl').forEach(li => {
    const head = $('.lvl__head', li);
    head.addEventListener('click', () => {
      if (!isMobile()) return;
      const open = !li.classList.contains('is-open');
      li.classList.toggle('is-open', open);
      head.setAttribute('aria-expanded', open);
    });
  });

  // ---------- Contatti: solo WhatsApp o email ----------
  const WA = '393209004282';
  const MAIL = 'info@legionezerosurvival.it';
  const waLink = text => `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

  // ---------- Form: precompila interesse/messaggio ----------
  const interest = $('#interesse');
  const msg = $('#msg');
  const prefill = (value, text) => {
    if (value) [...interest.options].forEach(o => { if (o.text === value) interest.value = o.value; });
    if (text) msg.value = text;
  };
  $$('[data-interest]').forEach(a => a.addEventListener('click', () => prefill(a.dataset.interest)));

  // ==========================================================
  // CALENDARIO 2027
  // ==========================================================
  const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
  const MESI_LUNGHI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const events = $$('.ev').map(el => {
    // senza data-start = evento "prossimamente", data ancora da definire
    const start = el.dataset.start ? parse(el.dataset.start) : null;
    const end = el.dataset.end ? parse(el.dataset.end) : start;
    return { el, start, end, month: start ? start.getMonth() : null, type: el.dataset.type, key: el.dataset.key || '', title: $('h3', el).textContent.trim() };
  });
  const real = events.filter(e => e.type !== 'off');
  const dated = real.filter(e => e.start);

  const fmtRange = (e) => {
    if (!e.start) return 'data in arrivo';
    const m = MESI_LUNGHI[e.end.getMonth()];
    return e.start.getTime() === e.end.getTime()
      ? `${e.start.getDate()} ${m} ${e.start.getFullYear()}`
      : `${e.start.getDate()}–${e.end.getDate()} ${m} ${e.end.getFullYear()}`;
  };

  // passati / prossimo
  dated.forEach(e => e.el.classList.toggle('is-past', e.end < today));
  const next = dated.find(e => e.end >= today);
  if (next) {
    next.el.classList.add('is-next');
    const chip = $('#nextOp');
    $('.next-op__title', chip).textContent = next.title;
    const days = Math.round((next.start - today) / 864e5);
    $('.next-op__date', chip).textContent = fmtRange(next) + (days > 0 ? ` · tra ${days} giorni` : ' · in corso');
    chip.hidden = false;
  }

  // file .ics per "aggiungi al calendario"
  const pad = n => String(n).padStart(2, '0');
  const icsDate = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const downloadIcs = (e) => {
    const endExcl = new Date(e.end); endExcl.setDate(endExcl.getDate() + 1);
    const p = $('p', e.el);
    const desc = p ? p.textContent.trim() : 'Legione Zero – Programmazione 2027';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Legione Zero//Calendario 2027//IT',
      'BEGIN:VEVENT',
      `UID:${icsDate(e.start)}-${e.title.replace(/\W+/g, '-').toLowerCase()}@legionezero`,
      `DTSTAMP:${icsDate(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(e.start)}`,
      `DTEND;VALUE=DATE:${icsDate(endExcl)}`,
      `SUMMARY:Legione Zero · ${e.title}`,
      `DESCRIPTION:${desc.replace(/[,;]/g, m => '\\' + m)}`,
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `legione-zero-${icsDate(e.start)}.ics` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // azioni su ogni evento
  real.forEach(e => {
    const actions = document.createElement('div');
    actions.className = 'ev__actions';
    const info = Object.assign(document.createElement('a'), {
      href: waLink(`Ciao, vorrei informazioni su: ${e.title} (${fmtRange(e)}).`),
      target: '_blank', rel: 'noopener', textContent: 'Info su WhatsApp'
    });
    const mail = Object.assign(document.createElement('a'), {
      href: `mailto:${MAIL}?subject=${encodeURIComponent('Info: ' + e.title)}&body=${encodeURIComponent(`Ciao, vorrei informazioni su: ${e.title} (${fmtRange(e)}).`)}`,
      textContent: 'Email'
    });
    const add = Object.assign(document.createElement('button'), { type: 'button', textContent: '+ Calendario' });
    add.addEventListener('click', () => downloadIcs(e));
    actions.append(info, mail);
    if (e.start) actions.append(add);
    $('.ev__body', e.el).appendChild(actions);
  });

  // barra mesi
  const monthsBar = $('#months');
  MESI.forEach((m, i) => {
    const n = dated.filter(e => e.month === i).length;
    const b = document.createElement('button');
    b.className = 'month' + (n ? '' : ' is-empty');
    if (today.getFullYear() === 2027 && today.getMonth() === i) b.classList.add('is-now');
    b.dataset.month = i;
    b.style.setProperty('--n', n);
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', `${MESI_LUNGHI[i]}: ${n ? n + (n > 1 ? ' appuntamenti' : ' appuntamento') : 'nessuna attività'}`);
    b.innerHTML = `${m}<i></i>`;
    monthsBar.appendChild(b);
  });

  const state = { type: 'all', month: null, key: null };
  const applyFilter = () => {
    let shown = 0;
    events.forEach(e => {
      const okType = state.type === 'all' || e.type === state.type;
      const okMonth = state.month === null || e.month === state.month;
      const okKey = !state.key || e.key === state.key;
      const show = okType && okMonth && okKey;
      e.el.hidden = !show;
      if (show) shown++;
    });
    $('#calEmpty').hidden = shown > 0;
    $$('.chip').forEach(c => c.classList.toggle('is-active', !state.key && c.dataset.type === state.type));
    $$('.month').forEach(b => {
      const on = +b.dataset.month === state.month;
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
    });
  };
  $$('.chip').forEach(c => c.addEventListener('click', () => { state.type = c.dataset.type; state.key = null; applyFilter(); }));
  $$('.month').forEach(b => b.addEventListener('click', () => {
    const m = +b.dataset.month;
    state.month = state.month === m ? null : m;
    state.key = null;
    applyFilter();
  }));
  $$('[data-filter-link]').forEach(a => a.addEventListener('click', () => {
    Object.assign(state, { type: 'all', month: null, key: a.dataset.filterLink });
    applyFilter();
  }));
  applyFilter();

  // ---------- Slider recensioni ----------
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
  const restart = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(idx + 1), 6500); };
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Recensione ${i + 1}`);
    b.addEventListener('click', () => { go(i); restart(); });
    dots.appendChild(b);
  });
  const swipe = (el, onLeft, onRight) => {
    let x0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) (dx < 0 ? onLeft : onRight)();
      x0 = null;
    });
  };
  swipe(track, () => { go(idx + 1); restart(); }, () => { go(idx - 1); restart(); });
  go(0); restart();

  // ---------- Lightbox galleria ----------
  const lb = $('#lightbox');
  const lbImg = $('img', lb);
  let shots = [];
  let cur = 0;
  const show = (i) => {
    cur = (i + shots.length) % shots.length;
    lbImg.src = shots[cur].getAttribute('href');
    lbImg.alt = $('img', shots[cur]).alt;
  };
  // ogni gruppo (galleria, locandine) si sfoglia per conto suo; per le locandine solo quelle visibili col filtro attivo
  const openLb = (group, link, poster) => {
    shots = group();
    lb.classList.toggle('lightbox--poster', poster);
    show(shots.indexOf(link));
    lb.hidden = false;
    document.body.classList.add('no-scroll');
  };
  $$('.g').forEach(a => a.addEventListener('click', e => { e.preventDefault(); openLb(() => $$('.g'), a, false); }));
  $$('.ev__poster').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    openLb(() => $$('.ev__poster').filter(p => !p.closest('.ev').hidden), a, true);
  }));
  const closeLb = () => { lb.hidden = true; document.body.classList.remove('no-scroll'); };
  $('.lightbox__prev', lb).addEventListener('click', e => { e.stopPropagation(); show(cur - 1); });
  $('.lightbox__next', lb).addEventListener('click', e => { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', e => { if (e.target === lb || e.target.classList.contains('lightbox__close')) closeLb(); });
  swipe(lb, () => show(cur + 1), () => show(cur - 1));
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowRight') show(cur + 1);
    if (e.key === 'ArrowLeft') show(cur - 1);
  });

  // ---------- Form: compone il messaggio e lo apre in WhatsApp o nella mail ----------
  $('#form').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const nome = f.nome.value.trim();
    const text = [`Ciao, sono ${nome}.`, `Interesse: ${f.interesse.value}.`, f.msg.value.trim()].filter(Boolean).join('\n');
    const via = e.submitter ? e.submitter.value : 'wa';
    if (via === 'mail') {
      location.href = `mailto:${MAIL}?subject=${encodeURIComponent(`Richiesta info – ${f.interesse.value}`)}&body=${encodeURIComponent(text)}`;
    } else {
      window.open(waLink(text), '_blank', 'noopener');
    }
  });

  $('#year').textContent = new Date().getFullYear();
})();
