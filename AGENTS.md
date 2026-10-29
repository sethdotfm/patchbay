# AGENTS.md

This file provides guidance to coding agents (including Claude Code) when working with code in this repository.

## What this is

Patchbay is a static CSS design system (no build step, no package manager, no tests or linter). It ships as plain files: `css/patchbay.tokens.css` + `css/patchbay.css` layered on a vendored `css/bootstrap.min.css`. `README.md` has the full usage and accessibility notes; `llms.txt` is the compact class reference for assistants building *with* the system, so keep it in sync when adding or renaming classes or tokens.

## Developing

- Verify changes in `index.html` (the reference page, one `<section id>` per component group, in the order of `patchbay.css`'s numbered sections) and the mock apps in `demo/`. Serve over http (`python3 -m http.server`) rather than `file://`, because Chrome blocks the external `<use href="icons/lucide.svg#…">` icon sprite on `file://`. `?theme=dark|light`, `?scale=125`, `?only=id,id` and `?instant` on `index.html` help with screenshots.
- Check both themes and `prefers-reduced-motion`, and at 125% scale (the toolbar buttons) since sizes are rem.
- `node tools/contrast.mjs` must exit 0 (checks documented text and non-text pairs in both themes). `--dump` prints every resolved token; diff it before and after a token refactor, since it normalises rem to px and colours to hex. `--worst` gives the per-token ratios quoted in the tokens file.
- `node tools/classes.mjs [pages…]` must print "All … defined and shown": every `.pb-*` class in `patchbay.css` needs a live example in `index.html`, and no page may use an undefined one.
- `demo/v1-regression.html` is a frozen page for pixel diffs (`?theme=` forces a theme; animations are off). Change it only on purpose.
- Bump `VERSION` for a release; apps copy it when they vendor `css/` and `icons/`.

## Architecture

Three CSS layers, loaded in this order: Bootstrap (reset only) → tokens → components.

- **`patchbay.tokens.css` is the only place values live.** Colours, type, spacing, sizing, motion and z-index are all `--pb-*` custom properties. Hues are defined once as `--pb-hue-*` primitives that the semantic tokens (accent, commit, status…) point at; components read only the semantic ones. Sizes are rem (hairlines, rims, bars and `--pb-touch-text` stay px on purpose), so apps scale with `html { font-size }`, never `zoom`. Colour tokens use `light-dark(<light>, <dark>)`, so theming is driven by `color-scheme` (OS default, forced by `data-theme`). Never write per-theme CSS rules; the exceptions are the checkbox/radio glyphs, which are images and have overrides at the bottom of the tokens file.
- **`patchbay.css` reads only tokens.** Never hard-code a colour, size, radius or shadow there. A new value means a new token. The file is organised into numbered sections (listed at the top), so add new components as a new `pb-` section and update that contents block.
- **Bootstrap is a reset plus optional JS hooks.** Don't use Bootstrap utilities or bare components. Where Bootstrap JS needs its class, pair it with the `pb-` one (`btn pb-btn`, `form-control pb-input`, and so on; the full list is in `llms.txt`).
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
