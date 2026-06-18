/* ==================================================================
   conjugator.js — client conjugation engine for the Conjugator module.
   For verbs present in the dataset, the (irregular-correct) Presente /
   Pretérito Perfeito / Futuro come straight from gloria_data; the
   remaining tenses are generated. For unknown verbs everything is
   generated from regular rules + a small common-irregular table.
   ================================================================== */
'use strict';

const Conjugator = (() => {
  const PRON = ['eu', 'tu', 'ele', 'nos', 'vos', 'eles'];

  // Common irregulars for the three "core" tenses (mirrors the pipeline).
  const IRREG = {
    ser:    { presente:['sou','és','é','somos','sois','são'], preterito:['fui','foste','foi','fomos','fostes','foram'], futuro:['serei','serás','será','seremos','sereis','serão'] },
    estar:  { presente:['estou','estás','está','estamos','estais','estão'], preterito:['estive','estiveste','esteve','estivemos','estivestes','estiveram'], futuro:['estarei','estarás','estará','estaremos','estareis','estarão'] },
    ter:    { presente:['tenho','tens','tem','temos','tendes','têm'], preterito:['tive','tiveste','teve','tivemos','tivestes','tiveram'], futuro:['terei','terás','terá','teremos','tereis','terão'] },
    ir:     { presente:['vou','vais','vai','vamos','ides','vão'], preterito:['fui','foste','foi','fomos','fostes','foram'], futuro:['irei','irás','irá','iremos','ireis','irão'] },
    fazer:  { presente:['faço','fazes','faz','fazemos','fazeis','fazem'], preterito:['fiz','fizeste','fez','fizemos','fizestes','fizeram'], futuro:['farei','farás','fará','faremos','fareis','farão'] },
    dizer:  { presente:['digo','dizes','diz','dizemos','dizeis','dizem'], preterito:['disse','disseste','disse','dissemos','dissestes','disseram'], futuro:['direi','dirás','dirá','diremos','direis','dirão'] },
    ver:    { presente:['vejo','vês','vê','vemos','vedes','veem'], preterito:['vi','viste','viu','vimos','vistes','viram'], futuro:['verei','verás','verá','veremos','vereis','verão'] },
    vir:    { presente:['venho','vens','vem','vimos','vindes','vêm'], preterito:['vim','vieste','veio','viemos','viestes','vieram'], futuro:['virei','virás','virá','viremos','vireis','virão'] },
    dar:    { presente:['dou','dás','dá','damos','dais','dão'], preterito:['dei','deste','deu','demos','destes','deram'], futuro:['darei','darás','dará','daremos','dareis','darão'] },
    poder:  { presente:['posso','podes','pode','podemos','podeis','podem'], preterito:['pude','pudeste','pôde','pudemos','pudestes','puderam'], futuro:['poderei','poderás','poderá','poderemos','podereis','poderão'] },
    querer: { presente:['quero','queres','quer','queremos','quereis','querem'], preterito:['quis','quiseste','quis','quisemos','quisestes','quiseram'], futuro:['quererei','quererás','quererá','quereremos','querereis','quererão'] },
    saber:  { presente:['sei','sabes','sabe','sabemos','sabeis','sabem'], preterito:['soube','soubeste','soube','soubemos','soubestes','souberam'], futuro:['saberei','saberás','saberá','saberemos','sabereis','saberão'] },
  };
  // Irregular imperfeito (only a handful diverge from the regular pattern).
  const IRREG_IMPERF = {
    ser: ['era','eras','era','éramos','éreis','eram'],
    ter: ['tinha','tinhas','tinha','tínhamos','tínheis','tinham'],
    vir: ['vinha','vinhas','vinha','vínhamos','vínheis','vinham'],
    'pôr': ['punha','punhas','punha','púnhamos','púnheis','punham'],
  };

  function regular(inf) {
    const m = inf.match(/^(.*?)(ar|er|ir)$/);
    if (!m) return null;
    const root = m[1], e = m[2];
    const PRES = { ar:['o','as','a','amos','ais','am'], er:['o','es','e','emos','eis','em'], ir:['o','es','e','imos','is','em'] };
    const PRET = { ar:['ei','aste','ou','amos','astes','aram'], er:['i','este','eu','emos','estes','eram'], ir:['i','iste','iu','imos','istes','iram'] };
    const IMPERF = { ar:['ava','avas','ava','ávamos','áveis','avam'], er:['ia','ias','ia','íamos','íeis','iam'], ir:['ia','ias','ia','íamos','íeis','iam'] };
    const FUT = ['ei','ás','á','emos','eis','ão'];
    const COND = ['ia','ias','ia','íamos','íeis','iam'];
    return {
      presente:  PRES[e].map(s => root + s),
      preterito: PRET[e].map(s => root + s),
      imperfeito: IMPERF[e].map(s => root + s),
      futuro:    FUT.map(s => inf + s),
      condicional: COND.map(s => inf + s),
    };
  }

  const obj = (list) => { const o = {}; PRON.forEach((p, i) => o[p] = list[i]); return o; };

  /** Returns null if not a conjugable verb; else { tenses: {...} }. */
  function conjugate(inputRaw) {
    const inf = (inputRaw || '').trim().toLowerCase();
    if (!/(ar|er|ir|ôr|or)$/.test(inf) || inf.length < 2) return null;

    const reg = regular(inf);
    const base = reg || null;
    if (!base && !IRREG[inf]) return null;

    const irr = IRREG[inf];
    const tenses = {
      presente:   obj((irr && irr.presente)  || base.presente),
      preterito:  obj((irr && irr.preterito) || base.preterito),
      imperfeito: obj(IRREG_IMPERF[inf] || (base && base.imperfeito) || regular('falar').imperfeito),
      futuro:     obj((irr && irr.futuro)    || base.futuro),
      condicional:obj((base && base.condicional) || regular('falar').condicional),
    };

    // If the verb is in the dataset, trust its stored (accurate) core tenses.
    const ds = (typeof Lexicon !== 'undefined') ? Lexicon.find(inf) : null;
    if (ds && ds.conjugations) {
      if (ds.conjugations.presente)  tenses.presente  = ds.conjugations.presente;
      if (ds.conjugations.preterito) tenses.preterito = ds.conjugations.preterito;
      if (ds.conjugations.futuro)    tenses.futuro    = ds.conjugations.futuro;
    }

    return { infinitive: inf, fromDataset: !!ds, tenses, hasIrregular: !!irr };
  }

  return { conjugate, PRON };
})();
