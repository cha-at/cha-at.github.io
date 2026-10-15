const LERP = 0.16;
const RING_SIZE = 30;

export function initCursor(): void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* Hybrid devices (Surface etc.) may report touch as the *primary* pointer
     while a mouse/pen is used — any-pointer covers those. Touch-only large
     screens still get the lens: it follows taps and drags. Narrow phones
     stay cursor-free. */
  const finePointer = window.matchMedia("(any-pointer: fine)").matches;
  const bigScreen = window.matchMedia("(min-width: 1024px)").matches;
  if ((!finePointer && !bigScreen) || reduced) return;

  const cross = document.createElement("div");
  cross.className = "cursor-cross";
  cross.setAttribute("aria-hidden", "true");
  cross.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 18 18"><path d="M9 1v5M9 12v5M1 9h5M12 9h5" stroke="currentColor" stroke-width="1.5"/><rect x="7.5" y="7.5" width="3" height="3" fill="currentColor"/></svg>';

  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  ring.setAttribute("aria-hidden", "true");

  document.body.append(cross, ring);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;
  let visible = false;
  let hovering = false;
  let ringScale = 1;

  const show = () => {
    if (visible) return;
    visible = true;
    document.documentElement.classList.add("has-cursor");
    cross.style.opacity = "1";
    ring.style.opacity = "1";
  };

  const hide = () => {
    visible = false;
    document.documentElement.classList.remove("has-cursor");
    cross.style.opacity = "0";
    ring.style.opacity = "0";
  };

  window.addEventListener(
    "pointermove",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      show();
    },
    { passive: true },
  );

  /* A touch tap produces no pointermove — without this the ring never
     appears on touch-only screens. */
  window.addEventListener(
    "pointerdown",
    (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      show();
    },
    { passive: true },
  );

  document.documentElement.addEventListener("pointerleave", hide);
  window.addEventListener("blur", hide);

  /* showModal() renders dialogs in the browser's top layer, above any
     z-index — the cursor would vanish under the dialog (and the site hides
     the native cursor, leaving NO pointer). Promote cursor to the top layer
     via a manual popover while a modal dialog is open: shown after the
     dialog, it paints above it, and mix-blend-mode still inverts the dialog
     content beneath. */
  const promote = (): void => {
    for (const el of [cross, ring]) {
      if (el.matches(":popover-open")) continue;
      el.setAttribute("popover", "manual");
      el.showPopover();
    }
  };
  const demote = (): void => {
    for (const el of [cross, ring]) {
      if (el.matches(":popover-open")) el.hidePopover();
      el.removeAttribute("popover");
    }
  };
  document.addEventListener(
    "toggle",
    (event) => {
      if (!(event.target instanceof HTMLDialogElement)) return;
      if (event.newState === "open") {
        if (event.target.matches(":modal")) promote();
      } else if (!document.querySelector("dialog:modal")) {
        /* A closed dialog no longer matches :modal, so the guard only
           applies to the open branch — demote runs whenever the last
           modal dialog has just closed. */
        demote();
      }
    },
    true,
  );

  document.addEventListener("pointerover", (event) => {
    const target = event.target as Element | null;
    hovering = Boolean(target?.closest?.('a, button, input, textarea, select, [data-cursor="link"]'));
  });

  function frame(): void {
    const nx = ringX + (targetX - ringX) * LERP;
    const ny = ringY + (targetY - ringY) * LERP;
    ringX = Math.abs(nx - ringX) < 0.05 ? targetX : nx;
    ringY = Math.abs(ny - ringY) < 0.05 ? targetY : ny;

    /* Scale must live inside the same transform list: the standalone CSS
       `scale` property composes *after* `transform`, which would also scale
       the translate3d offset and fling the ring toward the bottom-right. */
    const scaleTarget = hovering ? 1.7 : 1;
    ringScale += (scaleTarget - ringScale) * 0.2;

    cross.style.transform = `translate3d(${targetX - 9}px, ${targetY - 9}px, 0)`;
    ring.style.transform = `translate3d(${ringX - RING_SIZE / 2}px, ${ringY - RING_SIZE / 2}px, 0) scale(${ringScale.toFixed(3)})`;
    ring.classList.toggle("cursor-ring--active", hovering);

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
