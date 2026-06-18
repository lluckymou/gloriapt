/* ==================================================================
   tts.js — Text-to-speech for Portuguese with layered fallbacks.

   1) window.speechSynthesis  — only if the browser actually exposes
      voices. Brave/Tor neuter the Web Speech API (the object exists
      but getVoices() stays empty and nothing is spoken), so we detect
      that and skip straight to audio.
   2) Audio providers (free, hot-linkable mp3):
        a) Google Translate TTS (pt-BR, client=at).
   If everything fails, audio buttons are disabled + a toast is shown.
   ================================================================== */
'use strict';

const TTS = (() => {
  let ptVoice = null;
  let disabled = false;
  let audioEl = null;

  // Free audio endpoints, tried in order. Each maps text -> mp3 URL.
  const AUDIO_PROVIDERS = [
    (text) => 'https://translate.google.com/translate_tts?ie=UTF-8&tl=pt-BR&client=at&q=' + encodeURIComponent(text) + '&textlen=' + text.length + '&total=1&idx=0&ttsspeed=1',
  ];

  function pickVoice() {
    if (!('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices() || [];
    return voices.find(v => /pt[-_]BR/i.test(v.lang)) ||
           voices.find(v => /pt[-_]PT/i.test(v.lang)) ||
           voices.find(v => /^pt/i.test(v.lang)) || null;
  }
  function hasVoices() {
    return ('speechSynthesis' in window) && (window.speechSynthesis.getVoices() || []).length > 0;
  }

  if ('speechSynthesis' in window) {
    ptVoice = pickVoice();
    window.speechSynthesis.onvoiceschanged = () => { ptVoice = pickVoice(); };
  }

  function viaSynth(text) {
    return new Promise((resolve, reject) => {
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = (ptVoice && ptVoice.lang) || 'pt-BR';
        if (ptVoice) u.voice = ptVoice;
        u.rate = 0.95;
        let settled = false;
        u.onend = () => { settled = true; resolve(); };
        u.onerror = () => { if (!settled) reject('synth-error'); };
        window.speechSynthesis.speak(u);
        setTimeout(() => { if (!settled) resolve(); }, Math.min(8000, 1200 + text.length * 90));
      } catch (e) { reject('synth-throw'); }
    });
  }

  // Try each audio provider until one starts playing.
  function viaAudio(text) {
    return new Promise((resolve, reject) => {
      let i = 0, settled = false;
      const tryNext = () => {
        if (settled) return;
        if (i >= AUDIO_PROVIDERS.length) { settled = true; return reject('audio-all'); }
        const url = AUDIO_PROVIDERS[i++](text);
        const a = new Audio();
        audioEl = a;
        a.src = url;
        a.onerror = () => { if (!settled) tryNext(); };
        const p = a.play();
        if (p && p.then) p.then(() => { if (!settled) { settled = true; resolve(); } })
                          .catch(() => { if (!settled) tryNext(); });
        // older engines: no promise — assume playback works if no immediate error
        else setTimeout(() => { if (!settled) { settled = true; resolve(); } }, 400);
      };
      tryNext();
    });
  }

  /** Speak text. Resolves on success, rejects if every method fails. */
  async function speak(text) {
    if (disabled || !text) return Promise.reject('disabled');
    if (hasVoices()) {
      try { await viaSynth(text); return; } catch (e) { /* fall through to audio */ }
    }
    try { await viaAudio(text); return; }
    catch (e) { disabled = true; throw 'all-failed'; }
  }

  function available() {
    return !disabled && (hasVoices() || typeof Audio !== 'undefined');
  }

  return { speak, available, isDisabled: () => disabled };
})();
