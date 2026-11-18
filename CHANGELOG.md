DISCLOSURE: This was written by an LLM.

# Changelog

Each release lists what changed and what an app that vendors Patchbay has to
do. `VERSION` and `package.json` carry the current number.

## 3.0.0 (2026-11-18)

Patchbay no longer depends on Bootstrap. It is two stylesheets, a font
stylesheet and an icon sprite, and it installs from npm as `patchbay-css`.

### Breaking

- **Bootstrap is gone.** `css/bootstrap.min.css` is deleted and section 01 of
  `patchbay.css` is now the reset. Remove the Bootstrap `<link>`.
- **The Bootstrap pairing selectors are gone:** `.btn.pb-btn`,
  `.form-control.pb-input`, `.form-select.pb-select`,
  `.form-check-input.pb-check__input`, `.dropdown-menu.pb-menu`,
  `.dropdown-item.pb-menu__item`, `.modal-content.pb-modal`,
  `.modal-backdrop.show` and `.navbar.pb-toolbar`. Take the Bootstrap class
  off each `pb-` element. If the app still loads Bootstrap's CSS for its JS
  components, Bootstrap's rules now compete with Patchbay's; drive menus and
  dialogs from your own JS instead.
- **The `--bs-*` bridge tokens are gone.**
- **The reset differs from Bootstrap Reboot where Reboot had its own look:**
  - `h1` to `h6` follow the type scale (`h1` is `--pb-text-xl`, `h2`
    `--pb-text-lg`, `h3` `--pb-text-md`, `h4` to `h6` `--pb-text-sm`).
    Reboot used 2.5rem down to 1rem.
  - Bare links take the text colour and keep their underline. Reboot made
    them blue, a second accent the system does not allow.
  - `pre` uses `--pb-font-mono` at `--pb-text-xs`.
  - `dt` is `--pb-weight-bold` (600, the heaviest Plex weight shipped).
  - `legend` inherits its font size.
  - There is no styling for `.h1`-style classes, `small`, `mark` or
    `abbr[title]`.
- **Unused tokens are removed:** `--pb-accent-tab`, `--pb-icon`,
  `--pb-icon-disabled`, `--pb-tab-h` and `--pb-motion-instant`. Nothing in
  Patchbay read them.
- **`demo.html` is removed.** It only redirected to `index.html`.
- **`transition.md` is removed.** Its v1 upgrade guide is the 2.0.0 entry
  below.

### Fixed

Bootstrap's reset outranked two Patchbay rules. Both now render as designed:

- `pb-divider--hard` is 2px of `--pb-edge-hard`. It was a 1px soft line.
- A locked crosspoint (`pb-xpt--locked`) shows the `not-allowed` cursor. It
  showed `pointer`.

Also fixed, and present since 2.0: a hovered commit, ok, danger or latched
(`pb-btn--selected`) button lost its on-accent text, because `.pb-btn:hover`
outranked the variant. Hovered Apply showed dark text on dark amber in light
mode. Each variant now keeps `--pb-text-on-accent` on hover.

### Added

- `package.json`, for `npm install patchbay-css`. A bare
  `@import "patchbay-css"` loads `css/index.css` (tokens, then components).
  It also exports `tokens.css`, `patchbay.css`, `fonts.css` and `icons.svg`.
- `LICENSE`: Patchbay is released into the public domain under the
  Unlicense. Plex (OFL 1.1) and Lucide (ISC) keep their own licences.
- Tokens: `--pb-status-tint` (how much status colour washes an alert or
  banner), `--pb-caret-w` and `--pb-caret-h` (the drawn select and sort
  carets).
- A CI workflow that runs the contrast and class-coverage checks.
- `node tools/classes.mjs --llms` understands llms.txt's compact notation,
  so it reports only classes llms.txt really leaves out.

### Upgrading to 3.0

1. Copy `css/`, `fonts/`, `icons/` and `VERSION` over the app's copy, and
   delete the app's `css/bootstrap.min.css`.
2. Delete the Bootstrap `<link>`. The load order is now
   `fonts/plex.css`, `css/patchbay.tokens.css`, `css/patchbay.css`, page CSS.
3. Search the app for `btn `, `form-control`, `form-select`,
   `form-check-input`, `dropdown-menu`, `dropdown-item`, `modal-content`,
   `navbar` and `--bs-`, and remove them.
4. Check bare `h1` to `h6`, links and `pre` blocks against the list above.
   Give a heading a size in page CSS if it relied on Reboot's.
5. If the app used Bootstrap utilities (`d-flex`, `mb-3` and so on), replace
   them with `pb-row`, `pb-col` or page layout CSS. They were never supported,
   and now they do nothing.

## 2.3.0 (2026-11-18)

Fixes for things apps had to patch locally. You can usually delete these
workarounds:

| Local workaround | 2.3 |
| --- | --- |
| A 16px field rule for iOS, because the built-in one never applied | Built in: fields read `--pb-field-text-min`, which is `--pb-touch-text` under `pointer: coarse` |
| `scrollbar-width: auto` resets so Chrome draws `::-webkit-scrollbar` rules | Built in: the standard properties now go to Firefox only |
| `li:focus-within > .pb-menu__sub { display: block }` | Built in: submenus open on keyboard focus |
| Hiding `data-pb-tip` under `hover: none` | Built in: a tap no longer leaves the tip up; keyboard focus still shows it |
| A Google Fonts link, or a local copy of Plex | `fonts/plex.css` |
| Hand-drawn large or always-shown scrollbars | `pb-scroll pb-scroll--lg`, `--pb-scroll-thumb-min` |

Also in 2.3:

