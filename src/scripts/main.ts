import { armAudio, isMuted, play, setMuted } from "./audio";
import { initBoot } from "./boot";
import { initCursor } from "./cursor";
import { initArchive } from "./drag";
import { initEggs } from "./eggs";
import { initNavFeedback } from "./navFeedback";
import { initReveal } from "./reveal";

function initStatusBar(): void {
  const clock = document.getElementById("live-clock");
  const coords = document.getElementById("coord-tracker");
  const sndToggle = document.getElementById("snd-toggle");
  const sndLabel = document.getElementById("snd-label");
  const sndLed = document.getElementById("snd-led");

  const tick = (): void => {
    if (!clock) return;
    const now = new Date();
    clock.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  };
  tick();
  window.setInterval(tick, 1000);

  const finePointer = window.matchMedia("(pointer: fine)").matches;
  if (coords && finePointer) {
    window.addEventListener(
      "pointermove",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const x = Math.round(event.clientX);
        const y = Math.round(event.clientY);
        coords.textContent = `X:${String(x).padStart(4, "0")} Y:${String(y).padStart(4, "0")}`;
      },
      { passive: true },
    );
  } else if (coords) {
    coords.closest("span")?.remove();
  }

  if (sndToggle && sndLabel) {
    const render = (): void => {
      const muted = isMuted();
      sndLabel.textContent = muted ? "SND: OFF" : "SND: ON";
      sndToggle.setAttribute("aria-pressed", String(!muted));
      if (sndLed) {
        sndLed.classList.toggle("bg-win-shadow", muted);
        sndLed.classList.toggle("bg-red", !muted);
      }
    };
    render();
    sndToggle.addEventListener("click", () => {
      const wasMuted = isMuted();
      setMuted(!wasMuted);
      render();
      if (wasMuted) {
        play("chime");
      }
    });
  }
}

function initSoundTriggers(): void {
  document.addEventListener("click", (event) => {
    const el = (event.target as Element | null)?.closest?.<HTMLElement>("[data-snd]");
    if (!el) return;
    const name = el.dataset.snd as "click" | "open" | "chime" | "close" | "destroy" | undefined;
    if (name) play(name);
  });
}

function boot(): void {
  armAudio();
  initSoundTriggers();
  initBoot();
  initCursor();
  initStatusBar();
  initArchive();
  initEggs();
  initReveal();
  initNavFeedback();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
