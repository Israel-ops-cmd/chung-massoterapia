/* Tun Fu Chung Massoterapia: animações em JavaScript puro, sem bibliotecas. */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ---------- navbar ---------- */
  const nav = $('.nav');
  const toggle = $('.nav__toggle');
  const menu = $('#menu');
  let lastY = window.scrollY;

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.classList.toggle('is-open', open);
    document.body.classList.toggle('menu-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- revelar palavras (títulos) ---------- */
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            w.className = 'word';
            const inner = document.createElement('span');
            inner.textContent = part;
            inner.style.setProperty('--wi', i++);
            w.appendChild(inner);
            frag.appendChild(w);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    el.setAttribute('aria-label', el.textContent.trim());
    walk(el);
    $$('.word', el).forEach((w) => w.setAttribute('aria-hidden', 'true'));
  };
  $$('[data-words]').forEach(splitWords);

  /* cascata: atraso progressivo para irmãos com fade-up */
  $$('.hero__text, .steps__list, .bento, .about__text, .where__grid, .final__text').forEach((group) => {
    $$('.fade-up', group).forEach((el, k) => el.style.setProperty('--d', `${Math.min(k * 0.09, 0.5)}s`));
  });

  /* ---------- aparecer ao entrar na tela ---------- */
  // máscaras com clip-path não contam como visíveis para o observer,
  // então observamos o elemento pai e revelamos a máscara dentro dele
  const masks = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      (masks.get(e.target) || [e.target]).forEach((el) => el.classList.add('in'));
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  $$('.fade-up, .final__cut, [data-words]:not(.hero__title)').forEach((el) => io.observe(el));
  $$('.reveal-mask').forEach((el) => {
    const host = el.parentElement;
    if (!masks.has(host)) { masks.set(host, host.classList.contains('fade-up') ? [host] : []); io.observe(host); }
    masks.get(host).push(el);
  });

  const hero = $('.hero');
  // espera a entrada (só na primeira visita da sessão) antes de animar o hero
  const intro = $('.intro');
  const introOn = intro && !reduce && !document.documentElement.classList.contains('no-intro');
  setTimeout(() => requestAnimationFrame(() => {
    hero.classList.add('in');
    $('.hero__title').classList.add('in');
  }), introOn ? 2350 : 0);
  if (intro) setTimeout(() => intro.remove(), introOn ? 3300 : reduce ? 1200 : 0);

  /* ---------- odômetro ---------- */
  const odo = (el) => {
    const target = el.dataset.odo;
    el.textContent = '';
    [...target].forEach((d, k) => {
      const wrap = document.createElement('span');
      wrap.className = 'odo__d';
      wrap.setAttribute('aria-hidden', 'true');
      const col = document.createElement('span');
      col.className = 'odo__col';
      const n = +d;
      const loops = 10 + n; // gira uma volta inteira antes de parar
      for (let i = 0; i <= loops; i++) {
        const s = document.createElement('span');
        s.textContent = i % 10;
        col.appendChild(s);
      }
      col.style.transitionDelay = `${k * 0.12}s`;
      wrap.appendChild(col);
      el.appendChild(wrap);
      col.dataset.stop = loops;
    });
    const run = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      $$('.odo__col', el).forEach((c) => { c.style.transform = `translateY(-${c.dataset.stop * 1.15}em)`; });
      run.disconnect();
    }, { threshold: 0.5 });
    run.observe(el);
  };
  if (!reduce) $$('[data-odo]').forEach(odo);

  /* ---------- texto que se preenche (manifesto) ---------- */
  const fill = $('[data-fill]');
  let fillWords = [];
  if (fill) {
    const words = fill.textContent.trim().split(/\s+/);
    const accentFrom = words.findIndex((w) => w.startsWith('voltar'));
    fill.setAttribute('aria-label', fill.textContent.trim());
    fill.innerHTML = words.map((w, i) =>
      `<span class="w${accentFrom > -1 && i >= accentFrom ? ' accent' : ''}" aria-hidden="true">${w}</span>`).join(' ');
    fillWords = $$('.w', fill);
  }

  /* ---------- galeria horizontal dos depoimentos ---------- */
  const quotes = $('.quotes');
  const track = $('.quotes__track');
  const canPin = () => fine && !reduce && window.innerWidth >= 900;
  let pinDistance = 0;
  const setupPin = () => {
    if (!quotes) return;
    if (canPin()) {
      quotes.classList.add('is-pinned');
      track.style.transform = '';
      pinDistance = Math.max(0, track.scrollWidth - window.innerWidth + 80);
      quotes.style.setProperty('--pin-h', `${window.innerHeight + pinDistance}px`);
    } else {
      quotes.classList.remove('is-pinned');
      track.style.transform = '';
      pinDistance = 0;
    }
  };

  /* ---------- elementos ligados à rolagem ---------- */
  const frame = $('[data-parallax]');
  const cards = $$('.stack__card');
  const waFloat = $('.wa-float');
  const finalSec = $('.final');
  const footer = $('.footer');

  const onScroll = () => {
    const y = window.scrollY;
    const vh = window.innerHeight;

    // navbar
    nav.classList.toggle('is-solid', y > 40);
    if (!document.body.classList.contains('menu-open')) {
      nav.classList.toggle('is-hidden', y > lastY && y > vh * 0.8);
    }
    lastY = y;

    if (reduce) return;

    // parallax leve na foto do hero
    if (frame && y < vh * 1.2) frame.style.transform = `translate3d(0, ${y * 0.08}px, 0)`;

    // manifesto
    if (fillWords.length) {
      const r = fill.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0, 1);
      const lit = p * (fillWords.length + 3);
      fillWords.forEach((w, i) => w.classList.toggle('on', i < lit - 1));
    }

    // cartões que empilham: os de baixo encolhem e escurecem
    if (window.innerWidth >= 900) {
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        const inner = card.firstElementChild;
        if (!next) { card.style.transform = ''; inner.style.filter = ''; return; }
        const a = card.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        const p = clamp((a.bottom - b.top) / a.height, 0, 1);
        card.style.transform = `scale(${1 - p * 0.06})`;
        inner.style.filter = `brightness(${1 - p * 0.18})`;
      });
    }

    // galeria horizontal
    if (pinDistance > 0) {
      const r = quotes.getBoundingClientRect();
      const p = clamp(-r.top / (quotes.offsetHeight - vh), 0, 1);
      track.style.transform = `translate3d(${-p * pinDistance}px, 0, 0)`;
    }

    // WhatsApp flutuante some na chamada final e no rodapé
    const fr = finalSec.getBoundingClientRect();
    const ft = footer.getBoundingClientRect();
    waFloat.classList.toggle('is-away', (fr.top < vh * 0.6 && fr.bottom > 0) || ft.top < vh);
  };

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });

  let rz;
  window.addEventListener('resize', () => {
    clearTimeout(rz);
    rz = setTimeout(() => { setupPin(); onScroll(); }, 150);
  });
  setupPin();
  onScroll();

  /* ---------- sanfona com altura animada ---------- */
  $$('.faq__item').forEach((d) => {
    const summary = $('summary', d);
    const body = $('.faq__body', d);
    summary.addEventListener('click', (e) => {
      if (reduce) return;
      e.preventDefault();
      if (d.open) {
        const anim = body.animate([{ height: `${body.offsetHeight}px` }, { height: '0px' }], { duration: 380, easing: 'cubic-bezier(.22,.8,.24,1)' });
        anim.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        body.animate([{ height: '0px' }, { height: `${body.offsetHeight}px` }], { duration: 480, easing: 'cubic-bezier(.22,.8,.24,1)' });
      }
    });
  });

  /* ---------- rolagem com inércia (só desktop com mouse) ---------- */
  if (fine && !reduce) {
    let target = window.scrollY;
    let current = window.scrollY;
    let running = false;
    const max = () => document.documentElement.scrollHeight - window.innerHeight;

    const step = () => {
      current += (target - current) * 0.1;
      if (Math.abs(target - current) < 0.5) {
        current = target;
        running = false;
      }
      window.scrollTo(0, current);
      if (running) requestAnimationFrame(step);
    };
    const start = () => { if (!running) { running = true; requestAnimationFrame(step); } };

    window.addEventListener('wheel', (e) => {
      if (e.ctrlKey || document.body.classList.contains('menu-open')) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.target.closest('iframe, .quotes__track[data-native]')) return;
      e.preventDefault();
      if (!running) current = target = window.scrollY;
      const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? window.innerHeight : 1;
      target = clamp(target + e.deltaY * unit, 0, max());
      start();
    }, { passive: false });

    // teclado, barra de rolagem e outros: mantém o alvo sincronizado
    window.addEventListener('scroll', () => { if (!running) current = target = window.scrollY; }, { passive: true });

    // links internos com o mesmo deslize
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const el = id.length > 1 ? $(id) : null;
        if (!el && id !== '#topo') return;
        e.preventDefault();
        const navOffset = nav.offsetHeight + 12;
        const top = id === '#topo' ? 0 : el.getBoundingClientRect().top + window.scrollY - navOffset;
        current = window.scrollY;
        target = clamp(top, 0, max());
        start();
        history.replaceState(null, '', id);
      });
    });
  }
})();
