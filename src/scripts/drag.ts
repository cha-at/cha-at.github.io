import { play } from "./audio";

export function initArchive(): void {
  const wrap = document.getElementById("archive-window");
  const dialog = document.getElementById("archive-dialog");
  const slot = document.getElementById("archive-window-slot");
  const titlebar = document.querySelector<HTMLElement>("[data-drag-handle]");
  if (!wrap || !dialog || !slot || !titlebar) return;

  const triggers = document.querySelectorAll<HTMLElement>("[data-open-archive]");
  const closeBtn = dialog.querySelector<HTMLButtonElement>("[data-window-close]");
  const minBtn = dialog.querySelector<HTMLButtonElement>("[data-window-min]");
  const maxBtn = dialog.querySelector<HTMLButtonElement>("[data-window-max]");
  const statusEl = document.getElementById("archive-status");

  /* Floating mode is a function of viewport size, not pointer type — a
     Surface in tablet mode reports coarse primary pointer but still gets the
     draggable window (pointer events handle touch; touch-action on the
     titlebar keeps the gesture from scrolling the page). */
  const desktopQuery = window.matchMedia("(min-width: 1024px)");
  const EDGE = 16; // minimum gap to the viewport sides and bottom
  const TOP_CLEARANCE = 40; // keep clear of the fixed status bar so the title bar stays reachable

  let open = false;
  let returnFocus: HTMLElement | null = null;
  let offset = { x: 0, y: 0 };
  let maximized = false;
  let base: { left: number; top: number } | null = null;

  /* The window is centered by CSS (left: 50% + translateX(-50%)); the drag
     transform is translate3d(offset) *composed with* that centering, so offset
     (0,0) is exactly the centered position. The base is computed analytically —
     getBoundingClientRect() includes the current drag transform and must not
     be used here. Sizes use the client box so they match how CSS resolves
     left: 50% (excluding the classic scrollbar). */
  const viewport = () => ({
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  });

  function computeBase(): { left: number; top: number } {
    const top = Number.parseFloat(getComputedStyle(wrap!).top) || 96;
    return { left: (viewport().w - wrap!.offsetWidth) / 2, top };
  }

  function setStatus(text: string): void {
    if (statusEl) statusEl.textContent = `STATUS: ${text}`;
  }

  function applyOffset(): boolean {
    if (!desktopQuery.matches || !base) return false;
    const width = wrap!.offsetWidth;
    const height = wrap!.offsetHeight;
    const { w, h } = viewport();
    const minX = EDGE - base.left;
    const maxX = w - EDGE - base.left - width;
    const minY = TOP_CLEARANCE - base.top;
    const maxY = h - EDGE - base.top - height;
    const within = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), Math.max(min, max));
    offset.x = within(offset.x, minX, maxX);
    offset.y = within(offset.y, minY, maxY);
    wrap!.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) translateX(-50%)`;
    return true;
  }

  function openWindow(trigger: HTMLElement): void {
    if (open) {
      setStatus("ALREADY OPEN");
      dialog!.focus({ preventScroll: true });
      return;
    }
    open = true;
    returnFocus = trigger;
    wrap!.hidden = false;
    offset = { x: 0, y: 0 }; // every open starts centered
    if (desktopQuery.matches) {
      document.body.appendChild(wrap!);
      base = computeBase();
      applyOffset();
      setStatus("DRAG THE TITLE BAR");
    } else {
      setStatus("OPEN");
    }
    dialog!.animate(
      [
        { opacity: 0, transform: "scale(0.97)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 160, easing: "ease-out" },
    );
    play("open");
    closeBtn?.focus({ preventScroll: true });
    dialog!.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function closeWindow(): void {
    if (!open) return;
    open = false;
    wrap!.hidden = true;
    wrap!.classList.remove("dragging");
    setStatus("READY");
    play("close");
    if (returnFocus && document.contains(returnFocus)) {
      returnFocus.focus({ preventScroll: true });
    }
  }

  for (const trigger of triggers) {
    trigger.addEventListener("click", () => openWindow(trigger));
  }

  closeBtn?.addEventListener("click", closeWindow);
  minBtn?.addEventListener("click", closeWindow);

  maxBtn?.addEventListener("click", () => {
    if (!desktopQuery.matches) return;
    maximized = !maximized;
    if (maximized) {
      wrap!.classList.add("is-maximized");
      wrap!.style.transform = "none";
      setStatus("MAXIMIZED — PRESS □ AGAIN TO RESTORE");
    } else {
      wrap!.classList.remove("is-maximized");
      base = computeBase();
      applyOffset();
      setStatus("DRAG THE TITLE BAR");
    }
    play("click");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && open) {
      closeWindow();
    }
  });

  window.addEventListener("resize", () => {
    if (!open || maximized || !desktopQuery.matches) return;
    base = computeBase();
    applyOffset();
  });

  /* Drag: pointer capture on the titlebar only, desktop fine-pointer layouts. */
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startOffset = { x: 0, y: 0 };

  titlebar.addEventListener("pointerdown", (event) => {
    if (!desktopQuery.matches || maximized) return;
    if ((event.target as Element).closest("button")) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    dragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startOffset = { ...offset };
    if (!base) base = computeBase();
    wrap!.classList.add("dragging");
    try {
      titlebar.setPointerCapture(event.pointerId);
    } catch {
      /* synthetic or already-released pointer — capture is a nicety, not required */
    }
    play("click");
    event.preventDefault();
  });

  titlebar.addEventListener("pointermove", (event) => {
    if (!dragging) return;
    offset = { x: startOffset.x + (event.clientX - startX), y: startOffset.y + (event.clientY - startY) };
    applyOffset();
  });

  const endDrag = (event: PointerEvent): void => {
    if (!dragging) return;
    dragging = false;
    wrap!.classList.remove("dragging");
    try {
      if (titlebar.hasPointerCapture(event.pointerId)) {
        titlebar.releasePointerCapture(event.pointerId);
      }
    } catch {
      /* pointer already gone */
    }
  };

  titlebar.addEventListener("pointerup", endDrag);
  titlebar.addEventListener("pointercancel", endDrag);

  desktopQuery.addEventListener("change", () => {
    if (!desktopQuery.matches) {
      if (wrap!.parentElement === document.body && slot) {
        slot.appendChild(wrap!);
      }
      wrap!.style.transform = "";
      wrap!.classList.remove("is-maximized");
      maximized = false;
      base = null;
    }
  });
}
