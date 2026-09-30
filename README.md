# Buddha's Teachings, One Small Step at a Time

A beginner-friendly guide to the Buddha's core teachings, built for brains that get overwhelmed easily (ADHD-friendly by design). It leans on the **Thai Forest tradition** and the translations and books of **Ṭhānissaro Bhikkhu** (Ajaan Geoff).

> You don't need to read everything. You don't need to read in order. One lesson = 5-10 minutes. Stopping halfway is fine.

## Choose your path

Pick the row that matches your brain right now.

| You have... | Do this |
|-------------|---------|
| **2 minutes** | Read only the "Two-minute version" at the top of [Lesson 1](lessons/1-the-problem/01-four-noble-truths.md). Done. |
| **10 minutes** | Read one full lesson. Start with [Lesson 1](lessons/1-the-problem/01-four-noble-truths.md). |
| **Energy to *do* something** | Skip to the "Try it now" at the bottom of [Lesson 2: Craving](lessons/2-the-cause/02-craving.md) or [Lesson 5: Dependent Origination](lessons/3-how-it-works/05-dependent-origination.md). |
| **A word you don't know** | Check the [Glossary](lessons/reference/glossary.md). |
| **First time here** | Read [How to use this repo](lessons/00-start-here/how-to-use.md) (2 min), then go in order below. |

## The lessons, in order

Four tracks. Each lesson is numbered in the order to read it, and the website's "Next lesson" button follows the same order.

### Track 1: The Problem
What the Buddha said he was teaching about, in one framework.

| # | Lesson | Time | The one-line version |
|---|--------|------|----------------------|
| 1 | [The Four Noble Truths](lessons/1-the-problem/01-four-noble-truths.md) | 10 min | Four jobs to do about stress, not four beliefs to hold |

### Track 2: The Cause
Where the stress comes from.

| # | Lesson | Time | The one-line version |
|---|--------|------|----------------------|
| 2 | [Craving: the 3 kinds](lessons/2-the-cause/02-craving.md) | 7 min | What actually causes the stress |
| 3 | [Clinging: the 4 kinds](lessons/2-the-cause/03-clinging.md) | 7 min | What the mind grabs onto and how |
| 4 | [The Five Aggregates](lessons/2-the-cause/04-five-aggregates.md) | 10 min | Five activities that make up "you," none of them a self |

### Track 3: How It Works
Putting the pieces together.

| # | Lesson | Time | The one-line version |
|---|--------|------|----------------------|
| 5 | [Dependent Origination](lessons/3-how-it-works/05-dependent-origination.md) | 12 min | The step-by-step chain that turns a moment into stress, and where to break it |
| 6 | [The Three Characteristics](lessons/3-how-it-works/06-three-characteristics.md) | 10 min | Three ways of looking that help you let go |

### Track 4: Big Questions
Easier once the rest is familiar.

| # | Lesson | Time | The one-line version |
|---|--------|------|----------------------|
| 7 | [What does "reincarnation" actually mean?](lessons/4-big-questions/07-rebirth.md) | 10 min | Rebirth as something the mind does, not a soul travelling |

### Reference
[Glossary](lessons/reference/glossary.md) · [Sources & further reading](SOURCES.md) · [Roadmap](ROADMAP.md) · [Contributing](CONTRIBUTING.md)

## Track your progress

*On the website you can tick these and your browser remembers them. On GitHub they're display-only.*

- [ ] Lesson 1: Four Noble Truths
- [ ] Lesson 2: Craving
- [ ] Lesson 3: Clinging
- [ ] Lesson 4: Five Aggregates
- [ ] Lesson 5: Dependent Origination
- [ ] Lesson 6: Three Characteristics
- [ ] Lesson 7: Rebirth

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

Lesson text is [CC BY-SA 4.0](LICENSES/CC-BY-SA-4.0.txt); code is MIT (see [LICENSE](LICENSE)). Details and how to credit: [LICENSE.md](LICENSE.md). Quoted sutta and book material belongs to its authors and translators; see [SOURCES.md](SOURCES.md).
