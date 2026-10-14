import { armAudio, play } from "./audio";

const MINIMIZE_MS = 420; // keep in sync with --vt-dur in global.css
const MARKER_KEY = "chakerat.vt";
const MARKER_TTL_MS = 10_000;

const vtSupported = (): boolean => CSS.supports("view-transition-name: none");

let pendingRestore = false;
let outgoing = false;

function writeMarker(): void {
  try {
    sessionStorage.setItem(MARKER_KEY, JSON.stringify({ ts: Date.now() }));
  } catch {
    /* storage unavailable — the transition just plays without sound */
  }
}

function consumeMarker(): boolean {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(MARKER_KEY);
    sessionStorage.removeItem(MARKER_KEY);
  } catch {
    return false;
  }
  if (!raw) return false;
  try {
    const { ts } = JSON.parse(raw) as { ts?: number };
    if (typeof ts !== "number" || Date.now() - ts > MARKER_TTL_MS) return false;
  } catch {
    return false;
  }
  const [nav] = performance.getEntriesByType("navigation") as PerformanceNavigationTiming[];
  return !nav || nav.type !== "reload";
}

function scheduleRestore(): void {
  if (pendingRestore || !consumeMarker()) return;
  pendingRestore = true;
  window.setTimeout(() => {
    pendingRestore = false;
    play("restore");
  }, MINIMIZE_MS);
}

function onClick(event: MouseEvent): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const anchor = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
  if (!anchor) return;
  if (anchor.target && anchor.target !== "_self") return;
  if (anchor.hasAttribute("download")) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.search === location.search) return;
  outgoing = true;
  play("minimize");
  writeMarker();
}

export function initNavFeedback(): void {
  armAudio();
  if (!vtSupported()) return;
  document.addEventListener("click", onClick, { passive: true });
  window.addEventListener("pagehide", (event) => {
    // Back/forward into the bfcache; plain link clicks were already handled.
    if (event.persisted && !outgoing) {
      play("minimize");
      writeMarker();
    }
  });
  window.addEventListener("pageshow", () => {
    outgoing = false;
  });
  scheduleRestore();
}

// Registered at module scope so bfcache restores (which never re-run scripts)
// still time the restore sound against the view transition.
if (vtSupported()) {
  window.addEventListener("pagereveal", (event) => {
    if ((event as Event & { viewTransition?: unknown }).viewTransition) {
      scheduleRestore();
    }
  });
}
