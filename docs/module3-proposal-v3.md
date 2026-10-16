# Module 3 · Management and accountability: design proposal, v3

Status: revision for the author's review. No code has been changed. v3 answers `docs/module3-review.md`: every P1 and P2 finding and all ten recommendations are resolved, and the P3 and P4 findings applied (section 7). v1 and v2 are untouched. All companies, people and figures are illustrative.

## 1. Overview

1. Module 1 trained judgment, Module 2 the conversation. Module 3 trains the person who manages: what do I owe my people, my partners, my boss and myself? The learner is a new or mid-level sales manager, a rep who leads without the title, or a director; `who` names the seat. The cases are CPG field life.
2. Each case sets one value against another (`trade`). At least two options are defensible; the gap between the strongest and a "good" option is about how and when. Weak options are the shortcuts a manager takes under pressure.
3. Each case rests on one lesson from the six books (`lens`) and names one that pulls the other way (`tension`). Books appear in the data, never in learner-facing copy.
4. Nine themes each appear at least three times. Seven tracks (4 or 5 cases), seven skills, eight habit families, nine strengths, a five-case challenge.
5. About 250 learner-facing words a case. After the pick, one picture draws the tension from an evidence number, or else as the two values on an axis. Scoring has no headline percent (section 3).

## 2. Reference for the data

### 2.1 The six lessons the cases draw on

`lens` and `tension` are `[key, lesson]`. Each lesson paraphrases the author's own takeaway for that book and nothing else.

| Key | Book | The author's lesson |
|---|---|---|
| HGW | How Google Works | Create the environment: transparency, autonomy, safety, context to decide without permission. |
| CCL | The 15 Commitments of Conscious Leadership | How you show up matters: take responsibility, stay curious, notice ego and defensiveness. |
| TDC | Trillion Dollar Coach | Ask good questions, give honest feedback, build trust, help talented people do their best. |
| CEO | What the CEO Wants You to Know | Every role sits in a value network; know customers, cash, margins, profit drivers. |
| PCA | Poor Charlie's Almanack | More perspectives (economics, psychology, incentives, statistics) stop a familiar pattern passing for the whole picture. |
| HOM | High Output Management | Outcomes shouldn't depend on one person rescuing a broken process; expectations, process, metrics and developing people create leverage. |

### 2.2 Changes to the scenario shape

Module 3 keeps Module 2's shape (`id`, `customer`, `stage`, `skill`, `evidence`, `options`, `reasoning`, `principle`, `then`, `nextMove`); `buyer` becomes `voice`. **`channel` and `category` are dropped** (every `channel` was "off"; `category` was filler); the page renders `who` and `customer` under the title, and any product is in the `situation`. `question` defaults to “What do you do?”. `algorithm` is not stored: it follows from `picture.kind` (2.9).

| Field | What it is |
|---|---|
| `theme` | `values`, `follow-through`, `teamwork`, `fears`, `overconfidence`, `trust`, `love`, `dedication` or `rest`. |
| `trade` | The two values in tension (legend below). They are the axis ends and appear in the Why layer. |
| `lens`, `tension` | `[key, lesson]` as in 2.1. Why layer only. |
| `voice`, `pause` | The line that opens the scene; one question to ask yourself first. The pause names the real doubt and does not steer. |
| `leans` | On best and good options: the value the pick leans on. **It must be one of the case's two `trade` values.** |
| `picture` | `{ kind, left?, right?, marks, after, note? }` (2.9). |

Budgets (checked by script): situation 25 to 45 words; voice under 20; 3 evidence rows (4 only for a complication), label under 5 words, value under 8; pause under 15; option label under 90 characters, **the strongest under 60 and one move**; feedback 1 to 2 sentences, under 35 words; reasoning under 45; principle under 15; `then` under 25; nextMove under 20; `after` under 20; captions 2 to 5 words.

Value legend, used by `trade` and `leans`; the 20 values: `candor`, `kindness`, `loyalty`, `team`, `trust`, `verify`, `rest`, `drive`, `confidence`, `humility`, `follow`, `flex`, `speed`, `patience`, `integrity`, `results`, `growth`, `openness`, `joy`, `systems`.

Copy rules: plain English, US spelling, second person, no book or framework names, no em dashes, speech and quoted terms in curly double quotes, no jargon a rep wouldn't say on a Monday (leverage, base rate, stop rules). "What you fear" is an evidence label in three cases only (5, 24, 25). Every evidence row is echoed by a figure or label word in the `reasoning` or an option, so the Why layer's "Evidence used" line is never empty. Picture letters A to D follow the authored order and must be keyed to option identity, since Module 2's code rebalances positions.

### 2.3 Stages

`stages3 = ["Set", "Coach", "Correct", "Review", "Decide", "Recover", "Plan"]`.

### 2.4 Skills

Unchanged from v2; the `strong` and `watch` lines carry over word for word.

| Key | Name | Blurb |
|---|---|---|
| standard | Standards | Say what good looks like, and hold it for everyone. |
| candor | Candor | Say the true thing, early, and kindly. |
| system | Systems | Build it so results don't depend on a hero. |
| trust | Trust and verify | Give trust freely. Check what matters, the same way for everyone. |
| self | Leading yourself | Own your reactions, your fears and your rest. |
| across | Up and across | Carry the truth up, the context down, and a fair view sideways. |
| grow | Growing people | Ask first. Help them get better, not just get it done. |

### 2.5 Tracks

Titles and blurbs are unchanged from v2.

```js
export const tracks3 = [
  track("standard", "Set the standard", "", ["loved-not-delivering", "top-rep-cuts-corners", "inherited-slack-habits", "exception-request"]),
  track("hard", "Have the hard conversation", "", ["veteran-gone-quiet", "spouse-is-ill", "promoted-over-friend", "distributor-rep-slipped", "ready-for-promotion"]),
  track("system", "Build the system, not the hero", "", ["you-keep-rescuing", "hero-holds-the-account", "metrics-reward-the-wrong-thing", "context-not-permission"]),
  track("trust", "Trust and verify", "", ["says-all-set", "lock-that-isnt", "team-agrees", "one-explanation"]),
  track("self", "Lead yourself", "", ["q4-fatigue", "defensive-in-review", "miss-the-field", "vacation-text", "sure-of-the-plan"]),
  track("up", "Manage up and across", "", ["friday-6pm-email", "number-you-cant-hit", "reorg-rumor", "win-that-costs-supply"]),
  track("grow", "Grow people", "", ["rookie-overpromises", "quiet-says-fine", "ask-dont-answer", "burned-out-star"]),
];
export const challengeIds3 = ["loved-not-delivering", "you-keep-rescuing", "q4-fatigue", "number-you-cant-hit", "ask-dont-answer"];
```

The challenge mixes five tensions: candor with someone you like, rescuing, your own rest, bad news upward, asking instead of telling. Round two builds from the learner's weakest skill and most frequent habit family, sorting on the 0 or 1 sound score.

### 2.6 Habit families and patterns (what a weak pick reveals)

Eight families, each shown by weak picks in at least three different cases (checked by script), so Module 2's rule (3+ tagged picks, a quarter, a clear lead) can surface each. v2's one-case `tell` merges into `rescue`. Pattern `coach` lines are unchanged from v2.

```js
export const families3 = {
  rescue:  { name: "Rescuing", coach: "You step in and fix it, or give the answer before you have asked. It works today and teaches the team to wait for you." },
  avoid:   { name: "Avoiding", coach: "You wait, soften, or hand it off. The conversation you skip is usually the one that matters." },
  control: { name: "Controlling", coach: "You reach for a rule, a check or a consequence where a conversation would do." },
  please:  { name: "Pleasing", coach: "You protect how people feel about you, or decide what they can handle." },
  promise: { name: "Over-promising", coach: "You commit, or cheer a commitment, past what the evidence supports." },
  blame:   { name: "Defending", coach: "You explain or point elsewhere before saying what is yours." },
  grind:   { name: "Grinding", coach: "You answer pressure with more hours and call it dedication." },
  narrow:  { name: "One explanation", coach: "You settle on the first story that fits and stop looking." },
};
export const patterns3 = {
  rescue:     { family: "rescue",  name: "Doing it yourself" },
  hero:       { family: "rescue",  name: "Leaning on the hero" },
  lecture:    { family: "rescue",  name: "Telling, not asking" },
  wait:       { family: "avoid",   name: "Waiting and watching" },
  soften:     { family: "avoid",   name: "Cushioning the message" },
  pass:       { family: "avoid",   name: "Handing it off" },
  drop:       { family: "avoid",   name: "Letting them sink" },
  rule:       { family: "control", name: "A rule instead of a conversation" },
  check:      { family: "control", name: "Checking in secret" },
  punish:     { family: "control", name: "Making an example" },
  please:     { family: "please",  name: "Keeping the peace" },
  friend:     { family: "please",  name: "Staying the friend" },
  overpromise:{ family: "promise", name: "Committing past the evidence" },
  lock:       { family: "promise", name: "Locking it in first" },
  cheer:      { family: "promise", name: "Cheering the number" },
  hope:       { family: "promise", name: "Reassuring on hope" },
  defend:     { family: "blame",   name: "Defending the plan" },
  blame:      { family: "blame",   name: "Pointing elsewhere" },
  grind:      { family: "grind",   name: "Matching pressure with hours" },
  applaud:    { family: "grind",   name: "Rewarding the overwork" },
  assume:     { family: "narrow",  name: "Assuming it's fine" },
  label:      { family: "narrow",  name: "Settling on who they are" },
};
```

### 2.7 Strengths (tagged on best options)

Nine strengths, each on at least three best options. v2's `context` and `boundary` could surface once each and fold into `system` and `rest`.

```js
export const strengths3 = {
  ask:      { name: "Asking before answering" },
  candor:   { name: "Saying the true thing early" },
  standard: { name: "Holding the standard kindly" },
  own:      { name: "Owning your part first" },
  develop:  { name: "Letting them make the call, with you beside them" },
  system:   { name: "Fixing the process, not the instance" },
  verify:   { name: "Checking before you commit" },
  rest:     { name: "Resting on purpose" },
  whole:    { name: "Seeing the whole picture" },
};
```

### 2.8 Page layout

Before the pick: voice (quote) → situation → evidence tiles → pause → options. **No picture exists before the pick**: no frame, axis, end labels or reserved space. Evidence tiles are static in every case, belief cases included.

On the pick, the verdict opens in this order: feedback → **picture with its `after` caption** → principle → `then` → next move, with the usual scroll and focus. The picture draws in once (static under reduced motion). What each kind shows, and only this:

- `axis`, `check`, `curve`, `hours`, `forecast`: the learner's pick, marked "You", and the strongest option, marked; one mark if they are the same. The other two options are never drawn.
- `belief`: no option marks. The bar replays from `start` through `e1` to `eN`, one evidence row at a time with its caption, and stops where the evidence leaves it, always between 40 and 60, so it never states the answer; `after` says what the pick does to trust.

