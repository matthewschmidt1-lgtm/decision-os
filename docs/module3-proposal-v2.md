# Module 3 · Management and accountability: design proposal, v2

Status: revision for the author's review. No code has been changed. This replaces the words with pictures: every case is cut to a minimum of text and carries one of the nine Learn algorithms as a still picture. The original (`docs/module3-proposal.md`) is untouched. All companies, people and figures are illustrative.

**What changed from v1.** The ids, tracks, skills, lenses, tensions, themes, `trade` pairs, option qualities, patterns, strengths, scoring recommendation and open questions are kept. Changed: every learner-facing text is cut by more than half (budgets in 2.2); two fields are added (`algorithm`, `picture`); `lens` and `tension` are shortened; option labels are capped at 90 characters (Module 2 allows about 150); each scenario keeps exactly one `cost` line, on one weak option; the "handle with care" aside in case 6 moved to open question 3; a page layout (2.8) and a picture spec (2.9) were added.

## 1. Overview

1. Module 1 trained judgment, Module 2 the conversation. Module 3 trains the person who manages: what do I owe my people, my partners, my boss and myself?
2. The learner is a new or mid-level sales manager, a rep who leads without the title, or a director. `who` names the seat.
3. The cases are CPG field life: a rep the buyers love who misses forecasts, a Friday 6pm email from the VP, a distributor rep you depend on, a number you can't hit, your own tired Q4.
4. Each case sets one value against another (`trade`). At least two options are defensible; the gap between the strongest and a "good" option is about how and when. Weak options are the shortcuts a manager takes under pressure.
5. Each case rests on one lesson from the six books (`lens`) and names a second that pulls the other way (`tension`). Books appear in the data, never in learner-facing copy.
6. Nine themes (values, follow-through, teamwork, fears, overconfidence, trust, love of the work, dedication, rest) each appear at least three times.
7. Less text, more picture. Each case is about 250 learner-facing words, down from about 520. One picture per case draws the tension through an algorithm the learner can open in Learn. The algorithm is never named on the case.
8. Seven tracks (3 to 5 cases each), seven skills, nine habit families, eleven strengths, a five-case challenge.
9. Scoring: no headline percent. Count "sound" and "strongest" picks, and report the values you lean on and the habits that show under pressure (section 3).

## 2. Reference for the data

### 2.1 The six lessons the cases draw on

| Book | The lesson in one sentence |
|---|---|
| How Google Works | Build an environment (context, transparency, safety, room to decide) so people act without waiting for permission. |
| The 15 Commitments of Conscious Leadership | How you show up matters as much as what you get done: own your reactions and stay curious. |
| Trillion Dollar Coach | Ask more than you answer, give honest feedback, and build trust so talented people do their best work. |
| What the CEO Wants You to Know | Know where the money, margin and cash really come from before you decide anything. |
| Poor Charlie's Almanack | Bring more disciplines (incentives, psychology, base rates) so you don't mistake a familiar pattern for the whole picture. |
| High Output Management | Results shouldn't depend on one person's heroics: leverage comes from clear expectations, process, measures and development. |

### 2.2 Changes to the scenario shape

Module 3 keeps Module 2's shape (`id`, `customer`, `channel`, `category`, `stage`, `skill`, `evidence`, `question`, `options`, `reasoning`, `principle`, `then`, `nextMove`). `buyer` is renamed `voice`. New or changed fields:

| Field | What it is |
|---|---|
| `who` | The learner's seat: "Sales manager", "Director", "Lead rep (no title)". |
| `theme` | `values`, `follow-through`, `teamwork`, `fears`, `overconfidence`, `trust`, `love`, `dedication` or `rest`. |
| `trade` | The two values in tension, from the legend below. Shown in the Why layer only. |
| `lens`, `tension` | `{ book, lesson }`: the lesson the case is built from, and one that pulls the other way. Why layer only. |
| `voice` | One spoken line that opens the scene. |
| `pause` | One question to ask yourself before you pick. |
| `leans` | On best and good options: which value the pick leans on. Feeds "values you lean on". |
| `algorithm` | One of the nine Learn slugs. The lens the picture draws. New in v2. |
| `picture` | `{ kind, left, right, marks, after, note? }`: a spec the implementer can draw from (2.9). New in v2. |

Text budgets (all checked by script): situation 25 to 45 words; voice under 20; 3 evidence rows (4 only when the fourth is the complication), label under 5 words, value under 8; pause under 15; question under 10; option label under 90 characters; feedback 1 to 2 sentences, under 35 words; reasoning under 45; principle under 15; `then` under 25; nextMove under 20; picture `after` under 20.

Value legend for `trade` and `leans`: `candor`, `kindness`, `person`, `team`, `trust`, `verify`, `rest`, `drive`, `confidence`, `humility`, `follow`, `flex`, `speed`, `patience`, `integrity`, `results`, `growth`, `openness`, `joy`, `leverage`.

Copy rules: plain English, US spelling, second person, no framework names, no em dashes, speech in curly quotes. Best-option positions are rebalanced by the Module 2 code, so the order below is not what learners see; picture letters A to D follow the authored order and must be keyed to option identity, not screen position. No case trades anything of value for a placement.

### 2.3 Stages

`stages3 = ["Set", "Coach", "Correct", "Review", "Decide", "Recover", "Plan"]`.

### 2.4 Skills

```js
export const skills3 = {
  standard: { name: "Standards", blurb: "Say what good looks like, and hold it for everyone.", strong: "You set the bar in plain words and hold it, including for people you like.", watch: "You let a standard bend for people you like or numbers you need." },
  candor:   { name: "Candor", blurb: "Say the true thing, early, and kindly.", strong: "You say the hard thing early and plainly, and stay kind.", watch: "You soften or delay the hard thing until it is harder." },
  system:   { name: "Systems", blurb: "Build it so results don't depend on a hero.", strong: "You fix the process, not just the problem.", watch: "You fix it yourself, or lean on the one person who delivers." },
  trust:    { name: "Trust and verify", blurb: "Give trust freely. Check what matters, the same way for everyone.", strong: "You trust the person and check the work, and say so.", watch: "You take confidence for evidence, or check people in ways they feel." },
  self:     { name: "Leading yourself", blurb: "Own your reactions, your fears and your rest.", strong: "You name your part first and protect the rest you need.", watch: "You defend, push through, or hold on to the work you love." },
  across:   { name: "Up and across", blurb: "Carry the truth up, the context down, and a fair view sideways.", strong: "You bring the range, the drivers and the ask.", watch: "You promise upward, stay quiet across, or see only your own function." },
  grow:     { name: "Growing people", blurb: "Ask first. Help them get better, not just get it done.", strong: "You ask before you answer and stay beside people as they decide.", watch: "You answer fast, rescue, or take the quiet for the answer." },
};
```

### 2.5 Tracks

```js
export const tracks3 = [
  track("standard", "Set the standard", "What you allow becomes the rule. Hold it for the people you like.", ["loved-not-delivering", "top-rep-cuts-corners", "inherited-slack-habits", "exception-request"]),
  track("hard", "Have the hard conversation", "The kind thing and the true thing are rarely far apart.", ["veteran-gone-quiet", "spouse-is-ill", "promoted-over-friend", "distributor-rep-slipped", "ready-for-promotion"]),
  track("system", "Build the system, not the hero", "If the same fix lands on your desk weekly, it is a process, not a favor.", ["you-keep-rescuing", "hero-holds-the-account", "metrics-reward-the-wrong-thing", "context-not-permission"]),
  track("trust", "Trust and verify", "Confidence is a feeling. Evidence is something somebody did.", ["says-all-set", "lock-that-isnt", "team-agrees", "one-explanation"]),
  track("self", "Lead yourself", "Your tiredness, pride and love of the work are part of the job.", ["q4-fatigue", "defensive-in-review", "miss-the-field", "vacation-text", "sure-of-the-plan"]),
  track("up", "Manage up and across", "Carry the truth up, the context down, and the whole business into every decision.", ["friday-6pm-email", "number-you-cant-hit", "reorg-rumor", "win-that-costs-supply"]),
  track("grow", "Grow people", "Ask before you answer. Be beside them when they try.", ["rookie-overpromises", "quiet-says-fine", "ask-dont-answer", "burned-out-star"]),
];
export const challengeIds3 = ["loved-not-delivering", "you-keep-rescuing", "q4-fatigue", "number-you-cant-hit", "ask-dont-answer"];
```

The challenge set mixes five tensions: candor with someone you like, rescuing, your own rest, bad news upward, asking instead of telling. Round two builds from the learner's weakest skill and most frequent habit family, as in Module 2.

### 2.6 Habit families and patterns (what a weak pick reveals)

```js
export const families3 = {
  rescue:  { name: "Rescuing", coach: "You step in and fix it. It works today and teaches the team to wait for you." },
  avoid:   { name: "Avoiding", coach: "You wait, soften, or hand it off. The conversation you skip is usually the one that matters." },
  control: { name: "Controlling", coach: "You reach for a rule, a check or a consequence where a conversation would do." },
  please:  { name: "Pleasing", coach: "You protect how people feel about you, or decide what they can handle." },
  promise: { name: "Over-promising", coach: "You commit, or cheer a commitment, past what the evidence supports." },
  blame:   { name: "Defending", coach: "You explain or point elsewhere before saying what is yours." },
  grind:   { name: "Grinding", coach: "You answer pressure with more hours and call it dedication." },
  tell:    { name: "Telling", coach: "You give the answer before you have asked." },
  narrow:  { name: "One explanation", coach: "You settle on the first story that fits and stop looking." },
};
// Module 2 also has a family key "tell"; keep the two tables separate.
export const patterns3 = {
  rescue:     { family: "rescue",  name: "Doing it yourself", coach: "It was right when you fixed it. Next time ask what would let them fix it." },
  hero:       { family: "rescue",  name: "Leaning on the hero", coach: "You relied on the one who always delivers. That risk is theirs alone." },
  wait:       { family: "avoid",   name: "Waiting and watching", coach: "Time usually adds to the cost, and to what others learn from your silence." },
  soften:     { family: "avoid",   name: "Cushioning the message", coach: "It was so gentle it could be heard as nothing. Say it once, plainly and kindly." },
  pass:       { family: "avoid",   name: "Handing it off", coach: "Escalate with a fix in hand, and after you've spoken to the person." },
  drop:       { family: "avoid",   name: "Letting them sink", coach: "People learn faster with you beside them than alone in public." },
  rule:       { family: "control", name: "A rule instead of a conversation", coach: "The rule ended the problem on paper. The conversation still hasn't happened." },
  check:      { family: "control", name: "Checking in secret", coach: "If they find out, they remember the test, not the result." },
  punish:     { family: "control", name: "Making an example", coach: "The room learns to hide things." },
  please:     { family: "please",  name: "Keeping the peace", coach: "You protected the mood. Someone else pays later." },
  friend:     { family: "please",  name: "Staying the friend", coach: "The team is watching which wins, the friendship or the standard." },
  overpromise:{ family: "promise", name: "Committing past the evidence", coach: "Give the range and what's behind it." },
  lock:       { family: "promise", name: "Locking it in first", coach: "Bring in the people who own the answer while you still have a choice." },
  cheer:      { family: "promise", name: "Cheering the number", coach: "Believe the person, then ask what the buyer actually did." },
  hope:       { family: "promise", name: "Reassuring on hope", coach: "People handle a range better than a guess." },
  defend:     { family: "blame",   name: "Defending the plan", coach: "Own your part in one sentence first." },
  blame:      { family: "blame",   name: "Pointing elsewhere", coach: "People want to know who is fixing it, not whose fault it was." },
  grind:      { family: "grind",   name: "Matching pressure with hours", coach: "Tired decisions and missed promises tend to cost more than the gap." },
  applaud:    { family: "grind",   name: "Rewarding the overwork", coach: "Praise the results, not the hours. Everyone learns what you notice." },
  lecture:    { family: "tell",    name: "Telling, not asking", coach: "They nod and bring the same question on Friday." },
  assume:     { family: "narrow",  name: "Assuming it's fine", coach: "Ask a different question and wait." },
  label:      { family: "narrow",  name: "Settling on who they are", coach: "Check what changed around them first." },
};
```

### 2.7 Strengths (tagged on best options)

