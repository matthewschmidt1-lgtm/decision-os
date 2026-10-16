# UX Audit: Decision OS practice pages (Kroger diagnosis · Harris Teeter objection)

Pages tested: `/practice/kroger-decline` (Module 1 · Practice) and `/sell/competitor-margin` (Module 2 · Conversation). Tested live in the built-in browser pane at 1440×900, 1280×800, 390×844 and the "mobile" preset (375×812, Android UA, 5 touch points). Light mode primary; dark mode spot-checked. All measurements below are computed-style or getBoundingClientRect values unless marked *estimate*. No files were edited.

**Testing limits (things that prevented or constrained testing):**
- The browser profile already had a prior play recorded, so page 1 showed "You've played this one before. Replays don't change your score." on every load; the true first-visit variant of that line was not observed.
- Taps are delivered as mouse clicks; real touch gestures (swipe on the clipped mobile nav, long-press) were not exercised.
- Browser zoom (Cmd +) and screen-reader output cannot be driven by the tools; accessibility notes marked "hypothesis" are inferred from the DOM, not verified with AT.
- Contrast ratios are WCAG-formula computations on the measured colours; this is not a conformance claim.

---

## A. Executive summary

**Overall:** Both pages are clean, low-clutter and structurally sound for a sales learner. The sequence (context facts → situation → evidence → decision → answers → feedback → optional deep-dive) is logical, answers are large, comparable buttons with 58px+ targets, mouse/Enter/Space all select correctly, a visible 2px focus ring exists, there is no horizontal overflow at any viewport, and dark mode has better contrast than light. Page 1 (Kroger) is a good template. Page 2 (Harris Teeter) re-uses the format but its evidence and prompt are weaker: the buyer's actual words are the smallest body text on the page, and the yours-vs-theirs numbers are low-emphasis grey text spread across four cards, which on a phone pushes the decision 1.77 screens down.

**Three most important problems**
1. **Page 2 evidence is hard to scan and very tall on mobile.** Four cards stack single-column at 390px (each 136px; block is 759px tall), numbers are 15px grey list text with no emphasis, and "How do you respond?" lands at y=1495 (second-and-three-quarter screen). Page is 2387px before answering.
2. **Page 2 inverts hierarchy: the buyer's quote (the objection to respond to) is 15px; the paraphrase headline is 38px.** A learner's eye goes to the paraphrase, not the line they must answer.
3. **After an answer is selected, focus is dropped to `<body>` and the feedback is only partially in view** (feedback heading at viewport y≈820/900, 490/800, 564/844). The "Why?" button and the "Strongest option" line are always below the fold; keyboard users lose their place entirely (both pages).

**Single highest-impact improvement:** Re-lay out page 2's "What you know" as a compact Yours / Theirs comparison (two-column grid or a 4-row table) with the numbers set at 17–20px/600 in the body colour, and promote the buyer's quote to ~20px. This removes ~400px of mobile scrolling before the decision and makes the numbers the learner needs (33% vs 39%, $21 vs $12) readable at a glance. (Cheapest cross-cutting fix: move focus/scroll to the verdict heading on selection — see E1.)

---

## B. Findings table (sorted high → low)

No P1 Critical findings: nothing prevents a learner from completing either exercise.

