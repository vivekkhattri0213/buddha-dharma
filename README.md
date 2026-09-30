# Buddha's Teachings, One Small Step at a Time

A beginner-friendly guide to the Buddha's core teachings, built for brains that get overwhelmed easily (ADHD-friendly by design). It leans on the **Thai Forest tradition** and the translations and books of **Ṭhānissaro Bhikkhu** (Ajaan Geoff).

> You don't need to read everything. You don't need to read in order. One lesson = 5-10 minutes. Stopping halfway is fine.

## Start here

1. Read [How to use this repo](lessons/00-how-to-use.md) (2 min).
2. Pick **one** lesson below. Do only that one today.

| # | Lesson | Time | The one-line version |
|---|--------|------|----------------------|
| 1 | [The Four Noble Truths](lessons/01-four-noble-truths.md) | 10 min | Four jobs to do about stress, not four beliefs to hold |
| 2 | [The Three Characteristics](lessons/02-three-characteristics.md) | 10 min | Three ways of looking that help you let go |
| 3 | [Craving: the 3 kinds](lessons/03-craving.md) | 7 min | What actually causes the stress |
| 4 | [Clinging: the 4 kinds](lessons/04-clinging.md) | 7 min | What the mind grabs onto and how |
| 5 | [What does "reincarnation" actually mean?](lessons/05-rebirth.md) | 10 min | Rebirth as something the mind does, not a soul travelling |
| 6 | [The Five Aggregates](lessons/06-five-aggregates.md) | 10 min | Five activities that make up "you," none of them a self |
| 7 | [Dependent Origination](lessons/07-dependent-origination.md) | 12 min | The step-by-step chain that turns a moment into stress, and where to break it |

Also: [Glossary](lessons/glossary.md) · [Sources & further reading](SOURCES.md) · [Roadmap](ROADMAP.md) · [Contributing](CONTRIBUTING.md)

## Suggested path (if you like being told what to do)

`1 → 3 → 4 → 6 → 7 → 2 → 5`: truths first, then the cause (craving, clinging), then what gets clung to (the five aggregates), then how it all chains together (dependent origination), then the three characteristics, then rebirth last, because it makes more sense once the rest is familiar.

## Who this is for

- Complete beginners who find most Buddhism explanations vague or wordy
- People who want **practice**, not just philosophy
- Anyone who has tried to read the suttas and bounced off

## Honest disclaimers

- This is a study aid written by a learner, **not** an authority. Always check the sources.
- Each lesson links to the original suttas (early discourses) and Ṭhānissaro Bhikkhu's free books so you can go to the source.
- It is not therapy or medical advice. If you're struggling, please talk to a professional.

## Website

The repo builds into a simple static site in `docs/` (served by GitHub Pages).

- **Publish:** GitHub repo → Settings → Pages → Source: *Deploy from a branch* → Branch `main`, folder `/docs`.
- **After editing any `.md` file:** run `npm install` once, then `npm run build`, and commit the updated `docs/`.
- **Preview locally:** `cd docs && python3 -m http.server 8000`, then open <http://localhost:8000>.

## License

Lesson text is [CC BY-SA 4.0](LICENSE.md); code is MIT (see [LICENSE](LICENSE)). Quoted sutta and book material belongs to its authors and translators; see [SOURCES.md](SOURCES.md).
