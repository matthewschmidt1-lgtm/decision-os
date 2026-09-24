# Decision OS

A training site for CPG sales. Reps practice real commercial decisions, then see the evidence, reasoning, and principle behind the recommendation. The goal is to teach decision algorithms (expected value, Bayesian updating, value of information, marginal analysis, bandits, decision trees, utility trade-offs) through the decisions reps already make, not as theory.

- Live: https://decision-os-production-5b4a.up.railway.app/
- Repo: github.com/matthewschmidt1-lgtm/decision-os (branch `main`; pushing deploys to Railway automatically)

## Hard constraints

- **Zero build step.** Vanilla ES modules, plain CSS, hand-drawn SVG. No framework, no bundler, no runtime dependencies. Don't introduce npm tooling: this Mac has no Node, npm, Homebrew, `gh`, or `railway` CLI.
- **Every recommendation shows its reasoning.** Never display an answer without the logic behind it. Never reveal the preferred option before the user chooses (decisions and practice scenarios both hide it until a choice is made).
- **All data is illustrative** and must be labelled as such where it appears. Numbers must be internally consistent across pages (e.g. Brand B's share of trade is 32% everywhere).
- **Design language:** Apple / Mike Markkula restraint. Tokens live in `css/tokens.css`: ivory `#F5F5F0`, ink `#171717`, muted `#7B7B76`, one accent `#2457D6`. Green, amber, and red are for meaning only. One primary question per screen. Must work at 375px with no horizontal scroll.

## Run and test

```bash
python3 scripts/dev.py 4173
```

Dev server with SPA fallback, no-store caching. Preview at http://localhost:4173/.

Model tests run in the browser at http://localhost:4173/tests/run.html (an import map shims `node:test`). `npm test` also works anywhere Node exists. Add a test when you change a formula in `js/models.js` or `js/brandInsights.js`.

After changing anything visible, check it in the browser at desktop and 375px, and check the console for errors. ES modules can be cached in the preview tab; reload before trusting what you see.

## Deploy

Push to `main`. Railway runs `scripts/serve-site.sh`, which copies only the public site (`index.html`, `robots.txt`, `sitemap.xml`, `serve.json`, `css/`, `js/`, `public/`) into `dist/` and serves it with `npx serve -s`. Anything outside that list is not deployed. If you add a new top-level public file, add it to that script.

`serve.json` sets security headers (CSP, X-Frame-Options, HSTS, Permissions-Policy, COOP) and `Cache-Control: no-cache` on JS/CSS so updates show on the next visit. The CSP allows scripts from `'self'` only and fonts from Google Fonts. Don't add inline scripts or other third-party origins without updating it.

## Architecture

| Path | What it is |
|---|---|
| `index.html` | App shell, meta/Open Graph tags, nav, footer, ⌘K palette markup |
| `js/app.js` | History router (lazy-loads `js/pages/*`), `setMeta`, link interception. Closes any open modal before rendering |
| `js/ui.js` | DOM helpers: `h`, `s` (SVG), `bar`, `slider`, `segmented`, `says`, `disclose`, `metric`, `evidence`, `byKey`. Text is always inserted as text nodes. There is deliberately no innerHTML path |
| `js/models.js` | Pure decision models: marginal analysis, utility ranking, UCB hour allocation, Bayes, expected value, decision tree, value of information, fingerprint, trade-budget allocation (`tradeGain`, `allocateBudget`, `quadrant`), `money`/`pct` formatting |
| `js/data.js` | Territory data: 15 brands (with ROI fields), 3 distributors, 84 accounts, 4 territory decisions, blindspots |
| `js/brandInsights.js` | Pure logic for the Portfolio brand popup: `brandEconomics`, `brandInsights`, leadership questions. Every number in the popup comes from here |
| `js/scenarios.js` | 27 practice scenarios, tracks, 5-minute challenge ids, skills, levels |
| `js/lessons/` | Nine algorithm lessons (`index.js`) and their interactive widgets (`widgets.js`) |
| `js/pages/` | One module per route: home, practice, scenario (+ summary), decisions, decision, portfolio, accounts, account, learn, lesson, about (Learning Principles), notfound |
| `js/modal.js` | Single accessible modal (focus trap, Esc/×/backdrop close, `closeModal()` for router and palette) |
| `js/store.js` | localStorage: decision choices and practice results, per device only |
| `js/palette.js` | ⌘K command palette |
| `css/` | `tokens.css`, `base.css` (layout, header, footer), `components.css`, `pages.css` |
| `public/` | favicon, manifest, Open Graph image (`og-v2.png`; source `og-source.svg`) |

## Conventions and gotchas

- **Lookup maps** (`brandById`, `scenarioById`, etc.) use `byKey()`, which builds prototype-free objects so route ids like `__proto__` 404 instead of crashing. Use `byKey`, not `Object.fromEntries`, for any id lookup.
- **Scenario data shape:** `evidence` rows are `[label, value, tone?]`. A value containing ` · ` renders as chips or a comparison card, so keep the part order consistent across compared options. Each scenario has exactly four options with one `quality: "best"`. Best-answer positions are rebalanced automatically at the bottom of `scenarios.js`. Every scenario must belong to exactly one track.
- **Brand ROI fields:** `gm` is gross margin %, `tradeK` is annual trade $K, `avgRoi` is past incremental gross profit per $1 of trade, `r0` is the return on the next $1, `k` is how fast returns diminish, and `hoursNow` is selling hours per month (of 40). `margin` is the margin trend in pts and `trade` is trade growth %. Returns are measured before the trade cost, so $1 is breakeven.
- **Brand popup rules** use a materiality threshold (`MATERIAL_K`) and a breakeven band. Don't recommend moves worth less than the threshold, and don't let amounts round to "$0K".
- **Open Graph images** are rendered with macOS Quick Look (`qlmanage`) from an SVG on a square canvas, then cropped with `sips` to 1200×630. Give a new image a new filename so iMessage doesn't show a cached preview.
- **Canonical, sitemap, and robots** use the Railway domain. Update all three if the domain changes.
- **Commits** end with a `Co-Authored-By` line. Push only when asked, or when finishing a change the user requested.