| Priority | Page section / element | Observed issue | Evidence / measurement | Recommended fix | Expected learner benefit |
|---|---|---|---|---|---|
| **P2 High** | Page 2 · "What you know" evidence cards (mobile) | Four comparison cards stack single-column; numbers are secondary text; decision pushed far down | 390×844: `.ev-card` grid = `324px` (1 col), each card 136px tall; block spans y=655→1414 (759px); question at y=1495; page 2387px tall before answering. Page 1 by contrast uses a 2×3 grid (152px cols) and its question is at y=887. "yours 33% / theirs 39%" are `<li>` at 15px/400 #4A4A46 with no numeric emphasis (confirmed at 1440 and 390). | At ≤480px use a 2-column grid (as page 1 does) or render as one 4-row table `Metric · Yours · Theirs`. Set the values at 17–20px/600 #171717 and the "yours/theirs" word at 13px muted. | Learner sees all four comparisons in one glance and reaches the decision ~1 screen earlier on a phone. |
| **P2 High** | Page 2 · "The buyer says" quote vs "The situation" H1 | The text the learner must respond to is the smallest body copy on the page; the paraphrase is the largest | `.says` = 15px/400, lh 22.5px, 55px tall box (1440); H1 = 38px/500 directly below it. On mobile quote 15px vs H1 24px. | Set the quote to 20–22px/500 (18px on mobile), lh ~1.45, keep the tinted box; reduce the H1 to 28–30px or demote it to a 17–18px lede under the quote. | The objection reads as the prompt; the paraphrase becomes supporting context, matching how a real meeting unfolds. |
| **P2 High** | Both pages · answer selection → feedback | Focus is lost and feedback is only partly visible after choosing | `document.activeElement` = `BODY` after Enter (1440), mouse (1440), Space (1280). Verdict `.verdict` top at viewport y=820/900 (page 1, 1440), 490/800 (page 2, 1280), 564/844 (page 1, 390). "Strongest option:" and the "Why?" button were below the fold in every case. All four option buttons become `disabled` on selection, which is why focus drops. | On selection, give the verdict `<h2>` `tabindex="-1"`, call `.focus({preventScroll:true})`, then `scrollIntoView` so it sits ~16px under the sticky header. Alternatively keep buttons enabled but `aria-disabled`. | Keyboard/screen-reader users land on the feedback; sighted users see the verdict, lede and "Strongest option" without hunting; fewer learners miss the "Why?" layer. |
| **P2 High** | Page 1 · metric labels and caveats inside the sunk card | Decision-essential labels are small and low-contrast | `.k` ("Sales", "Distribution (ACV)", "Velocity ($/pt of ACV)") = 13px/400 #7B7B76 on #EDEDE7 → **3.62:1**. Caveat "Numbers are as messy…" 13px, same colour, same ratio. Page 2 "What he's measured on" label also 13px/#7B7B76. | 14px and a darker grey (≈#5F5F5A gives ≈4.6:1 on #EDEDE7; the existing eyebrow grey #4A4A46 gives 7.6:1). Keep the caveat at 13px but use the darker colour. | A rep scanning "Velocity ($/pt of ACV)" vs "Distribution (ACV)" — the crux of this diagnosis — can read the labels without leaning in. |
| **P3 Moderate** | Both pages · decision question/answers relative to the laptop fold | On a 1280×800 laptop the answers are not visible without scrolling; on page 2 the question itself is below the fold | Page 1 @1280×800: question y=696 (visible), option A y=781–839 (19px peeks above the 800 fold). Page 2 @1280×800: question y=1012, option A y=1098; the fold cuts the evidence block (caveat at y=881). @1440×900 page 2 question y=1016. | Tighten vertical rhythm above the decision: H1 38→32px (lh 1.2), section gaps ~56→40px, sunk-card padding 16→12px; on page 2 the evidence fix above removes a further ~60px. Target: question ≤700px from top at 1280×800 on page 2. | The scenario, evidence and at least the first answers can be scanned together on a laptop; less back-and-forth between numbers and options. |
| **P3 Moderate** | Both pages · "Evidence that matters" (inside "Why?" layer) | Repeats "What you know" verbatim | Page 1: same six tiles, same labels/values (y=1404–1560). Page 2: same four cards + "What he's measured on" (325px block, y=2140). Expanded page heights: page 1 2399px (1440), 3229px (390); page 2 3356px (1440). | Replace with a pointer that highlights only the tiles the reasoning cites (e.g. keep "Distribution (ACV)" and "Velocity", drop the rest), or show a one-line "Evidence used: Distribution −3 pts · Velocity −5%" strip. | Shorter deep-dive; learner's attention goes to the two numbers that drove the answer instead of re-reading six. |
| **P3 Moderate** | Both pages · reasoning / verdict prose width | Line lengths well beyond comfortable reading | Reasoning paragraph 17px at 974px wide (≈125–135 characters per line, *estimate from average glyph width*). Option B/D text on page 2 runs 940px wide. Verdict lede is capped at 700px while the "Strongest option" line below it runs 1024px — inconsistent ragging visible in screenshots. | Apply `max-width: 68ch` (~720px at 17px) to prose inside `.layer`, `.verdict` and the disclosure text; leave option buttons full width. | Reasoning and principle text read in 2–3 short sweeps rather than long lines that are easy to lose. |
| **P3 Moderate** | Mobile sticky header + nav row | Header consumes 14% of the viewport and the nav is clipped with no affordance | 390×844: `header.topbar` 121px tall, `position: sticky`; `nav` scrollWidth 452 vs clientWidth 358 (`overflow-x:auto`); "Accounts" is cut at the right edge and "Learn" is fully hidden (screenshot). Backdrop is 82% opaque, so content shows faintly through it while scrolling. | Below 480px make only the brand row sticky (≈64px) and let the nav row scroll away, or collapse nav into the search/menu button; add a right-edge fade on the scrollable row. | More of the exercise on screen while scrolling; learners can find "Learn" on a phone. |
| **P3 Moderate** | Both pages · unchosen options after selection | Faded options become low-contrast while the feedback asks the learner to compare them | Unchosen buttons `opacity: 0.55` → effective text contrast ≈3.9:1 (*blended estimate*). The "Why the other options were weaker" explanations (page 2) are 15px #7B7B76 on #F5F5F0 = 3.89:1. | Fade only the border and letter badge (opacity .5) and keep option text at full colour; set disclosure explanations to #4A4A46 and 16px. | The learner can re-read the options against the explanations without strain. |
| **P3 Moderate** | Page 2 · post-answer disclosures | Two separate collapsed steps hide most of the learning content | After selecting, "Why the other options were weaker" (`<details>`, 66px summary) is closed and the "Why?" button is a second, separate expander; expanding both adds ~1150px. | Open "Why the other options were weaker" by default once an answer is chosen (the learner has already committed), keep "Why?" as the single optional deep-dive. | One fewer click to the comparison the learner most wants after a wrong pick. |
| **P4 Low** | Page 2 · evidence card "Margin dollars per facing" | Title wraps to 2 lines so its rows sit 22px lower than the other three cards | Rows at y=690/730 vs 668/708 in neighbours (1440 and 1280). | Set a 2-line `min-height` on `.ev-card .k` or shorten to "Margin $ per facing". | Rows align across cards so "yours/theirs" can be compared by eye in one horizontal pass. |
| **P4 Low** | Page 1 · "Shelf audit · not done since Q1" | Amber warning text is the only sub-4.5:1 metric value | 17px/500 #B7791F on #EDEDE7 = **3.10:1**. Red (5.56:1) and green (4.25:1 at 22px/500) are acceptable-to-borderline. | Darken the amber (≈#8A5A10) to ≥4.5:1; optionally bump green slightly darker. | The one qualitative "unknown" in the evidence (a strong hint for this diagnosis) is as legible as the numbers. |
| **P4 Low** | Both pages · "Learn the algorithm" link | Small touch target on mobile | 26px tall `<a>` (390×844). All other controls ≥44px (options 58–162px, nav links 44px, Next/Back 54–56px). | Add vertical padding to reach ≥44px. | Easier tap after reading the principle. |
| **P4 Low** | Page 1 · correct-answer feedback | Heading and lede both open with "Good instinct." | H2 "Good instinct. Here's why." immediately followed by lede "Good instinct. Distribution fell 3 points…" | Drop the repeated phrase from one of the two (copy-only). | Marginally cleaner read; not a curriculum change. |
| **P4 Low** | Page 2 · `.says` quote has `role="status"`; `<main>` is `aria-live="polite"` | Static prompt text is in a live region (hypothesis: may be announced unexpectedly on load; whole-page live region may read the entire re-render on selection) | DOM attributes observed; not verified with a screen reader. | Remove `role="status"` from the quote; scope `aria-live` to the verdict container. | Cleaner screen-reader experience (unverified). |

