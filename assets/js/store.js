/* ==================================================================
   store.js — single source of truth backed by localStorage.
   Holds: dailyQueue, learnedWords, moduleStats, streak, history,
   lastActivityDate, streakEnabled.
   The metrics + global streak are the heart of the gamification, so
   every quiz interaction in the app routes through recordResult().
   ================================================================== */
'use strict';

const Store = (() => {
  const K = {
    queue: 'gloria.dailyQueue',
    learned: 'gloria.learnedWords',
    stats: 'gloria.moduleStats',
    streak: 'gloria.streak',
    lastDate: 'gloria.lastActivityDate',
    history: 'gloria.history',
    streakOn: 'gloria.streakEnabled',
  };

  const MODULES = ['numeros', 'cores', 'genero', 'geografia', 'horas', 'escrita', 'vocabulary_cards'];

  /* ---- low-level persistence ------------------------------- */
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const write = (k, v) => localStorage.setItem(k, JSON.stringify(v));

  /* ---- date helpers (local time) --------------------------- */
  function dayStr(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function addDays(str, n) {
    const [y, m, d] = str.split('-').map(Number);
    const dt = new Date(y, m - 1, d + n);
    return dayStr(dt);
  }
  const today = () => dayStr();
  const yesterday = () => addDays(today(), -1);

  /* ---- stats object ---------------------------------------- */
  function emptyStats() {
    const o = {};
    MODULES.forEach(m => o[m] = { total: 0, acertos: 0, erros: 0 });
    return o;
  }
  function getStats() {
    const s = read(K.stats, null) || emptyStats();
    MODULES.forEach(m => { if (!s[m]) s[m] = { total: 0, acertos: 0, erros: 0 }; });
    return s;
  }

  /* ---- history (per-day interaction counts) ---------------- */
  function getHistory() { return read(K.history, {}); }
  function last7() {
    const h = getHistory();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = addDays(today(), -i);
      out.push({ date: d, total: (h[d] && h[d].total) || 0 });
    }
    return out;
  }

  /* ---- streak ---------------------------------------------- */
  const streakEnabled = () => read(K.streakOn, true);
  function setStreakEnabled(on) { write(K.streakOn, !!on); }
  const getStreak = () => read(K.streak, 0);
  const lastActivity = () => read(K.lastDate, null);

  // Called on app load: if the user skipped a full day, the streak dies.
  function refreshStreak() {
    if (!streakEnabled()) return;
    const last = lastActivity();
    if (!last) return;
    if (last !== today() && last !== yesterday()) {
      write(K.streak, 0); // a day was missed
    }
  }

  /* ---- THE central metric writer --------------------------- *
   * moduleKey: one of MODULES. correct: boolean.
   * Increments total + acertos/erros, logs the daily interaction,
   * and advances the global streak on a correct answer.            */
  function recordResult(moduleKey, correct) {
    if (!MODULES.includes(moduleKey)) return;

    // 1) module stats
    const stats = getStats();
    stats[moduleKey].total += 1;
    if (correct) stats[moduleKey].acertos += 1; else stats[moduleKey].erros += 1;
    write(K.stats, stats);

    // 2) daily interaction history (every attempt counts)
    const h = getHistory();
    const d = today();
    if (!h[d]) h[d] = { total: 0, byModule: {} };
    h[d].total += 1;
    h[d].byModule[moduleKey] = (h[d].byModule[moduleKey] || 0) + 1;
    write(K.history, h);

    // 3) global streak — advances once per day on any correct answer
    if (correct && streakEnabled()) {
      const last = lastActivity();
      if (last !== d) {
        const cur = getStreak();
        write(K.streak, last === yesterday() ? cur + 1 : 1);
        write(K.lastDate, d);
      }
    }
  }

  /* ---- vocabulary queue + learned -------------------------- */
  const getQueue = () => read(K.queue, []);
  const setQueue = (q) => write(K.queue, q);
  const getLearned = () => read(K.learned, []);
  function addLearned(word) {
    const l = getLearned();
    if (!l.includes(word)) { l.push(word); write(K.learned, l); }
  }
  function removeLearned(word) { write(K.learned, getLearned().filter(w => w !== word)); }
  const isLocked = () => getQueue().length > 0;

  /* ---- danger: full reset (not exposed in UI, dev helper) -- */
  function resetAll() { Object.values(K).forEach(k => localStorage.removeItem(k)); }

  return {
    MODULES, recordResult, getStats,
    getStreak, streakEnabled, setStreakEnabled, refreshStreak, lastActivity,
    getHistory, last7, today, yesterday,
    getQueue, setQueue, getLearned, addLearned, removeLearned, isLocked,
    resetAll,
  };
})();