```js
export const strengths3 = {
  ask:      { name: "Asking before answering" },
  context:  { name: "Giving context, not permission" },
  standard: { name: "Holding the standard kindly" },
  candor:   { name: "Saying the true thing early" },
  boundary: { name: "Protecting what you can't give" },
  system:   { name: "Fixing the process, not the instance" },
  rest:     { name: "Resting on purpose" },
  own:      { name: "Owning your part first" },
  verify:   { name: "Trusting the person, checking the work" },
  develop:  { name: "Letting them make the call, with you beside them" },
  whole:    { name: "Seeing the whole business" },
};
```

### 2.8 Page layout

Order: voice (quote) → situation → three evidence tiles (a fourth only for the complication) → pause → picture frame → options → feedback → principle → next move.

Hidden until the pick: which option is strongest, feedback, reasoning, principle, `then`, next move, lens and tension, and every option mark on the picture. Shown from the start: voice, situation, evidence, pause, the picture frame (axes and end labels only, so the page does not jump). Belief pictures are the exception: tapping an evidence tile moves the bar before the pick, because evidence is not an answer.

On the pick, the four option dots appear, the strongest is marked, the learner's dot stays, and the `after` caption fades in under the picture. Then the usual verdict, scroll and focus pattern runs.

A single link under the verdict, "Learn the algorithm", goes to `/learn/<algorithm>`, as Module 1's does. The algorithm is never named on the case.

Reused: ev-tiles, choices, the verdict block, the reveal and scroll pattern, and the `frame`, `poly`, `ring`, `you`, `flip` helpers in `pictures.js`.

New: the picture kinds, as small spec-driven functions. `pictureFor` itself is hard-coded to each drill's numbers, so none runs as-is. Four kinds reuse an existing drawing with its constants lifted into the spec: `ev` (expected-value), `belief` (bayesian-updating), `check` (value-of-information bars), `curve` (optimization frame, no peak). Four need new drawings: `axis`, `tree`, `hours`, `forecast`.

### 2.9 Picture spec and the algorithm map

`picture = { kind, left, right, marks, after, note }`. `marks` is a list of `[key, number, caption]`; numbers are 0 to 100; captions 2 to 5 words. Keys A to D are options. Positions of options are ordinal ("position only") unless the caption quotes a figure from the evidence. No colors in the spec.

| kind | draws | mark keys | scale |
|---|---|---|---|
| `axis` | one line from the `left` value to the `right` value, options as dots | A to D | 0 left, 100 right |
| `belief` | one bar for one belief, moving as each evidence tile is tapped; no percent shown | `start`, `e1` to `e4` | belief level after that row |
| `check` | two bars (worth, cost) above a line from "decide now" to "check first" with option dots | `worth`, `cost`, A to D | bars share a scale; dots 0 decide now, 100 check first |
| `tree` | two branches, each ending in a cost now and a cost by quarter end | `Ln`, `Lq`, `Rn`, `Rq` (costs), A to D (0 takes left, 100 right) | cost size |
| `curve` | a return curve that flattens, options as dots on it, a bend marker | A to D (x), `bend` | x is how much of your time goes into it |
| `hours` | one bar of 100, or a known/unknown pair: how much goes to the right-hand use | A to D (share to right), `e1` reference | share of the bar |
| `ev` | chance × prize rising against a flat cost line; options as dots on the chance axis | `prize`, `cost`, A to D (chance) | 0 to 100 |
| `forecast` | one scale: what you expect (ticks) against what each option commits | `e1`, `e2` (ticks), A to D (commit) | percent |

| Algorithm | Cases | Count |
|---|---|---|
| utility-and-trade-offs | 1 loved-not-delivering, 3 inherited-slack-habits, 6 spouse-is-ill, 7 promoted-over-friend, 9 ready-for-promotion, 19 defensive-in-review, 21 vacation-text, 25 reorg-rumor | 8 |
| bayesian-updating | 14 says-all-set, 16 team-agrees, 17 one-explanation, 28 quiet-says-fine | 4 |
| decision-trees | 2 top-rep-cuts-corners, 12 metrics-reward-the-wrong-thing, 26 win-that-costs-supply | 3 |
| value-of-information | 5 veteran-gone-quiet, 23 friday-6pm-email, 29 ask-dont-answer | 3 |
| optimization | 10 you-keep-rescuing, 13 context-not-permission, 20 miss-the-field | 3 |
| prediction-vs-decision | 15 lock-that-isnt, 22 sure-of-the-plan, 24 number-you-cant-hit | 3 |
| expected-value | 8 distributor-rep-slipped, 30 burned-out-star | 2 |
| multi-armed-bandits | 4 exception-request, 18 q4-fatigue | 2 |
| exploration-vs-exploitation | 11 hero-holds-the-account, 27 rookie-overpromises | 2 |

Where the mapping did not fit the author's list: expected-value fits only 8 and 30 cleanly (the other candidates, 1, 7 and 9, are trades, not odds). No case literally gives an account to a proven rep or a rookie, so 11 (Sam or Nia on Kroger) and 27 (you or Jamal with the buyer) use the known/unknown pair, and the two bandit cases use a bar of Monday's 50 minutes (4) and a 24-hour day (18) in place of 40 selling hours. Decision trees were planned for "rescue or let it fail" (10, 27); both read better elsewhere (10 has hours in its evidence, 27 is a proven-versus-unproven choice), so trees went to the "act now, wait, or decide alone" cases. Bayesian is used for trust in a claim or a silence; its step sizes are illustrative, so draw the bar with no percent.

## 3. How Module 3 should score

**Recommendation: two levels of credit, no headline percent.**

- Each first pick records `best`, `good` or `weak`. For the tally, `qualityScore3 = { best: 1, good: 1, weak: 0 }`: best and good are both **sound**. A second count, **strongest**, counts best only.
- Hub and track cards show "sound picks" per skill (Early under 3 plays) and "n of N strongest" on track completion. No 0 to 100 bar.
- The summary reports in words: (1) **Values you lean on**, from `leans` of your sound picks, once you have five ("You lean on candor over kindness in 6 of 8"); (2) **Habits under pressure**, from the `family` of weak picks, by Module 2's rules (3+ tagged picks, a quarter of them, a clear lead; ties named); (3) **Strongest how**, the case where your sound pick and the strongest differed most.
- Feedback headings: best "A strong way to do it." · good "Defensible. Here's what it protects, and what it costs." · weak "A common move under pressure."

**Why not best = 1, good = 0.5?** A 0.5 tells a thoughtful manager a defensible choice was half wrong, so learners start guessing the grader instead of thinking about the person in the scene. It also hides what is most useful: which values you reach for.

**Why keep "strongest"?** Because how and when matter, and the count lets the product say so without calling anyone wrong.

**On screen.** The Why layer states what the strongest option costs too. The page never says "wrong" for a sound pick. The Module 3 hub notes: "Several answers here are defensible. We show which values each leans on, and what the strongest one adds."

**Optional.** Show the `pause` first and reveal the options on a tap. No timer.

## 4. The 30 scenarios

Seats: 20 sales managers (2 new to the job), 8 regional managers or directors, 2 lead reps without the title. Themes: trust 5, fears 4, and values, follow-through, teamwork, overconfidence, love, dedication, rest 3 each. In every picture, letters A to D follow the order written here.

### Track 1 · Set the standard

#### 1. loved-not-delivering

```js
{
  id: "loved-not-delivering", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Correct", skill: "standard", theme: "follow-through", trade: ["candor", "person"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Candor", right: "Protecting her", marks: [["A", 20, "Her numbers first"], ["B", 50, "Praise, then miss"], ["C", 85, "Wait a quarter"], ["D", 60, "Check-ins instead"]], after: "Same news, four distances from plain.", note: "position only" },
  lens: { book: "Trillion Dollar Coach", lesson: "Honest feedback, early, inside a trusting relationship, is the kindest thing." },
  tension: { book: "High Output Management", lesson: "A visible measure keeps a miss from hiding behind a good relationship." },
  voice: "Buyers love me. The number always comes together late.",
  situation: "Dana's buyers ask for her by name. Three quarters running she committed at week six and landed 10 to 15 points under, and your director's forecast paid. She once covered your territory for you.",
  evidence: [["Week-6 commit, 3 quarters", "105% · 108% · 110%", "warn"], ["Where she landed", "94% · 91% · 96%", "bad"], ["Your last review", "'Meets,' no forecast note", "warn"], ["What you fear", "She hears 'not good' and leaves", "warn"]],
  pause: "Who should tell Dana: you now, or your director in January?",
  question: "What do you do?",
  options: [
    { label: "Show her the pattern in her own numbers. Ask what she sees.", quality: "best", strength: "candor", leans: "candor", feedback: "Early, specific, and she speaks first. Cost: an uncomfortable half hour." },
    { label: "Open with what buyers value, then name the forecast habit.", quality: "good", leans: "person", feedback: "Praise first keeps the bond. She may hear the praise and miss the miss." },
    { label: "Rate her 'meets' again and watch another quarter.", quality: "weak", pattern: "wait", cost: "Another miss, and your director asks what you saw.", feedback: "She's had three quarters. Only Dana doesn't know it matters." },
    { label: "Add a weekly forecast check-in for a quarter.", quality: "weak", pattern: "rule", feedback: "Instead of the talk, it says you've lost faith without saying why." },
  ],
  reasoning: "Loyalty and honesty feel like opposites here. They aren't. The kind version is the earliest, with facts she can check. Waiting moves it to a worse day.",
  principle: "Delayed kindness is a loan she repays with interest.",
  then: "Dana: “Nobody told me it mattered that much.” Next quarter: committed 98%, landed 97%.",
  nextMove: "Compare commit and actual for every rep. Book the talk you've been avoiding.",
},
```

#### 2. top-rep-cuts-corners

```js
{
  id: "top-rep-cuts-corners", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Sparkling water",
  stage: "Correct", skill: "standard", theme: "values", trade: ["results", "integrity"],
  algorithm: "decision-trees",
  picture: { kind: "tree", left: "Fix it now", right: "Wait", marks: [["A", 0, "Talk to Marcus"], ["B", 0, "Team rule first"], ["C", 0, "Hand to HR"], ["D", 100, "Let it go"], ["Ln", 60, "Hard talk, best rep"], ["Lq", 10, "One rule holds"], ["Rn", 5, "Nothing happens"], ["Rq", 70, "Copying spreads"]], after: "Cost of each branch, now and by quarter end.", note: "costs are position only; '2 reps copying' is from the evidence" },
  lens: { book: "Poor Charlie's Almanack", lesson: "People respond to pay and praise, so check the incentive before judging the person." },
  tension: { book: "Trillion Dollar Coach", lesson: "Honest feedback only works if the person believes you're on their side." },
  voice: "Never lost a display fight. Does it matter if I log from the car?",
  situation: "Marcus is at 118%, first in the region. A third of his displays are logged 'executed' from a distributor's text. You checked six: one was never built. Compliance pays a bonus.",
  evidence: [["Logged from a text", "About 1 in 3", "warn"], ["Your kickoff line", "'I don't care how'", "warn"], ["Reps copying him", "2", "bad"]],
  pause: "What will the team learn from your next move?",
  question: "What do you do?",
  options: [
    { label: "See Marcus today. Show the six, own your line, set one rule for all.", quality: "best", strength: "standard", leans: "integrity", feedback: "You went to him first, owned your part, and fixed the rule for everyone. Cost: a hard talk with your best rep." },
    { label: "Reset the rule with the team first, no names. Then talk to Marcus.", quality: "good", leans: "team", feedback: "Spares him, keeps it fair. But he hears a speech first, you second." },
    { label: "Take it to your director and HR. Let them decide.", quality: "weak", pattern: "pass", cost: "He hears it from HR, not you.", feedback: "They need to know, but from you, after he does." },
    { label: "Let it go this quarter. One missing display is small.", quality: "weak", pattern: "wait", feedback: "Small is why it tempts. The team is learning what 'executed' means from what you tolerate." },
  ],
  reasoning: "Results against integrity, and he's good. But the bonus and your kickoff line gave permission. Fix the rule and your part, with Marcus in the room.",
  principle: "What you allow in your best rep becomes everyone's rule.",
  then: "Marcus: “I stopped walking them when the numbers were good.” He re-walks and finds two more missing.",
  nextMove: "Walk three 'executed' displays you haven't seen. Say what 'executed' means.",
},
```

#### 3. inherited-slack-habits

