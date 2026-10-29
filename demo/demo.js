// Behaviour for the demo site only. Patchbay itself ships no JavaScript:
// everything here is the "app JS" the README says you supply (theme switch,
// tabs, toasts), plus the documentation chrome (scale, snippets, TOC).

const root = document.documentElement;
const $ = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => [...scope.querySelectorAll(sel)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");

// ---- ?theme=light|dark, ?scale=125 and ?instant: for linking and screenshots ----

{
  const q = new URLSearchParams(location.search);
  if (q.get("theme")) root.dataset.theme = q.get("theme");
  if (q.get("scale")) root.style.fontSize = `${parseFloat(q.get("scale"))}%`;
  if (q.has("instant")) root.style.scrollBehavior = "auto";
  // ?only=id,id shows just those sections (for screenshots and focused links).
  if (q.get("only")) {
    const keep = q.get("only").split(",");
    document.querySelectorAll(".demo-sec").forEach((sec) => { sec.hidden = !keep.includes(sec.id); });
  }
}

// ---- theme: no data-theme means "follow the OS"; the toggle forces one ----

const themeToggle = $("#theme-toggle");
if (themeToggle) {
  const osLight = matchMedia("(prefers-color-scheme: light)");
  const isLight = () => (root.dataset.theme || (osLight.matches ? "light" : "dark")) === "light";
  const sync = () => { themeToggle.textContent = isLight() ? "Dark mode" : "Light mode"; };
  themeToggle.addEventListener("click", () => {
    root.classList.add("pb-theme-transition");
    root.dataset.theme = isLight() ? "dark" : "light";
    sync();
    const ms = parseFloat(getComputedStyle(root).getPropertyValue("--pb-motion-theme")) || 0;
    setTimeout(() => root.classList.remove("pb-theme-transition"), ms + 50);
  });
  osLight.addEventListener("change", sync);
  sync();
}

// ---- scale: the whole UI follows the root font size -----------------------

const scaleButtons = $$("[data-scale]");
{
  const fromUrl = new URLSearchParams(location.search).get("scale");
  if (fromUrl) scaleButtons.forEach((o) => o.setAttribute("aria-pressed", String(o.dataset.scale === String(parseFloat(fromUrl)))));
}
scaleButtons.forEach((b) => b.addEventListener("click", () => {
  root.style.fontSize = b.dataset.scale === "100" ? "" : `${b.dataset.scale}%`;
  scaleButtons.forEach((o) => o.setAttribute("aria-pressed", String(o === b)));
}));

// ---- snippets: each example shows its own markup --------------------------

function dedent(text) {
  const lines = text.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
  return lines.map((l) => l.slice(indent)).join("\n");
}

$$(".demo-ex").forEach((ex) => {
  const view = $(".demo-ex__view", ex);
  const code = $("pre code", ex);
  if (!view || !code) return;
  const clone = view.cloneNode(true);
  $$("[data-demo-only]", clone).forEach((n) => n.remove());
  $$("[data-demo-attr]", clone).forEach((n) => n.removeAttribute("data-demo-attr"));
  code.textContent = dedent(clone.innerHTML);
  const summary = $("summary", ex);
  if (summary && !$("[data-copy]", summary)) {
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "pb-btn pb-btn--ghost pb-btn--sm";
    copy.dataset.copy = "";
    copy.textContent = "Copy";
    copy.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      try { await navigator.clipboard.writeText(code.textContent); copy.textContent = "Copied"; }
      catch { copy.textContent = "Select and copy"; }
      setTimeout(() => { copy.textContent = "Copy"; }, 1500);
    });
    summary.append(copy);
  }
});

// ---- table of contents: scroll-spy and the narrow-screen select -----------

const tocLinks = $$(".demo-toc a");
const tocSelect = $(".demo-toc-select select");
const sections = $$(".demo-sec");

