/* ==================================================================
   ui.js — small DOM + utility helpers shared by every module.
   ================================================================== */
'use strict';

const UI = (() => {
  /** Create an element. tag#id.class, props object, children (string|node|array). */
  function el(sel, props = {}, children) {
    const m = sel.match(/^([a-z0-9]+)?(#[\w-]+)?((?:\.[\w-]+)*)$/i) || [];
    const tag = m[1] || 'div';
    const node = document.createElement(tag);
    if (m[2]) node.id = m[2].slice(1);
    if (m[3]) node.className = m[3].split('.').filter(Boolean).join(' ');
    for (const k in props) {
      if (k === 'html') node.innerHTML = props[k];
      else if (k === 'text') node.textContent = props[k];
      else if (k.startsWith('on') && typeof props[k] === 'function') node.addEventListener(k.slice(2).toLowerCase(), props[k]);
      else if (k === 'class') node.className += ' ' + props[k];
      else if (props[k] != null) node.setAttribute(k, props[k]);
    }
    if (children != null) appendChildren(node, children);
    return node;
  }
  function appendChildren(node, c) {
    if (Array.isArray(c)) c.forEach(x => appendChildren(node, x));
    else if (c instanceof Node) node.appendChild(c);
    else if (c != null) node.appendChild(document.createTextNode(String(c)));
  }
  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); return node; };

  /* random helpers */
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  function shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];
  function sampleN(arr, n) { return shuffle(arr).slice(0, n); }

  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

  /* toast host */
  let host;
  function toast(msg) {
    if (!host) { host = el('div.toast-host'); document.body.appendChild(host); }
    const tEl = el('div.toast', { text: msg });
    host.appendChild(tEl);
    setTimeout(() => tEl.remove(), 3000);
  }

  /* labels */
  function posLabel(pos) { return (typeof t === 'function') ? t('pos.' + pos) : pos; }
  const PRONOUN_LABEL = { eu: 'eu', tu: 'tu', ele: 'ele/ela', nos: 'nós', vos: 'vós', eles: 'eles/elas' };

  /* strip accents/case/punctuation for forgiving text comparison */
  const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.,!?;:]/g, '').trim();

  return { el, clear, randInt, shuffle, sample, sampleN, escapeHtml, toast, posLabel, PRONOUN_LABEL, norm };
})();
