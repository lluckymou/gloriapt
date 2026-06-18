/* ==================================================================
   i18n.js — Glória PT internationalization
   Default: Korean (ko). Also: English (en).
   Usage:  t('home.title')   ·   t('voc.notEnough', {n: 3})
   ================================================================== */
'use strict';

const I18N = {
  ko: {
    'app.subtitle': '한국인을 위한 포르투갈어',
    'lang.label': '언어',

    'nav.back': '뒤로',
    'nav.home': '홈',
    'common.start': '시작',
    'common.next': '다음',
    'common.check': '확인',
    'common.finish': '완료',
    'common.close': '닫기',
    'common.listen': '듣기',
    'common.correct': '정답입니다!',
    'common.wrong': '틀렸어요',
    'common.answerWas': '정답: {a}',
    'common.loading': '불러오는 중',
    'common.tryAgain': '다시 시도',
    'common.of': '/',
    'common.score': '점수',
    'common.skip': '건너뛰기',
    'common.restart': '다시 시작',
    'streak.tip': '스트릭 보기',

    'voc.practice': '익힌 카드 연습',
    'voc.practice.howMany': '몇 장을 연습할까요?',
    'voc.practice.all': '전체',
    'voc.practice.empty': '아직 익힌 카드가 없어요',
    'about.slogan': '재미있게 배우는 포르투갈어',
    'about.teacher': '글로리아 호 선생님',
    'about.creator': '제작: lluc.dev',
    'voc.good': '알아요',
    'voc.hard': '어려움',
    'voc.again': '다시',
    'voc.desc.good': '더미에서 제거',
    'voc.desc.hard': '더미 중간으로',
    'voc.desc.again': '더미 끝으로',
    'voc.card.translate': '번역 보기',
    'voc.giveUp': '카드 포기하기',
    'voc.learnedTitle': '익힌 단어',
    'voc.add.review': '복습할 카드 (이전 더미)',
    'voc.add.hint': '연습할 단어 종류를 하나 이상 선택하세요 ›',

    'data.loading': '전체 사전을 불러오는 중…',
    'data.ready': '전체 사전 준비 완료 ({n}개 단어)',
    'data.fallback': '기본 단어 200개로 실행 중',

    'home.title': '오늘은 무엇을 연습할까요?',

    'mod.voc.name': '단어 카드',
    'mod.voc.desc': '플래시카드 · 스트릭',
    'mod.num.name': '숫자',
    'mod.num.desc': '숫자 ↔ 글자',
    'mod.color.name': '색깔',
    'mod.color.desc': '20가지 색',
    'mod.gender.name': '성(性)',
    'mod.gender.desc': '남성 / 여성',
    'mod.write.name': '받아쓰기',
    'mod.write.desc': '듣고 입력',
    'mod.geo.name': '지리',
    'mod.geo.desc': '대륙 · 나라 · 수도',
    'mod.horas.name': '시간',
    'mod.horas.desc': '시간 표현 읽기',
    'horas.prompt': '포르투갈어로 표현된 시간을 숫자로 입력하세요:',
    'horas.placeholder': '예: 14:30 또는 2:30 da tarde',
    'mod.conj.name': '동사 활용',
    'mod.conj.desc': '동사 변화 검색',
    'mod.dict.name': '사전',
    'mod.dict.desc': '모든 단어 보기',
    'mod.stats.name': '통계',
    'mod.stats.desc': '스트릭과 성과',

    'voc.locked.title': '복습이 필요해요',
    'voc.locked.msg': '단어 카드 <b>{n}</b>개가 대기 중이에요. 다른 메뉴를 사용하려면 먼저 복습을 끝내세요.',
    'voc.locked.go': '복습하기',
    'voc.add.title': '카드 추가',
    'voc.add.sub': '오늘의 단어를 골라보세요',
    'voc.add.count': '카드 수',
    'voc.add.classes': '단어 종류 (TOP N 빈도 내에서)',
    'voc.add.create': '카드 만들기',
    'voc.add.pickOne': '단어 종류를 하나 이상 선택하세요',
    'voc.notEnough': '단어가 {n}개만 남아서 그만큼만 추가했어요',
    'voc.added': '{n}개의 카드를 추가했어요',
    'voc.empty': '대기 중인 카드가 없어요. 새 카드를 추가해 보세요!',
    'voc.learned': '아는 단어',
    'voc.reviewLater': '나중에 복습',
    'voc.done': '오늘의 복습 완료! 잘하셨어요',
    'voc.remaining': '남은 카드: {n}',
    'voc.learnedCount': '아는 단어: {n}개',
    'pos.noun': '명사', 'pos.verb': '동사', 'pos.adj': '형용사', 'pos.adv': '부사',
    'pos.pron': '대명사', 'pos.num': '수사', 'pos.art': '관사', 'pos.prep': '전치사',
    'pos.conj': '접속사', 'pos.interj': '감탄사',

    'num.config': '설정',
    'num.max': '최대 숫자 (최대 9.999.999)',
    'num.mode': '모드',
    'num.mode.d2t': '숫자 → 글자',
    'num.mode.t2d': '글자 → 숫자',
    'num.prompt.d2t': '이 숫자를 포르투갈어로 쓰세요:',
    'num.prompt.t2d': '이 글자를 숫자로 쓰세요:',
    'num.placeholder.t2d': '예: 1234',
    'num.placeholder.d2t': '예: mil duzentos e trinta e quatro',

    'color.mode.n2c': '이름 → 색깔 선택',
    'color.mode.c2n': '색깔 → 이름 선택',
    'color.prompt.n2c': '이 색을 고르세요:',
    'color.prompt.c2n': '이 색의 이름은?',

    'gender.prompt': '이 단어는?',
    'gender.masc': '남성',
    'gender.fem': '여성',
    'gender.rule.title': '규칙',
    'gender.rule.m': '보통 -o로 끝나는 단어는 남성입니다.',
    'gender.rule.f': '보통 -a로 끝나는 단어는 여성입니다.',
    'gender.rule.generic': '단어의 끝이 성을 알려주는 경우가 많지만 예외도 있어요.',
    'gender.exc': '예외: 일부 -a로 끝나는 단어는 남성(o problema, o dia), 일부 -o로 끝나는 단어는 여성(a foto, a moto)입니다.',
    'gender.noData': '성 정보가 있는 명사가 없습니다.',

    'write.prompt': '들은 내용을 입력하세요',
    'write.play': '다시 듣기',
    'write.placeholder': '여기에 입력…',
    'write.reveal': '정답 보기',
    'write.seeDict': '사전에서 보기',

    'geo.level': '난이도',
    'geo.l1': '대륙',
    'geo.l2': '나라',
    'geo.l3': '수도 · 주(州)',
    'geo.q.continent': '{c}은(는) 어느 대륙에 있나요?',
    'geo.q.capital': '{c}의 수도는?',
    'geo.q.country': '{cap}은(는) 어느 나라의 수도인가요?',
    'geo.q.state': '다음 중 브라질의 주(州)는?',

    'conj.search': '동사를 입력하세요 (예: falar, comer, ir)',
    'conj.go': '활용 보기',
    'conj.presente': '현재 (Presente)',
    'conj.preterito': '완전과거 (Pretérito Perfeito)',
    'conj.futuro': '미래 (Futuro do Presente)',
    'conj.notFound': '해당 동사를 찾을 수 없어요. 규칙 활용으로 생성합니다.',
    'conj.notVerb': '"{w}"은(는) 동사가 아니거나 -ar/-er/-ir로 끝나지 않아요.',
    'conj.generated': '(규칙 활용으로 생성됨)',

    'dict.search': '단어 검색…',
    'dict.noResults': '결과가 없어요',
    'dict.examples': '예문',
    'dict.definitions': '뜻',
    'dict.directTranslation': '직접 번역',
    'dict.examplesKo': '예문 번역',
    'dict.conj': '활용',
    'dict.freqRank': '빈도 순위',
    'dict.waiting': '전체 사전을 불러오는 중이에요. 기본 200단어를 먼저 검색할 수 있어요.',

    'stats.title': '통계',
    'stats.streak': '연속 학습일',
    'stats.days': '일',
    'stats.all': '전체',
    'stats.total': '총 시도',
    'stats.hits': '정답',
    'stats.errors': '오답',
    'stats.accuracy': '정답률',
    'stats.chart': '최근 7일 활동량',
    'stats.noData': '아직 데이터가 없어요. 연습을 시작해 보세요!',
    'stats.disableStreak': '스트릭 시스템 끄기',
    'stats.streakOff': '스트릭이 꺼져 있어요',

    'tts.unavailable': '음성 재생을 사용할 수 없어요',
    'tts.disabled': '이 기기에서는 음성 기능이 비활성화되었어요',
  },

  en: {
    'app.subtitle': 'Portuguese learning tools',
    'lang.label': 'Language',

    'nav.back': 'Back', 'nav.home': 'Home',
    'common.start': 'Start', 'common.next': 'Next', 'common.check': 'Check',
    'common.finish': 'Finish', 'common.close': 'Close', 'common.listen': 'Listen',
    'common.correct': 'Correct!', 'common.wrong': 'Not quite',
    'common.answerWas': 'Answer: {a}', 'common.loading': 'Loading',
    'common.tryAgain': 'Try again', 'common.of': 'of', 'common.score': 'Score',
    'common.skip': 'Skip', 'common.restart': 'Restart', 'streak.tip': 'View stats',

    'voc.practice': 'Practice learned',
    'voc.practice.howMany': 'How many cards?',
    'voc.practice.all': 'All',
    'voc.practice.empty': 'No learned cards yet',
    'about.slogan': 'Learn Portuguese, joyfully',
    'about.teacher': 'Teacher Glória Roh',
    'about.creator': 'Created by lluc.dev',
    'voc.good': 'Good',
    'voc.hard': 'Hard',
    'voc.again': 'Again',
    'voc.desc.good': 'Remove from deck',
    'voc.desc.hard': 'Middle of the deck',
    'voc.desc.again': 'End of the deck',
    'voc.card.translate': 'Show translation',
    'voc.giveUp': 'Give up the cards',
    'voc.learnedTitle': 'Learned words',
    'voc.add.review': 'Cards to review (previous stack)',
    'voc.add.hint': 'Tap a word class to activate it ›',

    'data.loading': 'Loading the full dictionary…',
    'data.ready': 'Full dictionary ready ({n} words)',
    'data.fallback': 'Running on the 200 starter words',

    'home.title': 'What will you practice today?',

    'mod.voc.name': 'Vocabulary Cards', 'mod.voc.desc': 'Flashcards · streak',
    'mod.num.name': 'Numbers', 'mod.num.desc': 'Digits ↔ words',
    'mod.color.name': 'Colors', 'mod.color.desc': '20 colors',
    'mod.gender.name': 'Gender', 'mod.gender.desc': 'Masc / Fem',
    'mod.write.name': 'Dictation', 'mod.write.desc': 'Listen & type',
    'mod.geo.name': 'Geography', 'mod.geo.desc': 'Continents · capitals',
    'mod.horas.name': 'Time', 'mod.horas.desc': 'Reading the clock',
    'horas.prompt': 'Write this time in digits:',
    'horas.placeholder': 'e.g. 14:30 or 2:30 da tarde',
    'mod.conj.name': 'Conjugator', 'mod.conj.desc': 'Search verb forms',
    'mod.dict.name': 'Dictionary', 'mod.dict.desc': 'Browse all words',
    'mod.stats.name': 'Stats', 'mod.stats.desc': 'Streak & performance',

    'voc.locked.title': 'Review required',
    'voc.locked.msg': 'You have <b>{n}</b> card(s) waiting. Finish the review to unlock the other modules.',
    'voc.locked.go': 'Review now',
    'voc.add.title': 'Add cards', 'voc.add.sub': 'Pick your words for today',
    'voc.add.count': 'Number of cards',
    'voc.add.classes': 'Word classes (within TOP N by frequency)',
    'voc.add.create': 'Create cards',
    'voc.add.pickOne': 'Pick at least one word class',
    'voc.notEnough': 'Only {n} words available — added those',
    'voc.added': 'Added {n} card(s)',
    'voc.empty': 'No cards in the queue. Add some new ones!',
    'voc.learned': 'I learned it', 'voc.reviewLater': 'Review later',
    'voc.done': "Today's review is done. Great job!",
    'voc.remaining': 'Cards left: {n}', 'voc.learnedCount': 'Learned words: {n}',
    'pos.noun': 'noun', 'pos.verb': 'verb', 'pos.adj': 'adjective', 'pos.adv': 'adverb',
    'pos.pron': 'pronoun', 'pos.num': 'numeral', 'pos.art': 'article', 'pos.prep': 'preposition',
    'pos.conj': 'conjunction', 'pos.interj': 'interjection',

    'num.config': 'Settings', 'num.max': 'Max number (up to 9,999,999)',
    'num.mode': 'Mode', 'num.mode.d2t': 'Digits → words', 'num.mode.t2d': 'Words → digits',
    'num.prompt.d2t': 'Write this number in Portuguese:',
    'num.prompt.t2d': 'Write this in digits:',
    'num.placeholder.t2d': 'e.g. 1234',
    'num.placeholder.d2t': 'e.g. mil duzentos e trinta e quatro',

    'color.mode.n2c': 'Name → tap the color', 'color.mode.c2n': 'Color → tap the name',
    'color.prompt.n2c': 'Tap this color:', 'color.prompt.c2n': 'What is this color called?',

    'gender.prompt': 'This word is…', 'gender.masc': 'Masculine', 'gender.fem': 'Feminine',
    'gender.rule.title': 'Rule',
    'gender.rule.m': 'Words ending in -o are usually masculine.',
    'gender.rule.f': 'Words ending in -a are usually feminine.',
    'gender.rule.generic': 'The ending often signals gender, but there are exceptions.',
    'gender.exc': 'Exceptions: some -a words are masculine (o problema, o dia); some -o words are feminine (a foto, a moto).',
    'gender.noData': 'No nouns with gender data available.',

    'write.prompt': 'Type what you hear', 'write.play': 'Play again',
    'write.placeholder': 'Type here…', 'write.reveal': 'Reveal answer',
    'write.seeDict': 'See in dictionary',

    'geo.level': 'Level', 'geo.l1': 'Continents', 'geo.l2': 'Countries', 'geo.l3': 'Capitals · States',
    'geo.q.continent': 'Which continent is {c} in?',
    'geo.q.capital': 'What is the capital of {c}?',
    'geo.q.country': '{cap} is the capital of which country?',
    'geo.q.state': 'Which of these is a Brazilian state?',

    'conj.search': 'Enter a verb (e.g. falar, comer, ir)', 'conj.go': 'Conjugate',
    'conj.presente': 'Present (Presente)', 'conj.preterito': 'Simple past (Pretérito Perfeito)',
    'conj.futuro': 'Future (Futuro do Presente)',
    'conj.notFound': 'Verb not in the dataset — generated with regular rules.',
    'conj.notVerb': '"{w}" is not a verb ending in -ar/-er/-ir.',
    'conj.generated': '(generated with regular rules)',

    'dict.search': 'Search a word…', 'dict.noResults': 'No results',
    'dict.examples': 'Examples', 'dict.definitions': 'Definitions',
    'dict.directTranslation': 'Direct translation', 'dict.examplesKo': 'Example translations',
    'dict.conj': 'Conjugation', 'dict.freqRank': 'Frequency rank',
    'dict.waiting': 'Loading full dictionary. You can search the 200 starter words now.',

    'stats.title': 'Statistics', 'stats.streak': 'Day streak', 'stats.days': 'days',
    'stats.all': 'All', 'stats.total': 'Total attempts', 'stats.hits': 'Correct',
    'stats.errors': 'Errors', 'stats.accuracy': 'Accuracy',
    'stats.chart': 'Activity over the last 7 days',
    'stats.noData': 'No data yet. Start practicing!',
    'stats.disableStreak': 'Turn off the streak system', 'stats.streakOff': 'Streak is off',

    'tts.unavailable': 'Audio playback is unavailable',
    'tts.disabled': 'Audio is disabled on this device',
  },

};

const LANG_META = [
  { code: 'ko', flag: '🇰🇷', label: '한국어' },
  { code: 'en', flag: '🇺🇸', label: 'English' },
];

let _lang = localStorage.getItem('gloria.lang') || 'ko';

function setLang(code) {
  if (!I18N[code]) return;
  _lang = code;
  localStorage.setItem('gloria.lang', code);
  document.documentElement.lang = code;
}
function getLang() { return _lang; }

/** Translate key, interpolating {placeholders} from vars. */
function t(key, vars) {
  const table = I18N[_lang] || I18N.ko;
  let s = (key in table) ? table[key] : (I18N.ko[key] || key);
  if (vars) for (const k in vars) s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
  return s;
}

document.documentElement.lang = _lang;
