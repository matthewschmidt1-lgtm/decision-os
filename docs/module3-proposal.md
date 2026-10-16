# Module 3 · Management and accountability: design proposal

Status: proposal for the author's review. No code has been changed. Everything below is copy and data in the shape of `js/scenarios2.js`, ready to be ported once approved. All companies, people and figures are illustrative.

## 1. Overview

1. Module 1 trained judgment (what should I do?). Module 2 trained the conversation (what do I say, ask, give, get?). Module 3 trains the person who manages: what do I owe my people, my partners, my boss and myself?
2. The learner is a new or mid-level sales manager, a rep who leads without the title, or a director with reps, distributors and an HQ above. The `who` field on each case says which seat you are in.
3. The cases are CPG field life: a rep the buyers love who misses forecasts, a Friday 6pm email from the VP, a distributor rep you depend on, a number you know you can't hit, your own tired Q4.
4. Every case sets one value against another (candor and kindness, follow-through and flexibility, trust and verification, rest and drive, confidence and humility, a person and the team). The `trade` field names the pair.
5. At least two options are defensible in every case. The gap between the strongest and a "good" option is about how and when, not right and wrong. Weak options are the shortcuts a real manager takes under pressure: avoid, rescue, control, please, over-promise, defend, grind, tell, settle on one explanation.
6. Every case rests on one lesson from the six books on the author's site (the `lens`), and names a second lesson that pulls the other way (the `tension`), which is why the runner-up answer is defensible. Books are named in the data, never in the learner-facing copy.
7. Nine themes run through the set: personal values, teamwork, follow-through, fears and doubts, overconfidence, trust, love of the work, dedication, rest. Each appears at least three times.
8. Each case adds a one-sentence `pause`, a question to ask yourself before you pick, and at least one evidence row about the people involved (what they fear, what was promised, how long you've slept).
9. Seven tracks (3 to 5 cases each), seven skills, nine habit families, eleven strengths and a five-case challenge set.
10. Scoring recommendation: no headline percent. Count "sound" picks (best or good both count) and "strongest" picks separately, and report the values you lean on and the habits that show up under pressure. Reasons are in section 3.

## 2. Reference for the data

### 2.1 The six lessons the cases draw on

These are the author's insights from the books page, restated as one sentence each. Each case's `lens.lesson` is a case-specific version of one of these.

| Book | The lesson in one sentence |
|---|---|
| How Google Works | The environment you build (context, transparency, safety, room to decide) matters as much as who you hire, because it lets people act without waiting for permission. |
| The 15 Commitments of Conscious Leadership | How you show up matters as much as what you get done: own your reactions, stay curious, and notice when ego or defensiveness is driving. |
| Trillion Dollar Coach | The best leaders ask more than they answer, give honest feedback, and build trust so talented people can do their best work. |
| What the CEO Wants You to Know | Every function lives inside a business, so know where the money, margin and cash really come from before you decide anything. |
| Poor Charlie's Almanack | The more disciplines you bring to a problem (incentives, psychology, base rates), the less likely you are to mistake a familiar pattern for the whole picture. |
| High Output Management | Good results shouldn't depend on one person's heroics; leverage comes from clear expectations, sound process, useful measures and developing people. |

### 2.2 Changes to the scenario shape

Module 3 keeps Module 2's shape and adds or renames these fields. Everything else (`id`, `customer`, `channel`, `category`, `stage`, `skill`, `evidence`, `question`, `options`, `reasoning`, `principle`, `then`, `nextMove`) is unchanged, and `buyer` is renamed `voice`.

| Field | What it is |
|---|---|
| `who` | The learner's seat in this case: "Sales manager", "Director", "Lead rep (no title)". Used for a filter and the case header. |
| `theme` | One of: `values`, `follow-through`, `teamwork`, `fears`, `overconfidence`, `trust`, `love`, `dedication`, `rest`. |
| `trade` | The two values the case sets against each other, from the legend below. Not shown before the pick; shown in the Why layer. |
| `lens` | `{ book, lesson }`: the book the case is built from and a one-sentence paraphrase of the lesson. Shown in the Why layer only, as a small "From the reading" line. |
| `tension` | `{ book, lesson }`: a second lesson that pulls the other way. It is the reason the second-best option is defensible. Every case carries one. |
| `voice` | A line someone says to open the scene (a rep, the VP, a distributor). Replaces `buyer`. Not every case has one. |
| `pause` | One sentence: a question to ask yourself before choosing. Shown above the options. |
| `leans` | On best and good options only: which value of the `trade` pair (or a third value) the pick leans on. Feeds the "values you lean on" read-out. |

Value legend for `trade` and `leans`: `candor`, `kindness`, `person` (loyalty to a person), `team` (loyalty to the team), `trust`, `verify`, `rest`, `drive`, `confidence`, `humility`, `follow` (keeping a commitment), `flex` (flexibility), `speed`, `patience`, `integrity`, `results`, `growth`, `openness`, `joy` (love of the work), `leverage`.

Copy conventions used throughout: plain English, US spelling, second person, no framework names, no em dashes, option labels under 150 characters (checked), speech in curly quotes. Best-option positions are rebalanced by the same code as Module 2, so the order below is not the order learners see. Categories avoid beverage alcohol on purpose; no case here trades anything of value for a placement.

### 2.3 Stages

`stages3 = ["Set", "Coach", "Correct", "Review", "Decide", "Recover", "Plan"]`: where in the management cycle the case sits.

### 2.4 Skills

```js
export const skills3 = {
  standard: { name: "Standards", blurb: "Say what good looks like, and hold it for everyone.", strong: "You set the bar in plain words and hold it, including for people you like.", watch: "You tend to let a standard bend for people you like or numbers you need." },
  candor:   { name: "Candor", blurb: "Say the true thing, early, and kindly.", strong: "You say the hard thing early and plainly, and stay kind while you do.", watch: "You tend to soften or delay the hard thing until it is harder." },
  system:   { name: "Systems", blurb: "Build it so results don't depend on a hero.", strong: "You fix the process, not just the problem, and you give people context and limits.", watch: "You tend to fix it yourself, or lean on the one person who always delivers." },
  trust:    { name: "Trust and verify", blurb: "Give trust freely. Check what matters, the same way for everyone.", strong: "You trust the person and check the work, and say so out loud.", watch: "You tend to take confidence for evidence, or check people in ways they feel." },
  self:     { name: "Leading yourself", blurb: "Own your reactions, your fears and your rest.", strong: "You name your part first and protect the rest you need to think clearly.", watch: "You tend to defend, push through, or hold on to the work you love." },
  across:   { name: "Up and across", blurb: "Carry the truth up, the context down, and a fair view sideways.", strong: "You bring the range, the drivers and the ask, and you see the whole business.", watch: "You tend to promise upward, stay quiet across, or see only your own function." },
  grow:     { name: "Growing people", blurb: "Ask first. Help them get better, not just get it done.", strong: "You ask before you answer and let people make the call with you beside them.", watch: "You tend to answer fast, rescue, or take the quiet for the answer." },
};
```

### 2.5 Tracks

```js
export const tracks3 = [
  track("standard", "Set the standard", "What you allow becomes the rule. Say what good looks like, and hold it for the people you like.", ["loved-not-delivering", "top-rep-cuts-corners", "inherited-slack-habits", "exception-request"]),
  track("hard", "Have the hard conversation", "The kind thing and the true thing are rarely far apart. Find the version of each that lets you say both.", ["veteran-gone-quiet", "spouse-is-ill", "promoted-over-friend", "distributor-rep-slipped", "ready-for-promotion"]),
  track("system", "Build the system, not the hero", "If the same fix lands on your desk every week, it is a process and not a favor.", ["you-keep-rescuing", "hero-holds-the-account", "metrics-reward-the-wrong-thing", "context-not-permission"]),
  track("trust", "Trust and verify", "Confidence is a feeling. Agreement is not information. Evidence is something somebody did.", ["says-all-set", "lock-that-isnt", "team-agrees", "one-explanation"]),
  track("self", "Lead yourself", "Your tiredness, your pride and the work you love are all part of the job.", ["q4-fatigue", "defensive-in-review", "miss-the-field", "vacation-text", "sure-of-the-plan"]),
  track("up", "Manage up and across", "Carry the truth up, the context down, and the whole business into every decision.", ["friday-6pm-email", "number-you-cant-hit", "reorg-rumor", "win-that-costs-supply"]),
  track("grow", "Grow people", "Ask before you answer. Be beside them when they try.", ["rookie-overpromises", "quiet-says-fine", "ask-dont-answer", "burned-out-star"]),
];
export const challengeIds3 = ["loved-not-delivering", "you-keep-rescuing", "q4-fatigue", "number-you-cant-hit", "ask-dont-answer"];
```

The challenge set takes five tracks' worth of different tensions: candor with a person you like, rescuing, your own rest, bad news upward, and asking instead of telling. Round two should build from the learner's weakest skill and the habit family they hit most, as in Module 2.

### 2.6 Habit families and patterns (what a weak pick reveals)

```js
export const families3 = {
  rescue:  { name: "Rescuing", coach: "You step in and fix it yourself. It works today and teaches the team to wait for you." },
  avoid:   { name: "Avoiding", coach: "You wait, soften, or hand it off. The conversation you skip is usually the one that matters." },
  control: { name: "Controlling", coach: "You reach for a rule, a check or a consequence where a conversation would do." },
  please:  { name: "Pleasing", coach: "You protect how people feel about you, or decide for them what they can handle." },
  promise: { name: "Over-promising", coach: "You commit, or cheer for a commitment, past what the evidence supports." },
  blame:   { name: "Defending", coach: "You explain, defend, or point elsewhere before you have said what is yours." },
  grind:   { name: "Grinding", coach: "You answer pressure with more hours, yours or theirs, and call it dedication." },
  tell:    { name: "Telling", coach: "You give the answer, the plan or the lecture before you have asked." },
  narrow:  { name: "One explanation", coach: "You settle on the first story that fits, about a person or a situation, and stop looking." },
};
// Module 2 already has a family key "tell"; keep the two modules' tables separate so the keys can overlap.
export const patterns3 = {
  rescue:     { family: "rescue",  name: "Doing it yourself", coach: "You fixed it so it would be right, and it was. Next time, ask what would let them fix it." },
  hero:       { family: "rescue",  name: "Leaning on the hero", coach: "You relied on the one person who always delivers. That is a risk they carry alone." },
  wait:       { family: "avoid",   name: "Waiting and watching", coach: "You gave it time, hoping it would resolve. Time usually adds to the cost, and to what others learn from your silence." },
  soften:     { family: "avoid",   name: "Cushioning the message", coach: "You said it so gently that it could be heard as nothing. Say it once, plainly and kindly." },
  pass:       { family: "avoid",   name: "Handing it off", coach: "You gave it to someone else (HR, your boss, a peer) before trying yourself. Escalate with a fix in hand, and after you've spoken to the person." },
  drop:       { family: "avoid",   name: "Letting them sink", coach: "You stepped back and called it learning. People learn faster with you beside them than on their own in public." },
  rule:       { family: "control", name: "A rule instead of a conversation", coach: "A rule ended the problem on paper. The person who needed the conversation still hasn't had it." },
  check:      { family: "control", name: "Checking in secret", coach: "You tested the work behind their back. If they find out, they will remember the test, not the result." },
  punish:     { family: "control", name: "Making an example", coach: "You used a consequence to send a message to the room. The room learns to hide things." },
  please:     { family: "please",  name: "Keeping the peace", coach: "You protected the mood. The cost is paid later, usually by someone else." },
  friend:     { family: "please",  name: "Staying the friend", coach: "You kept the friendship and bent the standard. The team is watching which one wins." },
  overpromise:{ family: "promise", name: "Committing past the evidence", coach: "You said yes to a number or a date before you knew you could. Give the range and what's behind it." },
  lock:       { family: "promise", name: "Locking it in first", coach: "You committed before the people who own the answer could weigh in. Bring them in while you still have a choice." },
  cheer:      { family: "promise", name: "Cheering the number", coach: "You turned a rep's confidence into a commitment. Believe the person, then ask what the buyer actually did." },
  hope:       { family: "promise", name: "Reassuring on hope", coach: "You told people it would be fine because you wanted it to be. People can handle a range better than a guess." },
  defend:     { family: "blame",   name: "Defending the plan", coach: "You protected the plan, or your picture of yourself, before you listened. Own your part in one sentence first." },
  blame:      { family: "blame",   name: "Pointing elsewhere", coach: "You explained the problem by naming whose fault it was. The people who matter want to know who is fixing it." },
  grind:      { family: "grind",   name: "Matching pressure with hours", coach: "You gave up rest to close the gap. Tired decisions and missed promises tend to cost more than the gap." },
  applaud:    { family: "grind",   name: "Rewarding the overwork", coach: "You praised the hours instead of the results. Everyone else learned what you notice." },
  lecture:    { family: "tell",    name: "Telling, not asking", coach: "You gave them everything you know. They nod and come back with the same question on Friday." },
  assume:     { family: "narrow",  name: "Assuming it's fine", coach: "You took 'fine', 'agreed' or 'all set' as the whole answer. Ask a different question and wait." },
  label:      { family: "narrow",  name: "Settling on who they are", coach: "You explained the numbers by the person. Check what changed around them first." },
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

## 3. How Module 3 should score

**Recommendation: two levels of credit, no headline percent.**

- Each first pick records `best`, `good` or `weak`, exactly as in Module 2. For the tally, `qualityScore3 = { best: 1, good: 1, weak: 0 }`: best and good are both **sound**. A second count, **strongest**, counts best only.
- The hub and track cards show "sound picks" per skill (Early under 3 plays), and "n of N strongest" on track completion. There is no 0 to 100 bar.
- The summary reports three things in words: (1) **Values you lean on**, from the `leans` of your sound picks, once you have five or more ("You lean on candor over kindness in 6 of 8"); (2) **Habits under pressure**, from the `family` of your weak picks, using Module 2's rules (a habit only with 3+ tagged picks, a quarter of tagged picks and a clear lead; ties are named); (3) **Strongest how**, the one case where your sound pick and the strongest differed most, with the sentence about what the strongest did that yours didn't.
- Feedback headings: best "A strong way to do it." · good "Defensible. Here's what it protects, and what it costs." · weak "A common move under pressure."

**Why not keep best = 1, good = 0.5, weak = 0?** Because here a 0.5 would tell a thoughtful manager that a defensible choice was half wrong. Learners would stop thinking about the person in the scene and start guessing the grader, which is the opposite of the pause these cases are meant to create. The old rule also hides what is most useful: *which* values you reach for.

**Why not make every defensible option score 1 and drop "strongest"?** Because how and when matter (the same candor delivered in a hallway on Friday and in a one-on-one on Monday lands differently), and a strongest count lets the product say so without calling anyone wrong.

**What to be honest about on screen.** The Why layer states for the strongest option what it costs too ("The cost: it takes an hour you don't have"). The page never says "wrong" for a sound pick. A short note on the Module 3 hub says: "Several answers here are defensible. We show which values each leans on, and what the strongest one adds."

**Optional, low-cost mechanic.** Show the `pause` line first and reveal the options on a tap ("Ready"). No timer (accessibility, and it would punish the learners who most need to think).

## 4. The 30 scenarios

Seats in the set (`who`): 20 sales managers (2 of them new to the job), 8 regional managers or directors, 2 lead reps without the title. Book counts as the primary lens: Coach 6, Commitments 6, Google 5, High Output Management 5, CEO 4, Munger 4. Themes: trust 5, fears 4, and values, follow-through, teamwork, overconfidence, love, dedication, rest 3 each.

### Track 1 · Set the standard

#### 1. loved-not-delivering

```js
{
  id: "loved-not-delivering", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Correct", skill: "standard", theme: "follow-through", trade: ["candor", "person"],
  lens: { book: "Trillion Dollar Coach", lesson: "Honest feedback given early, inside a relationship that has earned it, is the kindest thing a manager can give." },
  tension: { book: "High Output Management", lesson: "A clear expectation with a visible measure means a miss can't hide behind a good relationship." },
  voice: "Buyers love me. The number always comes together in the last two weeks.",
  situation: "Dana covers Meijer and Kroger, and both buyers ask for her by name. For three quarters running she has given you a confident commit at week six and landed 10 to 15 points under it, and each time the supply plan and your director's forecast paid for it. She also covered your territory for two weeks when you were new.",
  evidence: [["Dana's week-6 commit, last 3 quarters", "105% · 108% · 110%", "warn"], ["Where she landed", "94% · 91% · 96%", "bad"], ["What her buyers say", "asked your director to keep her on the accounts", "good"], ["Your last review of her", "'meets', no note on forecasting", "warn"], ["What she did for you", "covered your territory for two weeks in your first month"], ["What you're afraid of", "that she hears 'you're not good' and starts looking", "warn"]],
  pause: "Would Dana rather hear this from you now, or from your director in January?",
  question: "How do you handle her review?",
  options: [
    { label: "Open with the pattern in her own numbers: three commits, three misses. Ask what she sees, then agree one change in how she builds the commit.", quality: "best", strength: "candor", leans: "candor", feedback: "You said the true thing early, with her own data, and gave her the first word. It protects her standing with your director and the trust she's earned with you. The cost is an uncomfortable half hour, and she may be stung for a day." },
    { label: "Start with what she does well and how much the buyers value her, then name the forecast habit as the one thing to fix this quarter.", quality: "good", leans: "person", feedback: "Leading with the strengths is fair, because they're real, and it protects the relationship. The risk is that she leaves hearing the praise and not the miss. If you take this route, end with a specific change and a date, not a general wish." },
    { label: "Rate her 'meets' again with a note on forecasting, and see whether the pattern holds another quarter.", quality: "weak", pattern: "wait", cost: "Another miss, and now your director asks what you saw the last three times.", feedback: "Waiting feels fair, as if you were giving her room. But she has already had three quarters, and the only person who doesn't know it matters is Dana." },
    { label: "Put her on a weekly forecast check-in with you for a quarter and let the process do the correcting.", quality: "weak", pattern: "rule", feedback: "A check-in can help, and it may belong later. Used instead of the conversation, it tells her you've lost confidence without telling her why, and she'll learn to hit your check-in number, not to forecast well." },
  ],
  reasoning: "This is loyalty to a person against honesty with her, and in the moment they feel like opposites. They aren't. The kind version of this conversation is the earliest one, with the facts she can check, and an offer of help. Waiting only moves the same conversation to a worse day, probably with a third person in the room.",
  principle: "Kindness that delays the truth is a loan, and the person you're protecting pays the interest.",
  then: "Dana is quiet, then says, “Nobody told me it mattered that much.” Next quarter she commits 98% and lands at 97%. It's the first quarter your director doesn't ask about her.",
  nextMove: "Pull commit versus actual for each rep over the last three quarters. Book the conversation with the rep whose gap you've been explaining away.",
},
```

#### 2. top-rep-cuts-corners

```js
{
  id: "top-rep-cuts-corners", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Sparkling water",
  stage: "Correct", skill: "standard", theme: "values", trade: ["results", "integrity"],
  lens: { book: "Poor Charlie's Almanack", lesson: "People respond to what they are paid and praised for, so look at the incentive and the habit behind a behavior before you judge the person." },
  tension: { book: "Trillion Dollar Coach", lesson: "Honest feedback only works if the person already believes you are on their side." },
  voice: "I've never lost a display fight. Does it matter if I log it from the car?",
  situation: "Marcus is at 118% of plan and first in the region. You've learned he marks about a third of his displays 'executed' in the app from a distributor rep's text, without walking the store. You checked six: five were up, one was never built. Execution compliance feeds a bonus, and two other reps have started logging the same way.",
  evidence: [["Marcus against plan", "118%", "good"], ["Displays logged 'executed' from a text, not a visit", "about 1 in 3", "warn"], ["The six you checked", "5 up · 1 never built", "warn"], ["What the compliance score pays", "a quarterly bonus on logged %", "warn"], ["Reps now doing the same", "2", "bad"], ["What you said at kickoff", "'I don't care how, just get them up'", "warn"]],
  pause: "What will the rest of your team conclude from what you do next?",
  question: "What do you do?",
  options: [
    { label: "Talk to Marcus today: show him the six stores, own the 'I don't care how' line, and reset one rule for everyone: logged means someone saw it.", quality: "best", strength: "standard", leans: "integrity", feedback: "You went to the person first, owned your part in how this started, and set the rule for the whole team in one step. It protects the standard and Marcus's dignity. It costs you a hard conversation with your best rep, in the middle of his best year." },
    { label: "Reset the rule with the whole team first, no names, then talk to Marcus separately about what you found in his accounts.", quality: "good", leans: "team", feedback: "Starting with the team protects Marcus from being singled out, and it makes the rule fair. The risk is that he hears it as a general speech first and a personal one second, and the two reps copying him learn it from the room, not from you." },
    { label: "Take it to your director and HR now, and let them decide what happens to Marcus.", quality: "weak", pattern: "pass", cost: "He learns about it from HR, not from you, and you've handed away the one conversation that was yours.", feedback: "If the logs fed a bonus, your director and finance do need to know, and soon. But from you, after you've spoken to him, with the fix already in place. Going first to the formal route skips the part only you can do." },
    { label: "Let it go this quarter. He's at 118% and one missing display is small. Raise the rule in January.", quality: "weak", pattern: "wait", cost: "Two copiers become five, and your compliance number stops meaning anything to your director.", feedback: "The numbers are good and the miss is small, which is exactly why it's tempting. But the team is watching what gets tolerated in your top performer, and they're deciding what 'executed' means." },
  ],
  reasoning: "This is results against integrity, and the pressure comes from a real place: he's good, and the miss is small. The system also helped create it, since the bonus pays on the logged number and your kickoff line gave permission. The strongest move fixes the rule and your own part in it, with Marcus in the room, before anything formal.",
  principle: "What you allow in your best performer becomes the rule for everyone, so fix it where it started, including your own part.",
  then: "Marcus says, “I did stop walking them when the numbers were good. Fair.” He re-walks the third of his accounts that week and finds two more missing displays. The other reps hear the rule from you, not from rumor.",
  nextMove: "This week, walk three 'executed' displays you haven't seen, on three different reps' lists. Say aloud what 'executed' means on your team.",
},
```

#### 3. inherited-slack-habits

```js
{
  id: "inherited-slack-habits", who: "New sales manager", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Set", skill: "standard", theme: "follow-through", trade: ["follow", "flex"],
  lens: { book: "High Output Management", lesson: "A routine is worth keeping only if it has a clear purpose and a measure someone uses; otherwise it is overhead." },
  tension: { book: "How Google Works", lesson: "People hold a standard they understand and helped shape better than one handed down." },
  voice: "Reports are busywork, boss. I closed Kroger this week, isn't that the report?",
  situation: "You took over seven reps three weeks ago. Friday-noon call reports were on time 40% of the time last month, and your predecessor 'never chased.' The team is friendly and a little wary. Your director wants a weekly roll-up built from those reports, and one of your best reps just told you they're a waste of time.",
  evidence: [["On-time Friday reports, last 4 weeks", "40%", "bad"], ["What happens to a report after it's filed", "nothing; no one comments", "warn"], ["Time per report", "about 25 minutes"], ["What you use them for", "your Monday roll-up to your director"], ["Reps' mood", "friendly, a little wary"], ["What you're worried about", "being 'the new boss who nags'", "warn"]],
  pause: "Which would you rather defend: a rule you can explain, or a rule you've only enforced?",
  question: "What do you do?",
  options: [
    { label: "Say what the report is for, cut it to the three fields you actually use, promise a reply to each by Monday, and hold the Friday deadline.", quality: "best", strength: "standard", leans: "follow", feedback: "You gave the standard a reason, took out what nobody uses, and closed the loop that was missing: reports that vanish train people to stop writing them. It protects your credibility, and it costs you the Monday replies, which are real work." },
    { label: "Hold the Friday-noon deadline exactly as it is, starting now, and tell them why you need it. A standard is clearest when it doesn't move.", quality: "good", leans: "follow", feedback: "Consistency is a real strength, and a new manager who bends in week three never gets it back. The cost is that you're enforcing a form you suspect is longer than it needs to be. Fix that within a month, or the deadline starts to feel arbitrary." },
    { label: "Ask the team what would make reports worth writing and let them redesign it together before you enforce anything.", quality: "good", leans: "flex", feedback: "People keep what they help design, and it respects their time. The risk is another month at 40% while the team talks, and a team that learns the first thing the new boss did was ask whether the rules were optional." },
    { label: "Send a firm note: reports are due Friday noon, and late ones will be counted in reviews.", quality: "weak", pattern: "rule", cost: "On-time goes to 90%, and the reports are written in three minutes and say nothing.", feedback: "It will move the number. It will not move the quality, and it tells a wary team that the new boss leads with consequences. A deadline backed by a reason survives its first bad Friday." },
  ],
  reasoning: "Follow-through and flexibility pull against each other, and both options that mix them are defensible. What separates them is purpose. A standard people can see a reason for, with something coming back to them, holds. A standard that only counts them tends to produce compliance and empty reports.",
  principle: "A standard with a reason survives its first bad Friday. Say what it's for, cut what isn't, and hold it.",
  then: "By the third Friday you're at 85% on time. One of the two skeptics sends you a note: “You used my Kroger line in your Monday email.” It's the first time a report felt read.",
  nextMove: "Pick one routine you inherited. Write who uses it and what they do with it. Cut or fix every field nobody uses.",
},
```

#### 4. exception-request

```js
{
  id: "exception-request", who: "Sales manager (7 reps)", customer: "Priya, your top rep", channel: "off", category: "Portfolio",
  stage: "Set", skill: "standard", theme: "teamwork", trade: ["flex", "team"],
  lens: { book: "How Google Works", lesson: "Give strong people room and context to run their work, and make the shared things worth sharing." },
  tension: { book: "High Output Management", lesson: "Expectations that apply to everyone are what make a team's process predictable." },
  voice: "I'm at 124% and I spend Monday mornings on a call that doesn't help me. Can I skip it and just send my numbers?",
  situation: "Priya is your top rep and she's asking to skip the Monday team call. The call is 50 minutes of round-robin status. Your newest rep told you it's where he hears how Priya runs her Kroger resets, and two reps copied something she said last month. If you say yes, others will ask.",
  evidence: [["Priya, year to date", "124% of plan", "good"], ["The Monday call", "50 minutes, mostly status", "warn"], ["What she contributed the last two Mondays", "4 minutes each, on Kroger resets; two reps copied it", "good"], ["Newest rep's view", "'it's where I learn what Priya does'"], ["Reps who would ask next if she's excused", "probably 2 or 3"], ["Your own view of the call", "you've never asked the team what it's for", "warn"]],
  pause: "If a middle performer asked the same thing, would your answer change? Should it?",
  question: "What do you tell her?",
  options: [
    { label: "Don't excuse her yet. Ask what would make the call worth her time, then rebuild it with the team: 25 minutes, one real problem, status in writing.", quality: "best", strength: "standard", leans: "team", feedback: "You took her question as a signal about the call, not only about her. It keeps the team together and may improve the thing everyone sits through. It costs you a week of rebuilding, and she may have wanted a quicker yes." },
    { label: "Say yes for a quarter, on one condition: each month she sends a two-line note on something she's doing that others could copy.", quality: "good", leans: "flex", feedback: "Earned flexibility is a fair thing to offer your best performer, and the note keeps her knowledge in the team. The cost is that the newest rep loses the live version, and you've set a precedent for whoever hits 120% next." },
    { label: "Say no and keep it simple: the call is for the team, and everyone attends at every level.", quality: "good", leans: "team", feedback: "Fairness is real here, and you protect the people who aren't at 124% and need the call. The cost is a call you suspect isn't very good, held up as a principle, and a top rep who now sits through it resentfully." },
    { label: "Say yes quietly and don't mention it to the team.", quality: "weak", pattern: "please", cost: "Others notice by week two, and now it's a favorite, not a decision.", feedback: "It avoids a scene today. But exceptions made quietly tend to be discovered loudly, and what the team learns is that access to you works better than a good reason." },
  ],
  reasoning: "Flexibility for a top performer and fairness to the team are both good values, which is why two of these answers are defensible. The strongest one notices the question under the question: if your best rep doesn't think the call is worth her time, the call is the problem. Fix that, and the exception stops being needed.",
  principle: "A rule only your best person can skip is a perk, not a standard. Make the thing worth attending, or defend it openly.",
  then: "Priya comes back with two ideas. The new call is 30 minutes. In week two she runs the Kroger reset segment herself, and the newest rep takes notes.",
  nextMove: "Ask each rep one question this week: what is our Monday call for? If the answers differ, you've found the real problem.",
},
```

### Track 2 · Have the hard conversation

#### 5. veteran-gone-quiet

```js
{
  id: "veteran-gone-quiet", who: "Sales manager (9 reps)", customer: "Ray, 22 years in", channel: "off", category: "Salty snacks",
  stage: "Coach", skill: "candor", theme: "love", trade: ["candor", "patience"],
  lens: { book: "Trillion Dollar Coach", lesson: "Start with a question and with what you've seen. People tell you more when they feel you're trying to understand before you judge." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Stay curious about your own story before you act on it; 'he's checked out' may be a conclusion, not a fact." },
  voice: "I'm fine. I just don't see the point of the new reporting.",
  situation: "For twenty years Ray was the rep new hires rode with. This year he has stopped volunteering, his store visits are down 30%, and in three meetings in a row he's said “whatever you need,” which he never used to say. He is nine months from a pension milestone, and two reps have begun to grumble that they're covering his accounts.",
  evidence: [["Ray's store visits against last year", "down 30%", "warn"], ["His accounts' sales", "flat; his three biggest are fine so far"], ["Ride-alongs he led", "11 last year · 0 this year", "warn"], ["What he says in meetings", "'whatever you need' three times in a row", "warn"], ["Reps covering for him", "2, and they're starting to talk", "bad"], ["What you're afraid of", "that asking sounds like pushing him out", "warn"]],
  pause: "If you were Ray, what would you want your manager to ask?",
  question: "How do you start?",
  options: [
    { label: "Take him to lunch, not a conference room. Say what you've noticed in specifics, say you value him, then ask what's changed and listen first.", quality: "best", strength: "ask", leans: "patience", feedback: "You've named the facts without a conclusion, shown him respect, and given him the first answer. It protects his dignity and gets you the real reason. It costs time, and the two reps covering for him will wait a bit longer for a visible change." },
    { label: "Ask him to start leading ride-alongs again and give him a visible role mentoring the three newest reps. Lean on what he's best at.", quality: "good", leans: "person", feedback: "It speaks to what he loves and uses his strength, and it may bring him back. The risk is that you've picked the cure before knowing the cause. If he's running on empty, a bigger role can feel like more weight rather than a vote of confidence." },
    { label: "Have the straight talk: visits are down 30%, here is the standard, here is the date by which you expect it back.", quality: "good", leans: "candor", feedback: "It's clear and fair to the team, and some people respect being told plainly. What it leaves out is the why. If something is going on with Ray, he'll hear a deadline and nothing else, and you won't know what you just said it to." },
    { label: "Wait. He has nine months left and he's earned a quiet landing.", quality: "weak", pattern: "wait", cost: "The two reps covering for him read your silence as the new standard.", feedback: "The impulse is generous, and it comes from respect. But a quiet landing is chosen with someone, not for them, and the people paying for it are on your team today." },
  ],
  reasoning: "Candor and patience can both be defended here. What the strongest answer adds is order: say what you've seen, then ask, then listen, before you decide what it means. You may find he's tired, or bored by the reporting, or worried about something outside work. Each of those calls for a different next step, and none of them is the one you'd guess.",
  principle: "Before you decide what's wrong with someone, tell them what you've seen and ask what's changed.",
  then: "Ray is quiet for a while. Then: “I'm tired of being measured on the same sheet as reps half my age.” You agree a month: he leads ride-alongs with the two newest reps, and his reporting is cut to three fields. He starts offering again by week three.",
  nextMove: "Block a long, unscheduled lunch with the one person whose behavior has changed. Bring three specific things you've noticed, not conclusions.",
},
```

#### 6. spouse-is-ill

```js
{
  id: "spouse-is-ill", who: "Sales manager (8 reps)", customer: "Tom, 6 years on your team", channel: "off", category: "Portfolio",
  stage: "Coach", skill: "candor", theme: "values", trade: ["kindness", "team"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "How you show up matters; stay curious and ask what a person actually needs rather than assume it from your own experience." },
  tension: { book: "High Output Management", lesson: "A team can carry a lot, but only if workload and expectations are visible and fairly shared." },
  voice: "I'm okay. I'll catch up. I just need to leave early on Tuesdays and Thursdays for a while.",
  situation: "Tom told you in the parking lot that his wife has started chemotherapy and asked you to keep it between the two of you. In the six weeks since, his visits and forecasts have slipped, and a colleague quietly covered a Safeway reset. HR wants managers to flag performance concerns for mid-year calibration in ten days. (Handle with care: this case touches leave and privacy. Check actual policy with HR rather than guessing.)",
  evidence: [["Tom's record before this", "never below 95% of plan in six years", "good"], ["Last six weeks", "visits down 35% · two missed deadlines", "warn"], ["What he's asked of you", "to keep it between you two"], ["Coverage", "Aisha did the Safeway reset; she hasn't complained", "warn"], ["HR calibration", "due in ten days"], ["Your own experience", "when your dad was ill you wanted to be left alone to work", "warn"]],
  pause: "What do you know about what Tom needs, and what are you assuming from your own story?",
  question: "What do you do?",
  options: [
    { label: "Ask Tom what he needs. Tell him what the company offers (check with HR, no names), agree what shifts, and what Aisha knows, only with his OK.", quality: "best", strength: "ask", leans: "kindness", feedback: "You asked before assuming, you found out the real options before you promised any, and you kept his confidence while still planning for the work. It protects Tom and the team's load. It costs you a harder, more detailed conversation than 'take what you need.'" },
    { label: "Tell him to take what he needs, quietly shift the Safeway work to Aisha, and leave performance out of calibration for now. Revisit in a month.", quality: "good", leans: "kindness", feedback: "It's generous and fast, and for many people in Tom's position it's what they'd want. The costs are hidden: Aisha carries extra work with no end date, and Tom has no clear plan. Don't promise what you can't stand behind with HR." },
    { label: "Handle it like any performance drop: document it, set targets, and apply the same process you would to anyone.", quality: "weak", pattern: "rule", cost: "Tom stops telling you things, and stops asking for help.", feedback: "Fairness is a real value, and consistency has a place. But a policy applied without knowing the circumstances isn't fair to Tom, and it ignores that the company has other tools for exactly this situation." },
    { label: "Tell the team what's going on so they understand the extra load.", quality: "weak", pattern: "please", cost: "Tom finds out his private news is public.", feedback: "You wanted the team to be kind, and the load is real. But it was his news to share, and breaking a confidence, even to help, teaches the rest of the team what to hold back from you." },
  ],
  reasoning: "Kindness to Tom and fairness to the team are both owed, and neither is served by guessing. Ask what he needs, find out what the company can actually offer, and plan the work around that, so that the generosity is real and the team is not left carrying it in silence.",
  principle: "Ask what someone needs before you decide what's kind, and be clear about what you can and can't promise.",
  then: "Tom is relieved to be asked. You agree: out at 3 on Tuesdays and Thursdays, the Safeway follow-ups move to Aisha for six weeks, and she's told it's temporary. In calibration you write “known, temporary circumstances, plan in place.”",
  nextMove: "Find out today what leave and flexible-schedule options your company offers, so you can answer before someone asks you in a parking lot.",
},
```
#### 7. promoted-over-friend

```js
{
  id: "promoted-over-friend", who: "New sales manager, promoted from the team", customer: "Chris, your closest friend at work", channel: "off", category: "Portfolio",
  stage: "Correct", skill: "candor", theme: "trust", trade: ["person", "team"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice your own guilt, irritation and ego before you act on them, and own them out loud." },
  tension: { book: "Trillion Dollar Coach", lesson: "Trust is built by honest feedback given with care, and a friendship is strong enough to carry it." },
  voice: "Come on, you know how it works. Since when do you need a form for this?",
  situation: "Three months ago you were promoted to lead the team you used to be on. Chris applied for the job too, and he's the person you've had lunch with every week for five years. Since the announcement he's turned in three of four forecasts late, arrived late to Monday's call four times, and jokes about “the new boss” in front of the others.",
  evidence: [["Chris's forecasts", "late 3 of the last 4", "warn"], ["Monday call", "late 4 of 6, with jokes at your expense", "warn"], ["Chris's sales", "on plan", "good"], ["What the team is watching", "whether the rules changed with your title", "warn"], ["Your friendship", "weekly lunch for five years"], ["What you feel", "guilty you got it, and annoyed", "warn"]],
  pause: "Which would you rather lose: a bit of the friendship, or the team's belief that you treat everyone the same?",
  question: "What do you do?",
  options: [
    { label: "Meet Chris privately: name the late forecasts and the jokes, say you know you got the job he wanted, and ask what he needs to make this work.", quality: "best", strength: "own", leans: "candor", feedback: "You said the awkward part aloud, named the behaviors, and acknowledged the history, so the friendship is part of the conversation instead of a reason to skip it. It protects both the standard and the person. It costs you a hard hour and a few weeks of strain." },
    { label: "Keep the friendship out of it: send one clear note to the whole team on what's expected of everyone, then speak to Chris if it continues.", quality: "good", leans: "team", feedback: "A single standard for everyone is fair, and it avoids singling him out. The cost is that Chris will know exactly who it was written for, and he'll read the note as a way of not talking to him." },
    { label: "Joke back in the moment, take him for a beer, and sort it out as friends.", quality: "weak", pattern: "friend", cost: "The team watches the rules bend for your friend, and decides what your word is worth.", feedback: "It protects the friendship and feels natural. But the audience for the late forecasts and the jokes was never Chris. It was everyone else, and they're learning from your reply." },
    { label: "Give Chris a written warning, to show everyone nothing has changed with the title.", quality: "weak", pattern: "punish", cost: "You lose the friend, and a good rep, and the team learns the new boss uses paper to show power.", feedback: "The instinct to prove you're fair is a strong one for a new manager. But a formal step before a conversation is the harshest way to make the point, and it does the most damage to the thing you most need, which is trust." },
  ],
  reasoning: "Staying loyal to a friend and being fair to a team feel like a choice only until you say the thing you've both been avoiding. The strongest move treats Chris as an adult and a friend at once: name what he's doing, name what he must feel, and ask. The note to the team is fair but indirect, and the other two options protect one side at the other's expense.",
  principle: "The first rule you hold for a friend tells the team what your word is worth, so hold it kindly and say the awkward part aloud.",
  then: "Chris says, “I wanted it. I'll be over it by Wednesday, not Monday.” He's on time the next two Mondays. He still jokes, but now about himself.",
  nextMove: "List the three people you're most likely to go easy on. Pick the one whose behavior you've been explaining away, and book the conversation.",
},
```

#### 8. distributor-rep-slipped

```js
{
  id: "distributor-rep-slipped", who: "Regional sales manager", customer: "Mike, route rep at Cascade Beverage", channel: "off", category: "Sparkling water",
  stage: "Correct", skill: "candor", theme: "teamwork", trade: ["candor", "trust"],
  lens: { book: "What the CEO Wants You to Know", lesson: "Understand how the other party's business makes money; their behavior usually follows their economics." },
  tension: { book: "Trillion Dollar Coach", lesson: "Honest feedback is a gift when it comes with care for the person receiving it." },
  voice: "I know, I know. The feature slipped. I've got 140 stops and you're one of 300 brands.",
  situation: "Mike is the reason your sparkling water is on shelf in your 40 best stores, and he has gone out of his way for you for years. This quarter he missed the load-in on two features: 11 stores, then 9. Your own reps say, “Let it go, he's the only one who cares.” His boss is the distributor's sales manager, who has been friendly to you.",
  evidence: [["Missed load-ins this quarter", "2 (11 stores, then 9)", "bad"], ["Mike's record before this year", "never missed one", "good"], ["His route", "140 stops · about 300 brands"], ["What he earns on your brand", "about 1% of his pay"], ["What your reps say", "'let it go, he's the only one who cares'", "warn"], ["What you've done for him", "asked for three favors last year, sent one thank-you card", "warn"]],
  pause: "If you were Mike, which would you prefer: a call from you, or a message to your boss?",
  question: "What do you do?",
  options: [
    { label: "Call Mike: name both misses, ask what's getting in his way, agree a 48-hour check on each feature, and offer to send your reps to build the displays.", quality: "best", strength: "candor", leans: "candor", feedback: "You told him the truth first and in person, learned why it happened, and offered something back. It protects a relationship you depend on and gets the facts. It costs you some of your reps' time and a harder conversation than a thank-you card." },
    { label: "Take it to his sales manager with specifics, framed as a problem to solve together, so that Mike's priorities change.", quality: "good", leans: "candor", feedback: "A manager can change Mike's priority list in a way Mike can't, and it's fair to raise a pattern. The cost is that Mike may feel you went over his head, and you lose the one person who's gone the extra mile." },
    { label: "Let it go. He's earned some slack and you can't afford to lose him.", quality: "weak", pattern: "please", cost: "The third miss comes in Q4, and by then it's a pattern you've accepted.", feedback: "Loyalty to a partner is a good instinct. But he can't fix a problem nobody names, and you're depending on him more than you're helping him." },
    { label: "Send a written summary of both misses to Mike and copy his manager.", quality: "weak", pattern: "punish", feedback: "It creates a record, and sometimes you'll need one. As a first move with someone who has been this good, it reads as an accusation, and it closes the door on finding out what changed." },
  ],
  reasoning: "You rely on Mike, and that is exactly why the honesty can't wait. He's likely stretched, with a route of 300 brands and your product worth 1% of his pay, and no one has asked him what would help. The strongest answer is a call that is candid about the miss and curious about the cause, followed by an offer. The manager route may be needed later.",
  principle: "The people you depend on most deserve your honesty soonest, because it's the only way they can keep helping you.",
  then: "Mike: “My manager moved 40 new brands onto my route in June. I've been drowning.” Two of your reps pre-build his displays on load-in day, and Cascade agrees to send a feature calendar a month ahead. No more misses this quarter.",
  nextMove: "For the two distributor people you rely on most, find out what they earn on your brand and what else is on their plate before you next ask for a favor.",
},
```

#### 9. ready-for-promotion

```js
{
  id: "ready-for-promotion", who: "Sales manager (8 reps)", customer: "Lena, your strongest mid-level rep", channel: "off", category: "Portfolio",
  stage: "Review", skill: "candor", theme: "dedication", trade: ["candor", "kindness"],
  lens: { book: "Trillion Dollar Coach", lesson: "Give honest, specific feedback, and support the person's growth, rather than offering reassurance." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Own the part you played, here a vague promise, instead of defending it." },
  voice: "You said next cycle. It's next cycle.",
  situation: "Last year you told Lena, “We'll look at senior rep next cycle.” Since then she has worked weekends, taken on two accounts, and trained the newest hire. Her numbers are strong. But her account plans are thin, she has never led a cross-functional meeting, and your director said she's “close, but not there yet.” There is one opening, and Lena has already told her family.",
  evidence: [["Lena's results", "106% last year · 111% this year", "good"], ["What your director said", "'close, but not senior rep yet'", "warn"], ["Her account plans", "no 90-day plan on 3 of 5 key accounts", "warn"], ["What you told her last year", "'we'll look at it next cycle'", "warn"], ["Senior openings", "1"], ["Lena's situation", "told her family; skipped a vacation to cover a launch", "warn"]],
  pause: "What did Lena hear when you said “next cycle”? What did you mean?",
  question: "How do you handle the conversation?",
  options: [
    { label: "Tell her before the review: not this cycle. Name the three gaps, agree a plan and a date, and own that 'next cycle' was too vague.", quality: "best", strength: "own", leans: "candor", feedback: "You gave her the news early, in specifics she can act on, and owned the loose promise. It protects her trust, and the decisions she makes at home. It costs you her disappointment, which will be real for a day or more." },
    { label: "Go to your director and push for the promotion on her results and loyalty, and coach the gaps after she has the title.", quality: "good", leans: "person", feedback: "Advocating for someone who's earned it is part of the job, and she may be closer than your director thinks. The risk is setting her up in a role where the gaps show, and other reps seeing loyalty out-rank readiness." },
    { label: "Tell her she's “so close,” and promise to revisit in six months.", quality: "weak", pattern: "soften", cost: "She plans a family decision around 'so close.'", feedback: "It spares both of you a rough hour. But 'so close' is a phrase she'll live inside for six months, and the same promise will come due again." },
    { label: "Wait until your director decides, so you only deliver a final answer.", quality: "weak", pattern: "wait", feedback: "Not wanting to speculate is reasonable. But a decision that's coming either way isn't the only thing you can tell her: you can tell her where she stands, now, and what you'd need to see." },
  ],
  reasoning: "Dedication has earned her an honest answer, and kindness is part of how you give it. The vague promise is the real debt: she has been building her hopes on it. The strongest move pays the debt in full, with a plan, so that the 'no' comes with a route to 'yes.'",
  principle: "A vague promise is a debt. Pay it with a specific answer as soon as you know.",
  then: "Lena takes it hard for a day. Then she asks for the account-plan template and a date. She leads the March cross-functional meeting, and you both know what 'ready' will look like. She stays.",
  nextMove: "List every “next cycle,” “soon,” or “we'll see” you've told someone this year. Turn each into a date or a no.",
},
```

### Track 3 · Build the system, not the hero

#### 10. you-keep-rescuing

```js
{
  id: "you-keep-rescuing", who: "Sales manager (8 reps)", customer: "Jess, a first-year rep", channel: "off", category: "Better-for-you snacks",
  stage: "Coach", skill: "system", theme: "love", trade: ["speed", "growth"],
  lens: { book: "High Output Management", lesson: "Good outcomes shouldn't depend on one person constantly rescuing a broken process." },
  tension: { book: "Trillion Dollar Coach", lesson: "Care for people means helping them become capable, which sometimes means being slower today." },
  voice: "Can you just look at the Meijer proposal? You're so much better at these.",
  situation: "For the third Friday in a row you're rebuilding a rep's late, incomplete planogram proposal, and it works: the buyer thanks you. This week it's a $90K reset due Monday at 9am, from Jess, who is a few months in and a little overwhelmed. Rebuilding is the best part of your week. It's why you got promoted.",
  evidence: [["Proposals you rebuilt this quarter", "7 of 9", "bad"], ["Hours that cost you", "about 14", "warn"], ["Win rate on the ones you rebuilt", "5 of 7", "good"], ["The two you didn't rebuild", "one won, one lost; they were also the weaker accounts"], ["How you feel after you fix one", "it's the best part of your week", "warn"], ["This one", "$90K · due Monday 9am"]],
  pause: "Whose job is this proposal, and what does the team learn when you fix it?",
  question: "What do you do?",
  options: [
    { label: "Fix this one with her in the room, 60 minutes, her keyboard and your questions. Then agree a checklist for the next one before it reaches you.", quality: "best", strength: "system", leans: "growth", feedback: "You protect the $90K and spend the hour on the part that will change next quarter, which is her ability and a checklist the whole team can use. It costs you the pleasure of doing it yourself, and the proposal won't look like yours." },
    { label: "Rebuild it yourself this weekend because $90K is real, and on Monday set a new rule: drafts reach you 48 hours earlier, with a checklist.", quality: "good", leans: "speed", feedback: "Protecting a real $90K is a sound call. The honest cost is your weekend and another round of the pattern. Doing the process fix straight after is what makes this defensible and not just habit." },
    { label: "Rebuild it and say nothing. It's faster and Monday is real.", quality: "weak", pattern: "rescue", cost: "Next Friday it's the same, and so is the one after.", feedback: "It works and the buyer is happy. What it teaches is that sending something rough is fine, because the team has a manager who finishes things. Everything hinges on you being free on Fridays." },
    { label: "Send it back with comments and let her finish it Sunday on her own. If the proposal is weaker, so be it.", quality: "weak", pattern: "drop", cost: "A $90K miss, and a first-year rep who now believes she isn't cut out for this.", feedback: "Letting people struggle can teach a great deal. Doing it on $90K, alone, in her first year, the night before a deadline, risks losing both the sale and her confidence. Be beside her when the stakes are high." },
  ],
  reasoning: "You love the rescue and it works, which is why it's hard to stop. But a team that depends on you to fix its mistakes is a team whose results are capped by your Fridays. The strongest move keeps the $90K safe and uses the hour to change what comes in next time, which is where the leverage is.",
  principle: "If the same fix lands on your desk every week, the fix is a process, not a favor.",
  then: "She types, you ask. The result is a better proposal than her draft and a different one from yours. She runs the next two without sending them over, and you get about six hours of Friday back.",
  nextMove: "List the last five things you fixed for someone. For the most common one, write the checklist that would have prevented it.",
},
```

#### 11. hero-holds-the-account

```js
{
  id: "hero-holds-the-account", who: "Regional sales manager", customer: "Sam, your Kroger lead", channel: "off", category: "Sparkling water",
  stage: "Plan", skill: "system", theme: "dedication", trade: ["person", "leverage"],
  lens: { book: "High Output Management", lesson: "Results that depend on one person aren't a strength, they're a risk the organization hasn't priced in." },
  tension: { book: "Trillion Dollar Coach", lesson: "Trust and loyalty are real, and you earn the right to ask hard things by honoring them." },
  voice: "Don't worry about Kroger. I've got it.",
  situation: "Sam has run your biggest account for nine years, rarely takes a full week off, and keeps the buyer's habits, the promo history, and the relationship in his head and in a personal spreadsheet. He's 58, loyal, and has asked you for nothing this year. He has said before that “backups are for people who plan to leave.”",
  evidence: [["Kroger's share of your region", "31%", "good"], ["Others on your team who have met the buyer", "none", "bad"], ["Where the promo history lives", "Sam's own spreadsheet · one copy", "bad"], ["Sam's time off last year", "4 days", "warn"], ["Sam's view of backups", "'for people planning to leave'", "warn"], ["What you're afraid of", "that he feels measured for replacement", "warn"]],
  pause: "Is it more loyal to leave him carrying this alone, or to share the weight?",
  question: "What do you do?",
  options: [
    { label: "Tell Sam why: the account is too important to rest on one person, him included. Ask him to design the backup and pick who joins.", quality: "best", strength: "system", leans: "leverage", feedback: "You told him the real reason and handed him the design, so a backup is something he builds and not something done to him. It protects the account and him. It costs you a conversation he may find uncomfortable, and a few weeks of doubt on his side." },
    { label: "Add a second rep to the account as 'growth capacity,' without calling it a backup, and let the transfer happen naturally.", quality: "good", leans: "person", feedback: "It protects his pride and builds a bench. The cost is honesty: he may work out what it is, and feel handled, and a quiet transfer tends to be slower than a planned one." },
    { label: "Ask every key-account owner for a one-page account document each quarter, no exceptions, as part of everyone's planning.", quality: "good", leans: "leverage", feedback: "A routine for all key accounts avoids singling him out and starts the knowledge flowing. The risk is that he writes the minimum, and the buyer relationship, the hardest part to hand over, stays in his head." },
    { label: "Leave it. Nine years of results is proof the arrangement works.", quality: "weak", pattern: "hero", cost: "The day he's out for a month, you meet Kroger's buyer for the first time.", feedback: "Nine good years are real, and so is his pride. But a good record is exactly why nobody has asked what happens if he can't be there." },
  ],
  reasoning: "Wanting to honor Sam's loyalty is right. The question is what honoring him looks like. Leaving him as the single point of failure asks him to carry a risk alone, and his own history says he'd rather not hear about it. The strongest option names the reason and hands him the design.",
  principle: "Depending on one person isn't loyalty to them. It's a risk you're asking them to carry alone.",
  then: "Sam is quiet, then says, “I always figured the spreadsheet was a compliment.” He picks Nia to shadow Kroger, and takes his first full week off in six years. The spreadsheet goes into the shared folder.",
  nextMove: "List your five largest accounts and write who besides the owner could run each next week. Every blank is your next conversation.",
},
```

#### 12. metrics-reward-the-wrong-thing

```js
{
  id: "metrics-reward-the-wrong-thing", who: "Regional sales manager", customer: "Your region", channel: "off", category: "Energy drinks",
  stage: "Plan", skill: "system", theme: "values", trade: ["results", "candor"],
  lens: { book: "What the CEO Wants You to Know", lesson: "Follow the cash and the margin: a number that looks like a win can hide inventory, discounts and cost." },
  tension: { book: "Poor Charlie's Almanack", lesson: "People respond to what they are paid on, so if the behavior is wrong, look first at the incentive." },
  voice: "Great month. Keep that pace.",
  situation: "Your team is paid and ranked on cases shipped to distributors. Last month two reps pushed 3,000 cases in the final three days, with a deep sell-in discount you approved. Shipments are 112% of plan and your director praised you. Retail sales are flat, distributor stock is at 85 days against a 45-day target, and your own bonus rests on the same shipped number.",
  evidence: [["Cases shipped against plan", "112%", "good"], ["Retail sales, same month", "flat", "warn"], ["Distributor stock", "85 days · target 45", "bad"], ["What reps are paid on", "cases shipped"], ["Your bonus", "the same measure", "warn"], ["Next quarter", "distributors will work down stock; shipments will dip", "warn"]],
  pause: "If you tell your director now, what do you risk? If you tell her in February, what changes?",
  question: "What do you do?",
  options: [
    { label: "Tell your director now: strong shipments, flat sales, 85 days of stock. Propose paying the team on retail sales, and ask whether yours can follow.", quality: "best", strength: "whole", leans: "candor", feedback: "You told her the whole picture while there's still time to fix the plan, and you put your own bonus on the table with the team's. It protects the business's cash and your credibility. It costs you the praise, and possibly part of this quarter's bonus." },
    { label: "Take the praise, stop approving early buys quietly, and change the reps' measure next quarter once the stock has worked down.", quality: "good", leans: "results", feedback: "It avoids a messy conversation, protects morale and fixes the behavior going forward. The cost is that your director plans on a number you know is inflated, and finds out from the dip." },
    { label: "Hold the two reps accountable: they pushed the volume, so note it in their reviews.", quality: "weak", pattern: "blame", cost: "They did what the plan paid for, and the next ones will learn to hide it.", feedback: "The reps made the discount decisions, but you approved them, and the plan paid for them. Penalizing people for hitting your incentive is how a team learns to stop telling you what it's doing." },
    { label: "Say nothing yet. Next month's retail may catch up, and you'd have raised an alarm over nothing.", quality: "weak", pattern: "hope", cost: "A month on, the stock is at 90 days and your director hears about it from finance.", feedback: "Not wanting to cry wolf is reasonable, and retail might recover. But you already hold three signals, and a manager who waits for certainty gives the news to someone else first." },
  ],
  reasoning: "A shipped case is a sale to the distributor, not to anyone who drinks it. Your team did what the measure rewards, and so did you. The strongest move names that plainly, moves the measure toward what the business needs, and starts with your own.",
  principle: "People do what the number pays for. If the number is wrong, change the number, starting with yours.",
  then: "Your director is quiet, then says, “I should have asked what retail did.” Next quarter pays on retail sales, with days of stock as a guardrail. Shipments dip 9%, and everyone knew why.",
  nextMove: "For each number your team is paid on, ask how a clever rep could hit it without helping the business. Fix the worst one.",
},
```

#### 13. context-not-permission

```js
{
  id: "context-not-permission", who: "Sales manager (7 reps)", customer: "Omar, a solid second-year rep", channel: "off", category: "Salty snacks",
  stage: "Set", skill: "system", theme: "trust", trade: ["trust", "verify"],
  lens: { book: "How Google Works", lesson: "Give people context and a clear limit instead of making them wait for permission." },
  tension: { book: "High Output Management", lesson: "Delegation works when the expectations and measures are clear enough to check afterward." },
  voice: "I didn't want to make the call without checking with you. The buyer's still waiting.",
  situation: "Your reps ask you to approve everything, including spends under $1,500. Omar waited two days on a $900 display-material swap and the buyer gave the spot to a competitor. You like being the person who knows. But last quarter a rep promised $6,000 in trade that finance reversed, and everyone has been careful since.",
  evidence: [["Requests to you under $2,000, last month", "31", "warn"], ["Your median reply time", "about 9 hours", "warn"], ["Opportunities lost to waiting", "at least 2", "bad"], ["The $6,000 mistake", "reversed by finance; the rep was embarrassed", "warn"], ["What reps know about the trade budget", "not much; they've never seen the quarter's plan", "bad"], ["How you feel", "good being needed, a bit nervous about being blamed", "warn"]],
  pause: "Which would you rather explain to finance: one wrong call, or ten lost opportunities?",
  question: "What changes?",
  options: [
    { label: "Share the quarter's trade budget and rules, set a $2,000 limit, ask them to tell you after, and review a sample together each month.", quality: "best", strength: "context", leans: "trust", feedback: "You gave them what they need to decide, the budget and the reasons, plus a limit and a way to learn from mistakes. It protects speed and judgment, with a safety net. It costs you the feeling of being needed, and a few small errors." },
    { label: "Set a short pre-approval checklist: self-approve under $1,000 if it meets the list, and ask above that.", quality: "good", leans: "verify", feedback: "A checklist speeds most decisions and makes the rules concrete. The cost is that the limit is low and the judgment is still yours, so reps learn the list, not the budget." },
    { label: "Keep approving everything yourself, but promise to reply within the hour.", quality: "weak", pattern: "rule", cost: "You become the bottleneck on Fridays, and reps stop thinking about the budget at all.", feedback: "Faster replies help the buyer. They don't change the thing that makes people wait: they still aren't sure they're allowed." },
    { label: "Tell the team to “use their judgment” from now on, and don't mention the $6,000 mistake again.", quality: "weak", pattern: "drop", cost: "The next mistake reaches finance with no guardrails and no explanation.", feedback: "Handing over authority is right. Without the budget, a limit, or a discussion of what went wrong, it's a leap in the dark, and the reps know it." },
  ],
  reasoning: "Trust and verification are both needed, and the question is when. Asking permission one decision at a time makes you the gate. Giving context and a limit lets people decide, and a monthly look at a sample lets you check without hovering.",
  principle: "Don't hand out permission one decision at a time. Give people the context and the limit.",
  then: "In the first month the reps self-approve 22 requests. One is a $400 miss, and the rep tells you before finance does. Requests to you drop from 31 to 6.",
  nextMove: "Ask a rep what they decided not to do last month because they weren't sure they were allowed. Turn the answer into a limit.",
},
```
### Track 4 · Trust and verify

#### 14. says-all-set

```js
{
  id: "says-all-set", who: "Sales manager (6 reps)", customer: "Eli, four months in", channel: "off", category: "Refrigerated juice",
  stage: "Review", skill: "trust", theme: "trust", trade: ["trust", "verify"],
  lens: { book: "Trillion Dollar Coach", lesson: "Trust people first and keep it by asking good questions, not by auditing them." },
  tension: { book: "High Output Management", lesson: "Measure the output that matters, and check it the same way for everyone." },
  voice: "All 12 stores are set, boss. Looks great.",
  situation: "Eli is bright, eager, and you like him. He says the 12-store reset is done and on time. The last two resets, a buyer found a missing shelf strip that Eli hadn't mentioned. He's the kind of person who withdraws when he feels doubted, and you pass within a mile of four of the stores on Wednesday.",
  evidence: [["Eli's report", "12 of 12 set", ""], ["Photos in the app", "3 of 12", "warn"], ["Last two resets", "buyer found a missing strip each time; Eli hadn't mentioned it", "warn"], ["Any known false report from Eli", "none", "good"], ["How he reacts to doubt", "withdraws for a few days", "warn"], ["Your route Wednesday", "within a mile of 4 of the stores"]],
  pause: "What do you want Eli to learn about telling you bad news?",
  question: "What do you do?",
  options: [
    { label: "Ask him which two stores were hardest and what he fixed. Then drop in on two. Tell him you check everyone's first resets, not just his.", quality: "best", strength: "verify", leans: "verify", feedback: "A curious question shows you believe him, the visit confirms the work, and 'everyone's first resets' keeps it from feeling personal. It protects him and the buyer. It costs you an hour on Wednesday." },
    { label: "Ask for photos of all 12 by end of day, and tell him that's the new standard for every rep.", quality: "good", leans: "verify", feedback: "A photo standard for everyone is clear, quick and fair, and it builds a record. The cost is that it checks the work and says nothing about trusting the person, so Eli may feel more watched than helped." },
    { label: "Congratulate him, and ask what he'd do differently next reset. If the buyer finds a problem, treat it as a lesson.", quality: "good", leans: "trust", feedback: "Trust given freely is how people grow into it, and the question is a good one. The risk is that the lesson arrives from the buyer, in public, a third time, when a short visit could have caught it." },
    { label: "Drive past the four stores without telling him. If something's wrong you'll raise it then.", quality: "weak", pattern: "check", cost: "He finds out, and decides you never believed him.", feedback: "Checking is sensible. Checking in secret turns it into a test, and a test he'll remember for longer than the result." },
  ],
  reasoning: "Trust the person; check the work. Neither replaces the other, and both can be said out loud. The strongest option does both in one move and makes the check a standard instead of a suspicion. It costs you an hour, which is cheap compared with a third missing shelf strip.",
  principle: "Trust the person and check the work, say so out loud, and check everyone the same way.",
  then: "Two stores are fine; one is missing a shelf strip. Eli says, “I thought it was done.” From then on he texts a photo with every set, unprompted, and tells you about a problem before the buyer does.",
  nextMove: "Pick one status you accept from a rep on their word. Ask what it would cost if it were wrong, and add a spot-check where the cost is high.",
},
```

#### 15. lock-that-isnt

```js
{
  id: "lock-that-isnt", who: "Sales manager (8 reps)", customer: "Dave, your most persuasive rep", channel: "off", category: "Better-for-you snacks",
  stage: "Review", skill: "trust", theme: "overconfidence", trade: ["trust", "verify"],
  lens: { book: "Poor Charlie's Almanack", lesson: "Look at the base rate and the incentives behind a confident claim instead of the feeling it gives you." },
  tension: { book: "Trillion Dollar Coach", lesson: "A manager's trust in a person is part of what makes them perform; withdrawing it has a cost." },
  voice: "Safeway is a lock. I've never been surer.",
  situation: "Dave says a $120K Safeway reset is a lock for the quarter. He's said “lock” on four deals this year and two closed. He is also the rep most likely to be right about Safeway, where he has closed 3 of 4 over the years, and last year he saved a quarter on a deal that looked dead. Your director wants a committed number today.",
  evidence: [["Dave's 'locks' this year", "4 declared · 2 closed", "warn"], ["What Safeway has done", "buyer positive in person; no planogram date; category review in 6 weeks", "warn"], ["Dave's Safeway record, 3 years", "3 of 4 closed", "good"], ["What his confidence does for the team", "lifts the mood", "good"], ["Your director's ask", "a committed number today"], ["You, honestly", "you've been carried by his certainty before and regretted it", "warn"]],
  pause: "What would Dave need to see before he'd bet his own money?",
  question: "How do you handle the forecast?",
  options: [
    { label: "Ask Dave what the buyer has done, not said. Put Safeway in upside at half value and agree with him what would move it to commit.", quality: "best", strength: "verify", leans: "verify", feedback: "You used his confidence as information, asked for evidence you can check, and gave him a way to win the argument with facts. It protects your number and your credibility, and keeps his trust. It costs you some of the lift his certainty brings." },
    { label: "Commit Safeway at full value. His Safeway record is the best on the team, and not backing him would hurt his trust in you.", quality: "good", leans: "trust", feedback: "His record is a real base rate, and the loyalty is real too. The cost falls on your director's trust: if Safeway slips, your commit stops meaning something. Take the base rate into account, but not as the whole picture." },
    { label: "Leave Safeway out of the number, and tell Dave you'll add it the day there's a planogram date.", quality: "good", leans: "verify", feedback: "It's clean and protects your credibility. What it leaves out is Dave's track record on this specific buyer, which counts for something. Called upside rather than excluded, the deal stays in view." },
    { label: "Tell Dave you're counting on him, you'll commit it, and you'll hold him to it.", quality: "weak", pattern: "cheer", cost: "If it slips, the first conversation is about a promise he can't take back.", feedback: "It sounds like trust and motivation. But turning confidence into a commitment pushes a bet onto him, and your director's number onto your hopes." },
  ],
  reasoning: "Dave's confidence is a feeling about a deal; what the buyer has done is the evidence. His history is a base rate to weigh too. The strongest answer keeps these three apart: it counts the record, asks for the actions, and tells him which of them moved you.",
  principle: "Confidence is a feeling about a deal. Evidence is something the buyer did. Weigh them separately.",
  then: "Safeway slips a quarter on the buyer's category review. Your commit holds, and your director notices. Dave's next “lock” comes with a planogram date attached.",
  nextMove: "Keep a simple tally of each rep's 'locks' and what actually closed. Show them their own number every quarter.",
},
```

#### 16. team-agrees

```js
{
  id: "team-agrees", who: "Sales manager (7 reps)", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Decide", skill: "trust", theme: "fears", trade: ["openness", "speed"],
  lens: { book: "How Google Works", lesson: "Build an environment where people can safely say what they think, because they will not say it otherwise." },
  tension: { book: "Poor Charlie's Almanack", lesson: "Disagreement is how you test a plan against perspectives you don't have." },
  voice: "Sounds good to me.",
  situation: "In Monday's meeting you proposed moving Q4's promo dollars to the three biggest accounts. Nobody objected. Twenty minutes later a rep caught you in the hallway: “I didn't want to say in there, but two of my smaller accounts were counting on those dollars.” The last time someone pushed back in a meeting, you snapped, “We've been through this.”",
  evidence: [["Objections in the meeting", "0 of 7 reps", "warn"], ["Hallway comments afterward", "2 reps", "warn"], ["Times you've been challenged in meetings, last 6 months", "twice"], ["How you reacted last time", "'We've been through this'", "bad"], ["Deadline", "plan due Thursday"], ["The quiet voice", "Mira has run the two smaller accounts for 5 years"]],
  pause: "What does it cost a rep to disagree with you out loud?",
  question: "What do you do?",
  options: [
    { label: "Reopen it next meeting: say you heard concerns afterward, that you cut off pushback last time, and ask what the plan is missing.", quality: "best", strength: "own", leans: "openness", feedback: "You owned your part in the silence and made it safe to speak in front of everyone. It protects the plan and teaches the team that disagreeing with you is useful. It costs you some face and a day of the plan's momentum." },
    { label: "Talk to the two reps one-on-one, adjust the plan quietly, and don't make a point of it at the next meeting.", quality: "good", leans: "speed", feedback: "It fixes the plan fast and spares everyone the awkwardness. The team learns nothing about whether it's safe to disagree in the room, so the next quiet meeting will be as quiet." },
    { label: "Send a short, anonymous survey asking what the plan might miss, and decide on Thursday.", quality: "good", leans: "openness", feedback: "Anonymity makes it safe to say things, and a survey is fast. What it leaves out is you: the reason it takes a survey is how the last pushback went, and the team knows it." },
    { label: "Go ahead as planned. Silence in the room was agreement, and Thursday is Thursday.", quality: "weak", pattern: "assume", cost: "Mira's accounts lose their dollars, and you lose Mira's trust.", feedback: "No objection feels like a green light, and the deadline is real. But a team that doesn't disagree with you is telling you something, and often it isn't that you're right." },
  ],
  reasoning: "Silence after a proposal is data about the room, not about the plan. Speed and openness trade off, but the cost of reopening is a day, and the cost of the quiet is paid by Mira. The strongest answer repairs the cause by naming it.",
  principle: "If no one disagrees with you, don't take it as agreement. Find out what it costs to disagree with you.",
  then: "Three people speak up. One catches a mistake: the biggest account's promo budget is already committed. You move $15K back to Mira's accounts. The next Monday, someone disagrees in the first ten minutes.",
  nextMove: "At your next meeting, ask “what's the weakest part of this plan?” before you ask “any questions?” and wait through the silence.",
},
```

#### 17. one-explanation

```js
{
  id: "one-explanation", who: "Sales manager (8 reps)", customer: "Karen, a six-year rep", channel: "off", category: "Crackers",
  stage: "Review", skill: "trust", theme: "fears", trade: ["patience", "results"],
  lens: { book: "Poor Charlie's Almanack", lesson: "Check the situation, the incentive, and the numbers before you settle on a story about a person." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice when a certainty about someone is really a story you've told before." },
  voice: "I'm working as hard as ever. The accounts just don't respond.",
  situation: "Karen's sales are down 18% over two quarters, and your instinct says she's coasting. You've seen it before in others. In January her territory was re-cut: she lost two top accounts and gained 40 small stores 45 miles farther out. The comp plan also changed from case volume to margin. She hasn't complained, but she has gone quiet in meetings.",
  evidence: [["Karen's sales", "−18% over two quarters", "bad"], ["What changed in January", "lost 2 top accounts · +40 small stores · +45 miles a week", "warn"], ["New comp plan", "pays on margin; her items sell at lower margin", "warn"], ["Her store visits", "same as last year", "good"], ["Her tone", "quiet in meetings; fewer questions", "warn"], ["Your belief", "'she's coasting', and you've been right about that before", "warn"]],
  pause: "What would you see if it weren't about effort?",
  question: "What do you do first?",
  options: [
    { label: "Before any talk about effort, compare her numbers with the re-cut: same visits, new accounts, new pay plan. Then ask her what's changed for her.", quality: "best", strength: "ask", leans: "patience", feedback: "You tested your story against the facts before saying it, and then asked her. It protects her from an unfair read and you from a wrong one. It costs you a few days of looking at data, and you still might be right in the end." },
    { label: "Have the effort conversation anyway. You've seen this pattern before, and if you're wrong she'll tell you.", quality: "good", leans: "results", feedback: "Candor is a fine instinct, and some people want to be asked directly. The risk is that she hears an accusation and shuts down further, and you don't find out what changed until later." },
    { label: "Ask your director whether the territory and comp changes are fair across the team, and hold off on Karen until then.", quality: "good", leans: "patience", feedback: "It looks at the system, which is where the cause may lie. The cost is that Karen goes unspoken-to for a few weeks, which she may read as you having decided." },
    { label: "Put her on a 30-day activity plan to see whether the numbers move.", quality: "weak", pattern: "label", cost: "She works the plan and the numbers don't move, because activity was never the problem.", feedback: "A plan feels fair and specific. But it assumes the answer, that effort is the lever, and measures the one thing she's already doing." },
  ],
  reasoning: "The story you've told before is often right, which is why it's dangerous. Here at least three other explanations fit the facts: a territory re-cut, a changed pay plan, a tired rep. The strongest answer widens the picture first, then asks, and only then decides which conversation to have.",
  principle: "Before you explain a person, rule out the situation. The quick story is the one you've told before.",
  then: "Karen's margin per case is up 11%; the plan pays her less for it. You get the plan adjusted for the re-cut for two quarters. Her visits don't change. Her numbers do.",
  nextMove: "When someone's numbers move, write three possible causes that aren't the person. Check each before the conversation.",
},
```

### Track 5 · Lead yourself

#### 18. q4-fatigue

```js
{
  id: "q4-fatigue", who: "Sales manager (8 reps)", customer: "You", channel: "off", category: "Portfolio",
  stage: "Recover", skill: "self", theme: "rest", trade: ["drive", "rest"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "How you show up, including how rested and reactive you are, is part of the result you produce." },
  tension: { book: "How Google Works", lesson: "A team that knows the situation can carry some of the load; it is usually your silence that stops it." },
  voice: "You've been up since four again.",
  situation: "It's the second week of December. You've slept about five hours a night since Halloween. You're six points short of plan and your team is four short. Yesterday you snapped at a rep over a typo in a display count, and this morning you realized you can't recall what you promised the Kroger buyer on Tuesday. Thursday evening is your son's school concert, and you missed the last one.",
  evidence: [["Your quarter", "94% of plan · three weeks left", "warn"], ["Your sleep, last six weeks", "about 5 hours a night", "bad"], ["Yesterday", "snapped at a rep over a typo", "bad"], ["Tuesday's promise to the Kroger buyer", "you can't recall the details", "bad"], ["Your team", "tired too; two have stopped sending you bad news", "warn"], ["Thursday 5:30pm", "your son's concert; you missed the last one", "warn"]],
  pause: "What would you tell your best rep to do if they were in your seat?",
  question: "What do you do?",
  options: [
    { label: "Apologize to the rep. Cut your list to the three moves that close the gap, and keep Thursday evening and a full night's sleep.", quality: "best", strength: "rest", leans: "rest", feedback: "You repaired the damage, chose where the last three weeks really count, and protected the things that keep you sharp. It costs you the extra hours that might have closed a point or two, and a bit of guilt about leaving things undone." },
    { label: "Push through to year-end with a clear stop date: three hard weeks, sleep when you can, and four days off in January.", quality: "good", leans: "drive", feedback: "A planned finish line is a different thing from an open-ended grind, and some quarters do call for it. The honest cost: tired decisions in the weeks that count most, and a team that's already watching you wear down." },
    { label: "Tell your team the truth: you're stretched, the gap is real, and ask each of them for one thing they can take off your plate.", quality: "good", leans: "team", feedback: "Honesty with the team lightens your load and tells them how much you trust them. The gap is that it fixes your workload but not your sleep, and the apology you owe the rep is still unsaid." },
    { label: "Keep this pace through the 31st. Your team is tired too, and you can't ask them for more than you're giving.", quality: "weak", pattern: "grind", cost: "At 94% and tired, you misplace another promise to a buyer, and your best rep stops telling you bad news.", feedback: "Leading by example is a real value, and the gap is real. But your example right now is a manager with no margin left, and the thing running low is judgment, which the last three weeks need most." },
  ],
  reasoning: "Drive and rest are both real, and in the short run extra hours look free. They aren't: your forgotten promise, the snapped call and the quiet reps are already the invoice. The strongest answer is a smaller list, an apology, and the evening you'd regret missing.",
  principle: "Tired is a business risk. Treat your rest like you'd treat a key account.",
  then: "You apologize; he laughs and admits he'd started hiding a miss. You close the Kroger detail by phone on Wednesday, drop two internal meetings, and make Thursday. You finish at 98%, two points short, with a team that still talks to you.",
  nextMove: "Block next week's non-negotiables first (sleep, one evening, one meal), then schedule work around them. Ask a trusted rep what they've noticed.",
},
```

#### 19. defensive-in-review

```js
{
  id: "defensive-in-review", who: "Regional sales manager", customer: "Your director", channel: "off", category: "Sparkling water",
  stage: "Review", skill: "self", theme: "overconfidence", trade: ["confidence", "humility"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice when ego or defensiveness is driving, and take responsibility before you explain." },
  tension: { book: "Trillion Dollar Coach", lesson: "A leader who can be coached asks questions about their own results before defending them." },
  voice: "The Q3 endcap program missed by a wide margin. Walk me through it.",
  situation: "Your director opens your quarterly review with a slide: your region's promo return was 0.7x against a plan of 1.2x. The program you championed caused it. You feel your face heat up and a list of reasons ready: supply was short, finance changed the rules, two buyers cut weeks. Most of those are true. Two of your peers are in the room.",
  evidence: [["Promo return against plan", "0.7x · plan 1.2x", "bad"], ["Your reasons", "supply short · rules changed · two buyers cut weeks (all true)"], ["The program", "you championed it", "warn"], ["What you didn't check beforehand", "velocity in the second-tier markets", "warn"], ["Who's in the room", "your director and two peers"], ["Your body", "flushed, pulse up", "warn"]],
  pause: "What would your best rep say first if this were their program?",
  question: "What do you say?",
  options: [
    { label: "Breathe, then: “I championed it, and it missed.” Ask what she sees, and give the two things you'd do differently before any reasons.", quality: "best", strength: "own", leans: "humility", feedback: "You named your part in one sentence, asked for her view, and put your learning ahead of your explanations. It costs you a little pride in front of peers. It buys back the credibility the reasons would have spent." },
    { label: "Give the facts in order: what you expected, what changed (supply, rules, buyer cuts), and what you learned. Own the call at the end.", quality: "good", leans: "confidence", feedback: "Facts in order are clear, and the reasons are true. The risk is in the sequence: said first, they sound like excuses, and the ownership at the end may arrive after she's stopped listening." },
    { label: "Say you want the afternoon to go through the data properly, and you'll come back to her tomorrow.", quality: "good", leans: "humility", feedback: "Taking time to think rather than react is wise, and she may respect it. The cost is that it can look like avoidance, and in front of peers you've said nothing about your part." },
    { label: "List the three outside causes and point out that finance approved the plan.", quality: "weak", pattern: "defend", cost: "Your director hears someone who won't own a miss, and your peers learn what you do when you're wrong.", feedback: "The causes are true and finance did sign off, which is why it's tempting to lead with them. The effect is to turn a review of a program into a defense of you." },
  ],
  reasoning: "Confidence and humility aren't opposites, but under heat they feel that way. A short, plain sentence of ownership doesn't weaken your case; it earns the right to make it. The reasons are still true afterward and will be heard.",
  principle: "Own it in one sentence before you explain it. The explanation is heard better afterward.",
  then: "She nods. “I know about the supply issue. I wanted to hear the first part.” The rest of the review is about Q1, not the post-mortem.",
  nextMove: "Write the one sentence you'd say when you're responsible for a miss. Say it aloud once before your next review.",
},
```

#### 20. miss-the-field

```js
{
  id: "miss-the-field", who: "Sales manager (7 reps)", customer: "You and your team", channel: "off", category: "Refrigerated juice",
  stage: "Plan", skill: "self", theme: "love", trade: ["joy", "leverage"],
  lens: { book: "High Output Management", lesson: "A manager's output is the output of the team, so your time should go where it multiplies others." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "What energizes you is information, not a failing; use it rather than fight it." },
  voice: "Want to hit a few stores with me on Saturday? Like old times?",
  situation: "Since you became a manager you've spent most Saturdays in stores, building displays with your reps. It's what you love, the reps like it, and compliance is higher where you go. But your roll-ups reach your director late, you haven't had a one-on-one with two of your reps in five weeks, and one asked, “When do I get to run a reset on my own?”",
  evidence: [["Saturdays in stores last quarter", "9", ""], ["Display compliance in stores you visit", "+8 points", "good"], ["Your roll-ups to your director", "late 4 of 6", "warn"], ["Missed one-on-ones", "2 reps · 5 weeks", "bad"], ["How you feel in a store", "most like yourself", "warn"], ["A rep's question", "'when do I get to run a reset on my own?'", "warn"]],
  pause: "What do you give up, and who gives it up, when you do the part you love?",
  question: "What do you do with the Saturdays?",
  options: [
    { label: "Keep one store morning a month on purpose: a rep leads the reset, you watch and ask. Give the other hours to one-on-ones and your roll-up.", quality: "best", strength: "develop", leans: "leverage", feedback: "You kept what you love and pointed it at the thing only you can do, which is teaching. It protects the one-on-ones, your director's numbers and your own energy. It costs you most of your Saturdays, and some displays won't be as good as yours." },
    { label: "Ask your team what they'd do if you stopped joining. If they can run resets alone, step back; if not, teach them first.", quality: "good", leans: "leverage", feedback: "Asking the team is sound and avoids deciding for them. It takes a few weeks to learn, and meanwhile the one-on-ones and roll-ups stay behind." },
    { label: "Keep your Saturdays and catch up on one-on-ones and the roll-up on Sunday night. The store work keeps you going.", quality: "weak", pattern: "grind", cost: "By October the Sunday nights are gone too, and the roll-up is still late.", feedback: "It protects the work you love and sounds like dedication. But the roll-ups and one-on-ones were already slipping, and Sunday night is a fix you only get to use once." },
    { label: "Stop all store work. You're a manager now, and your time has a price.", quality: "weak", pattern: "rule", cost: "You lose what keeps you good at this, and your reps lose the signal that field work matters.", feedback: "Clear boundaries are healthy, and the lesson about leverage is right. As a rule it removes the thing that fuels you, and the reps lose the best teacher they have." },
  ],
  reasoning: "Love of the work is a reason to do it and a reason to be careful with it. Doing it for your team keeps you good and keeps them dependent. Doing it with them, with a rep leading, is the same hours turned into leverage.",
  principle: "Keep the part of the work you love, and use it to make someone else better at it.",
  then: "On your one Saturday, Pri leads a six-store reset while you carry the ladder. She says, “You didn't tell me where to put the cold box,” and she's right. Your roll-up goes in on time and the two skipped one-on-ones happen.",
  nextMove: "Book the two overdue one-on-ones before you book your next store day.",
},
```

#### 21. vacation-text

```js
{
  id: "vacation-text", who: "Sales manager (8 reps)", customer: "Your team", channel: "off", category: "Salty snacks",
  stage: "Recover", skill: "self", theme: "rest", trade: ["rest", "speed"],
  lens: { book: "How Google Works", lesson: "Give people the context and authority to decide so that they do not need you to be reachable." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice whether your availability is about the work or about your need to be needed." },
  voice: "Sorry to bug you on PTO. Safeway wants to know if we can do the BOGO. Thoughts?",
  situation: "It's day two of your first full week off in two years. A rep texts about a $4,000 promo question that falls inside the limit you gave him last month. Three more texts came yesterday, all things the team could have answered. You've replied within minutes each time, and you've noticed they now text you first. Tasha was named as cover, but nobody told her what that covers.",
  evidence: [["Texts yesterday", "4 · all inside delegated limits", "warn"], ["Your reply time", "under 10 minutes", "warn"], ["The question", "$4,000 promo, inside his limit; Safeway wants an answer Friday"], ["Your cover", "Tasha, named but not told what it covers", "warn"], ["At home", "your partner asked you to put the phone in the car", "warn"], ["Time left", "5 days"]],
  pause: "If you never replied, who would decide, and would they be able to?",
  question: "What do you do?",
  options: [
    { label: "Reply once: “It's inside your limit. Use your judgment, tell Tasha, and I'll look when I'm back.” Then check messages at one set time a day.", quality: "best", strength: "boundary", leans: "rest", feedback: "You returned the decision to the person who has the limit and the information, told him who else to loop in, and created a rhythm you can keep. It protects your rest and builds his judgment. It costs you the little rush of being the one who knows." },
    { label: "Answer this one with a quick yes. Tell the team that from tomorrow Tasha has the keys and you'll check once a day at noon.", quality: "good", leans: "speed", feedback: "A quick yes keeps Safeway moving, and the announcement fixes the system. It's a good plan; the cost is one more reply that reinforces the habit it is trying to end." },
    { label: "Answer all of them. Five days is a long time and the quarter matters.", quality: "weak", pattern: "grind", cost: "You get no rest, and the team learns that your week off still runs through you.", feedback: "Your care for the quarter is real. But the team still can't decide without you, and your time off isn't restoring anything." },
    { label: "Switch your phone off without a word and trust it will work out.", quality: "weak", pattern: "drop", cost: "A rep makes a $4,000 guess with no cover, and Safeway waits.", feedback: "Rest is right. The weak part is leaving without telling Tasha what she's covering or the team what's theirs to decide. Rest works when people know who decides." },
  ],
  reasoning: "The texts are a symptom. Your team asks you because you answer fast, and you answer fast because it feels good to be needed. The strongest answer sends the decision back with the context it needs, then sets a boundary you can keep.",
  principle: "Rest works when the team knows who decides. Say that before you leave, not by text on day two.",
  then: "He decides, tells Tasha, and Safeway gets a yes before lunch. On day four there are no texts. You come back to one question that was truly yours.",
  nextMove: "Before your next time off, write what each person can decide without you, who covers, and the three things that would justify a call.",
},
```

#### 22. sure-of-the-plan

```js
{
  id: "sure-of-the-plan", who: "Regional sales manager", customer: "Your region", channel: "off", category: "Cold brew coffee",
  stage: "Plan", skill: "self", theme: "overconfidence", trade: ["confidence", "openness"],
  lens: { book: "Poor Charlie's Almanack", lesson: "The more sure you are, the more disciplines and base rates you should bring to the plan." },
  tension: { book: "Trillion Dollar Coach", lesson: "A leader's job is to ask questions that let the team improve the plan, not to defend it." },
  voice: "No questions? Great. Let's go.",
  situation: "You've built a plan to move 40% of your region's selling effort to a new cold brew launch. You've led three launches that hit year-one targets, and you're sure. Your reps were polite and silent. A finance partner asked, “What if the distributor doesn't incent it?” and you answered in ten seconds. The plan is due Tuesday. Your three earlier launches were in markets with stronger distributors than this one.",
  evidence: [["Your launches", "3 of 3 hit year-one targets", "good"], ["This region's distributor", "weaker; about 22% fewer reps than in those markets", "warn"], ["Effort you'd shift", "40% of selling hours", "warn"], ["Your team's reaction", "polite; no questions", "warn"], ["Finance's question", "answered in ten seconds", "warn"], ["How you feel", "sure", "warn"]],
  pause: "What would you need to see in 30 days to know you were wrong?",
  question: "What do you do before Tuesday?",
  options: [
    { label: "Pilot it: shift 15% of effort in three markets for eight weeks. Write down beforehand what result makes you go bigger and what makes you stop.", quality: "best", strength: "ask", leans: "openness", feedback: "You kept your conviction and made it testable, with a rule written before you could rationalize. It protects the region's quarter and your credibility. It costs speed: you reach the full launch a couple of months later than you wanted." },
    { label: "Go ahead, but first ask the team and the finance partner for the three ways it could fail, and add a review at week six.", quality: "good", leans: "openness", feedback: "Collecting the doubts out loud and adding a checkpoint is a sensible compromise, and it keeps the momentum. The risk is that the review comes too late to be cheap to act on, with 40% of your hours already moved." },
    { label: "Delay a week and talk to the two managers who ran launches with weaker distributors. Then decide.", quality: "good", leans: "confidence", feedback: "Learning from someone who's been in your exact spot is worth a week. The cost is the deadline, and the risk that two stories feel like proof when they are still two stories." },
    { label: "Go all in as planned. Hesitating would tell the team you don't believe in it.", quality: "weak", pattern: "defend", cost: "At week six the weak-distributor markets lag by half, and 40% of your hours are already committed.", feedback: "Visible conviction does matter for a team. But conviction and a pilot aren't opposed, and the team's silence is a reason to ask, not a reason to go faster." },
  ],
  reasoning: "Three launches that worked is a real record, and the fourth looks different on one specific point. Sureness is a feeling, and its cheapest cure is a small test with a pre-written finish line.",
  principle: "When you're most sure, look hardest for how you could be wrong. Sure is a feeling, and a pilot is cheap.",
  then: "At week six the pilot markets with weaker distributors lag by half. You scale in the stronger markets and fix the incentive in the weak ones. It costs you a month, not a year.",
  nextMove: "Before your next big plan, write what you'd expect to see in 30 days if you're wrong. Put that date in the calendar.",
},
```
### Track 6 · Manage up and across

#### 23. friday-6pm-email

```js
{
  id: "friday-6pm-email", who: "Sales manager (8 reps)", customer: "Your VP", channel: "off", category: "Portfolio",
  stage: "Decide", skill: "across", theme: "rest", trade: ["rest", "drive"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Respond from a clear head instead of from alarm; pressure from above is something you choose how to meet." },
  tension: { book: "How Google Works", lesson: "People work better when they know why a request exists, and asking is part of giving context." },
  voice: "Need a store-level recovery plan for the Q4 shortfall on my desk Monday 8am. Thanks.",
  situation: "At 6:10 on Friday your VP sends that note. Your team just finished a brutal week. Your anniversary dinner is at 7:30. The data is mostly on your laptop. She rarely asks for things, and the last time you pushed back you spent weeks wondering if it counted against you.",
  evidence: [["The ask", "store-level recovery plan by Monday 8am"], ["Work needed", "about 4 hours alone · about 10 with the team", "warn"], ["Her usual pattern", "asks late Friday, often reads on Tuesday", "warn"], ["Your team", "just finished a hard week; one rep has a child's birthday Saturday"], ["Tonight", "your anniversary dinner, 7:30", "warn"], ["Last time you pushed back", "she said 'fine' and moved on; you worried for weeks", "warn"]],
  pause: "What is the deadline for? Do you know?",
  question: "What do you do?",
  options: [
    { label: "Reply tonight: “Got it. What decision does Monday's meeting make? I'll send a first cut at 8 and the full plan by Wednesday noon.” Then go to dinner.", quality: "best", strength: "ask", leans: "rest", feedback: "You said yes, asked the question that matters, and offered a staged answer. It protects your evening and your team's weekend, and gives her something at 8. It costs a little nerve: she might say, 'No, I need all of it Monday.'" },
    { label: "Reply that she'll have it Monday at 8. Spend two hours on it Sunday afternoon yourself and don't bring in the team.", quality: "good", leans: "drive", feedback: "You protect the team and hold your word without a negotiation. The cost is your Sunday and the quiet habit it feeds, which is that every late Friday email gets a weekend." },
    { label: "Reply that she'll have it Monday, then ask two reps to pull data on Saturday and promise comp time.", quality: "weak", pattern: "please", cost: "A Saturday for two reps, for a document that may not be read until Tuesday.", feedback: "Comp time is a kind gesture and it keeps your word. But it passes your Friday-night problem to the people who just had the hardest week, and you never found out whether it was needed." },
    { label: "Say yes, cancel dinner, and work all weekend with the team so the plan is excellent.", quality: "weak", pattern: "grind", cost: "Your anniversary, two reps' weekends, and a plan that's more than anyone needed.", feedback: "Dedication to the job is real. Doing it before asking what the plan is for means the whole weekend rests on a guess." },
  ],
  reasoning: "Rest and drive are both owed, and a clear head is how you serve both. The strongest answer doesn't push back or give in. It asks one question, offers a first cut, and trusts her to answer. If she needs all of it Monday, you can still do it, and you will have done it knowing why.",
  principle: "Ask what a deadline is for before you give up a weekend for it. Most deadlines can be met in a smaller way.",
  then: "She replies in four minutes: “First cut is fine. It's for Wednesday's call with the CEO.” You send a one-page view Monday at 8 and the full plan Tuesday. No one on your team loses a Saturday.",
  nextMove: "The next time a deadline lands late, ask what decision it supports before you accept it.",
},
```

#### 24. number-you-cant-hit

```js
{
  id: "number-you-cant-hit", who: "Regional sales manager", customer: "Your VP", channel: "off", category: "Portfolio",
  stage: "Plan", skill: "across", theme: "fears", trade: ["candor", "team"],
  lens: { book: "What the CEO Wants You to Know", lesson: "Know the drivers of the number, because a range with drivers is something the business can act on, and a bare promise is not." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice the fear in your body before you let it write your answer." },
  voice: "Are we good for the year? I need to tell the CEO on Thursday.",
  situation: "Your region is at 91% with six weeks left. Two big resets slipped to Q1, a distributor is overstocked, and a competitor cut price. Your honest range is 94% likely and 96% at best, against a plan of 100%. Your VP said last month, “I can't have another region miss.” Your team is working hard and most of them think you'll find the number.",
  evidence: [["Year to date", "91% of plan", "warn"], ["Honest range for the year", "94% likely · 96% at best", "bad"], ["What's behind the gap", "2 resets slipped to Q1 · distributor overstocked · competitor price cut"], ["What your VP said last month", "'I can't have another region miss'", "warn"], ["What your team believes", "most think you'll find the number", "warn"], ["What you're afraid of", "being the first to say it", "warn"]],
  pause: "If you were your VP, what would you want to know, and when?",
  question: "What do you tell her?",
  options: [
    { label: "Tell her now: “Likely 94, best case 96. Here's what's behind the gap, what we can still move, and what I need from you.”", quality: "best", strength: "whole", leans: "candor", feedback: "You gave her a range, the reasons and an ask while she still has time to use them. It protects her credibility with the CEO and yours with her. It costs the uncomfortable minute of saying it first." },
    { label: "Tell her the truth, but only after you've told your team and given them a week to close the gap.", quality: "good", leans: "team", feedback: "Telling the team first respects them, and a week of focused effort might move a point. The cost is time she doesn't have: Thursday is the CEO call, and she'll learn later that you knew." },
    { label: "Give her 96% as the number with the drivers, and mention that 94% is the risk you're watching.", quality: "good", leans: "confidence", feedback: "It's truthful about the range and shows your work. But it anchors on the best case, and she'll plan on 96 and carry 94 to the CEO as a surprise." },
    { label: "Say “we'll get there” and commit to 100%. A reorg is rumored and you can't look weak.", quality: "weak", pattern: "overpromise", cost: "In three weeks you're at 93, and her CEO has been told 100.", feedback: "Fear of looking weak is real, and so is the rumor. But you've handed her a number you don't believe, and the only thing that follows from a number you don't believe is a bigger miss." },
  ],
  reasoning: "The fear is natural and it points the wrong way. Bad news gets worse the longer it's held, and a range with its reasons is something a VP can plan with. The options that wait, anchor, or promise all protect you for a few days at her cost.",
  principle: "Bad news gets worse with every week it's held. Bring the range, the drivers, and the ask.",
  then: "She exhales: “I can work with 94. I can't work with a surprise.” She takes 94 to the CEO and helps you push the distributor in week five. You land at 95.",
  nextMove: "Write today's honest range and what's behind it for your own number, even if no one has asked. Send it before they do.",
},
```

#### 25. reorg-rumor

```js
{
  id: "reorg-rumor", who: "Regional sales manager", customer: "Your team", channel: "off", category: "Portfolio",
  stage: "Recover", skill: "across", theme: "trust", trade: ["candor", "follow"],
  lens: { book: "How Google Works", lesson: "Transparency is part of the environment you build; people can handle uncertainty, but not a leader who hides it." },
  tension: { book: "Poor Charlie's Almanack", lesson: "Think about what each person will do when they hear it, including the incentives of a rumor." },
  voice: "Is it true? I heard they're merging our region with the East.",
  situation: "A peer told you off the record that HQ is studying a merger of two regions next quarter. Nothing is decided, and you were asked to keep it private until HQ announces. Two of your best reps asked you directly today, and one has had a recruiter call this week. In March you told the team that no changes were planned, which was true then.",
  evidence: [["What you know", "a merger is being studied; no decision, no date"], ["What you were asked", "to keep it confidential until HQ announces"], ["What reps know", "a rumor; two asked you directly", "warn"], ["Risk", "one top rep has a recruiter call this week", "bad"], ["What you told them in March", "'no changes planned' (true then)", "warn"], ["Your own worry", "your job may be one of the ones that changes", "warn"]],
  pause: "What will they remember when it's announced: what you said, or that you said it?",
  question: "What do you tell them?",
  options: [
    { label: "Say what's true: you've heard talk, nothing is decided, you were asked to keep details private, and you'll tell them what you can when you can.", quality: "best", strength: "candor", leans: "candor", feedback: "You told the truth about what you know and what you don't, and about the limit on what you can say. It protects their trust in you and respects the request you were given. It costs you the comfort of a clean denial, and the questions you'll still get." },
    { label: "Go to your VP first: ask what you may tell the team, and promise them an answer by Friday.", quality: "good", leans: "follow", feedback: "It keeps your confidence and gets a safe script. The cost is two days of silence while a recruiter is calling, and the risk that 'I'll get back to you' sounds like what you say when it's true." },
    { label: "Tell your two top reps privately what you know, so you don't lose them, and ask them to keep it quiet.", quality: "weak", pattern: "please", cost: "The team splits into two classes, and the secret doesn't last the week.", feedback: "Keeping your best people is a real worry. But choosing who gets the truth is how a rumor turns into a rift, and you've asked them to keep a secret that isn't theirs." },
    { label: "Deny it: “No changes planned.” It was true in March.", quality: "weak", pattern: "soften", cost: "When it's announced, you've lied to them, and nobody remembers March.", feedback: "It was true once, and it spares everyone a hard few weeks. But now you know otherwise, and a statement you know is out of date is a lie by omission." },
  ],
  reasoning: "You owe HQ discretion and your team honesty, and the two are compatible if you're precise. You can't tell them everything. You can tell them what is true about what you know and don't, and what you'll do when that changes.",
  principle: "Tell people what you can, tell them what you can't, and never tell them what isn't so.",
  then: "Three reps thank you for saying it straight. The one with the recruiter call stays through the announcement and later says, “If you'd said nothing I'd have left.”",
  nextMove: "Decide now what you'd say to your team if you heard bad news tomorrow. Write three sentences: what you know, what you don't, when you'll update.",
},
```

#### 26. win-that-costs-supply

```js
{
  id: "win-that-costs-supply", who: "Lead rep (no title)", customer: "Your regional chain account", channel: "off", category: "Sparkling water",
  stage: "Decide", skill: "across", theme: "teamwork", trade: ["results", "team"],
  lens: { book: "What the CEO Wants You to Know", lesson: "Every function is part of one business, so judge a win by what it does to the company's margin, cash and capacity." },
  tension: { book: "How Google Works", lesson: "Share context early and openly so the people affected can solve the problem with you." },
  voice: "Great work. Lock it in before they change their mind.",
  situation: "You're the lead rep, with no title but a lot of influence, and you've negotiated a four-week BOGO with a regional chain, worth $180K and your best win this year. Then ops tells you the plant is 98% booked in that window, and the West region's launch, worth more, needs the same capacity. Your manager congratulated you in the team channel. You told the buyer, “I think we're good,” and nothing is in writing.",
  evidence: [["Your win", "$180K in four weeks · margin 31%", "good"], ["Plant capacity in that window", "98% already booked", "bad"], ["West region's launch", "$240K · margin 36% · slips if yours runs", "warn"], ["Your bonus", "your win counts; theirs doesn't", "warn"], ["What you told the buyer", "'I think we're good', nothing in writing", "warn"], ["Your manager", "congratulated you publicly"]],
  pause: "Whose job is it to decide which one runs? Is it yours?",
  question: "What do you do?",
  options: [
    { label: "Bring supply chain and the West lead together this week with both programs' margin and timing, and agree what the business should run.", quality: "best", strength: "whole", leans: "team", feedback: "You raised it early, with numbers from both sides, in front of the people who own the answer. It protects the company's margin and the buyer's trust. It costs you control of the outcome, and your win might shrink or move." },
    { label: "Run yours. You earned it and gave your word. Ask supply chain to find capacity for West by shifting their date.", quality: "good", leans: "follow", feedback: "Keeping your word to a buyer matters, and you may be right that West can move. The cost is that you've decided the company's priority for it, and the other region learns about it from supply chain." },
    { label: "Offer to move yours to the next window. West's has the higher margin, and your buyer may accept a different date.", quality: "good", leans: "team", feedback: "It's generous and probably good for the business. But you decided alone, before knowing whether the buyer would move, and spent some of their goodwill in advance." },
    { label: "Get the buyer's date in writing first, then tell supply chain, so you arrive with a done deal and not a problem.", quality: "weak", pattern: "lock", cost: "West's launch slips, and ops learns about the conflict after the buyer has it in writing.", feedback: "Securing the win is sensible, and no one can say you sat on it. But signing first takes the choice away from the people who own the capacity, and the cost lands on a team that never saw it coming." },
  ],
  reasoning: "A win for you can be a loss for the business, and you may be the only person who sees both at once. You don't have to decide it alone, and you shouldn't. The strongest move puts both programs side by side with the people who own the answer.",
  principle: "A win that costs another team isn't yet a win for the business. Put both on the table together.",
  then: "Supply chain finds about 15% more capacity by shifting a changeover. Your BOGO runs a week later, and West's launch holds. The buyer accepts the new date. You find out your win was smaller than you thought, and the company's was larger.",
  nextMove: "Before you finalize your next big deal, ask who else needs what it uses: capacity, inventory, trade dollars, people.",
},
```

### Track 7 · Grow people

#### 27. rookie-overpromises

```js
{
  id: "rookie-overpromises", who: "Sales manager (6 reps)", customer: "Jamal, four months in", channel: "off", category: "Protein bars",
  stage: "Coach", skill: "grow", theme: "follow-through", trade: ["growth", "results"],
  lens: { book: "High Output Management", lesson: "Teach a clear check before the commitment is made, so quality doesn't rely on your catching it afterward." },
  tension: { book: "Trillion Dollar Coach", lesson: "Help talented people perform by being beside them, not instead of them." },
  voice: "I told the buyer we'd have 20 more stores and a display by Friday. Was that wrong?",
  situation: "Jamal is talented and hungry. Without checking with the distributor or with you, he told a Sprouts buyer, a three-year customer, that he'd have 20 more stores and a display by Friday. The distributor can set 8 stores, and the display will be next week. Last week Jamal told you he's afraid he's “not cutting it.”",
  evidence: [["The promise", "20 stores and a display by Friday"], ["What's possible", "8 stores by Friday · display next week", "warn"], ["The buyer", "three years with you; patient but keeps a list", "good"], ["Jamal's state", "afraid he's 'not cutting it'", "warn"], ["Today", "Tuesday"], ["Six months ago", "a rep's overpromise cost you a feature week", "warn"]],
  pause: "Whose call is it to the buyer, and who will learn the most from making it?",
  question: "What do you do?",
  options: [
    { label: "Work it out with Jamal in 20 minutes: what can we deliver, and what does he say? He makes the call to the buyer, and you sit in.", quality: "best", strength: "develop", leans: "growth", feedback: "He fixes his own promise, with a safety net, and keeps both the buyer's trust and his own confidence. It costs you 20 minutes and the chance to get it exactly right yourself." },
    { label: "Call the buyer yourself today with the corrected plan, then debrief Jamal on what to check next time.", quality: "good", leans: "results", feedback: "It protects the customer with certainty, and the debrief teaches. The cost is that Jamal watches you repair his mistake, and he may hear it as a verdict on whether he can be trusted with calls." },
    { label: "Tell Jamal firmly that nobody promises dates without your approval, starting now.", quality: "weak", pattern: "rule", cost: "Reps stop promising and start waiting for you, even for easy things.", feedback: "A tighter rule after a mistake is natural. But it fixes the instance with a rule that grows the queue at your desk, and Jamal still hasn't done the repair." },
    { label: "Let Jamal find out on Friday that the promise can't be kept. He'll remember it.", quality: "weak", pattern: "drop", cost: "The buyer loses faith, and Jamal learns it alone and in public.", feedback: "Experience is a strong teacher. But the buyer pays for the lesson, and Jamal, who is already doubting himself, may take away the wrong one." },
  ],
  reasoning: "Jamal's mistake is overconfidence and eagerness, which are a good rep's flaws. The customer needs to hear the truth before Friday; Jamal needs to learn to be the one to say it. Together they point to the same move.",
  principle: "A promise you can't keep is fixed fastest by the person who made it, with you beside them.",
  then: "Jamal calls: “I overreached. Here's what I can do Friday and what I can do next week.” The buyer says, “Thank you for telling me before Friday.” Jamal starts texting you, “About to promise X, sanity check?” once a week.",
  nextMove: "Write the three questions a rep asks before promising a buyer a date, a number, or a display. Hand them out and ask for edits.",
},
```

#### 28. quiet-says-fine

```js
{
  id: "quiet-says-fine", who: "Sales manager (7 reps)", customer: "Hana, a strong third-year rep", channel: "off", category: "Hummus",
  stage: "Coach", skill: "grow", theme: "fears", trade: ["patience", "candor"],
  lens: { book: "Trillion Dollar Coach", lesson: "Good questions and real attention are how you find out what's going on with people." },
  tension: { book: "The 15 Commitments of Conscious Leadership", lesson: "Be curious about what you might be missing, including what you have avoided asking." },
  voice: "I'm fine. Really.",
  situation: "Hana used to push back hard in meetings. For six weeks she's been quiet, hitting her numbers, and saying “fine.” Yesterday she asked about the process for moving to another territory, then said, “Never mind.” You're slammed. She has said she's fine five times, and you've moved on each time.",
  evidence: [["Hana's numbers", "103% of plan", "good"], ["Her part in meetings", "was top two · now silent", "warn"], ["Yesterday's question", "about moving territories, then withdrawn", "warn"], ["Last five one-on-ones", "she said 'fine'; you moved on each time", "warn"], ["Your calendar", "next free hour is Thursday", "warn"], ["What you know about her life", "little; you've kept it professional"]],
  pause: "What question haven't you asked because you were afraid of the answer?",
  question: "What do you do?",
  options: [
    { label: "Ask differently: “You asked about moving yesterday and then dropped it. What's behind that?” Block an hour and let her take as long as she needs.", quality: "best", strength: "ask", leans: "candor", feedback: "You asked about the thing she actually raised, and gave the question room. It protects her trust and may keep a good rep. It costs you an hour you don't have, and she may still say 'fine'." },
    { label: "Tell her you've noticed she seems different and that you're around if she wants to talk. Say nothing more now.", quality: "good", leans: "patience", feedback: "It respects her space and leaves the door open. The risk is that after five 'fines' the door is not the issue. You've shown care, but she hasn't been asked anything she can answer." },
    { label: "Take her numbers as the answer. She's at plan and she said she's fine.", quality: "weak", pattern: "assume", cost: "She transfers in January, and you learn why from her next manager.", feedback: "Numbers are good, and respecting 'fine' is reasonable. But you've heard it five times, and the question she asked about moving is exactly the sort of thing a person tests the water with." },
    { label: "Raise it with your director as a retention risk, and ask for guidance.", quality: "weak", pattern: "pass", feedback: "A retention risk is worth sharing, and asking for help is smart. As a first step it skips the person herself, and Hana is the only one who knows what's going on." },
  ],
  reasoning: "Candor and patience are both ways of respecting her. The patient option waits to be invited; the candid one invites. After five 'fines,' she's more likely to need the invitation than the privacy. Ask about the specific thing she raised, not how she is in general.",
  principle: "A rep who says “fine” five times is telling you something. Ask a different question and make room for the answer.",
  then: "It takes a long silence. The Whole Foods contact she built over two years left, and she feels her work has become invisible. You introduce her to the new buyer and put her account win in your next update. She's arguing in meetings again within three weeks.",
  nextMove: "Pick the rep you've asked “how are you?” three times without a real answer. Ask a specific question instead: “What's the least fun part of your week?”",
},
```

#### 29. ask-dont-answer

```js
{
  id: "ask-dont-answer", who: "Lead rep (mentoring a newer rep)", customer: "Ben, eight months in", channel: "off", category: "Better-for-you snacks",
  stage: "Coach", skill: "grow", theme: "trust", trade: ["speed", "growth"],
  lens: { book: "Trillion Dollar Coach", lesson: "A leader asks more than they tell, because the best answer is the one the other person finds with you." },
  tension: { book: "High Output Management", lesson: "Time is the scarce resource, and coaching has to fit the time you actually have." },
  voice: "What should I do about Safeway? Just tell me what you'd do.",
  situation: "Your manager asked you to mentor Ben. Safeway wants to cut your facings from 4 to 3, and Ben asks you, for the fourth time in six weeks, what to do. You know the answer in ten seconds. You have 14 minutes before a call with your own manager. His results are fine, but his plans are thin, and last week he said, “I just don't want to get it wrong.”",
  evidence: [["Times Ben has asked 'what should I do?'", "4 in six weeks", "warn"], ["How long you'd take to answer", "ten seconds"], ["Time before your own call", "14 minutes", "warn"], ["Ben's own plans", "thin; he often presents yours back", "warn"], ["What he said last week", "'I just don't want to get it wrong'", "warn"], ["Safeway deadline", "Thursday; today is Tuesday", "good"]],
  pause: "Which would Ben remember in a month: your answer, or his?",
  question: "What do you say?",
  options: [
    { label: "“I'll tell you mine after you tell me yours: what do you think Safeway really wants?” Then book 15 minutes tomorrow to compare.", quality: "best", strength: "ask", leans: "growth", feedback: "You turned his question into a question, and the Tuesday-to-Thursday gap gives him room to think. It costs you ten seconds of efficiency and a mild frustration on his part. The payoff is that tomorrow's conversation starts from his idea." },
    { label: "Tell him your answer, then ask him to explain why it works, so he learns the reasoning with the answer.", quality: "good", leans: "speed", feedback: "You give him a working answer and teach the logic behind it. The cost is that it's still your answer, and he'll bring you the next one the same way." },
    { label: "Tell him the answer this time because of your call, and say that next time you'll ask for his first.", quality: "good", leans: "speed", feedback: "Honest about your constraint, and the promise sets expectations. The risk is that next time never comes, and you've given a fifth answer on a Tuesday when you had two days." },
    { label: "Give a ten-minute walkthrough of everything you know about Safeway, so he has the full picture.", quality: "weak", pattern: "lecture", cost: "He takes notes, nods, and sends you the next question on Friday.", feedback: "Generosity with knowledge is a good instinct. But the full picture is yours, and he'll leave with notes, not the confidence to build one of his own." },
  ],
  reasoning: "The quick answer helps this week and teaches nothing. Ben's fear of getting it wrong is the reason he keeps asking, and each answer you give confirms that someone else gets it right. With two days of runway, you can afford to ask.",
  principle: "Ask first and answer second, and only if they're stuck.",
  then: "Ben's idea is half yours: counter with velocity by facing. He adds something you hadn't thought of: offering a seasonal facing to fill Safeway's private-label gap. He presents it Thursday without notes from you.",
  nextMove: "For the next five “what should I do?” questions, answer with “what do you think?” first. Count how often their answer is good enough.",
},
```

#### 30. burned-out-star

```js
{
  id: "burned-out-star", who: "Regional sales manager", customer: "Zoe, your top rep", channel: "off", category: "Energy drinks",
  stage: "Review", skill: "grow", theme: "dedication", trade: ["results", "rest"],
  lens: { book: "The 15 Commitments of Conscious Leadership", lesson: "Notice what your own praise rewards, and take responsibility for the culture it creates." },
  tension: { book: "Trillion Dollar Coach", lesson: "Support a talented person by giving honest feedback, even about something they're proud of." },
  voice: "I love it. Honestly, I'd rather be working than at home.",
  situation: "Zoe is your top rep, sends emails at midnight, hasn't taken more than two days off in a year, and has just had a record quarter. She tells you she loves it. Last week at the all-hands you praised her for “giving everything,” and you noticed a colleague wince. Two of her recent emails had errors she'd normally catch, and two other reps are now answering at night to keep up.",
  evidence: [["Zoe's results", "131% of plan · record quarter", "good"], ["Her days off, last 12 months", "5", "warn"], ["Her emails", "11pm to 1am, about four nights a week", "warn"], ["Her last two emails", "two errors she wouldn't usually make", "warn"], ["What you said at the all-hands", "'giving everything'", "warn"], ["The team", "two reps answering at night to match", "bad"]],
  pause: "What are you teaching the rest of the team about what you notice?",
  question: "What do you do?",
  options: [
    { label: "Talk to her: name the errors, the hours and your all-hands praise. Ask what she'd want if she weren't proving something. Suggest a week off.", quality: "best", strength: "own", leans: "candor", feedback: "You owned your part in rewarding the hours, gave her specifics, and asked a real question. It protects her health and the team's norms. It costs her some pride, and possibly a harder year-end for her." },
    { label: "Say nothing about her hours. Tell the whole team what good looks like: results, not midnight emails, and let her hear it.", quality: "good", leans: "team", feedback: "It fixes the norm for everyone without singling her out, and it corrects your all-hands message. The cost is that she may not apply it to herself, and the one person who most needs the conversation doesn't get it." },
    { label: "Respect what she says: she loves it. Offer to take small tasks off her plate and check in monthly.", quality: "good", leans: "rest", feedback: "It honors her choice and her autonomy, which matter. What it leaves out is the evidence: the errors, the colleagues copying her, and the praise you gave. Her answer isn't the only fact in the room." },
    { label: "Praise her more and offer a bonus. She's earned it, and it keeps her motivated.", quality: "weak", pattern: "applaud", cost: "She keeps going, and so do the two reps trying to match her.", feedback: "She has earned recognition, and a bonus is not an insult. But it pays for the hours as well as the results, and the rest of the team can see the rate." },
  ],
  reasoning: "Loving the work is not the same as being well, and both can be true. Praise has already shaped the team, and her errors are early evidence. The strongest answer takes her seriously enough to tell her what you've seen and to own your part.",
  principle: "Celebrate the result, not the hours. When someone loves their work, your job is to make sure they can keep loving it.",
  then: "She is quiet. Then: “I think I'm afraid of what happens if I stop.” She takes a week in January, and you agree you won't send email after 9pm to anyone. When she comes back she finds the two errors herself.",
  nextMove: "Look at the timestamps on the last month of emails from your team and from you. What does the pattern say about what you reward?",
},
```

## 5. Further scenario seeds (not written out)

1. **Inheriting a buyer relationship** (Commitments / Charan). The last manager made informal favors the norm: the buyer says, “Tom always took care of this.” Loyalty to history against a standard you can defend.
2. **Carrying a decision you disagree with** (Google / Commitments). HQ cuts trade funds 20% mid-quarter and your reps ask what you think. Candor with the team without undermining your boss.
3. **First review in front of the director, feeling like an impostor** (Commitments). Over-preparing and hiding the middling number against saying where you're unsure.
4. **The rep who asks for a reference** (Coach). A strong rep is interviewing elsewhere and asks you to be a reference. Loyalty to the team against your values about letting people grow.
5. **A peer takes the credit** (Commitments / Munger). A fellow manager presents your analysis as theirs. Confronting, letting it go, or fixing the incentive.
6. **Two reps fighting over an account** (Grove / Munger). Both have a fair claim and the territory rule is unclear. Decide now, or ask them to design the rule.
7. **The rep who reports a colleague** (Google / Coach). A rep tells you privately that a teammate is padding visits. Safety for the reporter, fairness to the accused, and what you owe the team.
8. **Promised the team no territory changes** (Coach / Grove). HQ is about to re-cut territories after you said it wouldn't happen. Follow-through with a promise events have overtaken.
9. **The big-win celebration** (Commitments / Charan). The team hit a record month through a discount that hurt margin. Celebrate, correct, or both.
10. **A rep wants to step down from a promotion** (Coach / Commitments). A newly promoted rep admits they miss selling. Dedication against fit, and your own part in the promotion.

## 6. Open questions for the author

1. **Written reflection.** Should Module 3 end each case with an optional one-line reflection box ("What would you actually say first?") stored locally and never scored? It suits the pause, but it adds a new input to a site that has none today and needs the CSP and store to be checked.
2. **Replays.** In Module 2 a replay shuffles the options and can mark a case "Fixed". With defensible options, is a replay a reasonable test of changing your mind, or should Module 3 skip "Fixed" and offer a different prompt, such as "pick the option you'd regret least in a month"?
3. **HR territory.** Cases 2 (falsified records), 6 (a spouse's illness), 28 (a possible transfer) and 30 (overwork and health) touch HR, leave and privacy. Should these carry a short disclaimer ("Check your company's policy; this is practice, not legal advice"), and does the author want case 6 reviewed by someone in HR before it ships?
4. **Scoring.** Is the author comfortable with no headline percent in Module 3, with "sound" and "strongest" counts and a values read-out instead? It is the most visible difference from Modules 1 and 2.
5. **Role filter.** The `who` field marks which seat the learner is in (new manager, director, lead rep). Should the hub let the learner filter by seat, or keep one mixed path so that a rep sees what their manager faces?
