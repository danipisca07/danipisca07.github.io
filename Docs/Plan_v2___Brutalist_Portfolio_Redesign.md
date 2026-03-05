I have created the following plan after thorough exploration and analysis of the codebase. Follow the below plan verbatim. Trust the files and references. Do not re-verify what's written in the plan. Explore only when absolutely necessary. First implement all the proposed file changes and then I'll review all the changes together at the end.

# Implementation Plan: Brutalist/Constructivist Portfolio Redesign with i18n & Three.js Hero

## Observations

The site is an Angular app with a single-page scroll layout. The design relies on pastel/navajowhite colors (`$elementColor`), the cursive "Baloo Tamma 2" font, a WebGL colorful diamond grid as the hero background, a cartoonish split photo with a mouse-parallax effect, hexagon badges, rounded corners with shiny decorations, a hand-drawn doodle separator (`drawline.svg`), and colorful section bands (aquamarine, pink, green, purple). The content is solid — work history, projects, education, sports — it just needs a radical visual overhaul. The user also wants multilingual support (Italian default at `/`, English at `/en`) and a professional yet technically impressive hero using Three.js instead of the playful WebGL.

## Approach

Adopt a **Brutalist/Constructivist** design system: stark monochrome palette (white, black, one strong accent — e.g. red `#E63946`), bold geometric layout, thick borders instead of rounded cards, a heavy sans-serif typeface (IBM Plex Mono or Space Grotesk), and deliberate typographic hierarchy. Integrate Angular's `@angular/localize` for i18n, supporting Italian (default, root path) and English (at `/en` subpath). Replace the playful WebGL diamond grid + cartoon photo with a professional yet technically sophisticated hero using **Three.js** to generate a generative animation (animated grid particles, flowing wireframe geometry, or particle field) that conveys backend/technical depth without childishness. The Sports section is kept but condensed into the About bio. All decorative/childish elements are removed.

---

## Step 1 — Set up Angular i18n and localization infrastructure

The app will serve Italian by default at the root path (`/`) and English at `/en`. Use Angular's built-in `@angular/localize` tools.

### 1a — Install and configure i18n

Run `ng add @angular/localize` to add localization support. In `file:angular.json`:
- Add a new build configuration for the English locale under `projects.danipisca07-github-io.architect.build.configurations.en` with `localize: ["en"]`
- Add a new build configuration for Italian under `projects.danipisca07-github-io.architect.build.configurations.it` with `localize: ["it"]` (or set as the default build)
- Configure the dev server to serve Italian by default and add a dev config for `/en`

### 1b — Create translation files

Create `file:src/locale/messages.it.xlf` and `file:src/locale/messages.en.xlf` (XLIF format, Angular standard), or use JSON i18n files if preferred. These files will store all user-facing strings:
- Hero headline, tagline, CTA text
- Section headers ("My passion", "Employment History", "Education", etc.)
- Footer text
- Resume download CTA text
- All list item descriptions

### 1c — Prepare component templates for translation

In all component HTML files (landing, header, footer, app root, etc.), wrap all user-facing strings with the `i18n` attribute:

```html
<h1 i18n="Hero section title">DANIELE PISCAGLIA</h1>
<p i18n="Hero section role">BACKEND / FULLSTACK ENGINEER</p>
```

Extract strings using `ng extract-i18n`, which will auto-populate the `.xlf` files with all strings marked for translation. Then translate each string in the `.en.xlf` and `.it.xlf` files.

### 1d — Set the locale in app initialization

In `file:src/main.ts`, use the current path to set the locale:
```typescript
const locale = window.location.pathname.startsWith('/en') ? 'en' : 'it';
// ... bootstrap with locale
```

### 1e — Translation examples

Key strings to translate:

| Key | Italian | English |
|---|---|---|
| `heroTitle` | `DANIELE PISCAGLIA` | `DANIELE PISCAGLIA` |
| `heroRole` | `BACKEND / FULLSTACK ENGINEER` | `BACKEND / FULLSTACK ENGINEER` |
| `heroTagline` | `6 ANNI DI ESPERIENZA · DISPONIBILE PER PROGETTI` | `6 YEARS EXPERIENCE · AVAILABLE FOR HIRE` |
| `heroCTA` | `↓ Visualizza il mio lavoro` | `↓ See my work` |
| `resumePrompt` | `Vuoi saperne di più? Scarica il mio CV:` | `Want to know more? Download my resume:` |
| `skillsHeading` | `La mia passione` | `My passion` |
| `educationHeading` | `Carriera accademica` | `Academic career` |
| `workHeading` | `Cronologia lavorativa` | `Employment History` |
| `projectsHeading` | `I miei progetti` | `My projects` |

