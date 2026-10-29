# Patchbay

A hard-edged, near-black CSS design system for dense signal-routing and
device-control UIs. Square corners, 1px rims, hard offset shadows, one accent.

Serve the repo over http (`python3 -m http.server`) and open `index.html`: a
sectioned reference of every component, with live examples and their markup.
`demo/` has four mock apps (router matrix, settings, communication log,
phone) built only from Patchbay classes.

## Files

| File | What it is |
| --- | --- |
| `css/patchbay.tokens.css` | Design tokens (colour, type, space, sizing, motion). The only file to edit to re-skin. |
| `css/patchbay.css` | Component layer. Reads only from tokens — never hard-code a colour here. |
| `css/bootstrap.min.css` | Bootstrap 5.0.1 base (MIT). |
| `index.html` | The reference page: every component, live, with its markup. |
| `demo/` | `demo.css` / `demo.js` for the reference page; `router`, `settings`, `log` and `phone` mock apps; `v1-regression.html` frozen for screenshot diffs. |
| `tools/contrast.mjs` | Resolves tokens per theme, checks the documented contrast pairs, dumps values. |
| `tools/classes.mjs` | Reports classes a page uses that the CSS lacks, and classes the CSS defines that the page never shows. |
| `VERSION` | The version to copy when you vendor Patchbay. |
| `icons/lucide.svg` | Lucide icon sprite (1,539 icons, ISC licence in `icons/LICENSE`). |
| `llms.txt` | Compact usage rules and class reference for AI coding assistants. |

## Usage

Load in this order:

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<link href="css/bootstrap.min.css" rel="stylesheet">
<link href="css/patchbay.tokens.css" rel="stylesheet">
<link href="css/patchbay.css" rel="stylesheet">
<!-- your page CSS: layout only -->
```

### Light and dark

Patchbay follows the OS setting by default. To force a theme on a page:

```html
<html data-theme="dark">   <!-- or "light" -->
```

For a control-room deployment you probably want to pin `dark`, so monitors
don't change with an OS setting.

Colour tokens are written as `light-dark(<light>, <dark>)` and switch on
`color-scheme`. The checkbox and radio glyphs are images rather than colours,
so they have their own overrides at the bottom of `patchbay.tokens.css`.
`light-dark()` needs Chrome 123+, Safari 17.5+ or Firefox 120+. Dimming a
label when its control is disabled uses `:has()`, which needs Firefox 121+.

To crossfade a theme switch, add `pb-theme-transition` to `<html>`, change
`data-theme`, then remove the class after `--pb-motion-theme` (200ms).
`demo.html` shows how. It's instant under `prefers-reduced-motion`.

### Scaling

Sizes are `rem`, so the whole interface follows the root font size. To read it
from across a control room:

```css
html { font-size: 125%; }
```

Hairlines (borders, rims, bars, scrollbars) stay `px` so they stay crisp. Do
not use `zoom`, and never combine it with a root font size: that scales twice.
`@media` breakpoints in `rem` follow the browser's initial font size, not
`html`'s. Numbers an operator compares use `--pb-font-num` (Plex Mono by
default); to get Plex Sans digits, set only `--pb-font-num: var(--pb-font)`.

All classes use the `pb-` prefix with BEM-style naming:
`.pb-btn`, `.pb-btn--commit`, `.pb-form__label`, and so on.

## Components

Layout (`pb-page`, `pb-split`, `pb-pane`, `pb-panel`, `pb-header`), toolbar,
buttons and button groups (including `--ok` and `--loading`), chips, inputs /
selects / steppers / range, checkbox / radio / switch, form rows, stacked
fields and sections, field states, save bar, tabs, dropdown menus, modals,
drawers, tooltips, toasts, banners and the connection chip, progress and
spinners, skeletons, empty states, tables, key/value lists, breadcrumbs and
pagination, status dots / badges / alerts, routing crosspoints and 16
signal-level colours, role bars, summary bar, window-state borders
(commit, protect, offline), utilities and icons. See the numbered contents
block at the top of `patchbay.css`.

## Principles

- **One accent.** Periwinkle carries selection and focus. Don't add a second.
- **Five status states:** ok, warn, error, info, idle. Never colour alone —
  always pair with text or an icon.
- **Amber means unsaved.** `pb-btn--commit` and `pb-state-commit` mark pending work: edits exist and this applies them. Green `pb-btn--ok` is a positive finish (Done, Unlock). Don't use both for one action.
- **No rounding.** Every radius token is `0`.
- **Icons are [Lucide](https://lucide.dev)** v0.460.0, from the bundled sprite `icons/lucide.svg` (ISC, see `icons/LICENSE`):
  `<svg class="pb-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="icons/lucide.svg#play"/></svg>`.
  `.pb-icon` sets a 1.6 stroke in `currentColor`. Chrome blocks external `<use>` on `file://`, so serve over http.
