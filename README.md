# Decision OS

A decision-making operating system for CPG sales. It doesn't show salespeople algorithms; it lets them experience the algorithms through decisions they already make, then reveals the reasoning underneath.

**Live:** deployed on Railway (see below).

## What it is

- **Decisions.** Four territory decisions (Protect, Shift, Investigate, Capture), each with the same structure: what the model sees, the trade-off, your options, and *why the model is showing this*, in plain language and in algorithm language.
- **Algorithm underneath.** Every decision opens a 30-second interactive experiment: move a slider, watch the recommendation recalculate.
- **Portfolio.** Fifteen brands as a system: attention allocation (multi-armed bandit), the commercial chain (company → distributor → account → consumer), and the economic fingerprint.
- **Accounts.** Eighty-four accounts ranked by expected value, not size. On-premise and off-premise are treated as different worlds.
- **Blindspots.** Situations where the obvious metric is misleading.
- **Learn.** An algorithm library: Expected Value, Bayesian Updating, Decision Trees, Multi-Armed Bandits, Value of Information, Utility & Trade-offs, Optimization, Prediction vs. Decision, Exploration vs. Exploitation. Concept → Try it → See it in sales → Apply it.
- **⌘K.** Ask anything.

Hard rule: never give a recommendation without showing the decision logic.

## Architecture

Zero build step. Vanilla ES modules, CSS custom properties, hand-drawn SVG. No framework, no bundler, no dependencies at runtime.

```
index.html          app shell, meta, fonts
css/tokens.css      design tokens (palette, type scale, radii, motion)
css/base.css        reset, layout chrome, reveal + route transitions
css/components.css  cards, bars, options, sliders, palette, tables, tree
js/app.js           history router, meta, link interception
js/palette.js       ⌘K command palette
js/ui.js            DOM helpers (h, bar, slider, segmented, says, tween)
js/charts.js        SVG line chart, before/after bars
js/models.js        pure decision models (marginal, utility, UCB bandit, Bayes, EV, tree, VOI, fingerprint)
js/data.js          territory data: 15 brands, 3 distributors, 84 accounts, 4 decisions, blindspots
js/lessons/         lesson content + interactive widgets
js/pages/           one module per route, lazy loaded
tests/              node:test unit tests for the models
```

## Run locally

Any static server works:

```bash
python3 -m http.server 4173
```

or, with Node:

```bash
npx serve -s .
```

Tests (Node 18+):

```bash
npm test
```

## Deploy on Railway

`railway.json` starts `npx serve -s . -l $PORT` with SPA rewrites from `serve.json`. Connect the GitHub repo in Railway, or run `railway up`. Set the public domain, then update the canonical URL in `index.html`, `robots.txt`, and `sitemap.xml`.

## Design principles

Simplicity, restraint, hierarchy, direct manipulation, teach through use, confidence without intimidation. Warm white background, near-black type, one accent, colour used only for meaning.
