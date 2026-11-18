# AGENTS.md

This file provides guidance to coding agents (including Claude Code) when working with code in this repository.

## What this is

Patchbay is a static CSS design system with no build step and no dependencies. It ships as plain files, `css/patchbay.tokens.css` and `css/patchbay.css`, plus `fonts/` and `icons/`, and publishes to npm as `patchbay-css` (`package.json` has no dependencies or build; `files` and `exports` decide what ships). `README.md` has the usage and accessibility notes; `llms.txt` is the compact class reference for assistants building *with* the system, so keep it in sync when adding or renaming classes or tokens.

## Developing

- Verify changes in `index.html` (the reference page, one `<section id>` per component group, grouped by topic in its table of contents) and the mock apps in `demo/`. Serve over http (`python3 -m http.server`) rather than `file://`, because Chrome blocks the external `<use href="icons/lucide.svg#…">` icon sprite and the `fonts/` files on `file://`. `?theme=dark|light`, `?scale=125`, `?only=id,id` and `?instant` on `index.html` help with screenshots.
- Check both themes and `prefers-reduced-motion`, and at 125% scale (the toolbar buttons) since sizes are rem.
- `node tools/contrast.mjs` must exit 0 (checks documented text and non-text pairs in both themes). `--dump` prints every resolved token; diff it before and after a token refactor, since it normalises rem to px and colours to hex. `--worst` gives the per-token ratios quoted in the tokens file.
- `node tools/classes.mjs --llms [pages…]` must print "All … defined and shown": every `.pb-*` class in `patchbay.css` needs a live example in `index.html` and a mention in `llms.txt`, and no page may use an undefined one. CI (`.github/workflows/check.yml`) runs this and the contrast check over `index.html` and every mock app.
- `demo/v1-regression.html` is a frozen page for pixel diffs (`?theme=` forces a theme; animations are off). Change it only on purpose.
- For a release, bump `VERSION` and `package.json` together (CI checks they match) and add a `CHANGELOG.md` entry with upgrade steps. Apps copy `VERSION` when they vendor `css/`, `fonts/` and `icons/`.

## Architecture

Two CSS layers, loaded in this order: tokens, then components. Section 01 of `patchbay.css` is the reset.

- **`patchbay.tokens.css` is the only place values live.** Colours, type, spacing, sizing, motion and z-index are all `--pb-*` custom properties. Hues are defined once as `--pb-hue-*` primitives that the semantic tokens (accent, commit, status…) point at; components read only the semantic ones. Sizes are rem (hairlines, rims, bars, the default scrollbar and `--pb-touch-text` stay px on purpose; `pb-scroll--lg` is rem so it scales), so apps scale with `html { font-size }`, never `zoom`. Colour tokens use `light-dark(<light>, <dark>)`, so theming is driven by `color-scheme` (OS default, forced by `data-theme`). Never write per-theme CSS rules; the exceptions are the checkbox/radio glyphs, which are images and have overrides at the bottom of the tokens file.
- **`patchbay.css` reads only tokens.** Never hard-code a colour, size, radius or shadow there. A new value means a new token. The file is organised into numbered sections (listed at the top), so add new components as a new `pb-` section and update that contents block.
- **The reset keeps element specificity** (or zero, in `:where()`), so any `pb-` class beats it. Don't add framework or utility classes.
- Naming is `pb-` prefix with BEM (`pb-btn--commit`, `pb-form__label`). Page-level CSS should be layout only.

## Design constraints to preserve

- Every radius token is `0`; shadows are hard offsets with no blur.
- One accent colour (`--pb-accent`), used only for selection and focus. Don't add a second.
- Exactly five status states: ok, warn, error, info, idle. Always pair colour with text or an icon.
- `--pb-commit` and `--pb-status-warn` share a colour but mean different things: commit is unsaved user edits, warn is device or system state.
- The documented WCAG 2.2 AA contrast guarantees (text ≥ 4.5:1, non-text ≥ 3:1, in both themes) must hold. Re-run contrast checks after changing any colour token, and update the figures in `README.md` if they move.
- Never remove focus outlines.
- `pb-btn--commit` (amber, unsaved edits) and `pb-btn--ok` (green, a positive finish) are different things; don't use both for one action.
- Icons come from the bundled Lucide sprite. Use only ids that exist (`grep 'id="name"' icons/lucide.svg`) and always include `viewBox="0 0 24 24"`.