- **Bootstrap is a reset only.** Use `pb-` classes, not Bootstrap utilities or components.
- **Lifted = press, sunken = type.** Buttons are grey blocks, inputs are wells (black in dark, white in light).

## Accessibility

Both themes are audited against WCAG 2.2 AA:

- **Text contrast ≥ 4.5:1.** Every text token on every surface, status and
  accent text, text on routing crosspoints, and on-accent text on accent /
  commit / danger / ok fills. Lowest is 4.79:1 in dark (text on a hovered
  source crosspoint) and 5.00:1 in light (amber on a button).
- **Non-text contrast ≥ 3:1.** `--pb-edge` (control outlines), the focus
  ring, checkbox/radio glyphs, scrollbar thumbs, and state borders on every
  resting surface. (`--pb-edge` on the hover step is 2.7–2.9:1; hovered
  controls keep their own rim, so the outline is not the only cue.)
  Disabled controls are exempt by design.
- **Focus.** A 2px accent ring on `:focus-visible` everywhere; inputs thicken
  their border to 2px accent on focus.
- **Motion.** `prefers-reduced-motion` zeroes transitions and stops looping
  decoration (alarm pulse, offline frame, striped progress, skeleton sweep,
  toast arrival). Spinners keep turning.

When you build with Patchbay, you still need to:

- Associate every `pb-form__label` with its control (`for` / `id`).
- Give status dots, level swatches and icon-only buttons a text alternative.
- Use the right ARIA for tabs, menus and dialogs. `index.html` shows the pattern,
  but keyboard behaviour (arrow keys, focus trapping) is up to your JS.
- Give a tooltip trigger its own accessible name, or `aria-describedby`: the
  `data-pb-tip` text is decoration. Give a toast stack `aria-live="polite"`
  and an error toast `role="alert"`.
- Re-run `node tools/contrast.mjs` if you change any colour token; it exits
  non-zero if a documented pair drops below its minimum.

## Migrating from v1

v2 is additive for classes, but sizes are now `rem` and a few things moved.
In an app that vendored v1 you can usually delete:

| v1 workaround | v2 |
| --- | --- |
| `body { zoom: 1.25 }` and a private scale variable | `html { font-size: 125% }` |
| `--pb-font-mono: var(--pb-font)` to get Sans numbers | `--pb-font-num: var(--pb-font)` |
| A green Save button class with `color-mix` hover | `pb-btn--ok` |
| Local `code` / `kbd` / `.pb-code` styling | Built in |
| A `[data-tip]` hover tooltip | `data-pb-tip` (also on keyboard focus) |
| Stacked settings group, label-over-field grid, sticky save bar | `pb-section`, `pb-fields` / `pb-field`, `pb-savebar` |
| `border-left: 5px solid var(--pb-source)` | `pb-rolebar--source` |
| `@media (pointer: coarse)` 16px input rule | Built in (`--pb-touch-text`) |
| `[data-layout="phone"] body { min-width: 0 }` | `<html data-pb-layout="phone">` |
| A full-screen red lost-link frame | `pb-state-offline` with a `pb-conn` or `pb-banner` |

Three things break if you miss them:

- **Never combine `zoom` with a root font size.** That scales twice.
- **Your own `px` stops scaling once `zoom` goes.** Convert literals such as
  `5px`, `48px`, `1200px` and `minmax(180px, 1fr)` to `rem` or tokens, and drop
  any `calc(100vw / var(--scale))` division.
- **`@media` in `rem` uses the browser's initial font size**, not `html`'s, so
  breakpoints won't follow a 125% root.

`pb-w-*` widths now sit after the controls in the cascade, so they win over the
`width: 100%` that select and number wrappers, input groups and ranges set for
themselves. Put the class on the wrapper. Before, a `pb-w-*` on one of those
silently lost.

When you vendor Patchbay, copy `css/`, `icons/` and `VERSION`.
