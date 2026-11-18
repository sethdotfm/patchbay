# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are developers, and the coding agents working for them, who build device-control apps for broadcast and AV signal routing. They vendor `css/`, `fonts/` and `icons/` into an app (or install `patchbay-css`) and compose screens from `pb-` classes, using `index.html` and `llms.txt` as the reference.

The people who use those apps are control-room operators. They route sources to destinations, change device settings and watch device state, mostly on fixed monitors read from a distance, sometimes on a phone.

Patchbay is built for the user's own apps first, and it is public so outside teams can adopt it too.

## Product Purpose

Patchbay is a static CSS design system for dense signal-routing and device-control UIs. It gives an app a complete component set (routing crosspoints, signal-level colours, status, forms, tables, modals, toasts and more) that works in both themes, scales with the root font size and meets WCAG 2.2 AA without a build step.

Success means an app built only from Patchbay classes and page layout CSS is legible across a control room, never relies on colour alone, and keeps unsaved edits, device state and selection visibly distinct.

## Positioning

Patchbay encodes routing-domain meaning in its classes: source, destination and tieline crosspoints, locked and protected routes, 16 signal-level colours, role bars, and window-state borders for commit, protect and offline. It separates "unsaved user edits" (commit) from "device or system state" (warn) even though they share a colour. A general-purpose CSS kit has none of these.

## Operating Context

- Apps often run on closed networks, so fonts and icons ship with the page and nothing loads from a CDN.
- Control-room deployments usually pin `data-theme="dark"` so monitors don't follow an OS setting, and scale the UI with `html { font-size: 125% }` for reading at distance.
- Phone layouts opt in with `<html data-pb-layout="phone">`.
- Developers verify changes against `index.html`, the mock apps in `demo/`, `node tools/contrast.mjs` and `node tools/classes.mjs`. `demo/v1-regression.html` is frozen for pixel diffs.
- Apps copy `VERSION` when they vendor a release.

## Capabilities and Constraints

- Plain files only: `css/patchbay.tokens.css` and `css/patchbay.css`, with Patchbay's own reset. No dependencies or build step. Published to npm as `patchbay-css`; vendoring the files stays the primary path.
- Tokens hold every value. Components read only semantic tokens. Colours use `light-dark()`, so themes switch on `color-scheme`. Needs Chrome 123+, Safari 17.5+ or Firefox 120+ (121+ for `:has()` label dimming).
- Sizes are rem, except hairlines and the default scrollbar, which stay px.
- One accent colour for selection and focus. Exactly five status states: ok, warn, error, info, idle. Every radius is 0. Shadows are hard offsets with no blur. Focus outlines stay.
- Icons come only from the bundled Lucide v0.460.0 sprite. Type is self-hosted IBM Plex Sans and Plex Mono.
- Keyboard behaviour for tabs, menus and dialogs (arrow keys, focus trapping) is the consuming app's job, not Patchbay's.
- `llms.txt` must stay in sync with classes and tokens, because agents build from it.

## Brand Commitments

- The name is Patchbay. Classes use the `pb-` prefix with BEM naming.
- The README describes the system as hard-edged and near-black, with square corners, 1px rims, hard offset shadows and one accent (periwinkle). Buttons are lifted plates you press; inputs are sunken wells you type into.
- Documentation voice is terse and literal: what a class does, when to use it, and the rule that applies.

## Evidence on Hand

- `index.html`: the reference page, with every component live alongside its markup.
- `demo/router.html`, `demo/settings.html`, `demo/log.html`, `demo/phone.html`: mock apps built only from Patchbay classes.
- `tools/contrast.mjs` output and the contrast figures in `README.md` (lowest text pair 4.79:1 dark, 5.00:1 light).
- There are no named adopters, testimonials, usage numbers or case studies. Don't invent any.

## Product Principles

1. Meaning before colour. Every state an operator acts on has words or an icon, and each colour keeps one meaning.
2. Legible across the room. Dense layouts stay readable at scale, in both themes, at AA contrast.
3. One source of values. A change to the look is a token change, never a per-component or per-theme override.
4. Works offline and without tooling. Anything Patchbay needs ships in the repo as plain files.
5. Agents are first-class readers. The reference page and `llms.txt` are complete enough to build a correct screen from.

## Accessibility & Inclusion

WCAG 2.2 AA in both themes: text at least 4.5:1, non-text at least 3:1. Visible focus on `:focus-visible` everywhere. `prefers-reduced-motion` stops looping decoration and slows spinners rather than stopping them. Windows forced-colours mode keeps focus, selection and control glyphs visible. Touch fields stay at least 16px. The README's Accessibility section lists what consuming apps still owe.