---

## Step 2 — Define the new design token system

In `file:src/app/variables.scss`, replace all current variables with the new brutalist palette and typography tokens:

| Token | Old value | New value |
|---|---|---|
| `$backColor` | `#69E781` | `#FFFFFF` |
| `$elementColor` | `navajowhite` | `#000000` |
| `$darkTextColor` | `#2c3037` | `#000000` |
| `$accentColor` | _(none)_ | `#E63946` |
| `$mainFont` | `'Baloo Tamma 2', cursive` | `'IBM Plex Mono', monospace` |
| `$headingFont` | _(none)_ | `'Space Grotesk', sans-serif` |

Add the new Google Fonts import for **IBM Plex Mono** and **Space Grotesk** in `file:src/app/app.component.scss` (replacing the current Baloo Tamma 2 import). Remove the `Belove.otf` font reference entirely — it is only used for the signature in the header, which will be replaced by plain bold text.

---

## Step 3 — Redesign the Hero / Landing section

**Goal:** Replace the playful WebGL diamond grid + cartoon photo with a professional yet technically sophisticated hero using **Three.js** to generate a generative animation that conveys backend/technical depth without childishness.

### 3a — Replace the WebGL background with a Three.js canvas

In `file:src/assets/backgroundSquares.html`, replace the existing WebGL square grid with a **Three.js scene** that renders one of:

- **Animated grid particles**: A 3D grid of particles (or vertices) connected by white lines, slowly rotating or flowing. Particles brighten on proximity to cursor (like a network visualization). Monochrome: black background, white lines, red accent particle nodes.
- **Flowing wireframe geometry**: A morphing abstract geometric form (e.g., an icosahedron, torus knot, or custom lattice) that continuously deforms. White wireframe lines on black background.
- **Particle field**: A field of small dots moving in organized patterns (e.g., following sine/cosine waves, or flowing like a fluid). White particles, subtle trails.

Choose whichever feels most "backend engineer" — the grid particle network or flowing wireframe are strong choices. Keep the mouse interaction subtle: on hover, particles near cursor glow slightly or shift color to the accent red. No aggressive parallax or distortion — just a calm, hypnotic technical visualization.

Create a new file `file:src/assets/js/hero-three-scene.js` that initializes the Three.js scene, camera, renderer, and animation loop. Keep it lightweight (~5KB gzipped).

### 3b — Update the landing component to use the new Three.js canvas

In `file:src/app/landing/landing.component.html`:
- Replace the `<iframe>` pointing to `backgroundSquares.html` with a direct `<canvas id="heroCanvas">` element
- Remove the entire `.image` div (the cartoon photo with parallax)
- Remove the self-deprecating "somewhat" banner text
- Wrap all translatable text with `i18n` attributes

In `file:src/app/landing/landing.component.ts`:
- Remove `DomSanitizer` dependency
- Remove `translateL`, `translateR`, and `onMousemove`, `onMouseleave` methods
- Add an `ngOnInit` call that:
  - Dynamically imports the Three.js library (via npm: `three`)
  - Initializes the hero scene using the `hero-three-scene.js` script
  - Attaches mouse move listeners to the canvas for the subtle glow effect

### 3c — New hero layout with Three.js background

The landing now contains a full-viewport block overlaid on the Three.js animation:

```
┌─────────────────────────────────────────────────────────┐
│ [Three.js animated grid/wireframe · black background]   │
│                                                         │
│   DANIELE            ┌──────────────────────────────┐  │
│   PISCAGLIA          │  BACKEND /                   │  │
│                      │  FULLSTACK                   │  │
│                      │  ENGINEER                    │  │
│                      └──────────────────────────────┘  │
│                                                         │
│   6 YRS EXPERIENCE · AVAILABLE FOR HIRE                 │
│                      [↓ See my work]                   │
└─────────────────────────────────────────────────────────┘
```

In `file:src/app/landing/landing.component.html`:
- Name in large uppercase bold white text (left column, very large, using `$headingFont`), z-index above canvas
- Role titles in a bordered white box (thick 3px solid white border, no border-radius), black text
- Tagline in monospace small caps, white text
- A single `<a>` scroll-down CTA with thick white underline (no button styling, brutalist anchor), white text
- All text has `position: relative; z-index: 2` to layer above the Three.js canvas