function setCurrent(id) {
  tocLinks.forEach((a) => {
    if (a.getAttribute("href") === `#${id}`) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
  if (tocSelect) tocSelect.value = `#${id}`;
}

if (sections.length && "IntersectionObserver" in window) {
  const seen = new Map();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => seen.set(e.target.id, e.isIntersecting ? e.boundingClientRect.top : null));
    const top = [...seen].filter(([, y]) => y !== null).sort((a, b) => a[1] - b[1])[0];
    if (top) setCurrent(top[0]);
  }, { rootMargin: "-10% 0px -70% 0px" });
  sections.forEach((s) => io.observe(s));
}

if (tocSelect) tocSelect.addEventListener("change", () => { location.hash = tocSelect.value; });

// ---- tabs (role=tablist; arrow keys move and activate) --------------------

$$("[role=tablist]").forEach((list) => {
  const tabs = $$("[role=tab]:not([disabled])", list);
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) panel.classList.toggle("active", on);
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (next === undefined) return;
      e.preventDefault();
      const target = tabs[(next + tabs.length) % tabs.length];
      target.focus();
      select(target);
    });
  });
});

// ---- toggles: data-toggle="#id" data-class="class" ------------------------

$$("[data-toggle]").forEach((b) => b.addEventListener("click", () => {
  const target = $(b.dataset.toggle);
  if (!target) return;
  const on = target.classList.toggle(b.dataset.class);
  b.setAttribute("aria-expanded", String(on));
}));

// ---- toasts: data-toast="ok|warn|error|info" ------------------------------

const toastCopy = {
  ok: ["Route taken", "MON 2 now follows CAM 2 on all levels."],
  warn: ["Partial take", "Level 3 did not answer; 15 of 16 levels changed."],
  error: ["Take failed", "The router refused the route: destination is protected."],
  info: ["Names refreshed", "Router names are re-polled every 60 seconds."],
};

function toast(kind, copy) {
  const stack = $("#toast-stack");
  if (!stack) return;
  const [title, msg] = copy ? [copy.title, copy.msg] : toastCopy[kind];
  const icon = { ok: "circle-check", warn: "triangle-alert", error: "circle-x", info: "info" }[kind];
  const el = document.createElement("div");
  el.className = `pb-toast pb-toast--${kind}`;
  el.setAttribute("role", kind === "error" ? "alert" : "status");
  el.innerHTML = `
    <svg class="pb-icon pb-toast__icon" viewBox="0 0 24 24" aria-hidden="true"><use href="${iconBase}icons/lucide.svg#${icon}"/></svg>
    <div class="pb-toast__body"><div class="pb-toast__title"></div><div class="pb-toast__msg"></div></div>
    <button class="pb-btn pb-btn--ghost pb-btn--icon pb-btn--sm pb-toast__close" aria-label="Dismiss"><svg class="pb-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="${iconBase}icons/lucide.svg#x"/></svg></button>`;
  $(".pb-toast__title", el).textContent = title;
  $(".pb-toast__msg", el).textContent = msg;
  $(".pb-toast__close", el).addEventListener("click", () => el.remove());
  stack.append(el);
  if (kind !== "error") setTimeout(() => el.remove(), 6000);
}

const iconBase = document.body.dataset.iconBase || "";
$$("[data-toast]").forEach((b) => b.addEventListener("click", () => toast(b.dataset.toast)));
// Mock apps fire this with { kind, title, msg }.
window.addEventListener("demo-toast", (e) => toast(e.detail.kind, e.detail));

// ---- loading buttons: data-loading ----------------------------------------

$$("[data-loading]").forEach((b) => b.addEventListener("click", () => {
  b.classList.add("pb-btn--loading");
  b.setAttribute("aria-busy", "true");
  setTimeout(() => {
    b.classList.remove("pb-btn--loading");
    b.removeAttribute("aria-busy");
  }, 1600);
}));

// ---- window states: data-state="pb-state-offline" on a control ------------

$$("[data-state-toggle]").forEach((b) => b.addEventListener("click", () => {
  const target = $(b.dataset.target);
  if (!target) return;
  const on = target.classList.toggle(b.dataset.stateToggle);
  b.setAttribute("aria-pressed", String(on));
}));

// Reduced-motion note for the docs page.
const note = $("#reduced-note");
if (note) note.hidden = !reduced.matches;
