# Transition guide: Patchbay v1 → v2.1

For an agent (or person) upgrading an app that vendors Patchbay v1. It was
written from a diff of `css/patchbay.tokens.css` and `css/patchbay.css`
between v1 and v2.1, so every claim below maps to a real change.

- **v1** = git commit `81de438` ("Fix striped progress…"). It has no `VERSION`
  file and no tag. Its only files were `README.md`, `demo.html`, `css/`.
- **v2.1** = `VERSION` reads `2.1.0`, tag `v2.1.0`.

Companion docs in the repo: `README.md` (usage, accessibility), `llms.txt` (the
compact class and token reference — read it before writing markup),
`AGENTS.md` (rules for changing Patchbay itself, not for apps that use it).

## 1. What stays the same

**No token and no class was removed or renamed.** Every `--pb-*` token and every
`.pb-*` class in v1 still exists in v2.1. v1 markup keeps working. The upgrade
is mostly about deleting your own workarounds and checking six behaviour
changes (section 3).

Still true: every radius is `0`, shadows are hard offsets with no blur, one
accent (`--pb-accent`), exactly five status states (ok, warn, error, info, idle),
Bootstrap is a reset only, class naming is `pb-` + BEM.

## 2. Procedure

1. **Replace the vendored files.** Copy `css/`, `icons/` and `VERSION` from the
   new release over the app's copy. `demo/`, `tools/`, `index.html` and
   `demo.html` are documentation and are not vendored. (`demo.html` is now only
   a redirect to `index.html`.) Keep the load order:
   Plex fonts → `bootstrap.min.css` → `patchbay.tokens.css` → `patchbay.css` →
   page CSS. `bootstrap.min.css` is unchanged.
2. **Delete v1 workarounds** using the table in section 4.
3. **Fix the six behaviour changes** in section 3. These are the only places v1
   markup can look different.
4. **Convert page CSS from `px` to `rem`** (section 5).
5. **Add theme handling** (section 6). v1 was dark only; v2 follows the OS.
6. **Verify** (section 7).

## 3. Behaviour changes that can alter an existing app

Check each one by searching the app, not by assuming it does not apply.

1. **Ghost buttons are no longer square.** In v1, `pb-btn--ghost` also forced a
   30px square (`height`, `padding: 0`, `width`). In v2 it only removes the
   plate. A toolbar icon button must now be `pb-btn pb-btn--ghost pb-btn--icon`
   (add `--sm` where it was small). Search for `pb-btn--ghost` without
   `pb-btn--icon` on an icon-only button. A ghost button with a text label now
   works and is auto-width, which v1 could not do.
2. **Numbers use `--pb-font-num`, which defaults to IBM Plex Mono.** Applies to
   `.pb-num`, `.pb-text-num`, `.pb-table--numeric td` and `.pb-table .pb-num`.
   In v1 these inherited the Sans font. If the app wants Sans digits, set
   `--pb-font-num: var(--pb-font);` once in page CSS. Do not override the
   classes.
3. **`code`, `kbd` and `.pb-code` are now a sunken well with a hairline rim**
   (v1 only set the mono font and size). Delete any app CSS that styled them;
   `pre code` is reset to plain.
4. **`pb-w-*` widths moved to the end of the cascade** so they now beat the
   `width: 100%` of select/number wrappers, input groups and ranges. Put the
   class on the **wrapper** (`pb-select-wrap`, `pb-number-wrap`,
   `pb-input-group`), not the inner control. The values are the same in rem
   (3.125 / 5 / 8.75 / 12.5 / 20 rem).
5. **Grouped buttons have no black seam.** v1 added a 1px `--pb-edge-hard`
   `border-left` between `pb-btn-group` buttons; it is gone, so a group is now
   a row of buttons that each keep their own rim. Delete any CSS that
   re-adds a divider.
6. **Warn fills in dots and progress use `--pb-status-warn-fill`.** `pb-dot--warn`
   and `pb-progress__bar--warn` read this new token. It equals the amber text
   colour in dark mode (no change) and is a brighter amber in light mode so the
   fill still reads against the track. Do not point custom warn fills at
   `--pb-status-warn`; that is the text-safe colour.

Smaller visible changes, no action unless the app overrides them:

- `pb-split-handle` borders are `--pb-edge` (grey hairline), not `--pb-edge-hard`
  (black). A `pb-pane--divided` directly before a handle no longer draws its own
  2px bar (the handle draws the rule).
