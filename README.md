# Glória PT-BR

**포르투갈어 학습 앱** — A Portuguese learning app for Korean speakers, built for [Glória Roh](https://www.instagram.com/gloriaroh_/) 선생님.

---

## Modules

| | Module | Description |
|---|--------|-------------|
| 🃏 | **단어 카드** · Vocabulary Cards | Spaced-repetition flashcards with a daily queue and streak system |
| 🔢 | **숫자** · Numbers | Digit ↔ Portuguese word conversion, up to 9,999,999 |
| 🎨 | **색깔** · Colors | 20 colors — name-to-swatch and swatch-to-name |
| ♂♀ | **성(性)** · Gender | Masculine / feminine classification for nouns |
| 🌍 | **지리** · Geography | Continents, capitals, and Brazilian states in 3 difficulty levels |
| 🕐 | **시간** · Time | Read Portuguese time expressions, answer in `HH:MM` or `H:MM da tarde` |
| ✍️ | **받아쓰기** · Dictation | Listen to words and example sentences, type what you hear |
| 📖 | **동사 활용** · Conjugator | Instant conjugation lookup for any Portuguese verb |
| 📚 | **사전** · Dictionary | Full word browser with Korean definitions, examples, and translations |
| 📊 | **통계** · Stats | 7-day activity chart, per-module accuracy, and streak tracking |

---

## Features

- **Offline-first PWA** — installable on mobile, works fully offline after the first load
- **Korean UI by default** — all labels, prompts, and definitions in Korean; English toggle available
- **Korean translations built in** — direct translation, Korean definitions, and per-sentence translations on flashcards and dictation exercises
- **Forgiving input** — normalizes accents, case, and punctuation so `"Eu vou ao parque."` and `"eu vou ao parque"` are both accepted
- **3,000-word dataset** — top-frequency Portuguese words with Korean translations, example sentences, and verb conjugation tables

---

## Structure

```
gloriapt/
├── index.html               App shell
├── manifest.json            PWA manifest
├── service-worker.js        Offline cache (cache-first)
└── assets/
    ├── css/styles.css       Design system (glassmorphism + aurora gradient)
    ├── fonts/               Inter + Playfair Display (variable, zero CDN)
    ├── gloria.png           App icon / logo
    ├── gloria_data.js       Full dataset (3,000 words, lazy-loaded)
    ├── gloria_data_fallback.js  Starter dataset (200 words, bundled)
    └── js/
        ├── i18n.js          Korean / English translations + t()
        ├── icons.js         Inline SVG icon set
        ├── ui.js            DOM helpers, toast, text normalization
        ├── store.js         localStorage — queue, stats, streak, history
        ├── tts.js           Web Speech API wrapper with graceful degradation
        ├── ptnum.js         Portuguese number-to-words (0–9,999,999)
        ├── pttime.js        Portuguese time expression parser
        ├── staticdata.js    Colors, countries, capitals, Brazilian states
        ├── conjugator.js    Verb conjugation engine (5 tenses)
        ├── lexicon.js       Word data access layer (fallback → full swap)
        └── app.js           Router + all module views
```

---

## Running locally

```bash
# Any static file server works:
npx serve .
# or
python3 -m http.server 8080
```

Open `http://localhost:8080`. The service worker requires `http(s)://` — `file://` URLs won't work.

To install as an app: open in a mobile browser → "Add to Home Screen".

---

## Dataset

The word dataset (`gloria_data.js`) contains the top 3,000 most-frequent Portuguese words, enriched with:

- Korean direct translations and definitions
- Example sentences in Portuguese and Korean
- Verb conjugation tables (presente, pretérito perfeito, imperfeito, futuro, condicional)
- Grammatical gender for nouns

The fallback file (`gloria_data_fallback.js`) bundles the top 200 words so the app is immediately usable without waiting for the full dataset to load.