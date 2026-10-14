const SESSION_KEY = "chakerat.booted";

export function initBoot(): void {
  const root = document.documentElement;
  const screen = document.getElementById("bootscreen");
  if (!shouldBoot() || !root.classList.contains("boot-active") || !screen) {
    root.classList.remove("boot-active");
    root.classList.add("boot-done");
    root.style.removeProperty("overflow");
    return;
  }

  const lineEls = Array.from(screen.querySelectorAll<HTMLElement>(".boot-line"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ?slowboot=N stretches the sequence for inspecting the typing, dev-only tool. */
  const slow = Number(new URLSearchParams(window.location.search).get("slowboot") || 0) || 1;

  const lines: { el: HTMLElement; delay: number; duration: number }[] = [];
  let cursor = 0.25;
  for (const el of lineEls) {
    const chars = el.textContent?.length ?? 0;
    const duration = (reduced ? 0.01 : Math.min(0.42, 0.09 + chars * 0.011)) * slow;
    lines.push({ el, delay: cursor, duration });
    el.style.setProperty("--chars", String(chars));
    el.style.setProperty("--type-delay", `${cursor}s`);
    el.style.setProperty("--type-time", `${duration}s`);
    cursor += duration + 0.16 * slow;
  }

  let done = false;
  const timer = window.setTimeout(() => finish(), cursor * 1000 + 250);

  const onSkip = (): void => finish(true);
  window.addEventListener("keydown", onSkip);
  window.addEventListener("pointerdown", onSkip);

  function finish(skipped = false): void {
    if (done) return;
    done = true;
    window.clearTimeout(timer);
    window.removeEventListener("keydown", onSkip);
    window.removeEventListener("pointerdown", onSkip);

    if (skipped && !reduced) {
      for (const { el } of lines) {
        el.style.animation = "none";
        el.style.width = "auto";
      }
    }
    try {
      sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private mode — boot will replay, that is fine */
    }
    root.classList.add("boot-done");
    root.classList.remove("boot-active");
    root.style.removeProperty("overflow");
    window.setTimeout(() => screen.remove(), skipped ? 220 : 420);
  }
}

function shouldBoot(): boolean {
  const params = new URLSearchParams(window.location.search);
  if (params.has("skipboot")) return false;
  try {
    return sessionStorage.getItem(SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}