- Checkbox / radio glyphs and the switch knob come from tokens
  (`--pb-glyph-check|dash|radio`, `--pb-text-on-accent`) instead of hard-coded
  white. The checkmark has square caps (v1 was round).
- `pb-btn--danger:hover` reads `--pb-danger-hover` (value unchanged in dark).
- `pb-table--compact` now also pads the header cells to match the body cells.
  Before, compact headers were misaligned with their columns.
- `pb-badge` is `vertical-align: middle`, so it centres beside a heading.
- Number steppers (`pb-number-wrap`): the arrows are drawn by CSS and the native
  spin buttons are kept live and invisible over them, so clicks and
  hold-to-repeat work. Firefox shows its own spinner instead.
- `@media (pointer: coarse)` raises input text to 16px (`--pb-touch-text`) so
  iOS does not zoom. Zero specificity, so an app's own size wins.
- The overlay shadow block is a lifted grey in dark mode
  (`--pb-shadow-block`, `--pb-shadow-rim`) because black on near-black vanished.

## 4. Delete these v1 workarounds

| If the v1 app has | Use in v2.1 |
| --- | --- |
| `body { zoom: 1.25 }` and a private scale variable | `html { font-size: 125% }` |
| `--pb-font-mono: var(--pb-font)` to get Sans numbers | `--pb-font-num: var(--pb-font)` |
| A green Save button class with a `color-mix` hover | `pb-btn--ok` (`--pb-status-ok`, hover `--pb-status-ok-hover`) |
| Local `code` / `kbd` / `.pb-code` styling | Built in |
| A `[data-tip]` CSS tooltip | `data-pb-tip` (also on keyboard focus; `pb-tip--top|start|end`) |
| A stacked settings group, label-over-field grid, sticky save bar | `pb-section`, `pb-fields` + `pb-field`, `pb-savebar` |
| `border-left: 5px solid var(--pb-source)` | `pb-rolebar--source|dest|tieline|error` |
| An `@media (pointer: coarse)` 16px input rule | Built in |
| `[data-layout="phone"] body { min-width: 0 }` | `<html data-pb-layout="phone">` (also reflows split, form, modal, drawer) |
| A full-screen red lost-link frame | `pb-state-offline` on the outermost element, with a `pb-conn` or `pb-banner` |
| A hand-rolled toast, spinner-in-button, empty state, skeleton, breadcrumbs, pager, key/value list | `pb-toast`, `pb-btn--loading`, `pb-empty`, `pb-skeleton`, `pb-breadcrumbs`, `pb-pagination`, `pb-kv` |
| Per-theme CSS rules or colour overrides | Nothing: tokens switch themselves (section 6) |

## 5. Sizes: px → rem

All component sizes, type and spacing tokens are rem now (`--pb-space-*`,
`--pb-text-*`, `--pb-control-h*`, and so on), so the whole UI scales with
`html { font-size }`. The values are identical at a 16px root. Hairlines
(`--pb-border-w`, rims, bars, scrollbars) and `--pb-touch-text` stay `px` on
purpose.

In page CSS:

- Never use `zoom`, and never combine `zoom` with a root font size (scales
  twice). Remove `calc(100vw / var(--scale))` style divisions.
- Convert pixel literals (`5px`, `48px`, `1200px`, `minmax(180px, 1fr)`) to rem or
  a token. They stop scaling once `zoom` goes.
- `@media` queries in `rem` follow the browser's initial size, not `html`'s, so
  a 125% root does not move the breakpoint.
- `--pb-page-min-w` (42.5rem, the old 680px) is the floor under which the page
  scrolls sideways. Phone layouts opt out with `data-pb-layout="phone"`.

## 6. Themes (new in v2)

v1 was dark only. v2 is light and dark.

- `color-scheme: light dark` is set on `:root`, so the OS decides by default.
  Force a theme with `<html data-theme="light">` or `data-theme="dark"`.
- Every colour token is `light-dark(<light>, <dark>)`. **Never write per-theme
  CSS rules.** If something needs a new colour, add a token in
  `patchbay.tokens.css`.
- Hues are `--pb-hue-*` primitives that the semantic tokens point at. Components
  and apps read the semantic tokens only (`--pb-accent`, `--pb-commit`,
  `--pb-status-*`, …), never `--pb-hue-*`.
- The one exception is the checkbox/radio glyph images, which cannot read
  custom properties; their light overrides live at the bottom of the tokens file.
