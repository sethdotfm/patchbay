DISCLOSURE: This was written by an LLM.

# Patchbay

A hard-edged, near-black CSS design system for dense signal-routing and
device-control UIs. Square corners, 1px rims, hard offset shadows, one accent.

It is plain CSS with no build step and no framework: two stylesheets, a font
stylesheet and an icon sprite. Every component works in light and dark,
scales with the root font size, and meets WCAG 2.2 AA.

## Install

**npm.** `npm install patchbay-css`. With a bundler that reads package
`exports`, import the files by name; without one, link them from
`node_modules/patchbay-css/` in the order below.

```css
@import "patchbay-css/fonts.css";
@import "patchbay-css"; /* tokens, then components */
```

The icon sprite is `patchbay-css/icons.svg`. Serve it from your own origin,
because `<use href>` does not load cross-origin SVG.

**Vendor the files.** Device UIs often run on closed networks, so the fonts
and icons ship with the CSS and nothing needs a CDN. Copy `css/`, `fonts/`,
`icons/` and `VERSION` into the app, then load them in this order:

```html
<meta name="color-scheme" content="light dark"> <!-- paints the right canvas before the CSS loads -->
<link href="fonts/plex.css" rel="stylesheet">
<link href="css/patchbay.tokens.css" rel="stylesheet">
<link href="css/patchbay.css" rel="stylesheet">
<!-- your page CSS: layout only -->
```

To fetch the body face before the CSS asks for it, preload it. A font
preload needs `crossorigin` even on the same origin, or the browser fetches
it twice:

```html
<link rel="preload" href="fonts/IBMPlexSans-Regular.woff2" as="font" type="font/woff2" crossorigin>
```

Browser support: Chrome 123+, Safari 17.5+, Firefox 120+ (`light-dark()`).
Dimming a label when its control is disabled uses `:has()`, which needs
Firefox 121+.

## See it

Serve the repo over http (`python3 -m http.server`) and open `index.html`,
the home page, which has a live control panel built from Patchbay.
`reference.html` shows every component live, with its markup and a copy
button.
`demo/` has four mock apps built only from Patchbay classes: a router
matrix, a settings page, a communication log and a phone layout.

Chrome blocks the icon sprite and the fonts on `file://`, so use http.

## Files

| File | What it is |
| --- | --- |
| `css/patchbay.tokens.css` | Every value: colour, type, space, sizing, motion, z-index. The only file to edit to re-skin. |
| `css/patchbay.css` | The reset and components. Reads only tokens. |
| `fonts/` | IBM Plex Sans (400, 500, 600) and Plex Mono (400, 500) as woff2, with `plex.css`. |
| `icons/lucide.svg` | Lucide v0.460.0 icon sprite, 1,539 icons. |
| `llms.txt` | Compact rules and class reference for coding assistants. |
| `CHANGELOG.md` | What changed in each release and how to upgrade. |
| `index.html`, `reference.html`, `demo/` | The home page, the component reference and the mock apps. Not part of the package. |
| `tools/contrast.mjs` | Checks every documented contrast pair in both themes. |
| `tools/classes.mjs` | Checks that pages use only defined classes and show every one. |

## Theming

Patchbay follows the OS setting. To force a theme on a page:

```html
<html data-theme="dark">   <!-- or "light" -->
```

A control room usually pins `dark`, so monitors don't change with an OS
setting.

Colour tokens are `light-dark(<light>, <dark>)` and switch on
`color-scheme`. The checkbox and radio glyphs are images, so they have their
own overrides at the bottom of `patchbay.tokens.css`.

To re-skin, change tokens. Hues are defined once as `--pb-hue-*` primitives,
and the semantic tokens (`--pb-accent`, `--pb-commit`, `--pb-status-*`) point
at them. Components read only the semantic tokens.

To crossfade a theme switch, wrap the `data-theme` change in
`document.startViewTransition()`. Where that is missing, add
`pb-theme-transition` to `<html>`, change `data-theme`, and remove the class
after `--pb-motion-theme` (400ms). `demo/demo.js` does both. Under
`prefers-reduced-motion` the switch is instant.

## Scaling

Sizes are rem, so the whole interface follows the root font size. To read it
from across a room:

```css
html { font-size: 125%; }
```

Hairlines (borders, rims, bars, the default scrollbar) stay px so they stay
crisp. The large scrollbar, `pb-scroll--lg`, is rem so it grows with the UI.
Never use `zoom`, and never combine it with a root font size: that scales
twice. `@media` breakpoints in rem follow the browser's initial font size, not
`html`'s.

