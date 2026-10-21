# Patchbay

A hard-edged, near-black CSS design system for dense signal-routing and
device-control UIs. Square corners, 1px rims, hard offset shadows, one accent.

Open `demo.html` in a browser to see every component.

## Files

| File | What it is |
| --- | --- |
| `css/patchbay.tokens.css` | Design tokens (colour, type, space, sizing, motion). The only file to edit to re-skin. |
| `css/patchbay.css` | Component layer. Reads only from tokens — never hard-code a colour here. |
| `css/bootstrap.min.css` | Bootstrap 5.0.1 base (MIT). |
| `demo.html` | One-page demo of the components. |
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
`light-dark()` needs Chrome 123+, Safari 17.5+ or Firefox 120+.

To crossfade a theme switch, add `pb-theme-transition` to `<html>`, change
`data-theme`, then remove the class after `--pb-motion-theme` (200ms).
`demo.html` shows how. It's instant under `prefers-reduced-motion`.

All classes use the `pb-` prefix with BEM-style naming:
`.pb-btn`, `.pb-btn--commit`, `.pb-form__label`, and so on.

## Components

Layout (`pb-page`, `pb-split`, `pb-pane`, `pb-panel`, `pb-header`), toolbar,
buttons and button groups, chips, inputs / selects / steppers / range,
checkbox / radio / switch, form rows, tabs, dropdown menus, modals, drawers,
progress and spinners, tables, status dots / badges / alerts, routing
crosspoints and 16 signal-level colours, summary bar, window-state borders,
utilities and icons. See the numbered contents block at the top of
`patchbay.css`.

## Principles

- **One accent.** Periwinkle carries selection and focus. Don't add a second.
- **Five status states:** ok, warn, error, info, idle. Never colour alone —
  always pair with text or an icon.
- **Amber means unsaved.** `pb-btn--commit` and `pb-state-commit` mark pending work.
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
  commit / danger fills. Lowest is 4.79:1 in dark (text on a hovered source
  crosspoint) and 5.00:1 in light (amber on a button).
- **Non-text contrast ≥ 3:1.** `--pb-edge` (control outlines), the focus
  ring, checkbox/radio glyphs, scrollbar thumbs, and state borders on every
  surface.
  Disabled controls are exempt by design.
- **Focus.** A 2px accent ring on `:focus-visible` everywhere; inputs thicken
  their border to 2px accent on focus.
- **Motion.** `prefers-reduced-motion` zeroes transitions and stops looping
  decoration (alarm pulse, striped progress). Spinners keep turning.

When you build with Patchbay, you still need to:

- Associate every `pb-form__label` with its control (`for` / `id`).
- Give status dots, level swatches and icon-only buttons a text alternative.
- Use the right ARIA for tabs, menus and dialogs. `demo.html` shows the pattern,
  but keyboard behaviour (arrow keys, focus trapping) is up to your JS.
- Re-run contrast checks if you change any colour token.