"Learn the algorithm" under the verdict links to `/learn/<algorithm>`; the algorithm is never named on the case. Reused: ev-tiles, choices, the verdict block, and the `frame`, `poly`, `ring`, `you`, `flip` helpers in `pictures.js`. New: six small spec-driven drawings (`pictureFor` is hard-coded to each drill's numbers); `belief`, `check`, `curve` and `forecast` lift an existing drawing's constants, and `axis` and `hours` are trivial.

### 2.9 Picture spec and the algorithm map

`picture = { kind, left, right, marks, after, note }`; `marks` is `[key, number, caption?]`, numbers 0 to 100. **A picture draws a number only if it is in the evidence, in an option label, or follows from them by arithmetic shown in `note`.** Where a case has no number, `axis` is the default. Option positions, belief steps and bends are authored judgments, never shown as figures.

| kind | draws | marks | algorithm |
|---|---|---|---|
| `axis` | a line whose ends are the two `trade` values (no `left`/`right`); A to D are authored lean positions, 0 all the first value, 100 all the second | A to D, no captions | utility-and-trade-offs |
| `hours` | one bar of 100, the share going to the right-hand use | `e1` (today), A to D | utility-and-trade-offs |
| `belief` | one bar for one belief, replayed row by row | `start`, `e1` to `eN` (one per evidence row), captions | bayesian-updating |
| `check` | two bars on one scale (`worth`, `cost`) above a line from `left` to `right`; `null` puts an option off the line | `worth`, `cost`, A to D | value-of-information |
| `curve` | a return curve that flattens, a bend marker, x from `left` to `right`; the shape and bend are illustrative | A to D (x), `bend` | optimization |
| `forecast` | one scale: what you expect (ticks, only for odds the evidence states) against what each option commits | `e1`, optional `e2`, A to D | prediction-vs-decision |

On an `axis`, a sound option's `leans` must sit on its own side of 50 (checked by script), which ties the picture to the read-out in section 3. Belief steps are at most 30 points. Counts: axis 17 (1, 2, 3, 4, 6, 7, 8, 9, 11, 12, 19, 21, 25, 26, 27, 29, 30), belief 4 (14, 16, 17, 28), curve 3 (10, 13, 20), forecast 3 (15, 22, 24), check 2 (5, 23), hours 1 (18). So 18 cases use utility-and-trade-offs, and four Learn lessons (decision trees, expected value, bandits, exploration) have no case (question 7).

## 3. How Module 3 should score

**Recommendation: two levels of credit, no headline percent.**

- Each first pick records `best`, `good` or `weak`. `qualityScore3 = { best: 1, good: 1, weak: 0 }`: best and good are both **sound**; **strongest** counts best only.
- **Module 3 needs its own progress module.** `js/sell-progress.js` reads `qualityScore2` (good = 0.5) in its hub, levels, "Fixed" replays and challenge round 2, so reusing it would re-score a defensible pick as half right. Build `manage-progress.js` (or parameterize Module 2's) with good = 1 everywhere and no Bronze, Silver or Gold; track cards read Clean, Fixed or “Complete · n of N strongest”.
- The summary reports in words, each only when there is enough to say:
  1. **Values you reach for.** Every sound option's `leans` is one of the two values in its case's `trade`. For each value, count your sound picks in cases where it was on the table and how often you leaned on it; once a value has three such cases, name the highest and lowest ("When candor was on the table you chose it in 7 of 8; patience in 2 of 6").
  2. **Habits under pressure**, from the `family` of weak picks, by Module 2's rules (ties named).
  3. **What the strongest adds.** Among cases where you picked a good option, count the best option's `strength`; at three or more for one, say it ("When you picked a good answer, the strongest usually added: owning your part first").
- Feedback headings: best "A strong way to do it." · good "Defensible. Here's what it protects, and what it costs." · weak "A common move under pressure."

**Why not good = 0.5?** It tells a thoughtful manager a defensible choice was half wrong, so learners guess the grader. **Why keep "strongest"?** How and when matter, and the count says so without calling anyone wrong. Hub note: “Several answers here are defensible. We show which values each leans on, and what the strongest one adds.”

## 4. The 30 scenarios

Seats: 20 sales managers (2 new), 8 regional managers, 2 lead reps. Themes: trust 5, fears 4, the rest 3 each. Each strongest option is one move; its extra moves sit in its `feedback`.

### Track 1 · Set the standard

#### 1. loved-not-delivering

```js
{
  id: "loved-not-delivering", who: "Sales manager (8 reps)", customer: "Dana, your rep", stage: "Correct", skill: "standard", theme: "follow-through", trade: ["candor", "loyalty"],
  picture: { kind: "axis", marks: [["A", 15], ["B", 60], ["C", 90], ["D", 70]], after: "Your pick and the strongest, from candor to loyalty." },
  lens: ["TDC", "Give honest feedback and build trust."],
  tension: ["HOM", "Useful metrics keep misses visible."],
  voice: "Buyers love me. The number always comes together late.",
  situation: "Dana's buyers ask for her by name. Three quarters running she committed at week six and landed 11 to 17 points under, and your director's roll-up paid for it. You fear she'd hear “not good” and leave.",
  evidence: [["Week-6 commit, 3 quarters", "105% · 108% · 110%", "warn"], ["Where she landed", "94% · 91% · 96%", "bad"], ["Your last review", "“Meets,” no forecast note", "warn"]],
  pause: "Who should tell Dana: you now, or your director in January?",
  options: [
    { label: "Walk her through her three quarters, side by side.", quality: "best", strength: "candor", leans: "candor", feedback: "Early and specific; then ask what she sees. Cost: an uncomfortable half hour." },
    { label: "Open with what buyers value, then name the habit.", quality: "good", leans: "loyalty", feedback: "Praise first keeps the bond, but she may miss the miss." },
    { label: "Rate her “meets” again and watch another quarter.", quality: "weak", pattern: "wait", cost: "Another miss; your director asks what you saw.", feedback: "She's had three quarters. Only Dana doesn't know." },
    { label: "Add a weekly forecast check-in for a quarter.", quality: "weak", pattern: "rule", feedback: "It says you've lost faith without saying why." },
  ],
  reasoning: "Loyalty and honesty feel like opposites. They aren't. Committing 108% and landing 94% is a fact she can check; the kind version is the earliest.",
  principle: "Delayed kindness is a loan she repays with interest.",
  then: "Dana: “Nobody told me it mattered.” Next quarter: committed 98%, landed 97%.",
  nextMove: "Compare commit and actual for every rep. Book the talk.",
},
```

#### 2. top-rep-cuts-corners

```js
{
  id: "top-rep-cuts-corners", who: "Sales manager (8 reps)", customer: "Marcus, your top rep", stage: "Correct", skill: "standard", theme: "values", trade: ["results", "integrity"],
  picture: { kind: "axis", marks: [["A", 85], ["B", 40], ["C", 60], ["D", 5]], after: "Your pick and the strongest, from results to integrity." },
  lens: ["HOM", "Clear expectations matter more than one person's results."],
  tension: ["TDC", "Honest feedback only works inside trust."],
  voice: "Never lost a display fight. Does it matter if I log from the car?",
  situation: "Marcus is at 118%, first in the region. A third of his displays are logged “executed” from a distributor's text; you checked six and one was never built. Your director reads the logs, but nothing is paid on them.",
  evidence: [["Logged from a text", "About 1 in 3", "warn"], ["Your kickoff line", "“I don't care how”", "warn"], ["Reps copying him", "2 of 7 others", "bad"]],
  pause: "What will the team learn from your next move?",
  options: [
    { label: "Tell Marcus today the rule is the same for everyone.", quality: "best", strength: "standard", leans: "integrity", feedback: "He hears it from you first, and you own your kickoff line. Cost: a hard talk." },
    { label: "Reset the rule with the whole team first, no names, then see Marcus.", quality: "good", leans: "results", feedback: "Protects him and your numbers, but he hears a speech first." },
    { label: "Take it to your director and let them decide.", quality: "weak", pattern: "pass", cost: "He hears it from your director, not you.", feedback: "Your director needs the corrected count, but after Marcus hears it from you." },
    { label: "Let it go this quarter. One missing display is small.", quality: "weak", pattern: "wait", feedback: "Small is why it tempts. The team learns what “executed” means." },
  ],
  reasoning: "A third of his displays are logged from a text, your kickoff line gave permission, and two reps copy him. Hold him to the rule everyone gets, in person.",
  principle: "What you allow in your best rep becomes everyone's rule.",
  then: "Marcus: “I stopped walking them when the numbers were good.” He re-walks, finds two more missing, and you send your director the corrected count.",
  nextMove: "Walk three “executed” displays you haven't seen.",
},
```

#### 3. inherited-slack-habits

```js
{
  id: "inherited-slack-habits", who: "New sales manager", customer: "Your team", stage: "Set", skill: "standard", theme: "follow-through", trade: ["follow", "flex"],
  picture: { kind: "axis", marks: [["A", 30], ["B", 10], ["C", 85], ["D", 5]], after: "Your pick and the strongest, from follow to flex." },
  lens: ["HOM", "Effective processes start from clear expectations and a measure someone uses."],
  tension: ["HGW", "Give people context to decide."],
  voice: "Reports are busywork, boss. I closed Kroger. Isn't that the report?",
  situation: "New to seven reps, you find Friday reports on time 40% of the time; your predecessor “never chased.” Your best rep calls them a waste, and you hear yourself about to say “because I said so.”",
  evidence: [["On-time reports", "40%", "bad"], ["After filing", "Nothing; no one replies", "warn"], ["Your worry", "Being “the new boss who nags”", "warn"]],
  pause: "Could you explain this rule, or only enforce it?",
  options: [
    { label: "Say what the report is for, and cut it to three fields.", quality: "best", strength: "standard", leans: "follow", feedback: "A reason, and Monday replies to close the loop. Cost: the replies are real work." },
    { label: "Hold Friday exactly as is, and say why.", quality: "good", leans: "follow", feedback: "Consistency counts. But the form may be too long." },
    { label: "Let the team redesign the reports before you enforce anything.", quality: "good", leans: "flex", feedback: "People keep what they shape. But it's another month at 40%." },
    { label: "Send a firm note: late reports count in reviews.", quality: "weak", pattern: "rule", cost: "On time hits 90%; the reports say nothing.", feedback: "It moves the number, not the quality." },
  ],
  reasoning: "Firm and flexible are both defensible. A standard with a reason and a reply holds; a rule that only counts people makes you the new boss who nags.",
  principle: "A standard with a reason survives its first bad Friday.",
  then: "Third Friday: 85% on time. Your best rep: “Fine. Kroger's in the three fields.”",
  nextMove: "Pick one inherited routine. Cut every unused field.",
},
```

#### 4. exception-request

```js
{
  id: "exception-request", who: "Sales manager (7 reps)", customer: "Priya, your top rep", stage: "Set", skill: "standard", theme: "teamwork", trade: ["flex", "team"],
  picture: { kind: "axis", marks: [["A", 60], ["B", 20], ["C", 95], ["D", 5]], after: "Your pick and the strongest, from flex to team." },
  lens: ["HOM", "Fix the process, not just the one exception."],
  tension: ["HGW", "Autonomy and context let strong people act."],
  voice: "I'm at 124%. Can I skip Monday's call and just send numbers?",
  situation: "Priya, your top rep, wants out of the Monday call: 50 minutes of round-robin status. Your newest rep says it's where he learns how she runs Kroger resets. You know others would ask next.",
  evidence: [["Priya, year to date", "124% of plan", "good"], ["Her last two Mondays", "Spoke 4 minutes; two copied her reset", "good"], ["What you've asked", "Never what the call is for", "warn"]],
  pause: "Would your answer change for a middle performer?",
  question: "What do you tell her?",
  options: [
    { label: "Rebuild the call around one real problem first.", quality: "best", strength: "standard", leans: "team", feedback: "You heard what the call was telling you. Cost: a week of rebuilding first." },
    { label: "Yes for a quarter, with a monthly note on what others could copy.", quality: "good", leans: "flex", feedback: "Earned flexibility is fair. But her number becomes a precedent." },
    { label: "No. The call is for the team; everyone attends.", quality: "good", leans: "team", feedback: "Fair to those who need it. But you're defending a call you doubt." },
    { label: "Say yes quietly. Tell no one.", quality: "weak", pattern: "please", cost: "Others notice by week two.", feedback: "Quiet exceptions get found out loudly." },
  ],
  reasoning: "Flexibility and fairness both hold up. But if a 124% rep sees no value in the call, though two reps copied her four minutes, the call is the problem.",
  principle: "A rule only your best person can skip is a perk.",
  then: "Priya brings two ideas. The call shrinks to 25 minutes; she leads the Kroger segment.",
  nextMove: "Ask each rep: what is Monday's call for?",
},
```

### Track 2 · Have the hard conversation

#### 5. veteran-gone-quiet

```js
{
  id: "veteran-gone-quiet", who: "Sales manager (9 reps)", customer: "Ray, 22 years in", stage: "Coach", skill: "candor", theme: "love", trade: ["candor", "patience"],
  picture: { kind: "check", left: "Act now", right: "Ask first", marks: [["worth", 100, "6 hours a week"], ["cost", 33, "A 2-hour lunch"], ["A", 100], ["B", 25], ["C", 5], ["D", null]], after: "Two hours of lunch, against six hours a week.", note: "2 of 6 hours is 33; D (wait) is off the line" },
  lens: ["TDC", "Ask good questions and build trust before deciding what is wrong."],
  tension: ["CCL", "Stay curious; your story may be a reaction."],
  voice: "I just don't see the point of the new reports.",
  situation: "Ray, 22 years in, used to coach every new hire. Now his visits are down 30%, he has stopped volunteering, and two reps grumble about covering for him.",
  evidence: [["Covering for him", "Two reps · about 6 hours a week", "warn"], ["Your Thursday", "Two hours free for a lunch", "good"], ["What you fear", "Asking sounds like pushing him out", "warn"]],
  pause: "What would Ray want you to ask him?",
  question: "How do you start?",
  options: [
    { label: "Take Ray to lunch and ask what's changed.", quality: "best", strength: "ask", leans: "patience", feedback: "Say what you've noticed, without a conclusion, then listen. Cost: time, while two reps wait." },
    { label: "Ask him to mentor the three newest reps.", quality: "good", leans: "patience", feedback: "Uses his strength. But it's the cure before the cause." },
    { label: "Be plain: visits are down 30%; here is the standard and the date.", quality: "good", leans: "candor", feedback: "Clear and fair. But he hears a deadline, and you never learn why." },
    { label: "Wait. He's earned a quiet landing.", quality: "weak", pattern: "wait", cost: "Two reps read your silence as the new standard.", feedback: "A quiet landing is chosen with someone, not for them." },
  ],
  reasoning: "Candor and patience both hold; order decides it. Asking isn't pushing him out, and two hours is small next to 6 hours a week.",
  principle: "Say what you've seen, then ask what's changed.",
  then: "Ray: “Nobody asked me before the new reports.” They repeat his call notes; you fix the form for everyone.",
  nextMove: "Book a long lunch with the person who changed.",
},
```

#### 6. spouse-is-ill

```js
{
  id: "spouse-is-ill", who: "Sales manager (8 reps)", customer: "Tom, 6 years on your team", stage: "Coach", skill: "candor", theme: "values", trade: ["kindness", "team"],
  picture: { kind: "axis", marks: [["A", 40], ["B", 15], ["C", 90], ["D", 75]], after: "Your pick and the strongest, from kindness to team." },
  lens: ["CCL", "Stay curious and own your reaction before you assume."],
  tension: ["HGW", "Transparency helps a team decide together."],
  voice: "I'm okay. I just need to leave early Tuesdays and Thursdays.",
  situation: "Tom told you in the parking lot his wife has started chemotherapy, and asked for privacy. Since then his visits slipped and Aisha covered a Safeway reset. Your performance flags are due to HR in ten days.",
  evidence: [["Tom before this", "Never under 95% in six years", "good"], ["Last six weeks", "Visits down 35%; two missed deadlines", "warn"], ["Your own story", "Wanted space when your dad was ill", "warn"]],
  pause: "What do you know Tom needs, and what do you assume?",
  options: [
    { label: "Ask Tom what he needs, before you plan around him.", quality: "best", strength: "ask", leans: "kindness", feedback: "Then check HR options with no names; tell Aisha only with his OK. Cost: a harder talk than “take what you need.”" },
    { label: "Tell him to take what he needs; shift Safeway quietly.", quality: "good", leans: "kindness", feedback: "Generous and fast. But Aisha carries it with no end date." },
    { label: "Treat it like any performance drop: set targets.", quality: "weak", pattern: "rule", feedback: "Consistency has a place. Here it ignores the circumstances." },
    { label: "Tell the team, so they understand the extra load.", quality: "weak", pattern: "please", cost: "Tom learns his news is public.", feedback: "It was his news to share." },
  ],
  reasoning: "Kindness and fairness are both owed, and guessing serves neither. Visits down 35% after six years above 95% has a cause. Your own story (you wanted space) is not Tom's: ask him.",
  principle: "Ask what someone needs before deciding what's kind.",
  then: "Tom is relieved. He leaves at 3 twice a week; Aisha covers Safeway six weeks, knowing it's temporary.",
  nextMove: "Learn today what leave and flexible-schedule options exist.",
},
```

#### 7. promoted-over-friend

```js
{
  id: "promoted-over-friend", who: "New sales manager, promoted from the team", customer: "Chris, your closest friend at work", stage: "Correct", skill: "candor", theme: "trust", trade: ["loyalty", "team"],
  picture: { kind: "axis", marks: [["A", 40], ["B", 80], ["C", 5], ["D", 95]], after: "Your pick and the strongest, from loyalty to team." },
  lens: ["CCL", "Notice guilt and ego in your reactions before you act."],
  tension: ["TDC", "Honest feedback builds trust, even between friends."],
  voice: "Come on. Since when do you need a form for this?",
  situation: "You were promoted over Chris, your friend of five years, who applied too. Since then his forecasts run late, he's late to Monday's call, and he jokes about “the new boss” in front of everyone.",
  evidence: [["Forecasts", "Late 3 of last 4", "warn"], ["Monday call", "Late 4 of 6, jokes included", "warn"], ["The team is watching", "Whether the rules changed", "warn"]],
  pause: "Which costs more: some friendship, or the team's belief you're fair?",
  options: [
    { label: "Meet privately and name the lateness and the jokes.", quality: "best", strength: "own", leans: "loyalty", feedback: "Say what you're both avoiding, and own that you got his job. Cost: a hard hour, weeks of strain." },
    { label: "Send one note on expectations to everyone; talk to Chris if it continues.", quality: "good", leans: "team", feedback: "Fair, and doesn't single him out. But he'll know who it was for." },
    { label: "Joke back, grab a beer, sort it out as friends.", quality: "weak", pattern: "friend", cost: "The team watches rules bend for your friend.", feedback: "The audience was everyone else." },
    { label: "Give Chris a written warning to prove nothing changed.", quality: "weak", pattern: "punish", feedback: "Paper before a conversation is the harshest proof of fairness." },
  ],
  reasoning: "Friend or fair feels like a choice only until you say what you're both avoiding. Late on 3 of 4 forecasts and 4 of 6 calls: name it, own your part.",
  principle: "How you hold a friend to a rule shows your word's worth.",
  then: "Chris: “I wanted it. I'll be over it by Wednesday, not Monday.” He's on time after that.",
  nextMove: "List the three people you go easiest on. Book one talk.",
},
```

#### 8. distributor-rep-slipped

```js
{
  id: "distributor-rep-slipped", who: "Regional sales manager", customer: "Mike, route rep at Cascade Beverage", stage: "Correct", skill: "candor", theme: "teamwork", trade: ["candor", "trust"],
  picture: { kind: "axis", marks: [["A", 15], ["B", 35], ["C", 95], ["D", 25]], after: "Your pick and the strongest, from candor to trust." },
  lens: ["TDC", "Give honest feedback and build trust."],
  tension: ["CEO", "Know how the other side makes money."],
  voice: "I know. I missed the load-in. I've got 140 stops and you're one of 300 brands.",
  situation: "Mike got your sparkling water into your 40 best stores and has gone out of his way for years. This quarter he missed two load-ins: 11 stores, then 9. Your reps say let it go.",
  evidence: [["Missed load-ins", "2 (11 stores, then 9)", "bad"], ["Pay from your brand", "About 1%"], ["Favors you've asked", "3 · thanked: 1 card", "warn"]],
  pause: "What do you owe someone you depend on and underpay?",
  options: [
    { label: "Call Mike and ask what's behind the two misses.", quality: "best", strength: "candor", leans: "candor", feedback: "Name both misses, in person; agree he texts you the morning a load-in slips. Cost: your reps pre-build his displays." },
    { label: "Take it to his sales manager, framed as a shared problem.", quality: "good", leans: "candor", feedback: "A manager can reset his priorities. But Mike may feel you went over his head." },
    { label: "Let it go. He's earned slack and you need him.", quality: "weak", pattern: "please", cost: "The third miss lands in Q4.", feedback: "Loyalty is a good instinct, but he can't fix what nobody names." },
    { label: "Send a written summary to Mike, copying his manager.", quality: "weak", pattern: "punish", feedback: "Records have a place. First, it reads as an accusation." },
  ],
  reasoning: "You rely on Mike, so honesty can't wait. Your brand is 1% of his pay, and you asked three favors and sent one card. Call, ask, offer.",
  principle: "Be honest soonest with those you depend on most.",
  then: "Mike: “They moved 40 brands onto my route in June.” You agree a text when a load-in slips; no more misses.",
  nextMove: "Learn what's on your key distributor reps' plates first.",
},
```

#### 9. ready-for-promotion

```js
{
  id: "ready-for-promotion", who: "Sales manager (8 reps)", customer: "Lena, your strongest mid-level rep", stage: "Review", skill: "candor", theme: "dedication", trade: ["candor", "loyalty"],
  picture: { kind: "axis", marks: [["A", 15], ["B", 75], ["C", 90], ["D", 60]], after: "Your pick and the strongest, from candor to loyalty, for Lena." },
  lens: ["TDC", "Give honest feedback and help talented people grow."],
  tension: ["CCL", "Take responsibility for your part."],
  voice: "You said next cycle. It's next cycle.",
  situation: "Last year you told Lena, “We'll look at senior rep next cycle.” She's worked weekends since. Her numbers are strong, her plans thin; your director says “close, not yet.” She's told her family.",
  evidence: [["Lena's results", "106% · 111%", "good"], ["Your director", "“Close, not yet”", "warn"], ["Her account plans", "No 90-day plan on 3 of 5", "warn"]],
  pause: "What did Lena hear in “next cycle”? What did you mean?",
  options: [
    { label: "Tell her now: not this cycle, and here's why.", quality: "best", strength: "own", leans: "candor", feedback: "Name the gaps, set a plan, and own the vague promise. Cost: real disappointment." },
    { label: "Push your director to promote her; coach the gaps after.", quality: "good", leans: "loyalty", feedback: "Advocacy is the job. But the gaps show in the new role." },
    { label: "Tell her she's “so close” and revisit in six months.", quality: "weak", pattern: "soften", cost: "She plans a family decision around it.", feedback: "It spares you both a rough hour. “So close” is a hard place to live." },
    { label: "Wait for your director to decide.", quality: "weak", pattern: "wait", feedback: "Not speculating is fair. But you can tell her where she stands now." },
  ],
  reasoning: "Her 106% and 111% earned an honest answer. The vague promise is the debt, and three thin plans out of five are the gap. Pay it with a plan.",
  principle: "A vague promise is a debt. Pay it with specifics.",
  then: "Lena takes it hard for a day, then asks for the plan template and a date.",
  nextMove: "List every “next cycle” you've said. Make each a date or a no.",
},
```

### Track 3 · Build the system, not the hero

#### 10. you-keep-rescuing

```js
{
  id: "you-keep-rescuing", who: "Sales manager (8 reps)", customer: "Jess, a first-year rep", stage: "Coach", skill: "system", theme: "love", trade: ["speed", "growth"],
  picture: { kind: "curve", left: "None of your hours", right: "Four hours", marks: [["A", 25], ["B", 50], ["C", 50], ["D", 0], ["bend", 20, "Her learning stops"]], after: "Each extra hour of yours teaches her less.", note: "x is your hours on this proposal; a rebuild takes 2 (evidence); A is the 1 hour in its feedback" },
  lens: ["HOM", "Strong outcomes shouldn't depend on one person rescuing a broken process."],
  tension: ["TDC", "Helping people perform can mean being slower today."],
  voice: "Can you look at the Meijer proposal? You're so much better.",
  situation: "Third Friday running, you're rebuilding a rep's late proposal, and it works. This week it's a $90K reset due Monday 9am, from Jess, new and overwhelmed. Rebuilding is the best part of your week.",
  evidence: [["Proposals you rebuilt", "7 of 9 this quarter", "bad"], ["Time per rebuild", "About 2 hours", "warn"], ["Win rate on rebuilt", "5 of 7", "good"]],
  pause: "Whose proposal is this, and what does the team learn?",
  options: [
    { label: "Sit with her at the keyboard and fix this one together.", quality: "best", strength: "develop", leans: "growth", feedback: "An hour goes to her skill; then agree a checklist. Cost: you don't get to do it yourself." },
    { label: "Rebuild it this weekend; drafts due early after.", quality: "good", leans: "speed", feedback: "A real $90K justifies it. The fix afterward makes it defensible." },
    { label: "Rebuild it and say nothing. Monday is real.", quality: "weak", pattern: "rescue", cost: "Next Friday it's the same.", feedback: "It works. It also teaches that rough drafts are fine." },
    { label: "Send it back with comments for her to finish.", quality: "weak", pattern: "drop", feedback: "Alone, on $90K, risks the sale and her confidence." },
  ],
  reasoning: "The rescue wins 5 of 7, which is why it's hard to stop. But rebuilding 7 of 9 at 2 hours each caps the team at your Fridays. Protect the $90K, then change what arrives.",
  principle: "Weekly fixes are a process problem, not a favor.",
  then: "She types, you ask. The result beats her draft; she runs the next two alone.",
  nextMove: "List the last five things you fixed. Write a checklist for the commonest.",
},
```

#### 11. hero-holds-the-account

```js
{
  id: "hero-holds-the-account", who: "Regional sales manager", customer: "Sam, your Kroger lead", stage: "Plan", skill: "system", theme: "dedication", trade: ["loyalty", "systems"],
  picture: { kind: "axis", marks: [["A", 70], ["B", 20], ["C", 85], ["D", 0]], after: "Your pick and the strongest, from loyalty to systems." },
  lens: ["HOM", "Strong outcomes shouldn't depend on one person."],
  tension: ["TDC", "Trust built over years earns the right to ask for more."],
  voice: "Don't worry about Kroger. I've got it.",
  situation: "Sam has run your biggest account for nine years. The buyer's habits and promo history live in his head and one spreadsheet. He says “backups are for people who plan to leave,” and you fear he'd feel replaced.",
  evidence: [["Kroger's share of region", "31%", "warn"], ["Who's met the buyer", "Only Sam", "bad"], ["Where the history lives", "His head, one spreadsheet", "warn"]],
  pause: "Is it loyal to leave him carrying this alone?",
  options: [
    { label: "Ask Sam to design his own backup, starting with why.", quality: "best", strength: "system", leans: "systems", feedback: "The real reason, and the design is his, including who joins. Cost: an uncomfortable talk." },
    { label: "Add a second rep as “growth capacity” and let it unfold.", quality: "good", leans: "loyalty", feedback: "Protects his pride. But he may feel handled, and it runs slow." },
    { label: "Ask every key-account owner for a one-page account file.", quality: "good", leans: "systems", feedback: "Avoids singling him out. But the relationship stays in his head." },
    { label: "Leave it. Nine years prove it works.", quality: "weak", pattern: "hero", cost: "The day he's out, you meet Kroger's buyer for the first time.", feedback: "A good record is why no one asked what happens without him." },
  ],
  reasoning: "Honoring his loyalty is right. But with 31% of the region on a buyer only he has met, and the history in one spreadsheet, he carries the risk alone. Hand him the design.",
  principle: "One-person dependence isn't loyalty. It's a risk he carries alone.",
  then: "Sam: “I figured the spreadsheet was a compliment.” He picks Nia to shadow Kroger.",
  nextMove: "List your five biggest accounts and who else could run each.",
},
```

#### 12. metrics-reward-the-wrong-thing

```js
{
  id: "metrics-reward-the-wrong-thing", who: "Regional sales manager", customer: "Your region", stage: "Plan", skill: "system", theme: "values", trade: ["results", "candor"],
  picture: { kind: "axis", marks: [["A", 80], ["B", 25], ["C", 40], ["D", 10]], after: "Your pick and the strongest, from results to candor." },
  lens: ["CEO", "Know what drives profit and cash before celebrating a number."],
  tension: ["PCA", "Pay shapes behavior; bring psychology and economics."],
  voice: "Great month. Keep that pace.",
  situation: "Your team is paid on cases shipped. Two reps pushed 3,000 cases in three days with a discount you approved. Shipments hit 112% and your director praised you. Retail is flat, and your bonus rides on shipments.",
  evidence: [["Shipped vs plan", "112%", "good"], ["Retail, same month", "Flat", "warn"], ["Distributor stock", "85 days · target 45", "bad"]],
  pause: "What does telling your director now risk, and what does waiting risk?",
  options: [
    { label: "Ask your director to pay you on retail, not shipments.", quality: "best", strength: "system", leans: "candor", feedback: "It gives the whole picture, with your own pay on the line first. Cost: the praise, probably your bonus." },
    { label: "Take the praise now; quietly change the measure next quarter.", quality: "good", leans: "results", feedback: "Protects morale. But your director plans on a number you know is inflated." },
    { label: "Note it in the two reps' reviews.", quality: "weak", pattern: "blame", cost: "They did what the plan paid for.", feedback: "You approved the discounts. Punishing them teaches them to hide things." },
    { label: "Say nothing yet. Retail may catch up.", quality: "weak", pattern: "hope", feedback: "Not crying wolf is fair. But finance may tell your director first." },
  ],
  reasoning: "A shipped case is a sale to the distributor, not a drinker: 112% shipped, retail flat, 85 days of stock against 45. The pay plan did this, and so did you.",
  principle: "People do what the number pays for. Fix yours first.",
  then: "Your director: “I should have asked what retail did.” Pay moves to retail, yours first.",
  nextMove: "For each number you pay on, ask how a clever rep could game it.",
},
```

#### 13. context-not-permission

```js
{
  id: "context-not-permission", who: "Sales manager (7 reps)", customer: "Omar, a solid second-year rep", stage: "Set", skill: "system", theme: "trust", trade: ["trust", "verify"],
  picture: { kind: "curve", left: "Check nothing", right: "Check everything", marks: [["A", 25], ["B", 45], ["C", 100], ["D", 0], ["bend", 30, "Checks cost more"]], after: "Each extra check catches less and costs more waiting." },
  lens: ["HGW", "Give people context to decide without waiting for permission."],
  tension: ["HOM", "Useful metrics let you check what was decided."],
  voice: "I didn't want to decide without you. The buyer's still waiting.",
  situation: "Reps ask you to approve everything, even $900. Omar waited two days on a display swap and lost the spot. You like being needed, but finance reversed a rep's $6,000 promise last quarter.",
  evidence: [["Requests under $2,000", "31 last month", "warn"], ["Median reply", "About 9 hours", "warn"], ["Spots lost waiting", "At least 2", "bad"]],
  pause: "What are you protecting by approving $900?",
  question: "What changes?",
  options: [
    { label: "Give everyone the budget and a $2,000 limit.", quality: "best", strength: "system", leans: "trust", feedback: "Context and a limit; they tell you after, you review monthly. Cost: feeling needed, a few small errors." },
    { label: "Self-approve under $1,000, ask above.", quality: "good", leans: "verify", feedback: "Speeds most calls. But reps learn the list, not the budget." },
    { label: "Keep approving everything, but reply faster.", quality: "weak", pattern: "rule", cost: "You become the bottleneck.", feedback: "Faster replies don't fix why people wait: they aren't sure they're allowed." },
    { label: "Say “use your judgment” and skip the $6,000.", quality: "weak", pattern: "drop", feedback: "Right to delegate. Without a budget or limit, it's a leap in the dark." },
  ],
  reasoning: "Trust and checking are both needed. Approving 31 requests one by one makes you the gate: 9 hours' wait, 2 lost spots. Give context and a limit; sample to check.",
  principle: "Give context and a limit, not permission case by case.",
  then: "Month one: 22 self-approved, one $400 miss the rep reports first. Requests to you: 31 to 6.",
  nextMove: "Ask a rep what they skipped for fear of not being allowed.",
},
```

### Track 4 · Trust and verify

#### 14. says-all-set

```js
{
  id: "says-all-set", who: "Sales manager (6 reps)", customer: "Eli, four months in", stage: "Review", skill: "trust", theme: "trust", trade: ["trust", "verify"],
  picture: { kind: "belief", left: "Doubt it", right: "Believe it", marks: [["start", 70, "New rep, benefit of doubt"], ["e1", 75, "He said 12 of 12"], ["e2", 58, "Photos for 3"], ["e3", 38, "Two missed strips"], ["e4", 48, "No false reports"]], after: "A visit settles what a report can't, and keeps his trust." },
  lens: ["TDC", "Ask good questions and give honest feedback, so the truth reaches you."],
  tension: ["HOM", "Clear expectations and useful metrics apply to everyone."],
  voice: "All 12 stores are set, boss. Looks great.",
  situation: "Eli, four months in and eager, says the 12-store reset is done on time. He withdraws when he feels doubted. Wednesday your route passes four of the stores.",
  evidence: [["Eli's report", "12 of 12 set"], ["Photos in the app", "3 of 12", "warn"], ["Last two resets", "Missing strip each, unmentioned", "warn"], ["Known false reports", "None", "good"]],
  pause: "Can you check his work without him hearing that you doubt him?",
  options: [
    { label: "Visit two stores and ask which were hardest.", quality: "best", strength: "verify", leans: "verify", feedback: "Curiosity shows belief, the visit confirms, and saying you check everyone's first resets keeps it impersonal. Cost: an hour." },
    { label: "Ask for photos of all 12 today, as everyone's new standard.", quality: "good", leans: "verify", feedback: "Quick and fair. But it says nothing of trust." },
    { label: "Congratulate him; treat any buyer finding as a lesson.", quality: "good", leans: "trust", feedback: "Trust grows people. But the lesson may arrive from the buyer, in public." },
    { label: "Drive past four stores without telling him.", quality: "weak", pattern: "check", cost: "He finds out, and decides you never believed him.", feedback: "Secret checking becomes a test he remembers." },
  ],
  reasoning: "Trust the person, check the work; say both aloud. 12 of 12 reported, photos for 3, two earlier missing strips: check. He has never filed a false one.",
  principle: "Trust the person, check the work, check everyone alike.",
  then: "One store lacks a strip. Eli: “I thought it was done.” Now he sends photos unprompted.",
  nextMove: "Pick one status you accept on someone's word. Spot-check it.",
},
```

#### 15. lock-that-isnt

```js
{
  id: "lock-that-isnt", who: "Sales manager (8 reps)", customer: "Dave, your most persuasive rep", stage: "Review", skill: "trust", theme: "overconfidence", trade: ["trust", "verify"],
  picture: { kind: "forecast", left: "Your read", right: "Your commit", marks: [["e1", 50, "His locks: 2 of 4"], ["e2", 75, "Safeway: 3 of 4"], ["A", 50], ["B", 100], ["C", 0], ["D", 100]], after: "Share of the $120K you'd tell your director to count.", note: "2 of 4 is 50; 3 of 4 is 75" },
  lens: ["PCA", "Statistics and incentives keep a confident story from passing as the whole picture."],
  tension: ["TDC", "Building trust helps talented people do their best."],
  voice: "Safeway is a lock. I've never been surer.",
  situation: "Dave calls a $120K Safeway reset a lock. Your director wants a committed number today. Last year he saved a quarter on a deal that looked dead, and his confidence lifts the whole team.",
  evidence: [["Dave's “locks” this year", "4 called, 2 closed", "warn"], ["His Safeway record", "3 of 4 closed", "good"], ["What the buyer did", "Positive; no planogram date", "warn"]],
  pause: "Would Dave bet his own money on it?",
  question: "How do you forecast it?",
  options: [
    { label: "Count Safeway at half until the buyer sets a date.", quality: "best", strength: "verify", leans: "verify", feedback: "His confidence becomes information, and you ask what the buyer did, not said. Cost: some lift." },
    { label: "Commit Safeway at full value. His record is the team's best.", quality: "good", leans: "trust", feedback: "A real track record. But if it slips, your commit loses meaning upstairs." },
    { label: "Leave Safeway out until there's a planogram date.", quality: "good", leans: "verify", feedback: "Clean, and protects your credibility. But it ignores his record here." },
    { label: "Tell Dave you're counting on him and will hold him to it.", quality: "weak", pattern: "cheer", cost: "If it slips, the talk is about a promise.", feedback: "Sounds like trust, but turns confidence into a promise resting on hope." },
  ],
  reasoning: "Confidence is a feeling about a deal; what the buyer did is evidence; his record is his track record: 2 of 4 locks closed, 3 of 4 at Safeway.",
  principle: "Confidence is a feeling. Evidence is what the buyer did.",
  then: "Safeway slips a quarter. Your commit holds. Dave's next “lock” arrives with a planogram date.",
  nextMove: "Tally each rep's “locks” against closes. Show them quarterly.",
},
```

#### 16. team-agrees

```js
{
  id: "team-agrees", who: "Sales manager (7 reps)", customer: "Your team", stage: "Decide", skill: "trust", theme: "fears", trade: ["openness", "speed"],
  picture: { kind: "belief", left: "They disagree", right: "They agree", marks: [["start", 60, "They usually agree"], ["e1", 63, "0 of 7 objected"], ["e2", 42, "2 hallway comments"], ["e3", 48, "Last pushback snapped"]], after: "Silence tells you little. Asking moves the bar." },
  lens: ["HGW", "Build an environment where speaking up is safe."],
  tension: ["PCA", "More perspectives keep you from missing the whole picture."],
  voice: "Sounds good to me.",
  situation: "Monday you proposed moving Q4 promo dollars to your three biggest accounts. Nobody objected. In the hallway, Mira said her two smaller accounts counted on them. Plan due Thursday.",
  evidence: [["Objections in meeting", "0 of 7", "warn"], ["Hallway comments", "2 reps", "warn"], ["Last pushback", "You snapped: “Been through this”", "bad"]],
  pause: "What does disagreeing with you cost a rep?",
  options: [
    { label: "Reopen the plan by owning how you cut off pushback.", quality: "best", strength: "own", leans: "openness", feedback: "You owned the silence and made speaking up safe; then ask what's missing. Cost: some face and a day." },
    { label: "Talk to the two reps one-on-one and adjust quietly.", quality: "good", leans: "speed", feedback: "Fast and quiet. But the room learns nothing about disagreeing safely." },
    { label: "Send an anonymous survey on what the plan might miss.", quality: "good", leans: "openness", feedback: "Safe and quick. But it needs a survey because of how you reacted." },
    { label: "Proceed. Silence was agreement.", quality: "weak", pattern: "assume", cost: "Mira's accounts lose out, and so does her trust.", feedback: "No objection feels like a green light. Quiet is telling you something." },
  ],
  reasoning: "Silence says something about the room, not the plan. 0 of 7 objections, two hallway comments and your snap point to a room that learned not to speak.",
  principle: "Silence isn't agreement. Ask what disagreeing with you costs.",
  then: "Three speak up; one spots a committed budget. You move part of the promo money back to Mira.",
  nextMove: "Ask “what's the weakest part of this plan?” and wait.",
},
```

#### 17. one-explanation

```js
{
  id: "one-explanation", who: "Sales manager (8 reps)", customer: "Karen, a six-year rep", stage: "Review", skill: "trust", theme: "fears", trade: ["patience", "results"],
  picture: { kind: "belief", left: "Not coasting", right: "Coasting", marks: [["start", 70, "Your instinct"], ["e1", 75, "Sales down 18%"], ["e2", 58, "Territory re-cut"], ["e3", 50, "Pay plan changed"], ["e4", 45, "Visits unchanged"]], after: "Checking before you judge keeps her trust." },
  lens: ["PCA", "Check economics, incentives and behavior before settling on a story about a person."],
  tension: ["CCL", "Stay curious; notice when ego writes the story."],
  voice: "I'm working as hard as ever. The accounts just don't respond.",
  situation: "Karen's sales are down 18% in two quarters, and you suspect she's coasting; you've seen it before. In January her territory was re-cut and her pay plan changed. She's gone quiet.",
  evidence: [["Sales", "−18% in two quarters", "bad"], ["January re-cut", "−2 top accounts, +40 far stores", "warn"], ["New pay plan", "Pays on margin; far stores run thin", "warn"], ["Store visits", "Same as last year", "good"]],
  pause: "What would you see if it weren't effort?",
  question: "What do you do first?",
  options: [
    { label: "Check her numbers against the re-cut and pay plan.", quality: "best", strength: "whole", leans: "patience", feedback: "You test your story before you ask her, then ask. Cost: a few days; you may still be right." },
    { label: "Have the effort talk anyway. If you're wrong, she'll say.", quality: "good", leans: "results", feedback: "Candid. But she may hear an accusation and shut down." },
    { label: "Ask your director if the re-cut and pay plan are fair first.", quality: "good", leans: "patience", feedback: "Looks at the system. But Karen waits, and may read silence as a verdict." },
    { label: "Put her on a 30-day activity plan.", quality: "weak", pattern: "label", cost: "Activity was never the problem.", feedback: "Feels fair, but measures what she already does." },
  ],
  reasoning: "The familiar story is often right, which makes it dangerous. The 18% drop is real, but two top accounts gone, a plan that pays on margin and unchanged visits fit better.",
  principle: "Before you explain a person, rule out the situation.",
  then: "Her 40 far stores carry thin margins, so the plan underpaid her. You adjust it; she's selling again.",
  nextMove: "When numbers move, list three causes that aren't the person.",
},
```

### Track 5 · Lead yourself

#### 18. q4-fatigue

```js
{
  id: "q4-fatigue", who: "Sales manager (8 reps)", customer: "You", stage: "Recover", skill: "self", theme: "rest", trade: ["drive", "rest"],
  picture: { kind: "hours", left: "Work and waking", right: "Sleep", marks: [["e1", 21, "5 of 24 hours"], ["A", 29], ["B", 21], ["C", 21], ["D", 21]], after: "Two more hours of sleep, out of the same 24.", note: "5 of 24 is 21; 7 of 24 is 29" },
  lens: ["CCL", "How you show up while getting results matters as much as the results."],
  tension: ["HGW", "A team with context can carry some of the load."],
  voice: "You've been up since four again.",
  situation: "Second week of December. Five hours' sleep a night since Halloween, six points short of plan. You snapped at a rep over a typo yesterday, and can't recall what you promised the Kroger buyer Tuesday.",
  evidence: [["Sleep, six weeks", "About 5 hours a night", "bad"], ["Your quarter", "94% of plan; three weeks left", "warn"], ["Thursday 5:30pm", "Son's concert; you missed the last", "warn"]],
  pause: "What would you tell a friend running on five hours' sleep?",
  options: [
    { label: "Sleep seven hours a night until the 31st.", quality: "best", strength: "rest", leans: "rest", feedback: "Sleep restores judgment; then apologize to the rep and keep Thursday. Cost: hours that might close a point." },
    { label: "Push to year-end with a stop date, then four days off.", quality: "good", leans: "drive", feedback: "A finish line beats an open-ended grind. But tired decisions land in the weeks that count." },
    { label: "Tell the team you're stretched; ask each to take one thing.", quality: "good", leans: "drive", feedback: "Honest, and it lightens the load. But sleep is untouched, and the apology's owed." },
    { label: "Keep this pace through the 31st.", quality: "weak", pattern: "grind", cost: "You misplace another promise; your best rep stops bringing bad news.", feedback: "Example is a real value. But what's running low is judgment." },
  ],
  reasoning: "At 94% with three weeks left, extra hours look free; the forgotten promise and the snap are the invoice. Two more hours of sleep buy back judgment.",
  principle: "Tired is a business risk. Protect rest like a key account.",
  then: "You apologize; he admits hiding a miss. You fix Kroger by phone, make Thursday, finish at 98%.",
  nextMove: "Block next week's non-negotiables first: sleep, one evening, one meal.",
},
```

#### 19. defensive-in-review

```js
{
  id: "defensive-in-review", who: "Regional sales manager", customer: "Your director", stage: "Review", skill: "self", theme: "overconfidence", trade: ["confidence", "humility"],
  picture: { kind: "axis", marks: [["A", 80], ["B", 30], ["C", 60], ["D", 5]], after: "Your pick and the strongest, from confidence to humility." },
  lens: ["CCL", "Take responsibility, and notice when defensiveness drives you."],
  tension: ["TDC", "A good leader welcomes honest feedback."],
  voice: "The Q3 endcap program missed badly. Walk me through it.",
  situation: "Your director opens the review: promo return 0.7x against a plan of 1.2x, on your program. Your face heats up. You have reasons ready, and most are true. Two peers are watching.",
  evidence: [["Promo return", "0.7x · plan 1.2x", "bad"], ["Your reasons", "Supply, rules, cut weeks (true)"], ["What you skipped", "Slower second-tier markets", "warn"]],
  pause: "What would your best rep say first?",
  options: [
    { label: "Say: “I championed this program, and it missed.”", quality: "best", strength: "own", leans: "humility", feedback: "Ownership in one sentence; then ask her view and name two changes. Cost: pride in front of peers." },
    { label: "Give facts in order; own the call last.", quality: "good", leans: "confidence", feedback: "Clear and true. But said first they sound like excuses." },
    { label: "Ask for the afternoon; answer tomorrow.", quality: "good", leans: "humility", feedback: "Wise to think first. But it can read as avoidance." },
    { label: "List the outside causes; note finance approved.", quality: "weak", pattern: "defend", cost: "Your peers learn what you do when wrong.", feedback: "True, which tempts. But it turns a review into a defense of you." },
  ],
  reasoning: "Owning it and explaining it feel like opposites under heat. They aren't: a plain sentence of ownership earns the right to explain the 0.7x and the slower second-tier markets.",
  principle: "Own it in one sentence before you explain it.",
  then: "She nods: “I know about supply. I wanted to hear the first part.” The review moves to Q1.",
  nextMove: "Write the one sentence you'd say after a miss.",
},
```

#### 20. miss-the-field

```js
{
  id: "miss-the-field", who: "Sales manager (7 reps)", customer: "You and your team", stage: "Plan", skill: "self", theme: "love", trade: ["joy", "growth"],
  picture: { kind: "curve", left: "No Saturdays", right: "All nine", marks: [["A", 33], ["B", 20], ["C", 100], ["D", 0], ["bend", 25, "Doing it for them"]], after: "Each extra Saturday in stores buys less.", note: "one a month is 3 of 9, or 33" },
  lens: ["HOM", "A manager creates leverage by developing the people around them."],
  tension: ["CCL", "How you show up matters; notice what drives you."],
  voice: "Want to hit a few stores Saturday? Like old times?",
  situation: "Most Saturdays you build displays with your reps. You love it, and compliance is higher where you go. But roll-ups run late, two reps have had no one-on-one in five weeks, and Kai asked to run a reset alone.",
  evidence: [["Saturdays in stores", "9 last quarter"], ["Compliance where you go", "+8 points", "good"], ["Missed one-on-ones", "2 reps · 5 weeks", "bad"]],
  pause: "Who pays when your hours go to what you love?",
  question: "What do you do with Saturdays?",
  options: [
    { label: "Keep one store morning a month, with a rep leading.", quality: "best", strength: "develop", leans: "growth", feedback: "What you love, aimed at teaching; the rest goes to one-on-ones. Cost: most Saturdays." },
    { label: "Ask the team; step back if they can run resets alone.", quality: "good", leans: "growth", feedback: "Sound, and it respects them. But learning takes weeks while one-on-ones wait." },
    { label: "Keep Saturdays; catch up Sunday night.", quality: "weak", pattern: "grind", cost: "Within a quarter, Sunday nights are gone too.", feedback: "Sounds like dedication, but those things were already slipping." },
    { label: "Stop store work. A manager's time has a price.", quality: "weak", pattern: "rule", feedback: "Boundaries help. But it removes what fuels you, and your reps lose their best teacher." },
  ],
  reasoning: "Nine Saturdays and +8 points are real, and so is five weeks without one-on-ones. Doing it for them keeps them dependent; with a rep leading, the same hours teach.",
  principle: "Keep what you love, and use it to make someone better.",
  then: "On your Saturday, Kai leads a six-store reset while you carry the ladder. Roll-ups arrive on time.",
  nextMove: "Book the two overdue one-on-ones first.",
},
```

#### 21. vacation-text

```js
{
  id: "vacation-text", who: "Sales manager (8 reps)", customer: "Your team", stage: "Recover", skill: "self", theme: "rest", trade: ["rest", "speed"],
  picture: { kind: "axis", marks: [["A", 30], ["B", 65], ["C", 95], ["D", 5]], after: "Your pick and the strongest, from rest to speed." },
  lens: ["HGW", "Give people context and autonomy so they act without permission."],
  tension: ["CCL", "Notice whether your reaction serves the work or your ego."],
  voice: "Sorry to bug you on vacation. Safeway wants an answer on the BOGO. Thoughts?",
  situation: "Day two of your first week off in two years. A rep texts about a $4,000 promo inside his own limit. Yesterday brought four such texts, answered in minutes. Tasha is cover; nobody told her what that means.",
  evidence: [["Texts yesterday", "4, all inside limits", "warn"], ["Your reply time", "Under 10 minutes", "warn"], ["At home", "Partner wants the phone away", "warn"]],
  pause: "If you never replied, who would decide?",
  options: [
    { label: "Reply once: “Inside your limit. Your call.”", quality: "best", strength: "rest", leans: "rest", feedback: "The decision returns to who holds it; then check once a day. Cost: the rush of being needed." },
    { label: "Say yes now, and tell the team Tasha has the keys.", quality: "good", leans: "speed", feedback: "Moves Safeway and fixes the system. But it feeds the habit." },
    { label: "Answer everything. The quarter matters.", quality: "weak", pattern: "grind", cost: "Your week off still runs through you.", feedback: "Care is real. But the team still can't decide alone." },
    { label: "Switch the phone off without a word.", quality: "weak", pattern: "drop", feedback: "Rest is right. But Tasha doesn't know what she covers." },
  ],
  reasoning: "Four texts, all inside limits, answered in under 10 minutes: a symptom. You answer fast, so they ask. Return the decision with context, then keep a boundary.",
  principle: "Rest works when the team knows who decides.",
  then: "He decides and tells Tasha; Safeway has a yes by lunch. By day four, no texts.",
  nextMove: "Before time off, write who decides what and who covers.",
},
```

#### 22. sure-of-the-plan

```js
{
  id: "sure-of-the-plan", who: "Regional sales manager", customer: "Your region", stage: "Plan", skill: "self", theme: "overconfidence", trade: ["confidence", "openness"],
  picture: { kind: "forecast", left: "Odds of a hit", right: "Effort committed", marks: [["e1", 60, "About 6 in 10"], ["A", 15], ["B", 40], ["C", 0], ["D", 40]], after: "Six-in-ten odds, against the effort committed.", note: "6 in 10 is 60; commits are percent of effort" },
  lens: ["PCA", "More perspectives and statistics keep a familiar pattern from passing as the whole picture."],
  tension: ["TDC", "Ask good questions so the team can improve the plan."],
  voice: "No questions? Great. Let's go.",
  situation: "You'll move 40% of selling hours to a cold brew launch. Your last three launches worked and you're sure. Reps stayed silent; finance asked about distributor terms, and you answered in ten seconds.",
  evidence: [["Your launches", "3 of 3 hit year one", "good"], ["This distributor", "22% fewer reps than before", "warn"], ["Finance's odds here", "About 6 in 10", "warn"]],
  pause: "What would show you were wrong in 30 days?",
  question: "What do you do first?",
  options: [
    { label: "Pilot 15% of effort in three markets for six weeks.", quality: "best", strength: "verify", leans: "openness", feedback: "Conviction made testable: decide first what would make you stop. Cost: a couple of months." },
    { label: "Go ahead, list three ways it could fail, review at week eight.", quality: "good", leans: "confidence", feedback: "Keeps momentum. But week eight comes after 40% has moved." },
    { label: "Delay a week; talk to two managers with weaker distributors.", quality: "good", leans: "openness", feedback: "Worth a week. But two stories can feel like proof." },
    { label: "Go all in. Hesitating signals doubt.", quality: "weak", pattern: "defend", cost: "Weak-distributor markets lag by half, with 40% already moved.", feedback: "Conviction matters. But silence is a reason to ask, not to speed up." },
  ],
  reasoning: "3 of 3 is a real record, but 22% fewer reps and finance's 6-in-10 odds make this launch different. A small test with a stopping point cures sureness cheapest.",
  principle: "When you're most sure, look hardest for how you're wrong.",
  then: "Week six: weak-distributor pilots lag by half. You scale where it works, losing a month, not a year.",
  nextMove: "Before a big plan, write what you'd see in 30 days if wrong.",
},
```

### Track 6 · Manage up and across

#### 23. friday-6pm-email

```js
{
  id: "friday-6pm-email", who: "Sales manager (8 reps)", customer: "Your VP", stage: "Decide", skill: "across", theme: "rest", trade: ["rest", "drive"],
  picture: { kind: "check", left: "Decide now", right: "Ask first", marks: [["worth", 100, "10 team hours"], ["cost", 1, "A 5-minute email"], ["A", 100], ["B", 0], ["C", 0], ["D", 0]], after: "One email, against ten hours of your team's weekend.", note: "5 minutes is under 1% of 10 hours" },
  lens: ["CCL", "Stay curious and own your reaction."],
  tension: ["HGW", "Context helps people decide, and a request's purpose is context."],
  voice: "Need a store-level recovery plan for the Q4 shortfall Monday 8am.",
  situation: "At 6:10 Friday your VP sends that note. Your team just finished a brutal week, and your anniversary dinner is at 7:30. She rarely asks, and last time you pushed back you worried for weeks.",
  evidence: [["Work needed", "4 of your hours; 10 of theirs", "warn"], ["Her pattern", "Asks Friday, reads Tuesday", "warn"], ["A question to her", "One email, 5 minutes", "good"]],
  pause: "What is the deadline for? Do you know?",
  options: [
    { label: "Reply: “What decision does Monday make?”", quality: "best", strength: "rest", leans: "rest", feedback: "A yes, plus the question that matters, with a first cut at 8 and the plan Wednesday. Cost: nerve; she may want it all." },
    { label: "Promise Monday and work it alone on Sunday.", quality: "good", leans: "drive", feedback: "You protect the team. But every late Friday email now earns a weekend." },
    { label: "Promise Monday; two reps pull data Saturday.", quality: "weak", pattern: "please", cost: "Two reps lose a Saturday for a plan read Tuesday.", feedback: "Kind, but it passes your Friday problem to a tired team, unchecked." },
    { label: "Cancel dinner and work the weekend.", quality: "weak", pattern: "grind", feedback: "Dedication is real. But the weekend rests on a guess." },
  ],
  reasoning: "Rest and drive are both owed. Ten team hours against one five-minute email: neither push back nor cave. Ask one question, offer a first cut.",
  principle: "Ask what a deadline is for before giving up a weekend.",
  then: "She replies in four minutes: “First cut is fine. It's for Wednesday's CEO call.” Nobody loses a Saturday.",
  nextMove: "When a deadline lands late, ask what decision it supports.",
},
```

#### 24. number-you-cant-hit

```js
{
  id: "number-you-cant-hit", who: "Regional sales manager", customer: "Your VP", stage: "Plan", skill: "across", theme: "fears", trade: ["candor", "team"],
  picture: { kind: "forecast", left: "Honest range", right: "Your commitment", marks: [["e1", 91, "Year to date"], ["e2", 94, "Likely case"], ["A", 94], ["B", 94], ["C", 96], ["D", 100]], after: "Your honest range, against the number committed.", note: "percent of plan; scale 90 to 100" },
  lens: ["CEO", "Know the drivers behind your number: customers, cash, margin."],
  tension: ["CCL", "Notice fear or defensiveness before it writes your answer."],
  voice: "Are we good for the year? I tell the CEO Thursday.",
  situation: "At 91% with six weeks left, your region has two resets slipped to Q1, an overstocked distributor and a competitor price cut. The plan is 100%.",
  evidence: [["Honest range", "94% likely; 96% at best", "bad"], ["Your VP last month", "“No more region misses”", "warn"], ["What you fear", "Being first to say it", "warn"]],
  pause: "What would your VP want to know, and when?",
  question: "What do you tell her?",
  options: [
    { label: "Give her your honest range now: likely 94, best 96.", quality: "best", strength: "whole", leans: "candor", feedback: "Range, drivers and an ask, while she can still use them. Cost: one uncomfortable minute." },
    { label: "Tell your team first and give them a week.", quality: "good", leans: "team", feedback: "Respects them. But Thursday is the CEO call, and she'll learn you knew." },
    { label: "Give her 96%, with 94% as the risk.", quality: "good", leans: "candor", feedback: "Truthful. But she plans on 96 and carries 94 to the CEO as a surprise." },
    { label: "Say “we'll get there” and commit to 100%.", quality: "weak", pattern: "overpromise", cost: "Three weeks on you're at 93; the CEO was told 100.", feedback: "Fear is real. But a number you don't believe leads to a bigger miss." },
  ],
  reasoning: "Her “no more region misses” points the fear the wrong way. Bad news worsens with holding; a 94% range with reasons is something a VP can plan with.",
  principle: "Bad news worsens weekly. Bring the range, the drivers, the ask.",
  then: "“I can work with 94. I can't work with a surprise.” She takes 94 to the CEO. You land at 95.",
  nextMove: "Write today's honest range and its drivers. Send it first.",
},
```

#### 25. reorg-rumor

```js
{
  id: "reorg-rumor", who: "Regional sales manager", customer: "Your team", stage: "Recover", skill: "across", theme: "trust", trade: ["candor", "follow"],
  picture: { kind: "axis", marks: [["A", 60], ["B", 20], ["C", 40], ["D", 90]], after: "Your pick and the strongest, from candor to follow." },
  lens: ["HGW", "Transparency is part of the environment you create."],
  tension: ["PCA", "Think through what each person will do when they hear it."],
  voice: "Is it true? I heard they're merging us with the East.",
  situation: "Your VP told you in confidence that HQ is studying a regional merger; nothing is decided. Two top reps ask you directly. In March you told the team no changes were planned.",
  evidence: [["What you know", "Studied; no decision, no date"], ["Risk", "Top rep has a recruiter call", "bad"], ["What you fear", "Your job may change too", "warn"]],
  pause: "Will they remember what you said, or that you said it?",
  question: "What do you tell them?",
  options: [
    { label: "Say you can't confirm it, and will tell them when you can.", quality: "best", strength: "candor", leans: "follow", feedback: "No denial, no confirmation, a date to update; today, ask your VP what you may share. Cost: no clean answer." },
    { label: "Say it straight: talk exists, nothing's decided, no details yet.", quality: "good", leans: "candor", feedback: "Honest, and it calms the recruiter call. But you confirmed a study you were asked to keep." },
    { label: "Tell your two top reps privately; ask them to keep quiet.", quality: "weak", pattern: "please", cost: "The team splits into two classes.", feedback: "Real worry, wrong fix: choosing who gets the truth makes a rift." },
    { label: "Deny it: “No changes planned.” It was true in March.", quality: "weak", pattern: "soften", feedback: "Spares a hard few weeks. But now you know otherwise; it's a lie by omission." },
  ],
  reasoning: "You owe HQ discretion and your team honesty; both fit if you're precise. Say what you can't say, when that changes, and never what isn't so.",
  principle: "Say what you can and can't. Never say what isn't so.",
  then: "Your VP clears a short statement Friday. The rep with the recruiter call stays: “You didn't lie to me.”",
  nextMove: "Write three sentences: what you can say, can't, and when you'll update.",
},
```

#### 26. win-that-costs-supply

```js
{
  id: "win-that-costs-supply", who: "Lead rep (no title)", customer: "Your regional chain account", stage: "Decide", skill: "across", theme: "teamwork", trade: ["results", "team"],
  picture: { kind: "axis", marks: [["A", 85], ["B", 10], ["C", 65], ["D", 5]], after: "Your pick and the strongest, from results to team.", note: "$55.8K is $180K at 31%; $86.4K is $240K at 36%" },
  lens: ["CEO", "Judge a win by what it does to margin, cash and other functions."],
  tension: ["HGW", "Share context early so affected people can decide with you."],
  voice: "Great work. Lock it in before they change their mind.",
  situation: "You're a lead rep, and your first big win, a $180K sparkling water BOGO, may have to move: the plant is 98% booked and West's launch needs it. You told the buyer “I think we're good.”",
  evidence: [["Your win", "$180K · 31% margin", "good"], ["West's launch", "$240K · 36% margin", "warn"], ["Your bonus", "Counts yours, not theirs", "warn"]],
  pause: "Whose call is it which one runs?",
  options: [
    { label: "Bring supply chain and West's lead to one table.", quality: "best", strength: "whole", leans: "team", feedback: "Early, with both sides' numbers: about $56K against $86K gross profit. Cost: control; your win may move." },
    { label: "Run yours; you earned it and gave your word. Ask West to shift.", quality: "good", leans: "results", feedback: "Your word matters. But you've set the company's priority yourself." },
    { label: "Offer to move yours; West's margin is higher.", quality: "good", leans: "team", feedback: "Generous. But you decided alone, before knowing the buyer would move." },
    { label: "Get the buyer's date in writing first, then tell ops.", quality: "weak", pattern: "lock", cost: "West slips, and ops learns after the buyer has it in writing.", feedback: "Securing the win is sensible. But signing first takes the choice from the owners." },
  ],
  reasoning: "Your win may be the business's loss: about $56K of gross profit against $86K, and a bonus that counts only yours. Put both side by side with the owners.",
  principle: "A win that costs another team isn't yet the company's win.",
  then: "Supply chain finds 15% more capacity. Your BOGO runs a week later, West holds, the buyer agrees.",
  nextMove: "Before closing a big deal, ask who else needs what it uses.",
},
```

### Track 7 · Grow people

#### 27. rookie-overpromises

```js
{
  id: "rookie-overpromises", who: "Sales manager (6 reps)", customer: "Jamal, four months in", stage: "Coach", skill: "grow", theme: "follow-through", trade: ["growth", "results"],
  picture: { kind: "axis", marks: [["A", 20], ["B", 75], ["C", 60], ["D", 35]], after: "Your pick and the strongest, from growth to results." },
  lens: ["TDC", "Help talented people do their best by asking and staying beside them."],
  tension: ["HOM", "Clear expectations keep outcomes from depending on one person."],
  voice: "I promised the buyer 20 more stores and a display by Friday. Wrong?",
  situation: "Jamal, four months in, promised a Sprouts buyer more stores and a display by Friday without checking. The distributor can't deliver it. He's told you he fears he's “not cutting it.”",
  evidence: [["The promise", "20 stores, display, Friday"], ["What's possible", "8 stores; display next week", "warn"], ["The buyer", "Three years; keeps a list", "good"]],
  pause: "Whose call is this, and who learns most from it?",
  options: [
    { label: "Have Jamal call the buyer himself, with you sitting in.", quality: "best", strength: "develop", leans: "growth", feedback: "Spend 20 minutes on what's deliverable first. He fixes his own promise, with a net." },
    { label: "Call the buyer yourself with the corrected plan.", quality: "good", leans: "results", feedback: "Certain for the customer. But Jamal watches you repair his mistake." },
    { label: "Tell him no dates without your approval.", quality: "weak", pattern: "rule", cost: "Reps wait for you, even on easy things.", feedback: "Natural. But it grows your queue, and he still hasn't made the repair." },
    { label: "Let him find out Friday. He'll remember.", quality: "weak", pattern: "drop", feedback: "The buyer pays for the lesson, and a doubting rookie may learn the wrong one." },
  ],
  reasoning: "Eagerness is a good rep's flaw. The buyer needs the truth by Friday, with 8 stores and a display next week, and Jamal needs to be the one who says it.",
  principle: "Whoever made the promise fixes it, with you beside them.",
  then: "Jamal: “I overreached. Here's what I can do Friday.” The buyer thanks him. Now he texts: “Sanity check?”",
  nextMove: "Write three questions to ask before promising a date or display.",
},
```

#### 28. quiet-says-fine

```js
{
  id: "quiet-says-fine", who: "Sales manager (7 reps)", customer: "Hana, a strong third-year rep", stage: "Coach", skill: "grow", theme: "fears", trade: ["patience", "candor"],
  picture: { kind: "belief", left: "She's not fine", right: "She's fine", marks: [["start", 75, "Strong rep, on plan"], ["e1", 80, "103% of plan"], ["e2", 52, "Asked about moving"], ["e3", 44, "Five fines, moved on"]], after: "Asking about the move she raised tells her you listened." },
  lens: ["TDC", "Good questions and real attention show what is going on with people."],
  tension: ["CCL", "Stay curious about what you have avoided asking."],
  voice: "I'm fine. Really.",
  situation: "Hana used to push back hard in meetings. For six weeks she's been quiet, on plan, and saying “fine.” You're slammed, and you've let it pass five times.",
  evidence: [["Hana's numbers", "103% of plan", "good"], ["Yesterday", "Asked about moving, then withdrew", "warn"], ["Last five one-on-ones", "“Fine”; you moved on", "warn"]],
  pause: "What haven't you asked because you fear the answer?",
  options: [
    { label: "Ask her what's behind her question about moving.", quality: "best", strength: "ask", leans: "candor", feedback: "About what she actually raised, with an hour blocked. Cost: an hour; she may still say fine." },
    { label: "Say you've noticed she seems different, and you're around.", quality: "good", leans: "patience", feedback: "Respects her space. After five fines, she hasn't been asked anything she can answer." },
    { label: "Take her numbers as the answer. She's on plan.", quality: "weak", pattern: "assume", cost: "She transfers in January; you hear why secondhand.", feedback: "“Fine” deserves respect. But the transfer question is how people test the water." },
    { label: "Flag her to your director as a retention risk.", quality: "weak", pattern: "pass", feedback: "Smart to share. But it skips Hana, who knows what's going on." },
  ],
  reasoning: "Patience waits to be invited; candor invites. After five “fine”s and a question about moving, she likely needs the invitation. Her 103% says she can work; it doesn't say she's well.",
  principle: "A rep who says “fine” five times is telling you something.",
  then: "Her buyer of two years left; her work felt invisible. You put her name on the account review, and she's arguing again.",
  nextMove: "Ask a rep you've only asked “how are you?”: “What's the least fun part of your week?”",
},
```

#### 29. ask-dont-answer

```js
{
  id: "ask-dont-answer", who: "Lead rep (mentoring a newer rep)", customer: "Ben, eight months in", stage: "Coach", skill: "grow", theme: "trust", trade: ["speed", "growth"],
  picture: { kind: "axis", marks: [["A", 90], ["B", 35], ["C", 15], ["D", 25]], after: "Your pick and the strongest, from speed to growth." },
  lens: ["TDC", "Lead by asking good questions, not by having every answer."],
  tension: ["HOM", "Develop people so your time reaches further."],
  voice: "What should I do about Safeway? Just tell me what you'd do.",
  situation: "Ben, eight months in, asks again what to do about Safeway cutting your facings from 4 to 3. You know the answer in ten seconds. He says he fears getting it wrong.",
  evidence: [["Ben's asks for answers", "4 in six weeks", "warn"], ["Ben's own plans", "Thin; he presents yours back", "warn"], ["Time before Thursday", "Two days", "good"]],
  pause: "Which would Ben remember: your answer, or his?",
  question: "What do you say?",
  options: [
    { label: "Ask him to bring you his own answer by tomorrow.", quality: "best", strength: "develop", leans: "growth", feedback: "His question becomes your question, with 15 minutes tomorrow to compare. Cost: ten seconds, some frustration." },
    { label: "Give your answer, then ask him why it works.", quality: "good", leans: "speed", feedback: "He gets the logic. But it's still your answer, and the next one comes to you." },
    { label: "Give the answer now; ask him first next time.", quality: "good", leans: "speed", feedback: "Honest. But next time never comes, and you had two days." },
    { label: "Walk him through all you know about Safeway.", quality: "weak", pattern: "lecture", cost: "He takes notes and sends the next question Friday.", feedback: "Generous. But he leaves with notes, not confidence." },
  ],
  reasoning: "A quick answer helps this week and teaches nothing; four asks in six weeks and thin plans show it. With two days before Thursday, ask.",
  principle: "Ask first, answer second, and only if they're stuck.",
  then: "Ben counters with velocity by facing and adds an idea you hadn't thought of. He presents Thursday alone.",
  nextMove: "Next five times he asks, answer “what do you think?” first.",
},
```

#### 30. burned-out-star

```js
{
  id: "burned-out-star", who: "Regional sales manager", customer: "Zoe, your top rep", stage: "Review", skill: "grow", theme: "dedication", trade: ["results", "rest"],
  picture: { kind: "axis", marks: [["A", 75], ["B", 30], ["C", 55], ["D", 0]], after: "Your pick and the strongest, from results to rest." },
  lens: ["TDC", "Honest feedback, with trust behind it, helps talented people perform."],
  tension: ["CCL", "Take responsibility for how your own reactions land, praise included."],
  voice: "I love it. Honestly, I'd rather be working than at home.",
  situation: "Zoe, your top rep, emails at midnight, took five days off all year, and just posted a record quarter. You praised her “giving everything” at the all-hands; a colleague winced.",
  evidence: [["Zoe's results", "131% of plan", "good"], ["Her last two emails", "Two errors she'd catch", "warn"], ["Reps matching her hours", "2", "bad"]],
  pause: "What are you teaching the team about what you notice?",
  options: [
    { label: "Tell Zoe what you've seen, including your own praise.", quality: "best", strength: "own", leans: "rest", feedback: "Name the errors, the hours and your praise, then ask what she wants and suggest a week off. Cost: her pride." },
    { label: "Tell the whole team good means results, not midnight emails.", quality: "good", leans: "results", feedback: "Fixes the norm and corrects your message. But she may not apply it to herself." },
    { label: "Respect that she loves it; take small tasks off her plate.", quality: "good", leans: "rest", feedback: "Honors her choice. But it ignores the errors, the copycats and your praise." },
    { label: "Praise her more and add a bonus.", quality: "weak", pattern: "applaud", cost: "She keeps going, and so do two reps.", feedback: "Earned recognition. But a bonus pays for hours, and the team sees the rate." },
  ],
  reasoning: "Loving the work isn't being well. Her 131% is real, and so are the two errors and the two reps matching her hours. Say what you've seen, and own your part.",
  principle: "Celebrate results, not hours.",
  then: "Zoe: “I think I'm afraid of what happens if I stop.” She takes a week in January; no emails after 9pm.",
  nextMove: "Check the timestamps on your team's emails and yours.",
},
```

## 5. Further scenario seeds (not written out)

1. **Inheriting a buyer relationship.** “Tom always took care of this.”
2. **Carrying a decision you disagree with.** HQ cuts trade funds 20% mid-quarter.
3. **First review, feeling like an impostor.** Hide the middling number, or say where you're unsure.
4. **The rep who asks for a reference.** Loyalty against letting people grow; different prizes and odds could carry expected value.
5. **A peer takes the credit.** Confront, let it go, or fix the incentive.
6. **Two reps fighting over an account.** Decide, or ask them to design the rule.
7. **The rep who reports a colleague.** Safety for the reporter, fairness to the accused.
8. **Promised no territory changes.** HQ is about to re-cut.
9. **The big-win celebration.** A record month through a margin-hurting discount; could carry expected value.
10. **A rep wants to step down.** A newly promoted rep misses selling.

## 6. Open questions for the author

1. **Written reflection.** An optional, unscored one-line box (“What would you actually say first?”) would be the first free-text input; check the CSP.
2. **Replays.** Is a shuffled replay a fair test of changing your mind, or should Module 3 offer a different prompt, such as “pick the option you'd regret least in a month”?
3. **HR territory.** Cases 2 (unverified records), 5 (a long-tenured rep), 6 (a spouse's illness; check actual policy with HR), 25 (a confidential merger study), 28 (a possible transfer) and 30 (overwork and health) touch HR, leave and confidences. Add a disclaimer (“Check your company's policy; this is practice, not legal advice”)? Should 2, 5 and 6 be reviewed by someone in HR first? Case 2 pays nothing on the logs; a pay-linked version needs the strongest option to tell the director the same day.
4. **Scoring.** Is no headline percent, no Bronze, Silver or Gold, and a values read-out acceptable? It is the most visible difference from Modules 1 and 2.
5. **Role filter.** Filter the hub by seat (`who`), or keep one mixed path?
6. **Pictures after the pick.** Nothing shows until the pick, which removes the hint but also the chance to think with the picture. Is that right? And 17 of 30 pictures are the plain axis for lack of an honest number; should the author supply more (hours, chances, dollars) for cases such as 3, 8, 21 and 29?
7. **Learn coverage.** Four Learn lessons have no Module 3 case. Fine, or write seeds 4 and 9 first to bring expected value back with real odds?

## 7. What changed from v2

Each review finding by case id, then the validation results.

| Finding | What v3 did |
|---|---|
| P1 belief bars end on the answer before the pick: 16, 17, 28; 2.8 | Nothing is drawn before the pick (2.8). Belief bars replay after it and end at 48 (14), 48 (16), 45 (17), 44 (28); 16's “0 of 7 objected” moves the bar 3 points; each `after` names what the pick does to trust. |
| P1 read-out not computable: 2B, 5B, 7A, 9B, 18C, 24C, 26B, 30A, 30B | Rule (a): every sound `leans` is one of its case's `trade` values (75 of 75); section 3 counts leans against appearances. Added `loyalty`, `systems`; dropped `person`, `leverage`. |
| P2 best is longest in 27 of 30; stapled labels: 2A, 3A, 6A, 7A, 9A, 12A, 13A, 18A, 24A, 30A | Every best label is one move of 58 characters or fewer; extra moves sit in `feedback`. 3A is the review's own shorter version. |
| P2 numbers: 1, 4, 10, 17, 22 | 1 says “11 to 17”. 4 is an axis, `then` says 25 minutes, “copied her reset”. 10's x is your hours on one proposal (2 per rebuild). 17's pay row reads “far stores run thin” and `then` resolves it. 22 ticks only “about 6 in 10”; pilot and `then` are six weeks. |
| P2 realism: 2, 5, 11, 25 | 2: nothing is paid on the logs; `then` sends the director the corrected count. 5: no pension or age; the fix is the form, for everyone. 11: age removed. 25: new best does not confirm the study and asks the VP today; the old best is now good, with its cost named. |
| P2 “position only” pictures; focus in 2, 12, 18, 30 | Pictures draw an evidence number or the plain axis (2.9). One lesson each: 2 the rule for everyone, 12 your own number first, 18 sleep, 30 “Celebrate results, not hours.” |
| P3 trees 2, 12, 26; remaps 4, 8, 18, 30; 29 | Trees became axes; 4, 8, 18, 30 use utility-and-trade-offs; 29 left value-of-information. |
| P3 single cases: 5, 8, 9, 14, 19, 20, 27, 29 | 5's D is off the line. 8's voice, best and favors row follow the review. 9's axis is candor and loyalty. 14's lens drops “auditing”. 19 names its antecedent. 20's bend is 25, A is 33. 27's lens and tension are swapped. 29's row reads “Two days”. |
| P3 definitions: “Strongest how”, families, strengths, progress, `channel`, `category` | Defined in 3; `tell` merged into `rescue`; `context`, `boundary` folded in; own progress module; fields dropped. |
| P3 empathy, evidence echo, jargon, repeats, quotes; P4 | Pauses rewritten in 8, 13, 14; “because I said so” in 3; 26 names the first big win. Every row is echoed (17 first). Jargon replaced in 11, 15, 20, 13, 22. Repeats gone (1/9, 5/28, 18/19); “What you fear” in 5, 24, 25 only; curly quotes. All P4 items applied; the second Pri is Kai. |
| Lens fidelity: 2, 4, 8, 14, 22, 24, 30 (stretch), 27 (wrong) | Every lesson rewritten as a paraphrase of the author's takeaway. |

Validation (`m3check3.py`, `python3 -I`; extends the reviewer's script; arithmetic, lens fidelity and realism were checked by hand):

- 30 of 30 blocks parse; ids, tracks, keys and structure all pass.
- **Length tell: the best label is the longest in 6 of 30 cases (1, 10, 19, 24, 27, 29), by at most 9 characters, and the shortest in none.** Longest best label 58 characters; longest label 73.
- 75 of 75 sound options lean inside their `trade`; every axis position agrees. Ten values appear in three or more cases.
- Families each in 3 or more cases (avoid 10, control 9, please 6, grind 5, promise 4, blame 3, narrow 3, rescue 3); strengths each on 3 or more best picks (own 5, develop 4, the rest 3).
- Picture kinds: axis 17, belief 4, curve 3, forecast 3, check 2, hours 1. Belief bars end between 40 and 60.
- Zero violations of: text budgets, evidence echo, dashes, UK spelling, book names, jargon, straight-quoted speech, duplicate `after`, voice or pause. “What you fear” appears in 3 cases.

