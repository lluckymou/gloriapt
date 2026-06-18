/* ==================================================================
   lexicon.js — word data access layer.
   Boots from the bundled fallback (WORD_DATA_FALLBACK, ~200 words) so
   the app is usable instantly, then lazy-loads the full gloria_data.js
   (WORD_DATA) and hot-swaps it in, notifying subscribers.
   ================================================================== */
'use strict';

const Lexicon = (() => {
  let words = (typeof WORD_DATA_FALLBACK !== 'undefined') ? WORD_DATA_FALLBACK.slice() : [];
  let full = false;
  let loading = false;
  const subs = [];

  function emit() { subs.forEach(cb => { try { cb(); } catch (e) {} }); }

  /** Subscribe to "full dataset loaded". Fires immediately if already full. */
  function onReady(cb) { subs.push(cb); if (full) cb(); }

  /** Inject the big dataset; resolves true when ready, false on failure. */
  function loadFull() {
    return new Promise((resolve) => {
      if (full) return resolve(true);
      if (loading) return resolve(false);
      loading = true;
      const s = document.createElement('script');
      s.src = 'assets/gloria_data.js';
      s.async = true;
      s.onload = () => {
        if (typeof WORD_DATA !== 'undefined' && Array.isArray(WORD_DATA)) {
          words = WORD_DATA;
          full = true;
          emit();
          resolve(true);
        } else { resolve(false); }
        loading = false;
      };
      s.onerror = () => { loading = false; resolve(false); };
      document.head.appendChild(s);
    });
  }

  /* ---- queries -------------------------------------------- */
  const all = () => words;
  const isFull = () => full;
  const count = () => words.length;

  const find = (w) => words.find(x => x.word === w);

  function byPos(pos) { return words.filter(w => w.pos === pos); }

  // Content words eligible for flashcards, filtered by pos set + max freq rank.
  function pickForCards(posSet, maxRank) {
    return words.filter(w => posSet.includes(w.pos) && w.frequency <= maxRank);
  }

  function search(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return words.slice(0, 60);
    const starts = [], contains = [];
    for (const w of words) {
      const lw = w.word.toLowerCase();
      if (lw === q || lw.startsWith(q)) starts.push(w);
      else if (lw.includes(q)) contains.push(w);
      if (starts.length > 80) break;
    }
    return starts.concat(contains).slice(0, 80);
  }

  // Nouns that carry gender info — used by the Gender test.
  function genderedNouns() { return words.filter(w => w.pos === 'noun' && (w.gender === 'm' || w.gender === 'f')); }

  // Words usable for dictation (have an example or are themselves speakable).
  function speakable() { return words.filter(w => w.word && w.word.length > 1); }

  return { onReady, loadFull, all, isFull, count, find, byPos, pickForCards, search, genderedNouns, speakable };
})();
