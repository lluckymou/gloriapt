/* ==================================================================
   ptnum.js — Portuguese number ⇄ words (numeral por extenso).
   Supports 0 … 9 999 999 (Brazilian forms). Used by the Numbers test.
   ================================================================== */
'use strict';

const PTNum = (() => {
  const UNITS = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const TEENS = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const TENS  = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const HUND  = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  function twoDigit(n) {            // 0..99
    if (n < 10) return UNITS[n];
    if (n < 20) return TEENS[n - 10];
    const t = Math.floor(n / 10), u = n % 10;
    return u ? `${TENS[t]} e ${UNITS[u]}` : TENS[t];
  }

  function threeDigit(n) {          // 1..999
    if (n === 100) return 'cem';
    const h = Math.floor(n / 100), r = n % 100;
    const parts = [];
    if (h) parts.push(HUND[h]);
    if (r) parts.push(twoDigit(r));
    return parts.join(' e ');
  }

  /** Integer -> words. Returns '' for out-of-range. */
  function toWords(num) {
    num = Math.floor(Math.abs(num));
    if (num === 0) return 'zero';
    if (num > 9999999) return '';

    const mi = Math.floor(num / 1000000);
    const mil = Math.floor(num / 1000) % 1000;
    const un = num % 1000;

    const segs = [];
    if (mi)  segs.push({ n: mi,  s: `${threeDigit(mi)} ${mi === 1 ? 'milhão' : 'milhões'}` });
    if (mil) segs.push({ n: mil, s: mil === 1 ? 'mil' : `${threeDigit(mil)} mil` });
    if (un)  segs.push({ n: un,  s: threeDigit(un) });

    let out = segs[0].s;
    for (let i = 1; i < segs.length; i++) {
      const cur = segs[i];
      const useE = cur.n < 100 || cur.n % 100 === 0; // "e" before small / round groups
      out += (useE ? ' e ' : ' ') + cur.s;
    }
    return out;
  }

  /** Canonical form for forgiving comparison of typed answers. */
  function normalize(str) {
    return (str || '')
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
      .replace(/quatorze/g, 'catorze')
      .replace(/dezasseis/g, 'dezesseis').replace(/dezassete/g, 'dezessete').replace(/dezanove/g, 'dezenove')
      .replace(/\be\b/g, ' ')                            // drop connector "e"
      .replace(/[^a-z0-9]/g, '');                        // drop spaces/punctuation
  }

  function checkWords(num, typed) { return normalize(toWords(num)) === normalize(typed); }

  return { toWords, normalize, checkWords };
})();