```js
{
  id: "inherited-slack-habits", who: "New sales manager", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Set", skill: "standard", theme: "follow-through", trade: ["follow", "flex"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Hold the line", right: "Bend it", marks: [["A", 30, "A reason, fewer fields"], ["B", 10, "Exactly as before"], ["C", 90, "Redesign first"], ["D", 15, "A threat, no reason"]], after: "Same deadline, four ways: firm to flexible.", note: "position only" },
  lens: { book: "High Output Management", lesson: "A routine earns its place only with a purpose and a measure someone uses." },
  tension: { book: "How Google Works", lesson: "People hold a standard they understand and helped shape." },
  voice: "Reports are busywork, boss. I closed Kroger. Isn't that the report?",
  situation: "New to seven reps, you find Friday reports on time 40% of the time; your predecessor 'never chased.' Your director wants a roll-up built from them. Your best rep calls them a waste.",
  evidence: [["On-time reports", "40%", "bad"], ["After filing", "Nothing; no one replies", "warn"], ["Your worry", "Being 'the new boss who nags'", "warn"]],
  pause: "Could you explain this rule, or only enforce it?",
  question: "What do you do?",
  options: [
    { label: "Say what it's for, cut to three fields, promise Monday replies, hold Friday.", quality: "best", strength: "standard", leans: "follow", feedback: "The standard gets a reason and the loop closes. Cost: the Monday replies are real work." },
    { label: "Hold Friday noon exactly as is, and say why.", quality: "good", leans: "follow", feedback: "Consistency counts; bending in week three is hard to undo. But the form may be too long." },
    { label: "Let the team redesign reports before you enforce anything.", quality: "good", leans: "flex", feedback: "People keep what they shape. But it's another month at 40%, and rules start to look optional." },
    { label: "Send a firm note: late reports count in reviews.", quality: "weak", pattern: "rule", cost: "On time hits 90%; reports say nothing.", feedback: "It moves the number, not the quality, and tells a wary team you lead with consequences." },
  ],
  reasoning: "Two options mix firmness and flexibility defensibly. What decides it is purpose: a standard with a reason and a reply holds; one that only counts people breeds empty compliance.",
  principle: "A standard with a reason survives its first bad Friday.",
  then: "Third Friday: 85% on time. A skeptic notes: “You used my Kroger line.”",
  nextMove: "Pick one inherited routine. Cut every field nobody uses.",
},
```

#### 4. exception-request

```js
{
  id: "exception-request", who: "Sales manager (7 reps)", customer: "Priya, your top rep", channel: "off", category: "Portfolio",
  stage: "Set", skill: "standard", theme: "teamwork", trade: ["flex", "team"],
  algorithm: "multi-armed-bandits",
  picture: { kind: "hours", left: "Status", right: "Real problem", marks: [["e2", 8, "4 of 50 minutes"], ["A", 80, "25 min, one problem"], ["B", 8, "Same call, she's out"], ["C", 8, "Same call, all attend"], ["D", 8, "Same call, quiet yes"]], after: "Share of the call spent on a real problem.", note: "8% is 4 of 50 minutes, from the evidence; A's 80 is an assumption" },
  lens: { book: "How Google Works", lesson: "Give strong people room, and make the shared things worth sharing." },
  tension: { book: "High Output Management", lesson: "Expectations that apply to everyone make a team predictable." },
  voice: "I'm at 124%. Can I skip Monday's call and just send numbers?",
  situation: "Priya, your top rep, wants out of the Monday call: 50 minutes of round-robin status. Your newest rep says it's where he learns how she runs Kroger resets. Others would ask next.",
  evidence: [["Priya, year to date", "124% of plan", "good"], ["Her last two Mondays", "4 minutes each; two reps copied it", "good"], ["Your own view", "You never asked what it's for", "warn"]],
  pause: "Would your answer change for a middle performer?",
  question: "What do you tell her?",
  options: [
    { label: "Hold the yes. Rebuild the call: 25 minutes, one real problem.", quality: "best", strength: "standard", leans: "team", feedback: "You heard the signal about the call, not just her. Cost: a week of rebuilding." },
    { label: "Yes for a quarter, with a monthly note on what others could copy.", quality: "good", leans: "flex", feedback: "Earned flexibility is fair. But the newest rep loses the live version, and 120% becomes a precedent." },
    { label: "No. The call is for the team; everyone attends.", quality: "good", leans: "team", feedback: "Fair to those who need it. But you're defending a call you doubt." },
    { label: "Say yes quietly. Tell no one.", quality: "weak", pattern: "please", cost: "Others notice by week two.", feedback: "Quiet exceptions get found out loudly. The team learns access beats reasons." },
  ],
  reasoning: "Flexibility and fairness both hold up. The strongest hears the question underneath: if your best rep sees no value in the call, the call is the problem.",
  principle: "A rule only your best person can skip is a perk.",
  then: "Priya brings two ideas. The call shrinks to 30 minutes; she leads the Kroger segment.",
  nextMove: "Ask each rep: what is Monday's call for?",
},
```

### Track 2 · Have the hard conversation

#### 5. veteran-gone-quiet

```js
{
  id: "veteran-gone-quiet", who: "Sales manager (9 reps)", customer: "Ray, 22 years in", channel: "off", category: "Salty snacks",
  stage: "Coach", skill: "candor", theme: "love", trade: ["candor", "patience"],
  algorithm: "value-of-information",
  picture: { kind: "check", left: "Act now", right: "Ask first", marks: [["worth", 60, "Three causes, three moves"], ["cost", 10, "One lunch"], ["A", 100, "Lunch, then listen"], ["B", 25, "Give him a role"], ["C", 10, "Set the standard"], ["D", 0, "Wait, neither"]], after: "One lunch, against what it could change.", note: "position only; visits down 30% and 11 to 0 ride-alongs are from the evidence" },
  lens: { book: "Trillion Dollar Coach", lesson: "Say what you've seen, then ask. People open up when you try to understand first." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "'He's checked out' may be a conclusion, not a fact." },
  voice: "I'm fine. I just don't see the point of the new reports.",
  situation: "Ray, 22 years in, used to coach every new hire. Now his visits are down 30%, he's stopped volunteering, and two reps grumble about covering for him. He's nine months from his pension milestone.",
  evidence: [["Visits vs last year", "Down 30%", "warn"], ["Ride-alongs he led", "11 last year · 0 now", "warn"], ["What you fear", "Asking sounds like pushing him out", "warn"]],
  pause: "What would Ray want you to ask?",
  question: "How do you start?",
  options: [
    { label: "Lunch. Say what you've noticed and that you value him. Ask, then listen.", quality: "best", strength: "ask", leans: "patience", feedback: "Facts without a conclusion, and he answers first. Cost: time, while two reps wait." },
    { label: "Ask him to mentor the three newest reps.", quality: "good", leans: "person", feedback: "Uses his strength. But you've picked the cure before the cause." },
    { label: "Be plain: visits are down 30%; here's the standard and the date.", quality: "good", leans: "candor", feedback: "Clear and fair to the team. But he hears a deadline, and you never learn the why." },
    { label: "Wait. He's earned a quiet landing.", quality: "weak", pattern: "wait", cost: "Two reps read your silence as the new standard.", feedback: "Generous, but a quiet landing is chosen with someone, not for them." },
  ],
  reasoning: "Candor and patience both hold. Order decides it: say what you've seen, ask, listen. Tired, bored or troubled each need a different move.",
  principle: "Say what you've seen, then ask what's changed.",
  then: "Ray: “I'm tired of being measured like reps half my age.” You trim his reports, and he returns.",
  nextMove: "Book a long lunch with the person who changed. Bring specifics.",
},
```

#### 6. spouse-is-ill

```js
{
  id: "spouse-is-ill", who: "Sales manager (8 reps)", customer: "Tom, 6 years on your team", channel: "off", category: "Portfolio",
  stage: "Coach", skill: "candor", theme: "values", trade: ["kindness", "team"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Tom's needs", right: "Team's load", marks: [["A", 40, "Ask, then plan"], ["B", 15, "Quiet cover"], ["C", 90, "Same process"], ["D", 75, "Tell the team"]], after: "Four ways to carry Tom's news.", note: "position only" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Stay curious and ask what a person needs rather than assume it from your own story." },
  tension: { book: "High Output Management", lesson: "A team can carry a lot if workload is visible and fairly shared." },
  voice: "I'm okay. I just need to leave early Tuesdays and Thursdays.",
  situation: "Tom told you in the parking lot his wife has started chemotherapy, and asked for privacy. Since then his visits slipped and Aisha covered a Safeway reset. HR wants performance flags in ten days.",
  evidence: [["Tom before this", "Never under 95% in six years", "good"], ["Last six weeks", "Visits down 35%; two missed deadlines", "warn"], ["Your own story", "Wanted space when your dad was ill", "warn"]],
  pause: "What do you know Tom needs, and what do you assume?",
  question: "What do you do?",
  options: [
    { label: "Ask what he needs. Check options with HR, no names. Tell Aisha only with his OK.", quality: "best", strength: "ask", leans: "kindness", feedback: "You asked before assuming and kept his confidence. Cost: a harder talk than 'take what you need.'" },
    { label: "Say take what you need; shift Safeway to Aisha quietly.", quality: "good", leans: "kindness", feedback: "Generous and fast. But Aisha carries it with no end date, and Tom has no plan." },
    { label: "Treat it like any performance drop: document, set targets.", quality: "weak", pattern: "rule", feedback: "Consistency has a place. Here it ignores the circumstances and tools the company has." },
    { label: "Tell the team, so they understand the extra load.", quality: "weak", pattern: "please", cost: "Tom learns his news is public.", feedback: "It was his news to share. Breaking a confidence teaches the team to hold back." },
  ],
  reasoning: "Both kindness and fairness are owed, and guessing serves neither. Ask what he needs, learn what the company can offer, and plan around it.",
  principle: "Ask what someone needs before deciding what's kind.",
  then: "Tom is relieved. He leaves at 3 twice a week; Aisha covers Safeway six weeks, knowing it's temporary.",
  nextMove: "Learn today what leave and flexible-schedule options your company offers.",
},
```

#### 7. promoted-over-friend

```js
{
  id: "promoted-over-friend", who: "New sales manager, promoted from the team", customer: "Chris, your closest friend at work", channel: "off", category: "Portfolio",
  stage: "Correct", skill: "candor", theme: "trust", trade: ["person", "team"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Chris, the friend", right: "The team", marks: [["A", 45, "Name it, ask him"], ["B", 80, "One note to all"], ["C", 5, "Joke and a beer"], ["D", 95, "Warning on paper"]], after: "Same behavior, four distances from the friend.", note: "position only" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice your guilt, irritation and ego before you act on them, and say so." },
  tension: { book: "Trillion Dollar Coach", lesson: "A friendship can be strong enough to carry honest feedback." },
  voice: "Come on. Since when do you need a form for this?",
  situation: "You were promoted over Chris, your friend of five years, who applied too. Since then his forecasts run late, he's late to Monday's call, and he jokes about “the new boss” in front of everyone.",
  evidence: [["Forecasts", "Late 3 of last 4", "warn"], ["Monday call", "Late 4 of 6, jokes included", "warn"], ["The team is watching", "Whether the rules changed", "warn"]],
  pause: "Which costs more: some friendship, or the team's belief you're fair?",
  question: "What do you do?",
  options: [
    { label: "Meet privately. Name the lateness and jokes, own that you got his job, ask.", quality: "best", strength: "own", leans: "candor", feedback: "The friendship becomes part of the talk, not a reason to skip it. Cost: a hard hour, weeks of strain." },
    { label: "Send one note on expectations to everyone; talk to Chris if it continues.", quality: "good", leans: "team", feedback: "Fair, and doesn't single him out. But he'll know who it was for." },
    { label: "Joke back, grab a beer, sort it out as friends.", quality: "weak", pattern: "friend", cost: "The team watches rules bend for your friend.", feedback: "The audience was everyone else, and they're learning from your reply." },
    { label: "Give Chris a written warning to prove nothing changed.", quality: "weak", pattern: "punish", feedback: "Paper before a conversation is the harshest way to prove you're fair." },
  ],
  reasoning: "Friend or fairness feels like a choice only until you say the thing you're both avoiding. Name it, name how he must feel, and ask.",
  principle: "How you hold a friend to a rule shows your word's worth.",
  then: "Chris: “I wanted it. I'll be over it by Wednesday, not Monday.” He's on time after that.",
  nextMove: "List the three people you go easiest on. Book one talk.",
},
```

