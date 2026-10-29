# AGENTS.md

This file provides guidance to coding agents (including Claude Code) when working with code in this repository.

## What this is

Patchbay is a static CSS design system (no build step, no package manager, no tests or linter). It ships as plain files: `css/patchbay.tokens.css` + `css/patchbay.css` layered on a vendored `css/bootstrap.min.css`. `README.md` has the full usage and accessibility notes; `llms.txt` is the compact class reference for assistants building *with* the system, so keep it in sync when adding or renaming classes or tokens.

## Developing

- Verify changes by viewing `demo.html`, which exercises every component. Serve it over http (e.g. `python3 -m http.server`) rather than opening via `file://`, because Chrome blocks the external `<use href="icons/lucide.svg#…">` icon sprite on `file://`.
- Check both themes (toggle `<html data-theme="dark|light">` or flip the OS setting) and `prefers-reduced-motion`.

## Architecture

Three CSS layers, loaded in this order: Bootstrap (reset only) → tokens → components.

- **`patchbay.tokens.css` is the only place values live.** Colours, type, spacing, sizing, motion and z-index are all `--pb-*` custom properties. Colour tokens use `light-dark(<light>, <dark>)`, so theming is driven by `color-scheme` (OS default, forced by `data-theme`). Never write per-theme CSS rules; the exceptions are the checkbox/radio glyphs, which are images and have overrides at the bottom of the tokens file.
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
- Icons come from the bundled Lucide sprite. Use only ids that exist (`grep 'id="name"' icons/lucide.svg`) and always include `viewBox="0 0 24 24"`.