- Any app colour that was a literal dark-mode hex has to become a token.

### Switching the theme smoothly

Wrap the change in a View Transition so every surface, native control and glyph
crossfades together; fall back to the class where the API is missing. Duration is
`--pb-motion-theme` (400ms, zero under `prefers-reduced-motion`).

```js
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
function setTheme(next) {                       // "light" | "dark"
  const apply = () => { document.documentElement.dataset.theme = next; };
  if (document.startViewTransition && !reduced.matches) {
    document.startViewTransition(apply);
    return;
  }
  const root = document.documentElement;
  root.classList.add("pb-theme-transition");     // per-property fade fallback
  apply();
  const ms = parseFloat(getComputedStyle(root).getPropertyValue("--pb-motion-theme")) || 0;
  setTimeout(() => root.classList.remove("pb-theme-transition"), ms + 50);
}
```

Do not leave `pb-theme-transition` on permanently: it overrides every
component's own transition.

## 6a. New in v2 (additive, use when needed)

Components: `pb-btn--ok`, `pb-btn--loading`, `pb-tip` / `data-pb-tip`,
`pb-fields`, `pb-field`, `pb-field--error|ok`, `pb-input--valid`, `pb-hint`,
`pb-label`, `pb-section`, `pb-savebar`, `pb-rolebar--*`, `pb-conn`, `pb-banner`,
`pb-state-offline`, `pb-toast-stack` / `pb-toast`, `pb-enter`, `pb-kv`, `pb-empty`,
`pb-skeleton`, `pb-breadcrumbs`, `pb-pagination`, `pb-clamp-2|3`.

Tokens: `--pb-hue-*`, `--pb-font-num`, `--pb-danger-hover`,
`--pb-status-ok-hover`, `--pb-status-warn-fill`, `--pb-shadow-rim|block`,
`--pb-glyph-*`, `--pb-rolebar-w`, `--pb-page-min-w`, `--pb-touch-text`,
`--pb-motion-theme|enter`, `--pb-z-toast`.

Icons: a bundled Lucide sprite, `icons/lucide.svg` (licence in `icons/LICENSE`).
Use only ids that exist (`grep 'id="name"' icons/lucide.svg`), never write path
data, and always include `viewBox="0 0 24 24"`:

```html
<svg class="pb-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="icons/lucide.svg#play"/></svg>
```

Serve over http: Chrome blocks an external `<use>` on `file://`.

## 7. Verify

1. Look at every screen of the app in **both themes**, at 100% and 125%
   (`html { font-size: 125% }`), and with `prefers-reduced-motion` on. Pay
   attention to icon buttons (3.1), numeric columns (3.2), widths (3.4).
2. Contrast: all documented pairs must stay ≥ 4.5:1 for text and ≥ 3:1 for
   non-text, in both themes. In this repo `node tools/contrast.mjs` exits 0.
   In the app, re-check anything coloured by a literal instead of a token.
3. Every `.pb-*` class the app uses must exist in `patchbay.css`. In this repo
   `node tools/classes.mjs <pages…>` prints "All … defined and shown".
4. Keyboard: focus rings visible everywhere (never remove them); tooltip triggers
   have their own accessible name; icon-only buttons have `aria-label`; status
   colour always has text or an icon beside it.
5. Reference: `index.html` (one section per component group) and the mock apps in
   `demo/` show the intended markup for every component. Serve over http
   (`python3 -m http.server`); `?theme=dark|light`, `?scale=125` help.

## 8. Rules agents must keep while migrating

- Do not hard-code a colour, size, radius or shadow in app CSS: use `var(--pb-*)`.
  A new value means a new token.
- Do not use Bootstrap utilities (`d-flex`, `mb-3`, `text-*`) or bare Bootstrap
  components. Where Bootstrap JS needs its class, pair it: `btn pb-btn`,
  `form-control pb-input`, `form-select pb-select`, `form-check-input pb-check__input`,
  `dropdown-menu pb-menu`, `dropdown-item pb-menu__item`, `modal-content pb-modal`,
  `navbar pb-toolbar`.
- One accent colour only, used for selection and focus. No second one.
- `pb-btn--commit` (amber) = unsaved edits that this applies; `pb-btn--ok` (green)
  = a positive finish. Never both for one action. `--pb-commit` and
  `--pb-status-warn` share a colour but mean different things.
- Page CSS is layout only.