#### 8. distributor-rep-slipped

```js
{
  id: "distributor-rep-slipped", who: "Regional sales manager", customer: "Mike, route rep at Cascade Beverage", channel: "off", category: "Sparkling water",
  stage: "Correct", skill: "candor", theme: "teamwork", trade: ["candor", "trust"],
  algorithm: "expected-value",
  picture: { kind: "ev", left: "Chance it lands", right: "What changes", marks: [["prize", 70, "40 best stores"], ["cost", 25, "His goodwill"], ["A", 80, "Call him"], ["B", 55, "His boss"], ["C", 0, "Say nothing"], ["D", 25, "Paper first"]], after: "Odds each answer lands, against what's at stake.", note: "position only; 40 stores is from the situation" },
  lens: { book: "What the CEO Wants You to Know", lesson: "Their behavior follows their economics. Know how the other side makes money." },
  tension: { book: "Trillion Dollar Coach", lesson: "Honest feedback is a gift when it comes with care." },
  voice: "I know. The feature slipped. I've got 140 stops and you're one of 300 brands.",
  situation: "Mike got your sparkling water into your 40 best stores and has gone out of his way for years. This quarter he missed two load-ins: 11 stores, then 9. Your reps say let it go.",
  evidence: [["Missed load-ins", "2 (11 stores, then 9)", "bad"], ["Pay from your brand", "About 1%"], ["Favors repaid", "Asked three, sent one card", "warn"]],
  pause: "Would Mike rather hear it from you, or his boss?",
  question: "What do you do?",
  options: [
    { label: "Call Mike. Name both misses, ask what's in the way, agree 48-hour checks.", quality: "best", strength: "candor", leans: "candor", feedback: "Truth first, in person, with an offer of help. Cost: your reps' time." },
    { label: "Take it to his sales manager, framed as a shared problem.", quality: "good", leans: "candor", feedback: "A manager can reset his priorities. But Mike may feel you went over his head." },
    { label: "Let it go. He's earned slack and you need him.", quality: "weak", pattern: "please", cost: "The third miss lands in Q4.", feedback: "Loyalty is a good instinct, but he can't fix what nobody names." },
    { label: "Send a written summary to Mike, copying his manager.", quality: "weak", pattern: "punish", feedback: "Records have a place. As a first move it reads as an accusation." },
  ],
  reasoning: "You rely on Mike, so honesty can't wait. He's likely stretched, with your brand 1% of his pay. A candid, curious call plus an offer comes first.",
  principle: "Be honest soonest with those you depend on most.",
  then: "Mike: “They moved 40 brands onto my route in June.” Your reps pre-build his displays; no more misses.",
  nextMove: "Learn what's on your key distributor reps' plates before your next favor.",
},
```

#### 9. ready-for-promotion

```js
{
  id: "ready-for-promotion", who: "Sales manager (8 reps)", customer: "Lena, your strongest mid-level rep", channel: "off", category: "Portfolio",
  stage: "Review", skill: "candor", theme: "dedication", trade: ["candor", "kindness"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Candor", right: "Kindness", marks: [["A", 20, "Early, with a plan"], ["B", 60, "Push for the title"], ["C", 90, "'So close'"], ["D", 75, "Wait for the director"]], after: "Same news, four distances from plain.", note: "position only" },
  lens: { book: "Trillion Dollar Coach", lesson: "Honest, specific feedback and support for growth beat reassurance." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Own your part, here a vague promise, instead of defending it." },
  voice: "You said next cycle. It's next cycle.",
  situation: "Last year you told Lena, “We'll look at senior rep next cycle.” She's worked weekends since. Her numbers are strong, her plans thin; your director says “close, not yet.” She's told her family.",
  evidence: [["Lena's results", "106% · 111%", "good"], ["Your director", "'Close, not yet'", "warn"], ["Her account plans", "No 90-day plan on 3 of 5", "warn"]],
  pause: "What did Lena hear in “next cycle”? What did you mean?",
  question: "What do you do?",
  options: [
    { label: "Tell her now: not this cycle. Name the gaps, set a plan, own the vague promise.", quality: "best", strength: "own", leans: "candor", feedback: "Early, specific, and you pay the debt of your loose promise. Cost: real disappointment." },
    { label: "Push your director to promote her; coach the gaps after.", quality: "good", leans: "person", feedback: "Advocacy is the job. But the gaps show in the new role." },
    { label: "Tell her she's “so close” and revisit in six months.", quality: "weak", pattern: "soften", cost: "She plans a family decision around it.", feedback: "It spares you both a rough hour. 'So close' is a hard place to live." },
    { label: "Wait for your director to decide.", quality: "weak", pattern: "wait", feedback: "Not speculating is fair. But you can tell her where she stands now." },
  ],
  reasoning: "Her dedication earned an honest answer. The vague promise is the debt; pay it with a plan, so the no comes with a route to yes.",
  principle: "A vague promise is a debt. Pay it with specifics.",
  then: "Lena takes it hard for a day, then asks for the account-plan template and a date.",
  nextMove: "List every “next cycle” you've said. Turn each into a date or a no.",
},
```

### Track 3 · Build the system, not the hero

#### 10. you-keep-rescuing

```js
{
  id: "you-keep-rescuing", who: "Sales manager (8 reps)", customer: "Jess, a first-year rep", channel: "off", category: "Better-for-you snacks",
  stage: "Coach", skill: "system", theme: "love", trade: ["speed", "growth"],
  algorithm: "optimization",
  picture: { kind: "curve", left: "First hour", right: "Fourteenth hour", marks: [["A", 15, "One hour, her hands"], ["B", 55, "Your weekend"], ["C", 55, "Rebuild, say nothing"], ["D", 0, "None, she's alone"], ["bend", 20, "Rebuilding stops paying"]], after: "Each extra rebuilding hour buys less.", note: "curve shape is not data; 14 hours and 7 of 9 are from the evidence" },
  lens: { book: "High Output Management", lesson: "Good outcomes shouldn't depend on you rescuing a weak process." },
  tension: { book: "Trillion Dollar Coach", lesson: "Helping people become capable can mean being slower today." },
  voice: "Can you look at the Meijer proposal? You're so much better.",
  situation: "Third Friday running, you're rebuilding a rep's late proposal, and it works. This week it's a $90K reset due Monday 9am, from Jess, new and overwhelmed. Rebuilding is the best part of your week.",
  evidence: [["Proposals you rebuilt", "7 of 9 this quarter", "bad"], ["Hours it cost you", "About 14", "warn"], ["Win rate on rebuilt", "5 of 7", "good"]],
  pause: "Whose proposal is this, and what does the team learn?",
  question: "What do you do?",
  options: [
    { label: "Fix this one with her at the keyboard, then agree a checklist.", quality: "best", strength: "system", leans: "growth", feedback: "The $90K is safe and the hour goes to her skill. Cost: you don't get to do it yourself." },
    { label: "Rebuild it this weekend. Monday, set drafts due 48 hours early.", quality: "good", leans: "speed", feedback: "A real $90K justifies it. The fix afterward makes it defensible, not habit." },
    { label: "Rebuild it and say nothing. Monday is real.", quality: "weak", pattern: "rescue", cost: "Next Friday it's the same.", feedback: "It works. It also teaches that rough drafts are fine because you finish things." },
    { label: "Send it back with comments; she finishes alone.", quality: "weak", pattern: "drop", feedback: "Alone, on $90K, in her first year, risks the sale and her confidence." },
  ],
  reasoning: "The rescue works, which is why it's hard to stop. But a team that depends on your fixes is capped by your Fridays. Protect the $90K, then change what arrives.",
  principle: "Weekly fixes are a process problem, not a favor.",
  then: "She types, you ask. The result beats her draft. She runs the next two alone.",
  nextMove: "List the last five things you fixed. Write the checklist for the most common.",
},
```

#### 11. hero-holds-the-account

```js
{
  id: "hero-holds-the-account", who: "Regional sales manager", customer: "Sam, your Kroger lead", channel: "off", category: "Sparkling water",
  stage: "Plan", skill: "system", theme: "dedication", trade: ["person", "leverage"],
  algorithm: "exploration-vs-exploitation",
  picture: { kind: "hours", left: "Sam (proven)", right: "Second rep", marks: [["e2", 0, "None has met the buyer"], ["A", 30, "Sam designs handover"], ["B", 20, "Quiet second rep"], ["C", 5, "Paper only"], ["D", 0, "Sam alone"]], after: "How much of Kroger rests on someone else.", note: "position only; Kroger is 31% of the region" },
  lens: { book: "High Output Management", lesson: "Results that depend on one person are a risk nobody has priced." },
  tension: { book: "Trillion Dollar Coach", lesson: "Loyalty is real, and honoring it earns the right to ask hard things." },
  voice: "Don't worry about Kroger. I've got it.",
  situation: "Sam has run your biggest account nine years. The buyer's habits and promo history live in his head and one personal spreadsheet. He's 58, loyal, and says “backups are for people who plan to leave.”",
  evidence: [["Kroger's share of region", "31%", "good"], ["Others met the buyer", "None", "bad"], ["What you fear", "He feels measured for replacement", "warn"]],
  pause: "Is it loyal to leave him carrying this alone?",
  question: "What do you do?",
  options: [
    { label: "Tell Sam why. Ask him to design the backup and pick who joins.", quality: "best", strength: "system", leans: "leverage", feedback: "The real reason, and the design is his. Cost: an uncomfortable talk and weeks of doubt." },
    { label: "Add a second rep as 'growth capacity' and let it unfold.", quality: "good", leans: "person", feedback: "Protects his pride. But he may feel handled, and quiet handovers run slow." },
    { label: "Ask every key-account owner for a one-page account file.", quality: "good", leans: "leverage", feedback: "Avoids singling him out. He may write the minimum, and the relationship stays in his head." },
    { label: "Leave it. Nine years prove it works.", quality: "weak", pattern: "hero", cost: "The day he's out, you meet Kroger's buyer for the first time.", feedback: "A good record is why no one asked what happens without him." },
  ],
  reasoning: "Honoring his loyalty is right. Leaving him the single point of failure makes him carry the risk alone. Name the reason; hand him the design.",
  principle: "One-person dependence isn't loyalty. It's a risk he carries alone.",
  then: "Sam: “I figured the spreadsheet was a compliment.” He picks Nia to shadow Kroger.",
  nextMove: "List your five biggest accounts and who else could run each. Blanks are talks.",
},
```

#### 12. metrics-reward-the-wrong-thing

```js
{
  id: "metrics-reward-the-wrong-thing", who: "Regional sales manager", customer: "Your region", channel: "off", category: "Energy drinks",
  stage: "Plan", skill: "system", theme: "values", trade: ["results", "candor"],
  algorithm: "decision-trees",
  picture: { kind: "tree", left: "Tell her now", right: "Wait", marks: [["A", 0, "Tell her now"], ["B", 100, "Fix it quietly"], ["C", 100, "Blame the reps"], ["D", 100, "Say nothing yet"], ["Ln", 60, "Praise gone, bonus at risk"], ["Lq", 15, "Plan fixed, dip explained"], ["Rn", 5, "Applause, nothing else"], ["Rq", 75, "Finance tells her"]], after: "Cost of each branch, now and later.", note: "costs are position only; 85 days against 45 is from the evidence" },
  lens: { book: "What the CEO Wants You to Know", lesson: "Follow the cash and margin: a win can hide inventory and discount." },
  tension: { book: "Poor Charlie's Almanack", lesson: "People respond to what they're paid on, so check the incentive first." },
  voice: "Great month. Keep that pace.",
  situation: "Your team is paid on cases shipped. Two reps pushed 3,000 cases in three days with a discount you approved. Shipments hit 112% and your director praised you. Retail is flat, and your bonus rides on shipments.",
  evidence: [["Shipped vs plan", "112%", "good"], ["Retail, same month", "Flat", "warn"], ["Distributor stock", "85 days · target 45", "bad"]],
  pause: "What does telling her now risk? What changes by February?",
  question: "What do you do?",
  options: [
    { label: "Tell her now: shipments up, retail flat, stock high. Propose paying on retail, yours too.", quality: "best", strength: "whole", leans: "candor", feedback: "Whole picture while the plan can still change, with your bonus on the table. Cost: the praise." },
    { label: "Take the praise; quietly stop early buys; change the measure next quarter.", quality: "good", leans: "results", feedback: "Protects morale and fixes behavior. But your director plans on a number you know is inflated." },
    { label: "Note it in the two reps' reviews.", quality: "weak", pattern: "blame", cost: "They did what the plan paid for.", feedback: "You approved the discounts. Punishing them for your incentive teaches them to hide things." },
    { label: "Say nothing yet. Retail may catch up.", quality: "weak", pattern: "hope", feedback: "Not crying wolf is fair. But you hold three signals, and finance may tell her first." },
  ],
  reasoning: "A shipped case is a sale to the distributor, not a drinker. The measure did this, and you too. Say so, and change yours first.",
  principle: "People do what the number pays for. Fix yours first.",
  then: "Your director: “I should have asked what retail did.” Pay moves to retail. Shipments dip 9%.",
  nextMove: "For each number you pay on, ask how a clever rep could game it.",
},
```

