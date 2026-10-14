const LERP = 0.16;
const RING_SIZE = 30;

export function initCursor(): void {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!finePointer || reduced) return;

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
      if (event.pointerType !== "mouse") return;
      targetX = event.clientX;
      targetY = event.clientY;
      show();
    },
    { passive: true },
  );

  document.documentElement.addEventListener("pointerleave", hide);
  window.addEventListener("blur", hide);

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