**Observed, not a defect:** On page 2 the answer order is shuffled per load (first load A = "Their velocity is weak…", reload A = "On percent, they win…"); feedback refers to answers by quoted text rather than letter, which is correct for this behaviour. Reloading resets the exercise to unanswered (replay), so there is no in-page "try again" but recovery is one reload away. Answer buttons expose `aria-pressed`, and the focus ring (2px solid #2457D6, 3px offset) is clearly visible on the options.

---

## C. Typography audit (measured, light mode; body font Inter, eyebrows JetBrains Mono)

| Element | Measured | Weight / line-height | Colour / contrast | Concern | Recommendation |
|---|---|---|---|---|---|
| Context facts (Customer · Category · Skill · Goal/Stage) | 15px | values 500 / 23.25px | #171717 values; labels grey (*colour not measured*) | Fine as metadata | None |
| Section eyebrows (THE SITUATION, WHAT YOU KNOW, THE DECISION, REASONING, THE PRINCIPLE…) | 15px mono uppercase, 1.2px tracking | 400 / 23.25px | #4A4A46 → 8.14:1 page, 7.57:1 card | Eleven uppercase mono labels per fully-expanded page; legible but heavy | Keep; consider 13px for the post-answer layers to reduce competition with content |
| Situation H1 | 38px desktop / 24px mobile | 500 / 46.4px (1.22) / 29.3px | #171717, 16.4:1 | ~50 cpl at 998px — fine; height (139–146px) is the largest single consumer of first-screen space | 32px desktop is sufficient; on page 2 demote (see B) |
| Buyer quote (page 2) | **15px** | 400 / 22.5px (1.5) | #171717 on rgba(36,87,214,.1) | Smallest body text yet the prompt to answer | 20–22px desktop, 18px mobile |
| Metric labels `.k` (page 1) | **13px** | 400 / 17.6px | #7B7B76 on #EDEDE7 → **3.62:1** | Essential to the decision, small and low-contrast | 14px, darker grey |
| Metric values (page 1) | 22px numbers; 17px for text value | 500 / 26.4px | red 5.56:1, green 4.25:1, amber **3.10:1** | Numbers good; amber low | Darken amber |
| Page 2 card title | 17px | 600 / 22.1px | #171717 | Good | None |
| Page 2 card values ("yours 33%") | 15px | 400 / 21px | #4A4A46 → 8.6:1 | Numbers not visually distinct from the label word | Values 17–20px/600 dark; word 13px muted |
| Caveat notes ("Numbers are as messy…", "Some of this you'd know…") | 13px | 400 / 20.2px | #7B7B76 → 3.62:1 | Acceptable size for a caveat; colour too light | Darker grey, keep 13px |
| Decision question H2 | 32px desktop / 24.7px mobile | 500 / 38.4px | #171717 | Clearly differentiated; good | None |
| "Pick one. You'll see the reasoning either way." | 15px | 400 / 23.25px | #7B7B76 on page → 3.89:1 | Helper text; borderline | #5F5F5A |
| Answer text | 17px | 400 / 26.35px (1.55) | #171717 on #FBFBF8 | Good size; 940px line width on desktop for long quotes (page 2) | Keep; optionally `max-width: 75ch` inside the button |
| Choice letter badge | 13px | 400 | #7B7B76 → 4.10:1 | Decorative; fine | None |
| "Model prefers / Strongest move" pill | *not measured* | — | white on blue | Small; readable in screenshots | None |
| Verdict H2 ("A common move…") | 20px | 500 / 26px (1.3) | #171717 | Good | None |
| Verdict lede | 18px | 400 / 27.9px (1.55) | #4A4A46 | Good; capped at 700px | None |
| "You chose:" / "Strongest option:" | 15px | 400 | #7B7B76 → 3.89:1 | "Strongest option" is the key takeaway but styled as metadata | Make "Strongest option" 17px #171717 (or bold the answer text) |
| Reasoning / Next move body | 17px | 400 / 26.35px | #171717 | Line length ~130 cpl at 974px | `max-width: 68ch` |
| Reasoning footnote | 15px | 400 | ≈#585854 | Fine | None |
| Principle text | 22px on #171717 card | 400 / 29.7px | #F5F5F0; eyebrow at 60% alpha → 6.5:1 | Good | None |
| Buttons (Why?, Next challenge, Back) | 17px | 500 | — | Good; 54–83px tall | None |
| Footer "You've played this one before…" | 13px | 400 | #7B7B76 | Metadata; fine | None |

Dark mode (spot-check, page 1 @1440): body #1C1C1A, cards #151513; measured ratios — metric labels 5.65:1, red 6.01:1, green 7.92:1, amber 8.36:1, muted 5.27:1. Dark mode has no contrast concerns beyond those listed for light mode.

---

## D. Scrolling and viewport audit

Sticky header: 72px desktop, 121px at 390px (brand row + nav row), 82%-opaque backdrop. No horizontal overflow at any size (`scrollWidth === innerWidth` everywhere).

### Page 1 — Kroger (`/practice/kroger-decline`)
| Viewport | Page height (unanswered → answered → "Why?" expanded) | Visible without scrolling | Where the decision appears | Notes |
|---|---|---|---|---|
| 1440×900 | 1334px (1.5 screens) → 1687 → 2399 | Facts, situation, all six metrics + caveat, "THE DECISION", question, helper, option A, most of option B (cut at 900) | Question y=699; option A y=784 | Logical; one short scroll shows C and D. ~100px of empty space between the last option and the footer before answering. After "Why?", 2.7 screens — acceptable for an optional deep-dive. |
| 1280×800 | 1329px → — | Same, but only 19px of option A above the fold | Question y=696; option A y=781–839 | Answers need a scroll on a laptop; the question is visible so the task is understood first. |
| 390×844 | 1547px (1.8 screens) → 1998 → 3229 | Facts (2 lines), situation (24px), metrics in 2×3 grid (y=505–736), caveat | Question y=887 (just below fold); options y=964–1257 | Sequence is good; metric grid scans well on a phone. Options 58px tall (D wraps to 83px). After tap the page repositions so the verdict heading is at viewport y≈564; "Why?" below fold. |
| 375×812 (preset) | not separately measured for page 1 | — | — | Page 2 only measured on the preset (see below). |

### Page 2 — Harris Teeter (`/sell/competitor-margin`)
| Viewport | Page height | Visible without scrolling | Where the decision appears | Notes |
|---|---|---|---|---|
| 1440×900 | 1656px (1.8 screens) → 2206 → 3356 | Facts, buyer quote (y=250), situation H1 (380–519), four evidence cards (616–760), "What he's measured on" (806–855); caveat at 881 is cut by the fold | Question y=1016; options y=1101–1419 | Question and all answers are below the fold even on a large desktop. Options B and D are two-line (83px); A and C 58px. |
| 1280×800 | 1681px | Facts, quote, H1, evidence cards; fold cuts through the measured-on row | Question y=1012; option A y=1098 | Learner must scroll ~1 screen before seeing what they are being asked. |
| 390×844 | 2387px (2.8 screens) | Facts, quote (100px box), situation (146px), first evidence card | "What you know" y=655→1414 (759px); question y=1495; options y=1572–2097 with heights 162/135/83/109px | Longest pre-decision scroll in the audit. Cards stacked single-column are the cause. Tall option buttons remain tappable; text wraps to 5 lines on option A. |
| 375×812 (mobile preset, Android UA) | 2412px | As above | Question y=1519 | No layout difference from 390 beyond width; no overflow; option heights identical. |

Sticky elements do not obstruct content on desktop. On mobile the 121px header plus the nav overflow (Accounts/Learn clipped) is the only placement issue; the semi-transparent backdrop lets scrolled text show faintly through, which is cosmetic.

---

## E. Recommended changes (implementation order, small and targeted)

1. **Manage focus and scroll on selection (both pages).** When an option is chosen, set `tabindex="-1"` on the verdict `<h2>`, focus it with `preventScroll`, then scroll it to ~16px below the sticky header (`scroll-margin-top: 88px` desktop / 137px mobile). Keep the "Strongest option" line and the "Why?" button inside the first 500px of the verdict so they are visible at 1280×800. One-function change; fixes keyboard, screen-reader and sighted discovery at once.
2. **Rebuild page 2's "What you know" as a comparison (mobile-first).** At ≤480px use `grid-template-columns: 1fr 1fr` (matching page 1's 152px tiles) or a single 4-row table with columns Metric · Yours · Theirs. Values 17px (desktop 20px) / 600 / #171717; "yours"/"theirs" 13px muted. Set `min-height: 2 lines` on card titles so rows align. Expected reduction: ~400px on mobile, ~60px on desktop, and the $21 vs $12 contrast becomes legible at a glance.
3. **Promote the buyer's quote and demote the paraphrase (page 2).** `.says`: 20px/500, lh 1.45, padding 18px 20px (mobile 18px). `.sc-situation` on conversation pages: 28–30px, or render it as an 18px lede beneath the quote. Keep the tinted box as the visual anchor.
4. **Raise small-text legibility in the evidence cards (both pages).** `.k` 13→14px; `.k`, `.muted` inside `.card-sunk`, and "Pick one…" helper to a grey of ≥4.5:1 on #EDEDE7 (≈#5F5F5A, or reuse #4A4A46). Darken `.warn` amber to ≈#8A5A10. No layout change.
5. **Trim repetition and width in the post-answer layers (both pages).** Replace "Evidence that matters" with a highlighted subset (only tiles the reasoning cites) or a one-line "Evidence used" strip; apply `max-width: 68ch` to prose in `.layer`, `.verdict` and the disclosure; on page 2 open "Why the other options were weaker" by default after selection; keep unchosen options' text at full colour and fade only the border/letter. Combined effect: ~300–350px shorter deep-dive and 2–3 short reading sweeps per paragraph instead of 130-character lines.