#### 13. context-not-permission

```js
{
  id: "context-not-permission", who: "Sales manager (7 reps)", customer: "Omar, a solid second-year rep", channel: "off", category: "Salty snacks",
  stage: "Set", skill: "system", theme: "trust", trade: ["trust", "verify"],
  algorithm: "optimization",
  picture: { kind: "curve", left: "Approve nothing", right: "Approve all", marks: [["A", 25, "Limit, tell-after"], ["B", 45, "Checklist under $1K"], ["C", 100, "All, but faster"], ["D", 0, "No limit, no context"], ["bend", 30, "Checks cost more"]], after: "Each extra approval catches less and costs more waiting.", note: "curve shape is not data; 31 requests and 9 hours are from the evidence" },
  lens: { book: "How Google Works", lesson: "Give people context and a clear limit instead of making them wait for permission." },
  tension: { book: "High Output Management", lesson: "Delegation works when expectations and measures are clear enough to check later." },
  voice: "I didn't want to decide without you. The buyer's still waiting.",
  situation: "Reps ask you to approve everything, even $900. Omar waited two days on a display swap and lost the spot. You like being needed, but finance reversed a rep's $6,000 promise last quarter.",
  evidence: [["Requests under $2,000", "31 last month", "warn"], ["Median reply", "About 9 hours", "warn"], ["Spots lost waiting", "At least 2", "bad"]],
  pause: "Which is easier to explain: one wrong call, or ten lost spots?",
  question: "What changes?",
  options: [
    { label: "Share the budget and rules, set a $2,000 limit, tell-after, review monthly.", quality: "best", strength: "context", leans: "trust", feedback: "Context, a limit, a way to learn. Cost: feeling needed, a few small errors." },
    { label: "Give a checklist: self-approve under $1,000, ask above.", quality: "good", leans: "verify", feedback: "Speeds most calls. But reps learn the list, not the budget." },
    { label: "Keep approving everything, but reply within the hour.", quality: "weak", pattern: "rule", cost: "You become the Friday bottleneck.", feedback: "Faster replies don't fix why people wait: they aren't sure they're allowed." },
    { label: "Say “use your judgment” and never mention the $6,000.", quality: "weak", pattern: "drop", feedback: "Right to delegate. Without budget or limit, it's a leap in the dark." },
  ],
  reasoning: "Trust and checking are both needed. Permission case by case makes you the gate. Context and a limit let people decide; a sample lets you check.",
  principle: "Give context and a limit, not permission case by case.",
  then: "Month one: 22 self-approved, one $400 miss the rep reports first. Requests: 31 to 6.",
  nextMove: "Ask a rep what they skipped for fear of not being allowed.",
},
```

### Track 4 · Trust and verify

#### 14. says-all-set

```js
{
  id: "says-all-set", who: "Sales manager (6 reps)", customer: "Eli, four months in", channel: "off", category: "Refrigerated juice",
  stage: "Review", skill: "trust", theme: "trust", trade: ["trust", "verify"],
  algorithm: "bayesian-updating",
  picture: { kind: "belief", left: "Doubt it", right: "Believe it", marks: [["start", 70, "New rep, benefit of doubt"], ["e1", 80, "He said 12 of 12"], ["e2", 55, "Photos for 3"], ["e3", 35, "Two missed strips"], ["e4", 50, "No false reports"]], after: "Trust in 'all 12 are set,' one row at a time.", note: "directions follow each row; sizes are illustrative, so draw the bar with no percent" },
  lens: { book: "Trillion Dollar Coach", lesson: "Trust people first, and keep it by asking good questions rather than auditing." },
  tension: { book: "High Output Management", lesson: "Check output the same way for everyone." },
  voice: "All 12 stores are set, boss. Looks great.",
  situation: "Eli, four months in and eager, says the 12-store reset is done on time. He withdraws when he feels doubted. Wednesday your route passes four of the stores.",
  evidence: [["Eli's report", "12 of 12 set"], ["Photos in the app", "3 of 12", "warn"], ["Last two resets", "Missing strip each, unmentioned", "warn"], ["Known false reports", "None", "good"]],
  pause: "What should Eli learn about bringing you bad news?",
  question: "What do you do?",
  options: [
    { label: "Ask which two stores were hardest. Visit two. Say you check everyone's first resets.", quality: "best", strength: "verify", leans: "verify", feedback: "Curiosity shows belief, the visit confirms, and 'everyone' keeps it impersonal. Cost: an hour." },
    { label: "Ask for photos of all 12 today, as everyone's new standard.", quality: "good", leans: "verify", feedback: "Quick and fair. But it says nothing of trust, so he may feel watched." },
    { label: "Congratulate him; treat any buyer finding as a lesson.", quality: "good", leans: "trust", feedback: "Trust grows people. But the lesson may arrive from the buyer, in public, a third time." },
    { label: "Drive past four stores without telling him.", quality: "weak", pattern: "check", cost: "He finds out, and decides you never believed him.", feedback: "Secret checking turns it into a test he'll remember longer than the result." },
  ],
  reasoning: "Trust the person, check the work; say both out loud. The strongest does both at once, as a standard, not a suspicion.",
  principle: "Trust the person, check the work, check everyone alike.",
  then: "One store lacks a strip. Eli: “I thought it was done.” Now he sends photos unprompted.",
  nextMove: "Pick one status you accept on someone's word. Spot-check it if wrong is costly.",
},
```

#### 15. lock-that-isnt

```js
{
  id: "lock-that-isnt", who: "Sales manager (8 reps)", customer: "Dave, your most persuasive rep", channel: "off", category: "Better-for-you snacks",
  stage: "Review", skill: "trust", theme: "overconfidence", trade: ["trust", "verify"],
  algorithm: "prediction-vs-decision",
  picture: { kind: "forecast", left: "Your read", right: "Your commit", marks: [["e1", 50, "His locks: 2 of 4"], ["e2", 75, "Safeway: 3 of 4"], ["A", 50, "Half the deal"], ["B", 100, "All of it"], ["C", 0, "None yet"], ["D", 100, "All, plus a promise"]], after: "Share of the $120K you'd tell your director to count.", note: "percent of the $120K reset" },
  lens: { book: "Poor Charlie's Almanack", lesson: "Check the base rate and incentives behind a confident claim, not the feeling it gives you." },
  tension: { book: "Trillion Dollar Coach", lesson: "Withdrawing trust from a person has a cost." },
  voice: "Safeway is a lock. I've never been surer.",
  situation: "Dave calls a $120K Safeway reset a lock. Your director wants a committed number today. Last year he saved a quarter on a deal that looked dead, and his confidence lifts the whole team.",
  evidence: [["Dave's 'locks' this year", "4 called, 2 closed", "warn"], ["His Safeway record", "3 of 4 closed", "good"], ["What the buyer did", "Positive; no planogram date", "warn"]],
  pause: "Would Dave bet his own money on it?",
  question: "How do you forecast it?",
  options: [
    { label: "Ask what the buyer did, not said. Count Safeway at half.", quality: "best", strength: "verify", leans: "verify", feedback: "His confidence becomes information, and he can win with facts. Cost: some lift." },
    { label: "Commit Safeway at full value. His record is the team's best.", quality: "good", leans: "trust", feedback: "A real base rate, and real loyalty. But if it slips, your commit loses meaning upstairs." },
    { label: "Leave Safeway out until there's a planogram date.", quality: "good", leans: "verify", feedback: "Clean, and protects your credibility. But it ignores his record with this buyer." },
    { label: "Tell Dave you're counting on him and will hold him to it.", quality: "weak", pattern: "cheer", cost: "If it slips, the talk is about a promise.", feedback: "Sounds like trust, but turns confidence into a commitment resting on your hope." },
  ],
  reasoning: "Confidence is a feeling about a deal, what the buyer did is evidence, and his record is a base rate. The strongest keeps the three apart.",
  principle: "Confidence is a feeling. Evidence is what the buyer did.",
  then: "Safeway slips a quarter. Your commit holds. Dave's next “lock” arrives with a planogram date.",
  nextMove: "Tally each rep's 'locks' against closes. Show them quarterly.",
},
```

#### 16. team-agrees

```js
{
  id: "team-agrees", who: "Sales manager (7 reps)", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Decide", skill: "trust", theme: "fears", trade: ["openness", "speed"],
  algorithm: "bayesian-updating",
  picture: { kind: "belief", left: "They disagree", right: "They agree", marks: [["start", 60, "They usually agree"], ["e1", 85, "0 of 7 objected"], ["e2", 45, "2 hallway comments"], ["e3", 30, "Last pushback snapped"]], after: "Belief they agree, one row at a time.", note: "directions follow each row; sizes are illustrative, so draw the bar with no percent" },
  lens: { book: "How Google Works", lesson: "Build an environment where people can safely say what they think." },
  tension: { book: "Poor Charlie's Almanack", lesson: "Disagreement tests a plan against views you don't have." },
  voice: "Sounds good to me.",
  situation: "Monday you proposed moving Q4 promo dollars to your three biggest accounts. Nobody objected. In the hallway, Mira said her two smaller accounts counted on them. Plan due Thursday.",
  evidence: [["Objections in meeting", "0 of 7", "warn"], ["Hallway comments", "2 reps", "warn"], ["Last pushback", "You snapped: 'Been through this'", "bad"]],
  pause: "What does disagreeing with you cost a rep?",
  question: "What do you do?",
  options: [
    { label: "Reopen it. Own how you cut off pushback, and ask what's missing.", quality: "best", strength: "own", leans: "openness", feedback: "You owned the silence and made speaking up safe. Cost: some face and a day." },
    { label: "Talk to the two reps one-on-one and adjust quietly.", quality: "good", leans: "speed", feedback: "Fast, and no awkwardness. But the room learns nothing about disagreeing safely." },
    { label: "Send an anonymous survey on what the plan might miss.", quality: "good", leans: "openness", feedback: "Safe and quick. But it needs a survey because of how you reacted last time." },
    { label: "Proceed. Silence was agreement.", quality: "weak", pattern: "assume", cost: "Mira's accounts lose out, and so does her trust.", feedback: "No objection feels like a green light. A team that never disagrees is telling you something." },
  ],
  reasoning: "Silence after a proposal says something about the room, not the plan. Reopening costs a day; the quiet costs Mira. Repair the cause by naming it.",
  principle: "Silence isn't agreement. Ask what disagreeing with you costs.",
  then: "Three speak up; one spots a committed budget. You move $15K to Mira. Next Monday, someone disagrees early.",
  nextMove: "Ask “what's the weakest part of this plan?” and wait out the silence.",
},
```

#### 17. one-explanation