Numbers an operator compares use `--pb-font-num`, which is Plex Mono. For
Plex Sans digits, set only `--pb-font-num: var(--pb-font)`.

## Components

Classes use the `pb-` prefix with BEM naming: `pb-btn`, `pb-btn--commit`,
`pb-form__label`. `llms.txt` lists every class and token; the numbered
contents block at the top of `patchbay.css` lists every section.

- **Layout:** page, split panes, panels, headers, toolbar, tabs, drawers.
- **Controls:** buttons and groups (commit, ok, danger, loading), chips,
  inputs, selects, number steppers, ranges, checkbox, radio, switch.
- **Forms:** one-line label rows, stacked fields and sections, field states,
  a sticky save bar.
- **Overlays and feedback:** menus with submenus, modals, tooltips, toasts,
  banners, alerts, the connection chip, progress, spinners, skeletons, empty
  states.
- **Data:** tables and scrolling grids, key/value lists, breadcrumbs,
  pagination.
- **Device:** routing crosspoints (source, destination, tie-line, locked,
  protected), 16 signal-level colours, role bars, a summary bar, and window
  borders for unsaved edits, write protection and a lost link.

## Rules

- **One accent.** Periwinkle marks selection and focus, nothing else.
- **Five status states:** ok, warn, error, info, idle. Always pair the colour
  with text or an icon.
- **Amber means unsaved.** `pb-btn--commit` and `pb-state-commit` mark
  pending edits that this action applies. Green `pb-btn--ok` is a positive
  finish (Done, Unlock). Don't use both for one action.
- **No rounding.** Every radius token is `0`. Shadows are hard offsets.
- **Lifted = press, sunken = type.** Buttons are grey plates, inputs are
  wells.
- **Tokens only.** No raw colours, sizes or radii in components. Page CSS is
  layout.
- **Icons are Lucide**, from the bundled sprite. Use only ids that exist
  (`grep 'id="name"' icons/lucide.svg`) and always include the viewBox:
  `<svg class="pb-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="icons/lucide.svg#play"/></svg>`.

## Accessibility

Both themes meet WCAG 2.2 AA, and `node tools/contrast.mjs` checks it:

- **Text contrast is at least 4.5:1.** This covers every text token on every
  surface, status and accent text, text on routing crosspoints, and
  on-accent text on accent, commit, danger and ok fills. The lowest is 4.79:1
  in dark (text on a hovered source crosspoint) and 5.00:1 in light (amber on
  a button).
- **Non-text contrast is at least 3:1.** This covers `--pb-edge` (control
  outlines), the focus ring, checkbox and radio glyphs, scrollbar thumbs, and
  state borders on every resting surface. `--pb-edge` on the hover step is
  2.7 to 2.9:1; hovered controls keep their own rim, so the outline is not the
  only cue. Disabled controls are exempt.
- **Focus.** A 2px accent ring on `:focus-visible` everywhere. Inputs thicken
  their border to 2px accent on focus.
- **Motion.** `prefers-reduced-motion` zeroes transitions and stops looping
  decoration (alarm pulse, offline frame, striped progress, skeleton sweep,
  toast arrival). Spinners and the indeterminate bar slow to about a third of
  their speed rather than stop, because they are the only sign of work.
- **Forced colours.** In Windows High Contrast, focused fields keep an
  outline, the selected tab and table row get a `Highlight` outline,
  checkboxes and radios fall back to the native control, and the switch thumb
  stays visible.
- **Validation.** `pb-input` shows the native invalid state through
  `:user-invalid`, so a required field turns red only after the user edits
  and leaves it. `pb-input--invalid` is for errors your app decides.

An app built with Patchbay still has to:

- Associate every `pb-form__label` with its control (`for` and `id`).
- Give status dots, level swatches and icon-only buttons a text alternative.
- Use the right ARIA for tabs, menus and dialogs. `reference.html` shows the
  pattern; keyboard behaviour (arrow keys, focus trapping) is app JS.
- Give a tooltip trigger its own accessible name or `aria-describedby`. The
  `data-pb-tip` text is decoration. Give a toast stack `aria-live="polite"`
  and an error toast `role="alert"`.
- Re-run `node tools/contrast.mjs` after changing a colour token. It exits
  non-zero if a documented pair drops below its minimum.

## Upgrading

`CHANGELOG.md` has steps for each release, including the 3.0 move off
Bootstrap and the full v1 to v2 guide.

## Licence

Patchbay is public domain under the [Unlicense](LICENSE). IBM Plex is under
the SIL Open Font License 1.1 (`fonts/OFL.txt`) and Lucide under ISC
(`icons/LICENSE`).