- Placeholders use `--pb-text-muted`, for 4.5:1 contrast.
- `pb-input` shows the native invalid state through `:user-invalid`, so a
  required field turns red only after the user edits and leaves it.
- Forced-colours mode keeps focused fields outlined, the selected tab and
  row outlined in `Highlight`, native checkboxes and a visible switch thumb.
- Spinners and the indeterminate bar slow to about a third of their speed
  under `prefers-reduced-motion` instead of stopping.

Chrome and Safari skip every `::-webkit-scrollbar` rule on an element whose
`scrollbar-color` or `scrollbar-width` is not `auto`, including a value
inherited from an ancestor. Don't set either on `html` or `body` if you use
`pb-scroll`. Firefox has no least thumb length and still uses overlay bars on
macOS.

## 2.2.0 (2026-11-08)

- Routing-state tokens: `--pb-view` (the destination being viewed or staged),
  `--pb-view-idle` and `--pb-current-idle` (those colours mixed into the
  control surface for untouched cells).

## 2.0.0 and 2.1.0 (2026-10-29, 2026-11-02): upgrading from v1

2.1 added the View Transition theme crossfade and fixed button-group seams,
the splitter's double bar and compact table headers. The rest of this entry
covers both releases.

v1 is commit `81de438`. It has no `VERSION` file or tag, and it was dark only.
No v1 token or class was removed or renamed in v2, so v1 markup keeps working.
The upgrade is mostly deleting workarounds and checking six behaviour changes.

### Behaviour changes to check

Search the app for each one rather than assuming it does not apply.

1. **Ghost buttons are no longer square.** v1's `pb-btn--ghost` also forced a
   30px square. An icon-only toolbar button is now
   `pb-btn pb-btn--ghost pb-btn--icon` (add `--sm` where it was small). A ghost
   button with a text label now sizes to its label.
2. **Numbers use `--pb-font-num`, which defaults to Plex Mono.** This applies
   to `.pb-num`, `.pb-text-num`, `.pb-table--numeric td` and
   `.pb-table .pb-num`. For Sans digits, set `--pb-font-num: var(--pb-font)`
   once in page CSS.
3. **`code`, `kbd` and `.pb-code` are a sunken well with a hairline rim.**
   Delete app CSS that styled them; `pre code` is reset to plain.
4. **`pb-w-*` widths beat the wrappers' own `width: 100%`.** Put the class on
   the wrapper (`pb-select-wrap`, `pb-number-wrap`, `pb-input-group`), not the
   inner control.
5. **Grouped buttons have no black seam.** Delete CSS that re-adds a divider
   between `pb-btn-group` buttons.
6. **Warn fills in dots and progress read `--pb-status-warn-fill`.** It is a
   brighter amber in light mode. Don't point custom warn fills at
   `--pb-status-warn`, which is the text-safe colour.

Smaller visible changes: `pb-split-handle` borders are a grey hairline; a
`pb-pane--divided` right before a handle draws no bar of its own; checkbox,
radio and switch glyphs come from tokens; `pb-table--compact` pads header
cells to match the body; `pb-badge` centres beside a heading; number steppers
draw their arrows in CSS over live native spin buttons; the overlay shadow is
a lifted grey in dark mode.

### Delete these v1 workarounds

| v1 workaround | v2 |
| --- | --- |
| `body { zoom: 1.25 }` and a private scale variable | `html { font-size: 125% }` |
| `--pb-font-mono: var(--pb-font)` to get Sans numbers | `--pb-font-num: var(--pb-font)` |
| A green Save button class with a `color-mix` hover | `pb-btn--ok` |
| Local `code` / `kbd` / `.pb-code` styling | Built in |
| A `[data-tip]` CSS tooltip | `data-pb-tip`, also on keyboard focus |
| Stacked settings group, label-over-field grid, sticky save bar | `pb-section`, `pb-fields` / `pb-field`, `pb-savebar` |
| `border-left: 5px solid var(--pb-source)` | `pb-rolebar--source` |
| An `@media (pointer: coarse)` 16px input rule | Built in |
| `[data-layout="phone"] body { min-width: 0 }` | `<html data-pb-layout="phone">` |
| A full-screen red lost-link frame | `pb-state-offline` with a `pb-conn` or `pb-banner` |
| Hand-rolled toast, button spinner, empty state, skeleton, breadcrumbs, pager, key/value list | `pb-toast`, `pb-btn--loading`, `pb-empty`, `pb-skeleton`, `pb-breadcrumbs`, `pb-pagination`, `pb-kv` |
| Per-theme CSS rules or colour overrides | Nothing: tokens switch themselves |

### Sizes moved from px to rem

Every size, type and spacing token is rem, with identical values at a 16px
root. Hairlines, rims, bars, the default scrollbar and `--pb-touch-text` stay
px. In page CSS:

- Never use `zoom`, and never combine it with a root font size: that scales
  twice. Remove `calc(100vw / var(--scale))` divisions.
- Convert literals such as `5px`, `48px` and `minmax(180px, 1fr)` to rem or a
  token. They stop scaling once `zoom` goes.
- `@media` queries in rem follow the browser's initial font size, not
  `html`'s, so a 125% root does not move a breakpoint.

### Themes

v2 is light and dark and follows the OS. Force a theme with
`<html data-theme="light">` or `"dark"`. Every colour token is
`light-dark(<light>, <dark>)`, so an app colour that was a literal dark-mode
hex has to become a token. README.md shows how to crossfade a theme switch.

### Verify

Look at every screen in both themes, at 100% and 125%, and with
`prefers-reduced-motion` on, paying most attention to icon buttons, numeric
columns and widths. Re-check contrast for anything coloured by a literal
instead of a token.