```js
{
  id: "one-explanation", who: "Sales manager (8 reps)", customer: "Karen, a six-year rep", channel: "off", category: "Crackers",
  stage: "Review", skill: "trust", theme: "fears", trade: ["patience", "results"],
  algorithm: "bayesian-updating",
  picture: { kind: "belief", left: "Not coasting", right: "Coasting", marks: [["start", 70, "Your instinct"], ["e1", 75, "Sales down 18%"], ["e2", 45, "Territory re-cut"], ["e3", 30, "Pay plan changed"], ["e4", 20, "Visits unchanged"]], after: "Belief she's coasting, one row at a time.", note: "directions follow each row; sizes are illustrative, so draw the bar with no percent" },
  lens: { book: "Poor Charlie's Almanack", lesson: "Check situation, incentive and numbers before you settle on a story about a person." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "A certainty about someone may be a story you've told before." },
  voice: "I'm working as hard as ever. The accounts just don't respond.",
  situation: "Karen's sales are down 18% in two quarters, and you suspect she's coasting; you've seen it before. In January her territory was re-cut and her pay plan changed. She's gone quiet.",
  evidence: [["Sales", "−18% in two quarters", "bad"], ["January re-cut", "-2 top accounts, +40 far stores", "warn"], ["New pay plan", "Pays on margin; hers earn less", "warn"], ["Store visits", "Same as last year", "good"]],
  pause: "What would you see if it weren't effort?",
  question: "What do you do first?",
  options: [
    { label: "Compare her numbers with the re-cut and pay plan, then ask her.", quality: "best", strength: "ask", leans: "patience", feedback: "You test your story before asking. Cost: a few days; you may still be right." },
    { label: "Have the effort talk anyway. If you're wrong, she'll say.", quality: "good", leans: "results", feedback: "Candid. But she may hear an accusation and shut down." },
    { label: "Ask your director if the re-cut and pay plan are fair first.", quality: "good", leans: "patience", feedback: "Looks at the system. But Karen waits, and may read silence as a verdict." },
    { label: "Put her on a 30-day activity plan.", quality: "weak", pattern: "label", cost: "Activity was never the problem.", feedback: "Feels fair, but measures what she already does." },
  ],
  reasoning: "The familiar story is often right, which makes it dangerous. A re-cut, a pay change or tiredness also fit. Widen the picture, then ask.",
  principle: "Before you explain a person, rule out the situation.",
  then: "Her margin per case is up 11%; the plan underpaid it. You adjust it.",
  nextMove: "When numbers move, list three causes that aren't the person.",
},
```

### Track 5 · Lead yourself

#### 18. q4-fatigue

```js
{
  id: "q4-fatigue", who: "Sales manager (8 reps)", customer: "You", channel: "off", category: "Portfolio",
  stage: "Recover", skill: "self", theme: "rest", trade: ["drive", "rest"],
  algorithm: "multi-armed-bandits",
  picture: { kind: "hours", left: "Work", right: "Rest and people", marks: [["e1", 21, "5 of 24 hours asleep"], ["A", 42, "8 hours, Thursday kept"], ["B", 25, "Grind, then January"], ["C", 22, "Shared load, same sleep"], ["D", 21, "Same as now"]], after: "Share of the day for rest and people.", note: "21 is 5 of 24 hours, from the evidence; other shares are assumptions" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "How rested and reactive you are is part of the result you produce." },
  tension: { book: "How Google Works", lesson: "A team that knows the situation can carry some of the load." },
  voice: "You've been up since four again.",
  situation: "Second week of December. Five hours' sleep a night since Halloween, six points short of plan. Yesterday you snapped at a rep over a typo, and you can't recall what you promised the Kroger buyer Tuesday.",
  evidence: [["Sleep, six weeks", "About 5 hours a night", "bad"], ["Your quarter", "94% of plan; three weeks left", "warn"], ["Thursday 5:30pm", "Son's concert; you missed the last", "warn"]],
  pause: "What would you tell your best rep in your seat?",
  question: "What do you do?",
  options: [
    { label: "Apologize to the rep, cut to three moves, keep Thursday and sleep.", quality: "best", strength: "rest", leans: "rest", feedback: "You repair the damage and protect what keeps you sharp. Cost: hours that might close a point." },
    { label: "Push to year-end with a stop date, then four days off.", quality: "good", leans: "drive", feedback: "A finish line beats an open-ended grind. But tired decisions land in the weeks that count." },
    { label: "Tell the team you're stretched; ask each to take one thing.", quality: "good", leans: "team", feedback: "Honest, and it lightens workload. But sleep is untouched, and the apology's still owed." },
    { label: "Keep this pace through the 31st.", quality: "weak", pattern: "grind", cost: "You misplace another promise, and your best rep stops bringing bad news.", feedback: "Example is a real value. But what's running low is judgment." },
  ],
  reasoning: "Extra hours look free; the forgotten promise, the snap and the quiet reps are the invoice. Choose a smaller list, an apology, and the evening.",
  principle: "Tired is a business risk. Protect rest like a key account.",
  then: "You apologize; he admits hiding a miss. You fix Kroger by phone, make Thursday, finish at 98%.",
  nextMove: "Block next week's non-negotiables first: sleep, one evening, one meal.",
},
```

#### 19. defensive-in-review

```js
{
  id: "defensive-in-review", who: "Regional sales manager", customer: "Your director", channel: "off", category: "Sparkling water",
  stage: "Review", skill: "self", theme: "overconfidence", trade: ["confidence", "humility"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Confidence", right: "Humility", marks: [["A", 75, "One sentence, then ask"], ["B", 35, "Facts, own it last"], ["C", 60, "Take the afternoon"], ["D", 5, "Outside causes"]], after: "Four ways into the same moment.", note: "position only" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice ego and defensiveness, and take responsibility before you explain." },
  tension: { book: "Trillion Dollar Coach", lesson: "A leader who can be coached questions their own results first." },
  voice: "The Q3 endcap program missed badly. Walk me through it.",
  situation: "Your director opens the review: promo return 0.7x against a plan of 1.2x, on your program. Your face heats up. You have reasons ready, and most are true. Two peers are watching.",
  evidence: [["Promo return", "0.7x · plan 1.2x", "bad"], ["Your reasons", "Supply, rules, cut weeks (true)"], ["What you skipped", "Second-tier market velocity", "warn"]],
  pause: "What would your best rep say first?",
  question: "What do you say?",
  options: [
    { label: "Say “I championed it, and it missed.” Ask her view. Name two changes.", quality: "best", strength: "own", leans: "humility", feedback: "Ownership in a sentence, then learning before explanations. Cost: pride in front of peers." },
    { label: "Give facts in order: expected, changed, learned. Own the call last.", quality: "good", leans: "confidence", feedback: "Clear and true. But said first they sound like excuses." },
    { label: "Ask for the afternoon with the data; answer tomorrow.", quality: "good", leans: "humility", feedback: "Wise to think first. But it can read as avoidance." },
    { label: "List the three outside causes; note finance approved.", quality: "weak", pattern: "defend", cost: "Your peers learn what you do when wrong.", feedback: "True, which tempts. But it turns a review into a defense of you." },
  ],
  reasoning: "They feel like opposites under heat. They aren't: one plain sentence of ownership earns you the right to make your case.",
  principle: "Own it in one sentence before you explain it.",
  then: "She nods: “I know about supply. I wanted to hear the first part.” The review moves to Q1.",
  nextMove: "Write the one sentence you'd say after a miss. Say it aloud.",
},
```

#### 20. miss-the-field

```js
{
  id: "miss-the-field", who: "Sales manager (7 reps)", customer: "You and your team", channel: "off", category: "Refrigerated juice",
  stage: "Plan", skill: "self", theme: "love", trade: ["joy", "leverage"],
  algorithm: "optimization",
  picture: { kind: "curve", left: "No Saturdays", right: "All nine", marks: [["A", 33, "One a month"], ["B", 20, "Ask first"], ["C", 100, "All nine, plus Sundays"], ["D", 0, "No store work"], ["bend", 33, "Doing it for them"]], after: "Each extra Saturday in stores buys less.", note: "9 Saturdays = 100; one a month is about 3 of 9; curve shape is not data" },
  lens: { book: "High Output Management", lesson: "A manager's output is the team's output; spend time where it multiplies others." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "What energizes you is information; use it rather than fight it." },
  voice: "Want to hit a few stores Saturday? Like old times?",
  situation: "Most Saturdays you build displays with your reps. You love it, and compliance is higher where you go. But roll-ups run late, two reps have had no one-on-one in five weeks, and one asked to run a reset alone.",
  evidence: [["Saturdays in stores", "9 last quarter"], ["Compliance where you go", "+8 points", "good"], ["Missed one-on-ones", "2 reps · 5 weeks", "bad"]],
  pause: "Who pays when your hours go to what you love?",
  question: "What do you do with Saturdays?",
  options: [
    { label: "Keep one store morning a month, a rep leading. Rest to one-on-ones.", quality: "best", strength: "develop", leans: "leverage", feedback: "What you love, aimed at teaching. Cost: most Saturdays, and displays unlike yours." },
    { label: "Ask the team; step back if they can run resets alone.", quality: "good", leans: "leverage", feedback: "Sound, and it respects them. But learning takes weeks while one-on-ones wait." },
    { label: "Keep Saturdays; catch up Sunday night.", quality: "weak", pattern: "grind", cost: "By October Sunday nights are gone too.", feedback: "Sounds like dedication, but those things were already slipping." },
    { label: "Stop store work. A manager's time has a price.", quality: "weak", pattern: "rule", feedback: "Boundaries help. But as a rule it removes what fuels you, and your reps lose their best teacher." },
  ],
  reasoning: "Doing it for your team keeps them dependent. Doing it with a rep leading turns the same hours into leverage.",
  principle: "Keep what you love, and use it to make someone better.",
  then: "On your Saturday, Pri leads a six-store reset while you carry the ladder. Roll-ups arrive on time.",
  nextMove: "Book the two overdue one-on-ones before your next store day.",
},
```

#### 21. vacation-text

```js
{
  id: "vacation-text", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Salty snacks",
  stage: "Recover", skill: "self", theme: "rest", trade: ["rest", "speed"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Rest", right: "Speed", marks: [["A", 30, "One reply, then daily"], ["B", 50, "Quick yes, noon check"], ["C", 95, "Answer everything"], ["D", 10, "Phone off, no cover"]], after: "Four ways to spend a week off.", note: "position only" },
  lens: { book: "How Google Works", lesson: "Give people context and authority so they don't need you reachable." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice whether availability serves the work or your need to be needed." },
  voice: "Sorry on PTO. Safeway wants an answer on the BOGO. Thoughts?",
  situation: "Day two of your first week off in two years. A rep texts about a $4,000 promo inside his own limit. Yesterday brought four such texts, and you answered in minutes. Tasha is cover; nobody told her what that means.",
  evidence: [["Texts yesterday", "4, all inside limits", "warn"], ["Your reply time", "Under 10 minutes", "warn"], ["At home", "Partner wants the phone away", "warn"]],
  pause: "If you never replied, who would decide?",
  question: "What do you do?",
  options: [
    { label: "Reply once: “Inside your limit. Decide, tell Tasha.” Then check daily.", quality: "best", strength: "boundary", leans: "rest", feedback: "The decision returns to who holds it, and your rhythm holds. Cost: the rush of being needed." },
    { label: "Quick yes; tell the team Tasha has the keys; check at noon.", quality: "good", leans: "speed", feedback: "Moves Safeway and fixes the system. But it's one more reply feeding the habit." },
    { label: "Answer everything. The quarter matters.", quality: "weak", pattern: "grind", cost: "Your week off still runs through you.", feedback: "Care is real. But the team still can't decide alone, and nothing restores." },
    { label: "Switch the phone off without a word.", quality: "weak", pattern: "drop", feedback: "Rest is right. But Tasha doesn't know what she covers." },
  ],
  reasoning: "The texts are a symptom: you answer fast, so they ask. The strongest returns the decision with context, then sets a boundary you can keep.",
  principle: "Rest works when the team knows who decides.",
  then: "He decides and tells Tasha; Safeway has a yes by lunch. By day four, no texts.",
  nextMove: "Before time off, write who decides what, who covers, and what justifies a call.",
},
```

#### 22. sure-of-the-plan

