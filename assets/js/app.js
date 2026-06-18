/* ==================================================================
   app.js — Glória PT application shell, router, and all modules.
   Depends on: i18n, icons, ui, store, tts, ptnum, staticdata,
               conjugator, lexicon.
   ================================================================== */
'use strict';

(() => {
  const { el, clear, randInt, shuffle, sample, sampleN, toast, posLabel, PRONOUN_LABEL, norm } = UI;
  const main = document.getElementById('main');
  const bannerHost = document.getElementById('bannerHost');
  let currentView = 'home';

  /* ============================================================ *
   *  Shared widgets
   * ============================================================ */

  // Round speaker button wired to TTS with graceful degradation.
  function ttsButton(getText) {
    const btn = el('button.tts-btn', { title: t('common.listen'), 'aria-label': t('common.listen'), html: ICONS.speaker() });
    if (!TTS.available()) { btn.disabled = true; btn.innerHTML = ICONS.speakerOff(); }
    btn.addEventListener('click', async () => {
      const text = typeof getText === 'function' ? getText() : getText;
      try { await TTS.speak(text); }
      catch (e) { btn.disabled = true; btn.innerHTML = ICONS.speakerOff(); toast(t('tts.unavailable')); }
    });
    return btn;
  }

  // Compact speaker for dense rows (e.g. conjugation tables).
  function ttsMini(getText) {
    const b = el('button.tts-mini', { title: t('common.listen'), 'aria-label': t('common.listen'), html: ICONS.speaker() });
    if (!TTS.available()) { b.disabled = true; b.innerHTML = ICONS.speakerOff(); }
    b.addEventListener('click', async (e) => {
      e.stopPropagation();
      try { await TTS.speak(typeof getText === 'function' ? getText() : getText); }
      catch (err) { b.disabled = true; b.innerHTML = ICONS.speakerOff(); toast(t('tts.unavailable')); }
    });
    return b;
  }

  function viewHead(titleKey) {
    return el('div.view-head', {}, [
      el('button.back-btn', { html: ICONS.chevL(), 'aria-label': t('nav.back'), onclick: () => navigate('home') }),
      el('h2', { text: t(titleKey) }),
    ]);
  }

  // Bottom advance button: starts as "skip" (give up this item); once the user
  // has answered it flips to "next" via flipNext().
  function skipButton(onClick) {
    return el('button.btn.ghost.block.mt', { html: ICONS.refresh() + '<span>' + t('common.skip') + '</span>', onclick: onClick });
  }
  function flipNext(btn) { btn.innerHTML = ICONS.chevR() + '<span>' + t('common.next') + '</span>'; }

  /* modal */
  let modalBack = null;
  function openModal(node) {
    closeModal();
    modalBack = el('div.modal-back', { onclick: (e) => { if (e.target === modalBack) closeModal(); } },
      el('div.modal', {}, node));
    document.body.appendChild(modalBack);
  }
  function closeModal() { if (modalBack) { modalBack.remove(); modalBack = null; } }

  /* About / cover overlay — shown when the logo is tapped on the home view.
     Acts as a brand "hook"; tapping anywhere (except the links) dismisses it. */
  let aboutEl = null;
  function showAbout() {
    closeAbout();
    aboutEl = el('div.about', {}, [
      el('div.about-main', {}, [
        el('img.about-logo', { src: 'assets/gloria.png', alt: 'Glória PT' }),
        el('div.about-title', { text: 'Glória Português' }),
        el('div.about-slogan', { text: t('about.slogan') }),
        el('a.about-teacher', { href: 'https://www.instagram.com/gloriaroh_/', target: '_blank', rel: 'noopener noreferrer' },
          [ el('span', { html: ICONS.instagram(), style: 'display:flex;' }), el('span', { text: t('about.teacher') }) ]),
      ]),
      el('a.about-creator', { href: 'https://lluc.dev/', target: '_blank', rel: 'noopener noreferrer', text: t('about.creator') }),
    ]);
    // dismiss unless an actual link was tapped
    aboutEl.addEventListener('click', (e) => { if (!e.target.closest('a')) closeAbout(); });
    document.body.appendChild(aboutEl);
  }
  function closeAbout() { if (aboutEl) { aboutEl.remove(); aboutEl = null; } }

  // Central scoring: every quiz interaction goes through here.
  function score(moduleKey, correct) { Store.recordResult(moduleKey, correct); }

  /* ============================================================ *
   *  Header (subtitle + language selector)
   * ============================================================ */
  let langOpen = false; // collapsed language selector state

  function renderHeader() {
    document.getElementById('appSubtitle').textContent = t('app.subtitle');

    // Streak flame chip — only when the streak is active and not disabled.
    const old = document.getElementById('streakChip');
    if (old) old.remove();
    if (Store.streakEnabled() && Store.getStreak() > 0) {
      const chip = el('button#streakChip.streak-chip', {
        title: t('streak.tip'), 'aria-label': t('streak.tip') + ' · ' + Store.getStreak(),
        html: ICONS.flame() + '<span>' + Store.getStreak() + '</span>',
        onclick: () => navigate('stats'),
      });
      document.getElementById('langSel').before(chip);
    }

    // Language selector: collapsed shows only the current flag; clicking it
    // expands the others; choosing any flag collapses it again.
    const sel = clear(document.getElementById('langSel'));
    sel.classList.toggle('collapsed', !langOpen);
    LANG_META.forEach(l => {
      const b = el('button', { text: l.flag, title: l.label, 'aria-label': l.label });
      if (getLang() === l.code) b.classList.add('active');
      b.addEventListener('click', () => {
        if (!langOpen) { langOpen = true; renderHeader(); return; }   // first tap: open
        langOpen = false;
        if (l.code !== getLang()) { setLang(l.code); renderHeader(); navigate(currentView, true); }
        else renderHeader();                                          // same flag: just close
      });
      sel.appendChild(b);
    });
    // On home, the logo opens the brand cover; elsewhere it returns home.
    document.getElementById('brand').onclick = () => { if (currentView === 'home') showAbout(); else navigate('home'); };
  }

  /* ============================================================ *
   *  Banners: data-loading status + vocabulary queue lock
   * ============================================================ */
  function renderBanners() {
    clear(bannerHost);
    if (Store.isLocked() && currentView !== 'voc') {
      const n = Store.getQueue().length;
      const b = el('div.banner.lock.glass', {}, [
        el('span', { html: ICONS.lock(), style: 'color:var(--pink-strong);display:flex;' }),
        el('div.banner-txt', { html: t('voc.locked.msg', { n }) }),
        el('button.btn.sm', { text: t('voc.locked.go'), onclick: () => navigate('voc') }),
      ]);
      bannerHost.appendChild(b);
    }
  }

  /* ============================================================ *
   *  Router
   * ============================================================ */
  const VIEWS = {};
  function navigate(view, keepScroll) {
    // Queue lock: block entry to the practice modules (home + read-only stats
    // stay reachable so the user can still see their progress).
    if (Store.isLocked() && view !== 'voc' && view !== 'home' && view !== 'stats') {
      toast(t('voc.locked.go'));
      view = 'voc';
    }
    currentView = view;
    try { history.replaceState(null, '', '#' + view); } catch (e) {}
    closeModal();
    closeAbout();
    renderHeader();       // keep the streak chip in sync after earning/losing it
    renderBanners();
    clear(main);
    (VIEWS[view] || VIEWS.home)();
    if (!keepScroll) window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }

  /* ============================================================ *
   *  HOME — equal-size module grid
   * ============================================================ */
  const MODULES = [
    { key: 'voc',    icon: 'cards',   tint: 'tint-voc',   view: 'voc' },
    { key: 'num',    icon: 'numbers', tint: 'tint-num',   view: 'numeros' },
    { key: 'color',  icon: 'colors',  tint: 'tint-color', view: 'cores' },
    { key: 'gender', icon: 'gender',  tint: '',           view: 'genero' },
    { key: 'write',  icon: 'write',   tint: '',           view: 'escrita' },
    { key: 'geo',    icon: 'geo',     tint: 'tint-geo',   view: 'geografia' },
    { key: 'horas',  icon: 'clock',   tint: 'tint-horas', view: 'horas' },
    { key: 'conj',   icon: 'conj',    tint: '',           view: 'conjugador' },
    { key: 'dict',   icon: 'dict',    tint: '',           view: 'dicionario' },
    { key: 'stats',  icon: 'stats',   tint: '',           view: 'stats' },
  ];

  VIEWS.home = function () {
    const v = el('div.view');
    v.appendChild(el('p.muted.mb', { text: t('home.title'), style: 'font-size:14px;margin:6px 0 10px;' }));
    const locked = Store.isLocked();
    const grid = el('div.grid');
    MODULES.forEach(m => {
      const isLockable = m.key !== 'voc';
      const card = el('div.mod-card' + (m.tint ? '.' + m.tint : ''), {
        tabindex: '0', role: 'button',
        onclick: () => navigate(m.view),
        onkeydown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(m.view); } },
      }, [
        el('div.ic', { html: ICONS[m.icon]() }),
        el('div', {}, [
          el('h3', { text: t('mod.' + m.key + '.name') }),
          el('p', { text: t('mod.' + m.key + '.desc') }),
        ]),
      ]);
      if (locked && isLockable) {
        card.classList.add('locked');
        card.appendChild(el('span.lockbadge', { html: ICONS.lock() }));
      }
      grid.appendChild(card);
    });
    v.appendChild(grid);
    main.appendChild(v);
  };

  /* ============================================================ *
   *  VOCABULARY CARDS
   * ============================================================ */
  let practiceStack = null;   // in-memory free-practice deck (no lock, no localStorage)

  VIEWS.voc = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.voc.name'));

    // 1) Free-practice mode takes over the whole screen while a stack is active.
    if (practiceStack && practiceStack.length) {
      v.appendChild(practiceCard());
      main.appendChild(v);
      return;
    }
    practiceStack = null;

    // 2) A pending daily review is mandatory and also takes over the screen —
    //    no add/practice actions here, only the review + a small give-up link.
    const queue = Store.getQueue();
    if (queue.length) {
      v.appendChild(reviewCard());
      main.appendChild(v);
      return;
    }

    // 3) Empty queue → the deck menu.
    const learnedCount = Store.getLearned().length;
    v.appendChild(el('button.btn.block.mb', { html: ICONS.plus() + '<span>' + t('voc.add.title') + '</span>', onclick: openAddModal }));
    if (learnedCount >= 1) {
      v.appendChild(el('button.btn.ghost.block.mb', { html: ICONS.refresh() + '<span>' + t('voc.practice') + '</span>', onclick: startPractice }));
      // learned count is clickable → manage (remove) learned words
      v.appendChild(el('p.hint', { text: t('voc.learnedCount', { n: learnedCount }),
        style: 'cursor:pointer;text-decoration:underline;text-underline-offset:3px;', onclick: openLearnedModal }));
    } else {
      v.appendChild(el('p.hint', { text: t('voc.learnedCount', { n: 0 }) }));
    }
    v.appendChild(el('div.empty', { text: t('voc.empty') }));
    main.appendChild(v);
  };

  // Shared front face of a flashcard (pos tag, word, speaker, direct_ko, defs, examples).
  function flashFace(card) {
    const nodes = [
      el('span.pos-tag', { text: posLabel(card.pos) }),
      el('div.word', { text: card.word }),
      el('div.tts-row', {}, ttsButton(() => card.word)),
    ];

    if (card.direct_ko) {
      nodes.push(el('div.flash-direct', { text: card.direct_ko }));
    }

    // Definitions: Korean by default, toggle to Portuguese
    const defs_ko = card.definitions_ko && card.definitions_ko.length ? card.definitions_ko : null;
    const defs_pt = card.definitions && card.definitions.length ? card.definitions : null;
    if (defs_ko || defs_pt) {
      const defSection = el('div.flash-def-section');
      const defList = el('div');
      let showingKo = !!defs_ko;

      const renderDefs = () => {
        clear(defList);
        const defs = showingKo && defs_ko ? defs_ko : defs_pt;
        if (defs) defs.forEach((d, i) => defList.appendChild(el('div.def', { text: (defs.length > 1 ? (i + 1) + '. ' : '') + d })));
      };
      renderDefs();

      if (defs_ko && defs_pt) {
        const toggleBtn = el('button.def-lang-toggle', { text: 'PT' });
        toggleBtn.addEventListener('click', () => {
          showingKo = !showingKo;
          renderDefs();
          toggleBtn.textContent = showingKo ? 'PT' : 'KO';
        });
        defSection.appendChild(toggleBtn);
      }
      defSection.appendChild(defList);
      nodes.push(defSection);
    }

    // Examples: Portuguese, with per-example Korean translation toggle
    const exs = card.examples ? card.examples.filter(Boolean) : [];
    exs.forEach((ex, i) => {
      const exKo = card.examples_ko && card.examples_ko[i];
      const exEl = el('div.example', { text: '“' + ex + '”' });
      if (exKo) {
        const transEl = el('div.example-ko', { text: exKo });
        transEl.hidden = true;
        const transBtn = el('button.trans-toggle', { text: t('voc.card.translate') });
        transBtn.addEventListener('click', () => {
          transEl.hidden = !transEl.hidden;
          transBtn.classList.toggle('active', !transEl.hidden);
        });
        nodes.push(el('div.example-wrap', {}, [exEl, el('div.example-actions', {}, transBtn), transEl]));
      } else {
        nodes.push(exEl);
      }
    });

    return el('div.flash', {}, nodes);
  }

  // One labelled action button + its small description underneath.
  function reviewBtn(cls, label, desc, onclick) {
    return el('div.btn-col', {}, [
      el('button' + cls, { text: label, onclick }),
      el('div.btn-desc', { text: desc }),
    ]);
  }

  // The shared Again | Hard | Good control (used by review AND practice).
  // h = { again, hard, good } handlers.
  function deckButtons(h) {
    return el('div.btn-row.mt', {}, [
      reviewBtn('.btn.again',    t('voc.again'), t('voc.desc.again'), h.again),  // → end of deck
      reviewBtn('.btn.ok-light', t('voc.hard'),  t('voc.desc.hard'),  h.hard),   // → middle of deck
      reviewBtn('.btn.ok',       t('voc.good'),  t('voc.desc.good'),  h.good),   // → remove from deck
    ]);
  }

  // Small "give up the cards" escape hatch.
  function giveUpLink(onClick) { return el('button.give-up', { text: t('voc.giveUp'), onclick: onClick }); }

  function reviewCard() {
    const wrap = el('div.mt');
    const card = Store.getQueue()[0];
    wrap.appendChild(el('div.progress-pill', { text: t('voc.remaining', { n: Store.getQueue().length }) }));
    wrap.appendChild(flashFace(card));

    const advance = (mutate, correct) => {
      const q = Store.getQueue(); const c = q.shift();
      mutate(q, c); Store.setQueue(q);
      score('vocabulary_cards', correct);
      if (Store.getQueue().length === 0) toast(t('voc.done'));
      navigate('voc', true);
    };

    wrap.appendChild(deckButtons({
      again: () => advance((q, c) => q.push(c), false),
      hard:  () => advance((q, c) => q.splice(Math.floor(q.length / 2), 0, c), true),
      good:  () => advance((q, c) => { Store.addLearned(c.word); }, true),
    }));
    wrap.appendChild(giveUpLink(() => { Store.setQueue([]); navigate('voc'); }));
    return wrap;
  }

  /* ---- free practice with learned cards ---- */
  function learnedPool() { return Store.getLearned().map(w => Lexicon.find(w)).filter(Boolean); }

  function startPractice() {
    const pool = learnedPool();
    if (!pool.length) { toast(t('voc.practice.empty')); return; }

    const begin = (n) => { practiceStack = shuffle(pool).slice(0, n); closeModal(); navigate('voc', true); };

    // Below 5 learned cards, just practice them all — no modal.
    if (pool.length < 5) { begin(pool.length); return; }

    // Offer preset sizes that the user actually has, plus "all".
    const presets = [5, 10, 20, 50, 100].filter(n => n < pool.length);
    const buttons = presets.map(n => el('button.btn.sm', { text: String(n), onclick: () => begin(n) }));
    buttons.push(el('button.btn.sm', { text: t('voc.practice.all') + ' (' + pool.length + ')', onclick: () => begin(pool.length) }));

    openModal(el('div', {}, [
      el('h3', { text: t('voc.practice') }),
      el('p.modal-sub', { text: t('voc.practice.howMany') }),
      el('div.chips', {}, buttons),
    ]));
  }

  function practiceCard() {
    const wrap = el('div.mt');
    wrap.appendChild(el('div.progress-pill', { text: t('voc.remaining', { n: practiceStack.length }) }));
    wrap.appendChild(flashFace(practiceStack[0]));

    const advance = (mutate, correct) => {
      const c = practiceStack.shift();
      mutate(c);
      score('vocabulary_cards', correct);
      if (practiceStack.length === 0) { practiceStack = null; toast(t('voc.done')); }
      navigate('voc', true);
    };

    wrap.appendChild(deckButtons({
      again: () => advance(c => practiceStack.push(c), false),
      hard:  () => advance(c => practiceStack.splice(Math.floor(practiceStack.length / 2), 0, c), true),
      good:  () => advance(() => {}, true),
    }));
    wrap.appendChild(giveUpLink(() => { practiceStack = null; navigate('voc', true); }));
    return wrap;
  }

  // Learned-words manager: list with per-word remove.
  function openLearnedModal() {
    const list = el('div.dict-list', { style: 'max-height:50vh;overflow-y:auto;' });
    const render = () => {
      clear(list);
      const learned = Store.getLearned();
      if (!learned.length) { list.appendChild(el('div.empty', { text: t('voc.empty') })); return; }
      learned.forEach(w => {
        list.appendChild(el('div.dict-item', { style: 'display:flex;align-items:center;gap:8px;' }, [
          el('span.di-word', { text: w, style: 'flex:1;' }),
          ttsMini(() => w),
          el('button.tts-mini', { html: ICONS.x(), title: t('common.close'), onclick: () => { Store.removeLearned(w); render(); } }),
        ]));
      });
    };
    render();
    openModal(el('div', {}, [
      el('h3', { text: t('voc.learnedTitle') }),
      el('p.modal-sub', { text: t('voc.learnedCount', { n: Store.getLearned().length }) }),
      list,
      el('button.btn.ghost.block.mt', { text: t('common.close'), onclick: closeModal }),
    ]));
  }

  function openAddModal() {
    const CLASSES = [
      { pos: 'noun', label: t('pos.noun') },
      { pos: 'verb', label: t('pos.verb') },
      { pos: 'adj',  label: t('pos.adj') },
      { pos: 'adv',  label: t('pos.adv') },
    ];
    let count = 10;

    const countChips = el('div.chips', {});
    [5, 10, 20].forEach(n => {
      const c = el('label.chip' + (n === count ? '.on' : ''), { text: String(n) });
      c.addEventListener('click', () => { count = n; countChips.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); });
      countChips.appendChild(c);
    });

    // "Tap to activate" hint — disappears once any class is on.
    const hint = el('div.add-hint', {}, [ el('span.pulse-dot'), el('span', { text: t('voc.add.hint') }) ]);
    const refreshHint = () => { hint.style.display = Object.keys(state).some(p => state[p].on) ? 'none' : 'flex'; };

    const classRows = el('div', { style: 'display:flex;flex-direction:column;gap:8px;' });
    const state = {};
    CLASSES.forEach(c => {
      state[c.pos] = { on: false, top: 100 };               // everything starts OFF
      const cb = el('input', { type: 'checkbox' });
      const topInput = el('input', { type: 'number', min: '1', max: '999999', value: '100' });
      const row = el('label.chip.row', {}, [
        cb, el('span', { text: c.label }),
        el('span.topx', {}, [ el('span', { text: 'TOP' }), topInput ]),
      ]);
      const setOn = (on) => { state[c.pos].on = on; cb.checked = on; row.classList.toggle('on', on); refreshHint(); };
      cb.addEventListener('change', () => setOn(cb.checked));
      // editing the TOP value auto-activates that class
      ['pointerdown', 'click'].forEach(ev => topInput.addEventListener(ev, e => e.stopPropagation()));
      topInput.addEventListener('input', () => { state[c.pos].top = parseInt(topInput.value, 10) || 100; if (!state[c.pos].on) setOn(true); });
      classRows.appendChild(row);
    });

    // how many previously-learned cards to fold in as a review (capped at how
    // many learned words the user actually has)
    const learnedMax = Store.getLearned().length;
    const reviewInput = el('input', { type: 'number', min: '0', max: String(learnedMax), value: '0' });
    reviewInput.addEventListener('input', () => {
      let n = parseInt(reviewInput.value, 10) || 0;
      if (n > learnedMax) { n = learnedMax; reviewInput.value = String(n); }
    });

    const content = el('div', {}, [
      el('h3', { text: t('voc.add.title') }),
      el('p.modal-sub', { text: t('voc.add.sub') }),
      el('div.field', {}, [ el('label', { text: t('voc.add.count') }), countChips ]),
      // hint comes BEFORE the choices (makes more sense)
      el('div.field', {}, [ el('label', { text: t('voc.add.classes') }), hint, classRows ]),
      el('div.field', {}, [ el('label', { text: t('voc.add.review') + (learnedMax ? ' (max ' + learnedMax + ')' : '') }), reviewInput ]),
      el('div.btn-row.mt', {}, [
        el('button.btn.ghost', { text: t('common.close'), onclick: closeModal }),
        el('button.btn', { text: t('voc.add.create'), onclick: () => buildDeck(state, count, parseInt(reviewInput.value, 10) || 0) }),
      ]),
    ]);
    openModal(content);
    refreshHint();
  }

  function buildDeck(state, count, reviewCount) {
    const chosen = Object.keys(state).filter(p => state[p].on);
    if (!chosen.length && reviewCount <= 0) { toast(t('voc.add.pickOne')); return; }

    const learned = new Set(Store.getLearned());
    const inQueue = new Set(Store.getQueue().map(w => w.word));
    const seen = new Set();

    // new (unlearned) cards from the chosen classes within their TOP-N rank
    let pool = [];
    chosen.forEach(pos => {
      const rank = state[pos].top;
      Lexicon.all().forEach(w => {
        if (w.pos !== pos || w.frequency > rank) return;
        if (!(w.examples && w.examples.length)) return;   // need a real example sentence
        if (learned.has(w.word) || inQueue.has(w.word) || seen.has(w.word)) return;
        seen.add(w.word); pool.push(w);
      });
    });
    const deck = shuffle(pool).slice(0, count);
    deck.forEach(w => seen.add(w.word));

    // review cards: re-pull from the previously-learned stack
    let reviewDeck = [];
    if (reviewCount > 0) {
      const rpool = Store.getLearned().map(w => Lexicon.find(w))
        .filter(w => w && !inQueue.has(w.word) && !seen.has(w.word));
      reviewDeck = shuffle(rpool).slice(0, reviewCount);
    }

    const added = deck.concat(reviewDeck);
    if (!added.length) { toast(t('voc.notEnough', { n: 0 })); return; }
    const wanted = count * (chosen.length ? 1 : 0) + reviewCount;
    if (added.length < wanted) toast(t('voc.notEnough', { n: added.length }));
    else toast(t('voc.added', { n: added.length }));

    Store.setQueue(Store.getQueue().concat(added));
    closeModal();
    navigate('voc', true);
  }

  /* ============================================================ *
   *  NUMBERS
   * ============================================================ */
  VIEWS.numeros = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.num.name'));

    let max = 1000, mode = 'd2t';
    const quizHost = el('div');                 // the quiz renders here, ABOVE the config
    const panel = el('div.panel.glass');
    const maxInput = el('input', { type: 'number', min: '0', max: '9999999', value: '1000' });
    maxInput.addEventListener('input', () => { max = Math.min(9999999, Math.max(0, parseInt(maxInput.value, 10) || 0)); });

    const modeChips = el('div.chips');
    [['d2t', t('num.mode.d2t')], ['t2d', t('num.mode.t2d')]].forEach(([m, lbl]) => {
      const c = el('label.chip' + (m === mode ? '.on' : ''), { text: lbl });
      c.addEventListener('click', () => { mode = m; modeChips.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); });
      modeChips.appendChild(c);
    });

    const startBtn = el('button.btn.block.mt', { text: t('common.start'), onclick: () => {
      numberQuiz(quizHost, max, mode);
      startBtn.textContent = t('common.restart');   // after the first run it restarts
    } });

    panel.appendChild(el('div.field', {}, [ el('label', { text: t('num.max') }), maxInput ]));
    panel.appendChild(el('div.field', {}, [ el('label', { text: t('num.mode') }), modeChips ]));
    panel.appendChild(startBtn);
    v.appendChild(quizHost);
    v.appendChild(panel);
    main.appendChild(v);
  };

  function numberQuiz(host, max, mode) {
    clear(host);                                  // replace the previous quiz
    const n = randInt(0, max);
    const quiz = el('div.panel.glass.quiz.mb');
    const adv = skipButton(() => numberQuiz(host, max, mode));

    if (mode === 'd2t') {
      quiz.appendChild(el('p.prompt-sub', { text: t('num.prompt.d2t') }));
      quiz.appendChild(el('div.prompt-big', { text: n.toLocaleString('pt-BR') }));
      const input = el('input', { type: 'text', placeholder: t('num.placeholder.d2t') });
      quiz.appendChild(el('div.field.mt', {}, input));
      const fb = el('div.feedback');
      const check = el('button.btn.block', { text: t('common.check'), onclick: () => {
        const ok = PTNum.checkWords(n, input.value);
        score('numeros', ok);
        fb.className = 'feedback ' + (ok ? 'ok' : 'err');
        fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: PTNum.toWords(n) });
        check.disabled = true; input.disabled = true; flipNext(adv);
      } });
      quiz.appendChild(check); quiz.appendChild(fb);
    } else {
      quiz.appendChild(el('p.prompt-sub', { text: t('num.prompt.t2d') }));
      quiz.appendChild(el('div.prompt-big', { text: PTNum.toWords(n) }));
      quiz.appendChild(el('div.tts-row', { style: 'display:flex;justify-content:center;margin:4px 0;' }, ttsButton(() => PTNum.toWords(n))));
      const input = el('input', { type: 'number', placeholder: t('num.placeholder.t2d') });
      quiz.appendChild(el('div.field.mt', {}, input));
      const fb = el('div.feedback');
      const check = el('button.btn.block', { text: t('common.check'), onclick: () => {
        const ok = parseInt(input.value, 10) === n;
        score('numeros', ok);
        fb.className = 'feedback ' + (ok ? 'ok' : 'err');
        fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: n.toLocaleString('pt-BR') });
        check.disabled = true; input.disabled = true; flipNext(adv);
      } });
      quiz.appendChild(check); quiz.appendChild(fb);
    }

    quiz.appendChild(adv);
    host.appendChild(quiz);
  }

  /* ============================================================ *
   *  COLORS
   * ============================================================ */
  VIEWS.cores = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.color.name'));
    let mode = 'n2c';
    const modeChips = el('div.chips.mb');
    [['n2c', t('color.mode.n2c')], ['c2n', t('color.mode.c2n')]].forEach(([m, lbl]) => {
      const c = el('label.chip' + (m === mode ? '.on' : ''), { text: lbl });
      c.addEventListener('click', () => { mode = m; modeChips.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); colorRound(v, mode); });
      modeChips.appendChild(c);
    });
    v.appendChild(modeChips);
    main.appendChild(v);
    colorRound(v, mode);
  };

  function colorRound(v, mode) {
    const old = v.querySelector('.quiz'); if (old) old.remove();
    const correct = sample(COLORS);
    const opts = shuffle([correct, ...sampleN(COLORS.filter(c => c !== correct), 5)]);
    const quiz = el('div.panel.glass.quiz');
    const fb = el('div.feedback');
    const adv = skipButton(() => colorRound(v, mode));
    // the answer, rendered in its own colour (so "cinza" actually looks grey)
    const colouredName = (c) => '<span style="color:' + c.hex + ';font-weight:800;text-shadow:0 0 1px rgba(0,0,0,.30)">' + UI.escapeHtml(c.name) + '</span>';
    let answered = false;

    if (mode === 'n2c') {
      quiz.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:center;gap:10px;' }, [
        el('div.prompt-big', { text: correct.name, style: 'margin:0;' }),
        ttsButton(() => correct.name),
      ]));
      quiz.appendChild(el('p.prompt-sub', { text: t('color.prompt.n2c') }));
      const grid = el('div.options');
      const cells = [];
      opts.forEach(c => {
        const cell = el('div.swatch-wrap', {}, el('div.swatch', { style: 'background:' + c.hex }));
        cell._color = c;
        cell.addEventListener('click', () => {
          if (answered) return; answered = true;
          const ok = c === correct; score('cores', ok);
          cells.forEach(x => { if (x._color === correct) x.classList.add('correct'); });
          if (!ok) cell.classList.add('wrong');
          fb.className = 'feedback ' + (ok ? 'ok' : 'err');
          if (ok) fb.textContent = t('common.correct');
          else fb.innerHTML = t('common.answerWas', { a: colouredName(correct) });
          flipNext(adv);
        });
        cells.push(cell); grid.appendChild(cell);
      });
      quiz.appendChild(grid);
    } else {
      quiz.appendChild(el('div.swatch.mb', { style: 'background:' + correct.hex + ';height:90px;' }));
      quiz.appendChild(el('p.prompt-sub', { text: t('color.prompt.c2n') }));
      const grid = el('div.options');
      opts.forEach(c => {
        const b = el('button.opt', { text: c.name, onclick: () => {
          if (answered) return; answered = true;
          const ok = c === correct; score('cores', ok);
          b.classList.add(ok ? 'correct' : 'wrong');
          grid.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.textContent === correct.name) x.classList.add('correct'); });
          fb.className = 'feedback ' + (ok ? 'ok' : 'err');
          fb.innerHTML = ok ? t('common.correct') : t('common.answerWas', { a: colouredName(correct) });
          flipNext(adv);
        } });
        grid.appendChild(b);
      });
      quiz.appendChild(grid);
    }

    quiz.appendChild(fb);
    quiz.appendChild(adv);
    v.appendChild(quiz);
  }

  /* ============================================================ *
   *  GENDER
   * ============================================================ */
  VIEWS.genero = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.gender.name'));
    main.appendChild(v);
    genderRound(v);
  };

  function genderRound(v) {
    const old = v.querySelector('.quiz'); if (old) old.remove();
    const nouns = Lexicon.genderedNouns();
    if (!nouns.length) { v.appendChild(el('div.empty.quiz', { text: t('gender.noData') })); return; }
    const w = sample(nouns);
    const quiz = el('div.panel.glass.quiz');
    quiz.appendChild(el('p.prompt-sub', { text: t('gender.prompt') }));
    quiz.appendChild(el('div', { style: 'display:flex;align-items:center;justify-content:center;gap:10px;' }, [
      el('div.prompt-big', { text: w.word, style: 'margin:0;' }), ttsButton(() => w.word),
    ]));
    const fb = el('div.feedback');
    const ruleBox = el('div.rule-box', { style: 'display:none;' });
    const adv = skipButton(() => genderRound(v));
    let answered = false;

    const answer = (g, btn, grid) => {
      if (answered) return; answered = true;
      const ok = g === w.gender; score('genero', ok);
      btn.classList.add(ok ? 'correct' : 'wrong');
      grid.querySelectorAll('.opt').forEach(x => { x.disabled = true; });
      fb.className = 'feedback ' + (ok ? 'ok' : 'err');
      fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: w.gender === 'm' ? t('gender.masc') : t('gender.fem') });
      const endsO = /o$/.test(w.word), endsA = /a$/.test(w.word);
      const rule = endsO ? t('gender.rule.m') : endsA ? t('gender.rule.f') : t('gender.rule.generic');
      ruleBox.style.display = 'block';
      ruleBox.innerHTML = '<b>' + t('gender.rule.title') + ':</b> ' + UI.escapeHtml(rule) + '<br><br>' + UI.escapeHtml(t('gender.exc'));
      flipNext(adv);
    };

    const grid = el('div.options', { style: 'grid-template-columns:repeat(2,1fr);' });
    const mBtn = el('button.opt', { text: t('gender.masc'), onclick: () => answer('m', mBtn, grid) });
    const fBtn = el('button.opt', { text: t('gender.fem'), onclick: () => answer('f', fBtn, grid) });
    grid.appendChild(mBtn); grid.appendChild(fBtn);
    quiz.appendChild(grid); quiz.appendChild(fb); quiz.appendChild(ruleBox);
    quiz.appendChild(adv);
    v.appendChild(quiz);
  }

  /* ============================================================ *
   *  WRITING (dictation via TTS)
   * ============================================================ */
  VIEWS.escrita = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.write.name'));
    main.appendChild(v);
    if (!TTS.available()) { v.appendChild(el('div.empty', { text: t('tts.disabled') })); return; }
    writeRound(v);
  };

  function writeRound(v) {
    const old = v.querySelector('.quiz'); if (old) old.remove();
    const pool = Lexicon.speakable();
    const w = sample(pool);
    // 40% of the time dictate a short example sentence, else the word itself.
    let target = w.word;
    if (w.examples && w.examples.length) {
      const ex = w.examples.find(e => e.length <= 48);
      if (ex && Math.random() < 0.45) target = ex;
    }

    const quiz = el('div.panel.glass.quiz');
    quiz.appendChild(el('p.prompt-sub', { text: t('write.prompt') }));
    quiz.appendChild(el('div.tts-row', { style: 'display:flex;justify-content:center;margin:6px 0 12px;' }, ttsButton(() => target)));
    const input = el('input', { type: 'text', placeholder: t('write.placeholder'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    quiz.appendChild(el('div.field', {}, input));
    const fb = el('div.feedback');
    const hintArea = el('div');

    const adv = skipButton(() => writeRound(v));
    const check = el('button.btn.block', { text: t('common.check'), onclick: () => {
      const ok = norm(input.value) === norm(target);
      score('escrita', ok);
      fb.className = 'feedback ' + (ok ? 'ok' : 'err');
      fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: target });
      check.disabled = true; input.disabled = true; flipNext(adv);

      // Translation hint + dictionary link
      const isWord = target === w.word;
      let translation = null;
      if (isWord) {
        translation = w.direct_ko || (w.definitions_ko && w.definitions_ko[0]) || null;
      } else {
        const exIdx = w.examples ? w.examples.indexOf(target) : -1;
        translation = (exIdx >= 0 && w.examples_ko) ? w.examples_ko[exIdx] : null;
      }
      const hintChildren = [];
      if (translation) hintChildren.push(el('div.write-hint-trans', { text: translation }));
      hintChildren.push(el('button.write-hint-dict', { text: t('write.seeDict'), onclick: () => openWord(w) }));
      hintArea.appendChild(el('div.write-hint', {}, hintChildren));
    } });
    quiz.appendChild(check); quiz.appendChild(fb); quiz.appendChild(hintArea);
    quiz.appendChild(adv);
    v.appendChild(quiz);
    // auto-play once
    TTS.speak(target).catch(() => {});
  }

  /* ============================================================ *
   *  GEOGRAPHY (3 levels)
   * ============================================================ */
  VIEWS.geografia = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.geo.name'));
    let level = 1;
    const tabs = el('div.chips.mb');
    [[1, t('geo.l1')], [2, t('geo.l2')], [3, t('geo.l3')]].forEach(([lv, lbl]) => {
      const c = el('label.chip' + (lv === level ? '.on' : ''), { text: lbl });
      c.addEventListener('click', () => { level = lv; tabs.querySelectorAll('.chip').forEach(x => x.classList.remove('on')); c.classList.add('on'); geoRound(v, level); });
      tabs.appendChild(c);
    });
    v.appendChild(tabs);
    main.appendChild(v);
    geoRound(v, level);
  };

  function geoRound(v, level) {
    const old = v.querySelector('.quiz'); if (old) old.remove();
    const quiz = el('div.panel.glass.quiz');
    let promptText, promptSpeak = null, correctLabel, options;

    if (level === 1) {
      const c = sample(COUNTRIES);
      promptText = t('geo.q.continent', { c: c.country }); promptSpeak = c.country;
      correctLabel = c.continent;
      options = shuffle([c.continent, ...sampleN(CONTINENTS.filter(x => x !== c.continent), 4)]);
    } else if (level === 2) {
      const c = sample(COUNTRIES);
      promptText = t('geo.q.country', { cap: c.capital }); promptSpeak = c.capital;
      correctLabel = c.country;
      options = shuffle([c.country, ...sampleN(COUNTRIES.filter(x => x !== c).map(x => x.country), 5)]);
    } else {
      if (Math.random() < 0.5) {
        const c = sample(COUNTRIES);
        promptText = t('geo.q.capital', { c: c.country }); promptSpeak = c.country;
        correctLabel = c.capital;
        options = shuffle([c.capital, ...sampleN(COUNTRIES.filter(x => x !== c).map(x => x.capital), 5)]);
      } else {
        const s = sample(BR_STATES);
        promptText = t('geo.q.state'); correctLabel = s.state;
        options = shuffle([s.state, ...sampleN(NOT_BR_STATES, 5)]);
      }
    }

    const head = el('div', { style: 'display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;' }, [
      el('div.prompt-big', { text: promptText, style: 'font-size:22px;margin:0;' }),
    ]);
    if (promptSpeak) head.appendChild(ttsButton(() => promptSpeak));
    quiz.appendChild(head);

    const fb = el('div.feedback');
    const adv = skipButton(() => geoRound(v, level));
    let answered = false;
    const grid = el('div.options');
    options.forEach(o => {
      const b = el('button.opt', { text: o, style: 'font-size:14px;', onclick: () => {
        if (answered) return; answered = true;
        const ok = o === correctLabel; score('geografia', ok);
        b.classList.add(ok ? 'correct' : 'wrong');
        grid.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.textContent === correctLabel) x.classList.add('correct'); });
        fb.className = 'feedback ' + (ok ? 'ok' : 'err');
        fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: correctLabel });
        flipNext(adv);
      } });
      grid.appendChild(b);
    });
    quiz.appendChild(grid); quiz.appendChild(fb);
    quiz.appendChild(adv);
    v.appendChild(quiz);
  }

  /* ============================================================ *
   *  HORAS (time expressions)
   * ============================================================ */
  VIEWS.horas = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.horas.name'));
    main.appendChild(v);
    horasRound(v);
  };

  function horasRound(v) {
    const old = v.querySelector('.quiz'); if (old) old.remove();
    const h = randInt(0, 23);
    const m = randInt(0, 11) * 5;
    const prompt = PTTime.toWords(h, m);

    const per = PTTime.period(h);

    const quiz = el('div.panel.glass.quiz');
    quiz.appendChild(el('p.prompt-sub', { text: t('horas.prompt') }));
    quiz.appendChild(el('div.prompt-big', { text: prompt, style: 'font-size:clamp(20px,5vw,27px);line-height:1.35;' }));
    if (per) quiz.appendChild(el('p.horas-period', { text: per }));
    const input = el('input', { type: 'text', placeholder: t('horas.placeholder'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    quiz.appendChild(el('div.field.mt', {}, input));
    const fb = el('div.feedback');
    const adv = skipButton(() => horasRound(v));

    const check = el('button.btn.block', { text: t('common.check'), onclick: () => {
      const parsed = PTTime.parseInput(input.value);
      const ok = parsed !== null && parsed.h === h && parsed.min === m;
      score('horas', ok);
      fb.className = 'feedback ' + (ok ? 'ok' : 'err');
      fb.textContent = ok ? t('common.correct') : t('common.answerWas', { a: PTTime.format24(h, m) });
      check.disabled = true; input.disabled = true; flipNext(adv);
    } });
    input.addEventListener('keydown', e => { if (e.key === 'Enter' && !check.disabled) check.click(); });
    quiz.appendChild(check); quiz.appendChild(fb);
    quiz.appendChild(adv);
    v.appendChild(quiz);
  }

  /* ============================================================ *
   *  CONJUGATOR (reference tool)
   * ============================================================ */
  const TENSE_KEYS = [['presente', 'conj.presente'], ['preterito', 'conj.preterito'], ['imperfeito', null], ['futuro', 'conj.futuro'], ['condicional', null]];
  const TENSE_TITLE = { presente: 'conj.presente', preterito: 'conj.preterito', imperfeito: null, futuro: 'conj.futuro', condicional: null };

  VIEWS.conjugador = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.conj.name'));
    const input = el('input', { type: 'text', placeholder: t('conj.search'), autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false' });
    const out = el('div.mt');
    const run = () => {
      clear(out);
      const res = Conjugator.conjugate(input.value);
      if (!res) { toast(t('conj.notVerb', { w: input.value.trim() })); return; }
      if (!res.fromDataset) out.appendChild(el('p.hint.mb', { text: t('conj.generated') }));
      const head = el('div', { style: 'display:flex;align-items:center;gap:10px;margin-bottom:6px;' }, [
        el('div.prompt-big', { text: res.infinitive, style: 'font-size:26px;margin:0;' }), ttsButton(() => res.infinitive),
      ]);
      out.appendChild(head);
      const TITLES = { presente: t('conj.presente'), preterito: t('conj.preterito'), futuro: t('conj.futuro'),
                       imperfeito: 'Pretérito Imperfeito', condicional: 'Futuro do Pretérito' };
      ['presente', 'preterito', 'imperfeito', 'futuro', 'condicional'].forEach(tk => {
        const tbl = el('table.conj-table');
        tbl.appendChild(el('caption', { text: TITLES[tk] }));
        Conjugator.PRON.forEach(p => {
          const form = res.tenses[tk][p];
          tbl.appendChild(el('tr', {}, [
            el('td', { text: PRONOUN_LABEL[p] }),
            el('td.val', {}, [ el('span', { text: form }), ttsMini(() => form) ]),
          ]));
        });
        out.appendChild(el('div.panel.glass.mb', { style: 'padding:12px 16px;' }, tbl));
      });
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    v.appendChild(el('div.search-row', {}, [ input, el('button.btn', { text: t('conj.go'), onclick: run }) ]));
    v.appendChild(out);
    main.appendChild(v);
  };

  /* ============================================================ *
   *  DICTIONARY (reference tool)
   * ============================================================ */
  VIEWS.dicionario = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.dict.name'));
    if (!Lexicon.isFull()) v.appendChild(el('p.hint.mb', { text: t('dict.waiting') }));

    const input = el('input', { type: 'text', placeholder: t('dict.search'), autocomplete: 'off' });
    const list = el('div.dict-list.mt');
    // Random sample shown while the search box is empty (so it isn't always
    // the same top-frequency words). Recomputed each time the view opens.
    const sample = shuffle(Lexicon.all()).slice(0, 60);
    const renderList = () => {
      clear(list);
      const q = input.value.trim();
      const res = q ? Lexicon.search(q) : sample;
      if (!res.length) { list.appendChild(el('div.empty', { text: t('dict.noResults') })); return; }
      res.forEach(w => {
        const item = el('div.dict-item', { onclick: () => openWord(w) }, [
          el('div.di-head', {}, [
            el('span.di-word', { text: w.word }),
            el('span.di-pos', { text: posLabel(w.pos) }),
            el('span.di-freq', { text: '#' + w.frequency }),
          ]),
          ((w.definitions_ko && w.definitions_ko[0]) || (w.definitions && w.definitions[0]))
            ? el('div.di-def', { text: (w.definitions_ko && w.definitions_ko[0]) || w.definitions[0] })
            : null,
        ].filter(Boolean));
        list.appendChild(item);
      });
    };
    input.addEventListener('input', renderList);
    v.appendChild(el('div.search-row', {}, [ el('span.tts-btn', { html: ICONS.search(), style: 'pointer-events:none;' }), input ]));
    v.appendChild(list);
    main.appendChild(v);
    renderList();
  };

  function openWord(w) {
    const node = el('div', {}, [
      el('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
        el('h3', { text: w.word, style: 'margin:0;' }), el('span.di-pos', { text: posLabel(w.pos) }), ttsButton(() => w.word),
      ]),
      el('p.hint', { text: t('dict.freqRank') + ': #' + w.frequency }),
    ]);
    if (w.direct_ko) {
      node.appendChild(el('h4.mt', { text: t('dict.directTranslation'), style: 'font-size:14px;color:var(--ink-soft);' }));
      node.appendChild(el('div', { text: w.direct_ko, style: 'font-size:17px;font-weight:600;margin:4px 0;' }));
    }
    const defs = (w.definitions_ko && w.definitions_ko.length) ? w.definitions_ko : w.definitions;
    if (defs && defs.length) {
      node.appendChild(el('h4.mt', { text: t('dict.definitions'), style: 'font-size:14px;color:var(--ink-soft);' }));
      const ul = el('div', { style: 'font-size:14px;line-height:1.5;' });
      defs.forEach((d, i) => ul.appendChild(el('div', { text: (i + 1) + '. ' + d, style: 'margin:3px 0;' })));
      node.appendChild(ul);
    }
    if (w.examples && w.examples.length) {
      node.appendChild(el('h4.mt', { text: t('dict.examples'), style: 'font-size:14px;color:var(--ink-soft);' }));
      w.examples.forEach(ex => node.appendChild(el('div.example', { text: '”' + ex + '”', style: 'font-size:13px;margin:4px 0;' })));
    }
    if (w.examples_ko && w.examples_ko.length) {
      node.appendChild(el('h4.mt', { text: t('dict.examplesKo'), style: 'font-size:14px;color:var(--ink-soft);' }));
      w.examples_ko.forEach(ex => node.appendChild(el('div.example', { text: ex, style: 'font-size:13px;margin:4px 0;opacity:0.75;' })));
    }
    if (w.pos === 'verb' && w.conjugations) {
      node.appendChild(el('h4.mt', { text: t('dict.conj'), style: 'font-size:14px;color:var(--ink-soft);' }));
      [['presente', t('conj.presente')], ['preterito', t('conj.preterito')], ['futuro', t('conj.futuro')]].forEach(([k, title]) => {
        if (!w.conjugations[k]) return;
        const tbl = el('table.conj-table');
        tbl.appendChild(el('caption', { text: title }));
        Object.keys(w.conjugations[k]).forEach(p => tbl.appendChild(el('tr', {}, [ el('td', { text: PRONOUN_LABEL[p] || p }), el('td', { text: w.conjugations[k][p] }) ])));
        node.appendChild(tbl);
      });
    }
    node.appendChild(el('button.btn.ghost.block.mt', { text: t('common.close'), onclick: closeModal }));
    openModal(node);
  }

  /* ============================================================ *
   *  STATS
   * ============================================================ */
  const STAT_TABS = [
    ['all', 'stats.all'],
    ['vocabulary_cards', 'mod.voc.name'],
    ['numeros', 'mod.num.name'],
    ['cores', 'mod.color.name'],
    ['genero', 'mod.gender.name'],
    ['geografia', 'mod.geo.name'],
    ['horas', 'mod.horas.name'],
    ['escrita', 'mod.write.name'],
  ];

  VIEWS.stats = function () {
    const v = el('div.view');
    v.appendChild(viewHead('mod.stats.name'));

    // streak card
    const streakOn = Store.streakEnabled();
    const streakCard = el('div.streak-card.glass', {}, [
      el('span.streak-flame', { html: ICONS.flame() }),
      el('div', {}, [
        el('div.streak-num', { text: streakOn ? String(Store.getStreak()) : '—' }),
        el('div.streak-lbl', { text: streakOn ? (t('stats.streak') + ' · ' + t('stats.days')) : t('stats.streakOff') }),
      ]),
    ]);
    v.appendChild(streakCard);

    // 7-day chart
    const chartWrap = el('div.chart-wrap.glass', {}, [ el('h4', { text: t('stats.chart') }) ]);
    const canvas = el('canvas', { height: '160' });
    chartWrap.appendChild(canvas);
    v.appendChild(chartWrap);

    // module filter tabs
    let sel = 'all';
    const tabs = el('div.stat-tabs');
    const boxes = el('div.stat-grid');
    const renderBoxes = () => {
      clear(boxes);
      const stats = Store.getStats();
      let total = 0, ac = 0, er = 0;
      if (sel === 'all') {
        Store.MODULES.forEach(m => { total += stats[m].total; ac += stats[m].acertos; er += stats[m].erros; });
      } else { total = stats[sel].total; ac = stats[sel].acertos; er = stats[sel].erros; }
      const pct = total ? Math.round((ac / total) * 100) : 0;
      boxes.appendChild(el('div.stat-box', {}, [ el('div.v', { text: total }), el('div.l', { text: t('stats.total') }) ]));
      boxes.appendChild(el('div.stat-box', {}, [ el('div.v.ok', { text: ac }), el('div.l', { text: t('stats.hits') }) ]));
      boxes.appendChild(el('div.stat-box', {}, [ el('div.v.err', { text: er }), el('div.l', { text: t('stats.errors') }) ]));
      boxes.appendChild(el('div.stat-box', {}, [ el('div.v', { text: pct + '%' }), el('div.l', { text: t('stats.accuracy') }) ]));
    };
    STAT_TABS.forEach(([key, lblKey]) => {
      const c = el('button.stat-tab' + (key === sel ? '.on' : ''), { text: t(lblKey) });
      c.addEventListener('click', () => { sel = key; tabs.querySelectorAll('.stat-tab').forEach(x => x.classList.remove('on')); c.classList.add('on'); renderBoxes(); });
      tabs.appendChild(c);
    });
    v.appendChild(tabs);
    v.appendChild(boxes);

    // streak toggle
    const toggle = el('input', { type: 'checkbox' });
    toggle.checked = streakOn;
    toggle.addEventListener('change', () => { Store.setStreakEnabled(toggle.checked); navigate('stats', true); });
    v.appendChild(el('div.toggle-row.glass', {}, [
      el('div', {}, [ el('div', { text: t('stats.disableStreak'), style: 'font-weight:600;font-size:14px;' }) ]),
      el('label.switch', {}, [ toggle, el('span.track') ]),
    ]));

    main.appendChild(v);
    renderBoxes();
    drawChart(canvas);
  };

  function drawChart(canvas) {
    const data = Store.last7();
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 460, cssH = 160;
    canvas.width = cssW * dpr; canvas.height = cssH * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssW, cssH);

    const maxV = Math.max(1, ...data.map(d => d.total));
    const padB = 26, padT = 18;
    const n = data.length;
    const gap = 14;
    const bw = (cssW - gap * (n - 1)) / n;
    const chartH = cssH - padB - padT;

    const grad = ctx.createLinearGradient(0, padT, 0, cssH - padB);
    grad.addColorStop(0, '#F41B8C'); grad.addColorStop(1, '#FA65A7');

    ctx.textAlign = 'center';
    data.forEach((d, i) => {
      const x = i * (bw + gap);
      const h = (d.total / maxV) * chartH;
      const y = cssH - padB - h;
      // bar
      ctx.fillStyle = grad;
      roundRect(ctx, x, y, bw, Math.max(h, d.total ? 3 : 0), 8);
      ctx.fill();
      // value
      if (d.total) { ctx.fillStyle = '#6d5763'; ctx.font = '600 11px Inter, sans-serif'; ctx.fillText(String(d.total), x + bw / 2, y - 5); }
      // day label (weekday)
      const wd = new Date(d.date + 'T00:00:00').toLocaleDateString(getLang(), { weekday: 'short' });
      ctx.fillStyle = '#6d5763'; ctx.font = '500 10px Inter, sans-serif';
      ctx.fillText(wd, x + bw / 2, cssH - 8);
    });
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2 || r);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, 0);
    ctx.arcTo(x, y + h, x, y, 0);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  /* ============================================================ *
   *  Boot
   * ============================================================ */
  function boot() {
    Store.refreshStreak();
    renderHeader();
    // Deep-link support: open #view from the URL (falls back to home/voc).
    const hashView = (location.hash || '').slice(1);
    // When the queue is locked the guard in navigate() keeps the user out of
    // other modules; home still renders (banner + greyed cards) so they can
    // see what's waiting and jump into the review.
    navigate(VIEWS[hashView] ? hashView : 'home');
    window.addEventListener('hashchange', () => {
      const hv = (location.hash || '').slice(1);
      if (hv && hv !== currentView && VIEWS[hv]) navigate(hv);
    });

    // Lazy-load the full dictionary; swap in when ready.
    Lexicon.loadFull().then(ok => {
      if (ok) {
        toast(t('data.ready', { n: Lexicon.count() }));
        if (currentView === 'dicionario') navigate('dicionario', true);
      }
    });

    // Register the service worker for offline/PWA.
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').catch(() => {}));
    }
  }

  boot();
})();