(Optional, same sprint: reduce H1 to 32px and section gap to ~40px above the decision so page 1's option A clears the 800px fold at 1280×800, and make only the brand row sticky on mobile.)

---

## F. Final verdict

1. **Can a first-time learner understand the task quickly?** Page 1: yes — the situation, six metrics and the question "What do you investigate first?" are all within the first screen at 1440×900 and the first scroll on laptop/mobile. Page 2: partly — the quote-then-paraphrase order is right, but the quote is visually minor and the question sits below the fold on every tested viewport (1.77 screens down on a phone), so the learner reads all the evidence before knowing what they will be asked.
2. **Is the text comfortably readable?** Mostly. Body (17px/1.55), answers (17px), question (32px) and feedback lede (18px) are in or above guideline. The weak spots are measured: metric labels and caveats at 13px #7B7B76 (3.62:1), the 15px buyer quote, the 15px grey comparison values on page 2, amber at 3.10:1, and ~130-character reasoning lines.
3. **Is page length appropriate?** Page 1 yes (1.5 screens desktop, 1.8 mobile before answering; the optional deep-dive adds the rest). Page 2 is long on mobile (2.8 screens before answering) mainly because of the stacked evidence cards; the duplicated "Evidence that matters" block adds avoidable length to both pages' deep-dives.
4. **Are metrics and answer choices easy to scan?** Page 1 metrics: yes — six tiles, colour-coded 22px values, consistent grid, caveat adjacent. Page 2 metrics: no — numbers are not emphasised and the cards misalign/stack. Answers on both pages: yes — full-width buttons, letter badges, 58px+ targets, clear chosen/preferred states; long quoted answers on page 2 are inherent to the exercise and still readable.
5. **What should be fixed first?** Move focus and scroll to the verdict on selection (E1) — it is a few lines, affects every exercise in this format, and directly addresses the keyboard/feedback-discovery gap. Immediately after, rebuild page 2's evidence block and promote the buyer's quote (E2–E3), which together resolve the largest measured scrolling and hierarchy problems.