```js
{
  id: "sure-of-the-plan", who: "Regional sales manager", customer: "Your region", channel: "off", category: "Cold brew coffee",
  stage: "Plan", skill: "self", theme: "overconfidence", trade: ["confidence", "openness"],
  algorithm: "prediction-vs-decision",
  picture: { kind: "forecast", left: "Your confidence", right: "Your commitment", marks: [["e1", 100, "3 of 3 launches"], ["e2", 78, "22% fewer reps"], ["A", 15, "Pilot: 15%"], ["B", 40, "40%, week-6 review"], ["C", 0, "Wait a week"], ["D", 40, "All in: 40%"]], after: "How sure you are, and what each answer commits.", note: "commits are percent of selling effort; 78 is 100 minus 22" },
  lens: { book: "Poor Charlie's Almanack", lesson: "The surer you are, the more base rates you should bring." },
  tension: { book: "Trillion Dollar Coach", lesson: "Ask questions that let the team improve the plan, not defend it." },
  voice: "No questions? Great. Let's go.",
  situation: "You'll move 40% of selling hours to a cold brew launch. Your last three launches worked and you're sure. Reps stayed silent; finance asked about distributor incentives, and you answered in ten seconds.",
  evidence: [["Your launches", "3 of 3 hit year one", "good"], ["This distributor", "22% fewer reps than before", "warn"], ["Effort shifted", "40% of hours", "warn"]],
  pause: "What would show you were wrong in 30 days?",
  question: "What do you do first?",
  options: [
    { label: "Pilot 15% of effort in three markets for eight weeks; write stop rules first.", quality: "best", strength: "ask", leans: "openness", feedback: "Conviction made testable, with stop rules set first. Cost: a couple of months." },
    { label: "Go ahead, but list three ways it could fail and review at week six.", quality: "good", leans: "openness", feedback: "Keeps momentum. But week six comes after 40% has moved." },
    { label: "Delay a week; talk to two managers with weaker distributors.", quality: "good", leans: "confidence", feedback: "Worth a week. But two stories can feel like proof." },
    { label: "Go all in. Hesitating signals doubt.", quality: "weak", pattern: "defend", cost: "At week six weak-distributor markets lag by half.", feedback: "Conviction matters. But silence is a reason to ask, not to speed up." },
  ],
  reasoning: "Three wins is a real record, but this launch differs. Sureness is a feeling; a small test with a stop rule is its cheapest cure.",
  principle: "When you're most sure, look hardest for how you're wrong.",
  then: "Week six: weak-distributor pilots lag by half. You scale where it works, losing a month, not a year.",
  nextMove: "Before a big plan, write what you'd see in 30 days if you're wrong.",
},
```

### Track 6 · Manage up and across

#### 23. friday-6pm-email

```js
{
  id: "friday-6pm-email", who: "Sales manager (8 reps)", customer: "Your VP", channel: "off", category: "Portfolio",
  stage: "Decide", skill: "across", theme: "rest", trade: ["rest", "drive"],
  algorithm: "value-of-information",
  picture: { kind: "check", left: "Decide now", right: "Ask first", marks: [["worth", 100, "10 hours of weekend"], ["cost", 2, "One email"], ["A", 100, "Reply with a question"], ["B", 0, "Promise Monday"], ["C", 0, "Saturday data pull"], ["D", 0, "Cancel dinner"]], after: "One question, against ten hours of weekend.", note: "10 hours is the with-team estimate from the evidence" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Respond from a clear head, not from alarm." },
  tension: { book: "How Google Works", lesson: "Asking why a request exists is part of giving context." },
  voice: "Need a store-level recovery plan for the Q4 shortfall Monday 8am.",
  situation: "At 6:10 Friday your VP sends that note. Your team just finished a brutal week, and your anniversary dinner is at 7:30. She rarely asks for things, and last time you pushed back you worried for weeks.",
  evidence: [["The ask", "Plan by Monday 8am"], ["Work needed", "4 hours alone; 10 with team", "warn"], ["Her pattern", "Asks Friday, reads Tuesday", "warn"]],
  pause: "What is the deadline for? Do you know?",
  question: "What do you do?",
  options: [
    { label: "Reply: “What decision does Monday make? First cut at 8, full plan Wednesday.”", quality: "best", strength: "ask", leans: "rest", feedback: "Yes, plus the question that matters and a staged answer. Cost: nerve; she may want it all." },
    { label: "Promise Monday 8am. Work it alone on Sunday.", quality: "good", leans: "drive", feedback: "You protect the team without a negotiation. But every late Friday email now earns a weekend." },
    { label: "Promise Monday; two reps pull data Saturday for comp time.", quality: "weak", pattern: "please", cost: "Two reps lose a Saturday for a plan read Tuesday.", feedback: "Kind, but it passes your Friday problem to a tired team, unchecked." },
    { label: "Cancel dinner and work the weekend with the team.", quality: "weak", pattern: "grind", feedback: "Dedication is real. But the weekend rests on a guess." },
  ],
  reasoning: "Rest and drive are both owed, and a clear head serves both. Neither push back nor cave: ask one question, offer a first cut, and let her answer.",
  principle: "Ask what a deadline is for before giving up a weekend.",
  then: "She replies in four minutes: “First cut is fine. It's for Wednesday's CEO call.” Nobody loses a Saturday.",
  nextMove: "When a deadline lands late, ask what decision it supports.",
},
```

#### 24. number-you-cant-hit

```js
{
  id: "number-you-cant-hit", who: "Regional sales manager", customer: "Your VP", channel: "off", category: "Portfolio",
  stage: "Plan", skill: "across", theme: "fears", trade: ["candor", "team"],
  algorithm: "prediction-vs-decision",
  picture: { kind: "forecast", left: "Honest range", right: "Your commitment", marks: [["e1", 91, "Year to date"], ["e2", 94, "Likely case"], ["A", 94, "Range, with drivers"], ["B", 94, "Range, a week late"], ["C", 96, "Best case"], ["D", 100, "'We'll get there'"]], after: "Your honest range, against each number committed.", note: "percent of plan; draw the scale from 90 to 100" },
  lens: { book: "What the CEO Wants You to Know", lesson: "A range with drivers is something the business can act on; a bare promise isn't." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice the fear in your body before it writes your answer." },
  voice: "Are we good for the year? I tell the CEO Thursday.",
  situation: "At 91% with six weeks left, your region has two resets slipped to Q1, an overstocked distributor and a competitor price cut. The plan is 100%.",
  evidence: [["Honest range", "94% likely; 96% at best", "bad"], ["Your VP last month", "'No more region misses'", "warn"], ["What you fear", "Being first to say it", "warn"]],
  pause: "What would your VP want to know, and when?",
  question: "What do you tell her?",
  options: [
    { label: "Tell her now: likely 94, best 96, with drivers and your ask.", quality: "best", strength: "whole", leans: "candor", feedback: "Range, reasons and an ask while she can use them. Cost: one uncomfortable minute." },
    { label: "Tell your team first and give them a week to close the gap.", quality: "good", leans: "team", feedback: "Respects them. But Thursday is the CEO call, and she'll learn you knew." },
    { label: "Give her 96% with drivers; mention 94% as the risk.", quality: "good", leans: "confidence", feedback: "Truthful. But she plans on 96 and carries 94 to the CEO as a surprise." },
    { label: "Say “we'll get there” and commit to 100%.", quality: "weak", pattern: "overpromise", cost: "Three weeks on you're at 93; the CEO was told 100.", feedback: "Fear is real. But a number you don't believe leads to a bigger miss." },
  ],
  reasoning: "The fear points the wrong way. Bad news worsens with holding; a range with reasons is something a VP can plan with.",
  principle: "Bad news worsens weekly. Bring the range, the drivers, the ask.",
  then: "“I can work with 94. I can't work with a surprise.” She takes 94 to the CEO. You land at 95.",
  nextMove: "Write today's honest range and its drivers. Send it before anyone asks.",
},
```

#### 25. reorg-rumor

```js
{
  id: "reorg-rumor", who: "Regional sales manager", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Recover", skill: "across", theme: "trust", trade: ["candor", "follow"],
  algorithm: "utility-and-trade-offs",
  picture: { kind: "axis", left: "Tell all", right: "Tell nothing", marks: [["A", 40, "Talk exists, no details"], ["B", 75, "Nothing until Friday"], ["C", 55, "Two hear all"], ["D", 100, "Denies what you know"]], after: "How much each answer tells the team.", note: "position only" },
  lens: { book: "How Google Works", lesson: "Transparency is part of the environment; people handle uncertainty better than hiding." },
  tension: { book: "Poor Charlie's Almanack", lesson: "Think about what each person will do when they hear it." },
  voice: "Is it true? I heard they're merging us with the East.",
  situation: "A peer says HQ is studying a regional merger. Nothing is decided, and you were asked to keep it private. Two top reps ask you directly. In March you said no changes were planned.",
  evidence: [["What you know", "Studied; no decision, no date"], ["Risk", "Top rep has a recruiter call", "bad"], ["Your own worry", "Your job may change too", "warn"]],
  pause: "Will they remember what you said, or that you said it?",
  question: "What do you tell them?",
  options: [
    { label: "Say it straight: talk exists, nothing's decided, you can't share details yet.", quality: "best", strength: "candor", leans: "candor", feedback: "True about what you know and can't say. Cost: no clean denial." },
    { label: "Ask your VP first what you may say; promise an answer Friday.", quality: "good", leans: "follow", feedback: "Keeps the confidence. But two silent days while a recruiter calls." },
    { label: "Tell your two top reps privately; ask them to keep quiet.", quality: "weak", pattern: "please", cost: "The team splits into two classes.", feedback: "Real worry, wrong fix: choosing who gets the truth turns a rumor into a rift." },
    { label: "Deny it: “No changes planned.” It was true in March.", quality: "weak", pattern: "soften", feedback: "Spares everyone a hard few weeks. But now you know otherwise; it's a lie by omission." },
  ],
  reasoning: "You owe HQ discretion and your team honesty; both fit if you're precise. Say what's true, what you don't know, and when that changes.",
  principle: "Say what you can and can't. Never say what isn't so.",
  then: "Three reps thank you. The one with the recruiter call stays: “If you'd said nothing, I'd have left.”",
  nextMove: "Write three sentences: what you know, what you don't, when you'll update.",
},
```

#### 26. win-that-costs-supply

```js
{
  id: "win-that-costs-supply", who: "Lead rep (no title)", customer: "Your regional chain account", channel: "off", category: "Sparkling water",
  stage: "Decide", skill: "across", theme: "teamwork", trade: ["results", "team"],
  algorithm: "decision-trees",
  picture: { kind: "tree", left: "Decide together", right: "Decide alone", marks: [["A", 0, "Both on one table"], ["B", 100, "Run yours, move West"], ["C", 100, "Move yours alone"], ["D", 100, "Lock the date first"], ["Ln", 40, "A week of meetings"], ["Lq", 15, "Both numbers seen"], ["Rn", 10, "Win feels done"], ["Rq", 70, "West slips, ops surprised"]], after: "Cost of each branch. Gross profit: yours about $56K, West's about $86K.", note: "costs are position only; $56K is $180K at 31%, $86K is $240K at 36%" },
  lens: { book: "What the CEO Wants You to Know", lesson: "Judge a win by what it does to the company's margin, cash and capacity." },
  tension: { book: "How Google Works", lesson: "Share context early so the people affected can solve it with you." },
  voice: "Great work. Lock it in before they change their mind.",
  situation: "You're a lead rep who just won a $180K BOGO. Then ops says the plant is 98% booked that window, and West's bigger launch needs the capacity. You told the buyer “I think we're good.” Nothing's in writing.",
  evidence: [["Your win", "$180K · 31% margin", "good"], ["West's launch", "$240K · 36% margin", "warn"], ["Your bonus", "Counts yours, not theirs", "warn"]],
  pause: "Whose call is it which one runs?",
  question: "What do you do?",
  options: [
    { label: "Bring supply chain and West's lead together with both programs' numbers.", quality: "best", strength: "whole", leans: "team", feedback: "Early, with both sides' numbers, in front of the owners. Cost: control; your win may move." },
    { label: "Run yours; you earned it and gave your word. Ask West to shift.", quality: "good", leans: "follow", feedback: "Your word matters. But you've set the company's priority yourself." },
    { label: "Offer to move yours; West's margin is higher.", quality: "good", leans: "team", feedback: "Generous. But you decided alone, before knowing the buyer would move." },
    { label: "Get the buyer's date in writing first, then tell ops.", quality: "weak", pattern: "lock", cost: "West slips, and ops learns after the buyer has it in writing.", feedback: "Securing the win is sensible. But signing first takes the choice from the owners." },
  ],
  reasoning: "Your win may be the business's loss, and you may be the only one seeing both. Put both side by side with the owners.",
  principle: "A win that costs another team isn't yet the company's win.",
  then: "Supply chain finds 15% more capacity. Your BOGO runs a week later, West holds, the buyer agrees.",
  nextMove: "Before closing a big deal, ask who else needs what it uses.",
},
```

### Track 7 · Grow people

#### 27. rookie-overpromises