In `file:src/app/landing/landing.component.scss`:
- `.landing-container` removes the previous background rule (was pointing to the iframe), now just the canvas fills the viewport
- The `#heroCanvas` element is `position: absolute; z-index: 0; width: 100vw; height: 100vh`
- Text elements have `z-index: 1` or higher
- All text is white (inverted from the light gray future main body)

---

## Step 4 — Redesign the Header

In `file:src/app/header/header.component.html`:
- Replace the `<mat-toolbar>` (Angular Material peach bar) with a plain `<header>` element — or keep it but strip its theming completely
- Replace the `Belove` cursive signature with `DANIELE PISCAGLIA` in bold uppercase monospace
- **Remove the Facebook link** — not appropriate for a professional freelance profile
- Keep: GitHub, LinkedIn, email, WhatsApp/phone (these are valid professional contacts)
- Remove the `drawline.svg` pseudo-element separator in `file:src/app/header/header.component.scss` — replace with a simple `3px solid black` bottom border

In `file:src/app/header/header.component.scss`:
- Background: `#000000` (black bar)
- Text/icon color: `#FFFFFF`
- On hover: accent color `$accentColor`
- Remove the `Belove` font-family from `#firma`

---

## Step 5 — Redesign the "About" / Skills sections

### 5a — Remove the "Me in 4 words" hexagon section

In `file:src/app/about/about.component.html`, replace the hexagon badge layout entirely. This presentation (emoji-style icons + hexagon shapes) is childish and doesn't communicate seniority.

Replace with a **two-column brutalist stat block**:

```
┌───────────────────┬───────────────────────────────────┐
│  WHO               │  Daniele Piscaglia                │
│  ROLE              │  Backend / Fullstack Engineer     │
│  EXPERIENCE        │  6 Years                          │
│  EDUCATION         │  MSc Computer Engineering (110L)  │
│  LOCATION          │  Italy · Remote-friendly          │
│  FOCUS             │  Backend · Cloud · APIs · IoT     │
└───────────────────┴───────────────────────────────────┘
```

Thick `1px` or `2px` borders on table cells, no background color, monospace font, all uppercase labels in the left column. This immediately reads as senior/confident.

In `file:src/app/about/about.component.scss`:
- Remove hexagon background image reference
- Remove `.hexagon` class entirely

### 5b — Redesign the Skills / "My passion" section

In `file:src/app/app.component.html`, the `aquamarine` sliding-div with the tech grid is the right idea but needs visual treatment:

