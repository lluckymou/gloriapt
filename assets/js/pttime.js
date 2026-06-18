/* ==================================================================
   pttime.js — Portuguese time expression converter.
   toWords(h, m)    → "dez para as três"
   format24(h, m)   → "14:50"
   parseInput(str)  → { h, m } | null   (accepts HH:MM and "H:MM da tarde")
   ================================================================== */
'use strict';

const PTTime = (() => {
  const HOUR_NAMES = ['', 'uma', 'duas', 'três', 'quatro', 'cinco', 'seis',
                      'sete', 'oito', 'nove', 'dez', 'onze'];

  function h24label(h) {
    if (h === 0) return 'meia-noite';
    if (h === 12) return 'meio-dia';
    return HOUR_NAMES[h % 12];
  }

  function hourFull(h) {
    if (h === 0) return 'meia-noite';
    if (h === 12) return 'meio-dia';
    const h12 = h % 12;
    if (h12 === 1) return 'uma hora';
    if (h12 === 2) return 'duas horas';
    return HOUR_NAMES[h12] + ' horas';
  }

  const SMALL = { 5: 'cinco', 10: 'dez', 20: 'vinte', 25: 'vinte e cinco' };

  function minLabel(m) {
    if (m === 15) return 'um quarto';
    return SMALL[m] || String(m);
  }

  function toWords(h, m) {
    if (m === 0) return hourFull(h);
    if (m <= 30) {
      const base = hourFull(h);
      const min = m === 30 ? 'e meia' : m === 15 ? 'e um quarto' : 'e ' + minLabel(m);
      return base + ' ' + min;
    }
    const rem = 60 - m;
    const nextH = (h + 1) % 24;
    let para;
    if (nextH === 0)       para = 'para a meia-noite';
    else if (nextH === 12) para = 'para o meio-dia';
    else if (nextH % 12 === 1) para = 'para a uma';
    else if (nextH % 12 === 2) para = 'para as duas';
    else                   para = 'para as ' + h24label(nextH);
    return minLabel(rem) + ' ' + para;
  }

  function format24(h, m) {
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  // Returns the period label for a given 24h hour, or null if unambiguous (0 / 12).
  function period(h) {
    if (h === 0 || h === 12) return null;
    if (h >= 1 && h <= 5)   return 'da madrugada';
    if (h >= 6 && h <= 11)  return 'da manhã';
    if (h >= 13 && h <= 17) return 'da tarde';
    return 'da noite';
  }

  function parseInput(str) {
    const s = (str || '').trim().toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '');

    // 24h: HH:MM or H:MM
    let r = s.match(/^(\d{1,2}):(\d{2})$/);
    if (r) {
      const h = +r[1], min = +r[2];
      if (h >= 0 && h <= 23 && min >= 0 && min <= 59) return { h, min };
    }

    // 12h with period: H:MM da manhã / tarde / noite / madrugada
    r = s.match(/^(\d{1,2}):(\d{2})\s+da\s+(\w+)$/);
    if (r) {
      let h = +r[1];
      const min = +r[2];
      const period = r[3];
      if (h < 1 || h > 12 || min < 0 || min > 59) return null;
      if (period === 'manha' || period === 'madrugada') {
        h = h === 12 ? 0 : h;
      } else if (period === 'tarde') {
        h = h === 12 ? 12 : h + 12;
      } else if (period === 'noite') {
        h = h === 12 ? 0 : h + 12;
      } else {
        return null;
      }
      if (h < 0 || h > 23) return null;
      return { h, min };
    }

    return null;
  }

  return { toWords, format24, parseInput, period };
})();
