/* ==================================================================
   icons.js — inline SVG icon set (no emojis, per the brief).
   Each entry is a function returning an <svg> string; stroke uses
   currentColor so icons inherit the surrounding text color.
   ================================================================== */
'use strict';

const ICONS = (() => {
  const s = (paths, opts = {}) =>
    `<svg viewBox="0 0 24 24" fill="${opts.fill || 'none'}" stroke="${opts.stroke || 'currentColor'}" ` +
    `stroke-width="${opts.sw || 1.8}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

  return {
    cards: () => s('<rect x="3" y="7" width="14" height="13" rx="2.5"/><path d="M7 4h11a2 2 0 0 1 2 2v11"/>'),
    numbers: () => s('<path d="M9 4 7 20M17 4l-2 16M5 9h15M4 15h15"/>'),
    colors: () => s('<circle cx="12" cy="12" r="8.5"/><circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.4" fill="currentColor" stroke="none"/>'),
    gender: () => s('<circle cx="10" cy="14" r="5"/><path d="M14 10 20 4M20 4h-4M20 4v4"/>'),
    write: () => s('<path d="M4 20h16M5 16l9-9 3 3-9 9H5z"/><path d="M13 6l2-2 3 3-2 2"/>'),
    geo: () => s('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 4 5.7 4 9s-1.4 6.4-4 9c-2.6-2.6-4-5.7-4-9s1.4-6.4 4-9z"/>'),
    conj: () => s('<path d="M5 5h14M5 5v14M5 12h9M5 19h14"/><path d="M16 16l2.5 2.5L22 14"/>'),
    dict: () => s('<path d="M5 4h11a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H5z"/><path d="M5 4v14"/><path d="M9 9h6M9 12h4"/>'),
    stats: () => s('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),

    clock: () => s('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>'),
    speaker: () => s('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a3 3 0 0 1 0 6M18.5 7a6 6 0 0 1 0 10"/>'),
    speakerOff: () => s('<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M22 9l-5 5M17 9l5 5"/>'),
    flame: () => s('<path d="M12 2c1 3-1 4.5-2.5 6.5C8 10.5 7 12 7 14a5 5 0 0 0 10 0c0-2.2-1.2-3.7-2.2-5-.3 1-1 1.8-1.8 2 .5-1.7.2-4-1-9z"/>', { fill: 'currentColor', stroke: 'none' }),
    chevL: () => s('<path d="M15 6l-6 6 6 6"/>'),
    chevR: () => s('<path d="M9 6l6 6-6 6"/>'),
    lock: () => s('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    check: () => s('<path d="M5 12l5 5 9-11"/>'),
    refresh: () => s('<path d="M4 12a8 8 0 0 1 13.7-5.7L20 8M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.7 5.7L4 16M4 20v-4h4"/>'),
    plus: () => s('<path d="M12 5v14M5 12h14"/>'),
    x: () => s('<path d="M6 6l12 12M18 6 6 18"/>'),
    search: () => s('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    instagram: () => s('<rect x="3" y="3" width="18" height="18" rx="5.5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/>'),
  };
})();