- Change `backgroundColor` to `#000000` (or `#111111`)
- Replace `.gridBox` items (currently `display: none !important` — this bug should be fixed by removing the `display: none !important` override in `file:src/app/app.component.scss`) with solid bordered boxes: `2px solid white`, white text on black background
- Highlight primary backend skills (C#, Java, Node.js, Spring/JEE, Python, MongoDB) with the accent color border/text
- Remove the decorative `<mat-icon svgIcon="success">` illustration — not appropriate here
- Rewrite the "My passion" paragraph to something more direct and professional: e.g. _"6 years building backend systems, APIs, and cloud services across IoT, fitness-tech, and blockchain."_

### 5c — Redesign section containers (`sliding-div`)

In `file:src/app/sliding-div/sliding-div.component.scss`:
- Remove the `.cornered` class styles: the `border-bottom-right-radius: 35px`, the inner shadow, and especially the `shinycorner.png` decorative element — this is the most childish visual element on the page
- Keep the `.slideIn` animation (it is subtle and professional)
- Change section background colors in `file:src/app/app.component.html` to a strict alternating scheme: `#FFFFFF` / `#F2F2F2` (or white / near-white), with the section header using a thick left-border accent: `border-left: 6px solid #E63946`

---

## Step 6 — Redesign the section headers

In `file:src/app/app.component.scss`, for `.listDiv h1`:
- Change to uppercase, very heavy weight (`font-weight: 900`)
- Left-aligned, not centered
- Add `border-left: 6px solid $accentColor` + `padding-left: 12px`
- Remove `font-weight: normal`

Apply the same treatment to `h1` in `file:src/app/about/about.component.scss`.

---

## Step 7 — Redesign the "Employment History" section

This is the most important section for hiring. In `file:src/app/app.component.html`:
- Convert `#workList` from a plain `<ul>` to a **timeline table** structure:

```
  2025 → PRESENT   FREELANCE ENGINEER
  2022 → 2025      SOFTWARE ENGINEER — TECHNOGYM S.P.A.
  2021 → 2022      IOT EDGE DEVELOPER — BONFIGLIOLI S.P.A.
  2020 → 2021      THESIS INTERNSHIP — BONFIGLIOLI S.P.A.
  2018 → 2018      INTERNSHIP — NEXT S.R.L.
```

Two-column layout: year range (monospace, muted) | role + company (bold). Most recent entry at top. This reads immediately as a résumé and signals seniority.

---

## Step 8 — Redesign the "Projects" section

In `file:src/app/app.component.html`, convert `#projectList` items to **project cards** in a CSS grid:

Each card:
- `2px solid black` border, no border-radius
- Project name in bold uppercase
- Small descriptor text beneath (add short 1-line description for each)
- On hover: black background + white text (inverted) — no CSS transition duration > 0.1s (brutalist = immediate)
- Remove the decorative `<mat-icon svgIcon="tasks">` illustration

Remove items that are outdated or look unprofessional as a lead item (e.g. `CrazyCyclist Mobile Game` from Amazon can be kept as a curiosity, or removed — your call). The blockchain/IOTA and cloud projects are strong, keep them front.

---

## Step 9 — Remove or merge the "Sports" section

The `Sports` section with the purple background (`#B986FC`) is a personal touch that dilutes the professional focus. Two options:

- **Remove it entirely** — cleanest approach for a hire-focused site
- **Condense it** — add one line to the About stat block: `HOBBY · Jet-ski · Italian Champion F1 (2019/20/21/23)` — this is actually an impressive differentiator (discipline, competitiveness) and worth a single line

Recommended: condense into the About block, remove the standalone section.

---

## Step 10 — Redesign the Footer

In `file:src/app/footer/footer.component.html` and `file:src/app/footer/footer.component.scss`:
- Remove the `drawline.svg` pseudo-element
- Black background (`$elementColor` will now be black)
- White text
- Single centered line: `DANIELE PISCAGLIA · AVAILABLE FOR FREELANCE · danielepiscagliasw@gmail.com`
- Social icons row below (GitHub, LinkedIn, email only — remove Facebook)
- Add `border-top: 4px solid $accentColor`

---

## Step 11 — Global cleanup and i18n integration

In `file:src/app/app.component.html`:
- Remove the commented-out `<app-test>` reference (dead code)
- The `resumeDiv` (resume download links) can remain but should be styled as a brutalist CTA bar: full-width black band, white text, white bordered buttons with no border-radius. Move it immediately after the hero landing section so it's above the fold on scroll.
- Wrap the CTA text `"Want to know more? Download my resume:"` with `i18n` attribute
- Update resume links to use language-aware paths or include both resume files with language labels (already in place: `DanielePiscaglia_IT.pdf` and `DanielePiscaglia_EN.pdf`)

In `file:src/app/app.component.scss`:
- Fix the `.grid { display: none !important; }` bug — the `!important` override hides the skills grid entirely. Remove this line so the grid renders.
- Remove all pastel color references

In `file:src/index.html`:
- Update `<title>` from `Daniele Piscaglia IT` to `Daniele Piscaglia — Backend & Fullstack Engineer`

### 11a — Ensure proper URL routing for locale

Update `file:src/app/app-routing.module.ts` or add a guard that checks the current locale and sets it based on the URL:
- Root path `/` → Italian locale (default)
- `/en/*` → English locale

The simplest approach: use Angular's built-in `$localize` and build separate bundles for each locale using the i18n build configurations in `angular.json`, then configure the web server (GitHub Pages) to serve the correct bundle based on the URL.

---

## Step 12 — Update Three.js dependencies

In `file:package.json`:
- Add `"three": "^r128"` (or latest stable) to `dependencies`
- Optionally add `"@types/three": "^latest"` to `devDependencies` for TypeScript support

In `file:src/app/app.module.ts`, no changes needed — Three.js is imported dynamically in the landing component.

---

## Summary of removals

| Element | File | Reason |
|---|---|---|
| WebGL iframe + cartoon photo + parallax JS | `landing.component.*` | Replaced with professional Three.js animation |
| Hexagon badges + emoji icons | `about.component.*` | Childish, replaced with stat table |
| `drawline.svg` separators | `header`, `footer` scss | Childish decoration |
| `shinycorner.png` + rounded shadow | `sliding-div.component.scss` | Childish decoration |
| Facebook link | `header`, `footer` html | Unprofessional for a hire-focused site |
| `Belove.otf` cursive signature | `header.component.scss`, `app.component.scss` | Replaced by bold monospace |
| `Sports` as standalone section | `app.component.html` | Condensed into About block |
| Pastel section background colors | `app.component.html` | Replaced by monochrome + accent |
| Self-deprecating banner copy | `landing.component.html` | Replaced by confident professional copy |