```js
{
  id: "rookie-overpromises", who: "Sales manager (6 reps)", customer: "Jamal, four months in", channel: "off", category: "Protein bars",
  stage: "Coach", skill: "grow", theme: "follow-through", trade: ["growth", "results"],
  algorithm: "exploration-vs-exploitation",
  picture: { kind: "hours", left: "You (proven)", right: "Jamal (rookie)", marks: [["A", 80, "Jamal calls, you sit in"], ["B", 10, "You call, then debrief"], ["C", 20, "Rule: wait for you"], ["D", 100, "Jamal alone, Friday"]], after: "How much of the repair Jamal carries, and who stands beside him.", note: "position only" },
  lens: { book: "High Output Management", lesson: "Teach a clear check before the commitment, so quality doesn't depend on catching it later." },
  tension: { book: "Trillion Dollar Coach", lesson: "Be beside talented people, not instead of them." },
  voice: "I promised the buyer 20 more stores and a display by Friday. Wrong?",
  situation: "Jamal, four months in, promised a Sprouts buyer more stores and a display by Friday without checking. The distributor can't deliver it. He's told you he fears he's “not cutting it.”",
  evidence: [["The promise", "20 stores, display, Friday"], ["What's possible", "8 stores; display next week", "warn"], ["The buyer", "Three years; keeps a list", "good"]],
  pause: "Whose call is this, and who learns most from it?",
  question: "What do you do?",
  options: [
    { label: "Spend 20 minutes on what's deliverable. He calls the buyer; you sit in.", quality: "best", strength: "develop", leans: "growth", feedback: "He fixes his own promise, with a net. Cost: 20 minutes." },
    { label: "Call the buyer yourself with the corrected plan, then debrief him.", quality: "good", leans: "results", feedback: "Certain for the customer. But Jamal watches you repair his mistake." },
    { label: "Tell him nobody promises dates without your approval.", quality: "weak", pattern: "rule", cost: "Reps wait for you, even on easy things.", feedback: "Natural. But it grows your queue, and he still hasn't made the repair." },
    { label: "Let him find out Friday. He'll remember.", quality: "weak", pattern: "drop", feedback: "The buyer pays for the lesson, and a doubting rookie may learn the wrong one." },
  ],
  reasoning: "Eagerness is a good rep's flaw. The buyer needs the truth by Friday; Jamal needs to be the one who says it.",
  principle: "Whoever made the promise fixes it, with you beside them.",
  then: "Jamal: “I overreached. Here's what I can do Friday.” The buyer thanks him. Now he texts: “Sanity check?”",
  nextMove: "Write three questions to ask before promising a date, number or display.",
},
```

#### 28. quiet-says-fine

```js
{
  id: "quiet-says-fine", who: "Sales manager (7 reps)", customer: "Hana, a strong third-year rep", channel: "off", category: "Hummus",
  stage: "Coach", skill: "grow", theme: "fears", trade: ["patience", "candor"],
  algorithm: "bayesian-updating",
  picture: { kind: "belief", left: "She's not fine", right: "She's fine", marks: [["start", 75, "Strong rep, on plan"], ["e1", 85, "103% of plan"], ["e2", 40, "Asked about moving"], ["e3", 30, "Five fines, moved on"]], after: "Belief she's fine, one row at a time.", note: "directions follow each row; sizes are illustrative, so draw the bar with no percent" },
  lens: { book: "Trillion Dollar Coach", lesson: "Good questions and real attention are how you learn what's going on with people." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Be curious about what you've avoided asking." },
  voice: "I'm fine. Really.",
  situation: "Hana used to push back hard in meetings. For six weeks she's been quiet, on plan, and saying “fine.” You're slammed, and you've let five fines pass.",
  evidence: [["Hana's numbers", "103% of plan", "good"], ["Yesterday", "Asked about moving, then withdrew", "warn"], ["Last five one-on-ones", "'Fine'; you moved on", "warn"]],
  pause: "What haven't you asked because you fear the answer?",
  question: "What do you do?",
  options: [
    { label: "Ask: “You asked about moving, then dropped it. What's behind that?” Block an hour.", quality: "best", strength: "ask", leans: "candor", feedback: "About what she actually raised, with room. Cost: an hour; she may still say fine." },
    { label: "Say you've noticed she seems different, and you're around.", quality: "good", leans: "patience", feedback: "Respects her space. After five fines, she hasn't been asked anything she can answer." },
    { label: "Take her numbers as the answer. She's on plan.", quality: "weak", pattern: "assume", cost: "She transfers in January; you hear why secondhand.", feedback: "'Fine' deserves respect. But the transfer question is how people test the water." },
    { label: "Flag her to your director as a retention risk.", quality: "weak", pattern: "pass", feedback: "Smart to share. But it skips Hana, who knows what's going on." },
  ],
  reasoning: "Patience waits to be invited; candor invites. After five fines, she likely needs the invitation. Ask about what she raised.",
  principle: "A rep who says “fine” five times is telling you something.",
  then: "Her buyer of two years left; her work felt invisible. You credit her win, and she's arguing again.",
  nextMove: "Ask the rep you've asked “how are you?” three times: “What's the least fun part of your week?”",
},
```

#### 29. ask-dont-answer

```js
{
  id: "ask-dont-answer", who: "Lead rep (mentoring a newer rep)", customer: "Ben, eight months in", channel: "off", category: "Better-for-you snacks",
  stage: "Coach", skill: "grow", theme: "trust", trade: ["speed", "growth"],
  algorithm: "value-of-information",
  picture: { kind: "check", left: "Tell him", right: "Ask him", marks: [["worth", 70, "His idea, not yours"], ["cost", 10, "15 minutes tomorrow"], ["A", 100, "Ask first, compare"], ["B", 20, "Tell, then why"], ["C", 15, "Tell now, ask later"], ["D", 0, "Ten-minute lecture"]], after: "Fifteen minutes, against what Ben could bring.", note: "position only; 4 asks in six weeks and the Thursday deadline are from the evidence" },
  lens: { book: "Trillion Dollar Coach", lesson: "Ask more than you tell; the best answer is the one they find with you." },
  tension: { book: "High Output Management", lesson: "Time is scarce, and coaching has to fit the time you have." },
  voice: "What should I do about Safeway? Just tell me what you'd do.",
  situation: "Ben, eight months in, asks again what to do about Safeway cutting your facings from 4 to 3. You know the answer in ten seconds. He says he fears getting it wrong.",
  evidence: [["Ben's asks for answers", "4 in six weeks", "warn"], ["Ben's own plans", "Thin; he presents yours back", "warn"], ["Your time", "14 minutes; Safeway wants Thursday", "good"]],
  pause: "Which would Ben remember: your answer, or his?",
  question: "What do you say?",
  options: [
    { label: "Say: “Tell me yours first.” Book 15 minutes tomorrow to compare.", quality: "best", strength: "ask", leans: "growth", feedback: "His question becomes a question, with room. Cost: ten seconds, and some frustration." },
    { label: "Give your answer, then ask him why it works.", quality: "good", leans: "speed", feedback: "He gets the logic. But it's still your answer, and the next one comes to you." },
    { label: "Give the answer now; promise to ask him first next time.", quality: "good", leans: "speed", feedback: "Honest. But next time never comes, and you had two days." },
    { label: "Walk him through everything you know about Safeway.", quality: "weak", pattern: "lecture", cost: "He takes notes and sends the next question Friday.", feedback: "Generous. But he leaves with notes, not confidence." },
  ],
  reasoning: "A quick answer helps this week and teaches nothing; each confirms someone else gets it right. With two days, ask.",
  principle: "Ask first, answer second, and only if they're stuck.",
  then: "Ben counters with velocity by facing and adds an idea you hadn't thought of. He presents Thursday alone.",
  nextMove: "Next five times he asks, answer “what do you think?” first.",
},
```

#### 30. burned-out-star

```js
{
  id: "burned-out-star", who: "Regional sales manager", customer: "Zoe, your top rep", channel: "off", category: "Energy drinks",
  stage: "Review", skill: "grow", theme: "dedication", trade: ["results", "rest"],
  algorithm: "expected-value",
  picture: { kind: "ev", left: "Chance it lands", right: "What changes", marks: [["prize", 70, "Her health, two reps"], ["cost", 30, "Her pride"], ["A", 75, "Name it, own praise"], ["B", 35, "Team norm only"], ["C", 25, "Accept 'I love it'"], ["D", 0, "Bonus, no talk"]], after: "Odds each answer lands, against what changes.", note: "position only; 5 days off and the 2 reps matching her are from the evidence" },
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice what your own praise rewards, and own the culture it creates." },
  tension: { book: "Trillion Dollar Coach", lesson: "Honest feedback, even about something they're proud of, supports talented people." },
  voice: "I love it. Honestly, I'd rather be working than at home.",
  situation: "Zoe, your top rep, emails at midnight, took five days off all year, and just posted a record quarter. You praised her “giving everything” at the all-hands; a colleague winced.",
  evidence: [["Zoe's results", "131% of plan", "good"], ["Her last two emails", "Two errors she'd catch", "warn"], ["Reps matching her hours", "2", "bad"]],
  pause: "What are you teaching the team about what you notice?",
  question: "What do you do?",
  options: [
    { label: "Name the errors, hours and your praise. Ask what she wants. Suggest a week off.", quality: "best", strength: "own", leans: "candor", feedback: "You owned your part and asked a real question. Cost: her pride, perhaps a harder year-end." },
    { label: "Tell the whole team good means results, not midnight emails.", quality: "good", leans: "team", feedback: "Fixes the norm and corrects your message. But she may not apply it to herself." },
    { label: "Respect that she loves it; take small tasks off her plate.", quality: "good", leans: "rest", feedback: "Honors her choice. But it ignores the errors, the copycats and your praise." },
    { label: "Praise her more and add a bonus.", quality: "weak", pattern: "applaud", cost: "She keeps going, and so do two reps.", feedback: "Earned recognition. But a bonus pays for hours, and the team sees the rate." },
  ],
  reasoning: "Loving the work isn't being well. Your praise shaped the team, and the errors are early evidence. Say what you've seen, and own your part.",
  principle: "Celebrate results, not hours. Help people keep loving the work.",
  then: "Zoe: “I think I'm afraid of what happens if I stop.” She takes a week in January; no emails after 9pm.",
  nextMove: "Check the timestamps on your team's emails and yours. What do you reward?",
},
```

## 5. Further scenario seeds (not written out)

1. **Inheriting a buyer relationship.** The last manager made favors the norm: “Tom always took care of this.” History against a standard you can defend.
2. **Carrying a decision you disagree with.** HQ cuts trade funds 20% mid-quarter and your reps ask what you think.
3. **First review, feeling like an impostor.** Over-preparing and hiding the middling number, or saying where you're unsure.
4. **The rep who asks for a reference.** A strong rep is interviewing elsewhere. Loyalty to the team against letting people grow.
5. **A peer takes the credit.** Confront, let it go, or fix the incentive.
6. **Two reps fighting over an account.** Both have a fair claim. Decide now, or ask them to design the rule.
7. **The rep who reports a colleague.** A teammate is padding visits. Safety for the reporter, fairness to the accused.
8. **Promised no territory changes.** HQ is about to re-cut after you said it wouldn't happen.
9. **The big-win celebration.** A record month through a discount that hurt margin. Celebrate, correct, or both.
10. **A rep wants to step down.** A newly promoted rep admits they miss selling. Dedication against fit, and your part in the promotion.

## 6. Open questions for the author

1. **Written reflection.** Should each case end with an optional one-line box ("What would you actually say first?"), stored locally and never scored? It suits the pause but adds the site's first free-text input; check the CSP and store.
2. **Replays.** With defensible options, is a shuffled replay a fair test of changing your mind, or should Module 3 skip "Fixed" and offer a different prompt, such as "pick the option you'd regret least in a month"?
3. **HR territory.** Cases 2 (falsified records), 6 (a spouse's illness, with a "check actual policy with HR" aside that v2 moved here), 28 (a possible transfer) and 30 (overwork and health) touch HR, leave and privacy. Add a short disclaimer ("Check your company's policy; this is practice, not legal advice")? Should case 6 be reviewed by someone in HR before it ships?
4. **Scoring.** Is no headline percent, with "sound" and "strongest" counts and a values read-out, acceptable? It is the most visible difference from Modules 1 and 2.
5. **Role filter.** Should the hub filter by seat (`who`), or keep one mixed path so a rep sees what their manager faces?
6. **Picture before or after the pick.** Shown before the pick it hints (the dots show where the options sit and imply a best); shown only after, it explains. This draft shows the empty frame first and the marks after the pick, and lets belief bars move as evidence is tapped. Check and tree pictures nearly give away the strongest answer if shown early. Which does the author prefer, and should the frame itself be hidden until the pick?
