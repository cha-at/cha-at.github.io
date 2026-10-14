import { play } from "./audio";

export function initEggs(): void {
  initGuestbook();
  initRedacted();
  initMagnetic();
}

function initGuestbook(): void {
  const form = document.getElementById("guestbook-form") as HTMLFormElement | null;
  const send = document.getElementById("guestbook-send") as HTMLButtonElement | null;
  const label = document.getElementById("guestbook-send-label");
  const input = document.getElementById("guestbook-input") as HTMLTextAreaElement | null;
  const status = document.getElementById("guestbook-status");
  const stamp = document.getElementById("guestbook-stamp");
  const hint = document.getElementById("guestbook-hint");
  if (!form || !send || !label || !input || !status || !stamp || !hint) return;

  const normal = send.dataset.labelNormal ?? "SEND 发送";
  const hover = send.dataset.labelHover ?? "CANCEL AND DELETE ALL";

  send.addEventListener("mouseenter", () => {
    label.textContent = hover;
    hint.textContent = "AUTO-DESTRUCT: DO NOT PRESS";
    hint.classList.add("text-red");
  });

  send.addEventListener("mouseleave", () => {
    if (send.dataset.destroyed === "1") return;
    label.textContent = normal;
    hint.textContent = "AUTO-DESTRUCT: ARMED";
    hint.classList.remove("text-red");
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    input.value = "";
    send.dataset.destroyed = "1";
    label.textContent = "已成功销毁信息";
    hint.textContent = "AUTO-DESTRUCT: COMPLETE";
    hint.classList.remove("text-red");
    status.textContent = "Message successfully destroyed. It never happened.";
    play("destroy");

    stamp.style.transition = "opacity 120ms ease-out";
    stamp.style.opacity = "1";
    window.setTimeout(() => {
      stamp.style.transition = "opacity 400ms ease-in";
      stamp.style.opacity = "0";
    }, 1600);

    window.setTimeout(() => {
      send.dataset.destroyed = "0";
      label.textContent = normal;
      status.textContent = "";
    }, 3200);
  });
}

function initRedacted(): void {
  const toggles = document.querySelectorAll<HTMLButtonElement>(".redacted-toggle");
  for (const toggle of toggles) {
    let revealed = false;
    toggle.addEventListener("click", () => {
      revealed = !revealed;
      if (revealed) {
        toggle.textContent = toggle.dataset.redacted ?? "???";
        toggle.classList.remove("bg-ink", "text-transparent");
        toggle.classList.add("bg-red", "text-white");
        play("click");
      } else {
        toggle.textContent = "████████";
        toggle.classList.add("bg-ink", "text-transparent");
        toggle.classList.remove("bg-red", "text-white");
      }
    });
  }
}

function initMagnetic(): void {
  if (!window.matchMedia("(pointer: fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const rows = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  for (const row of rows) {
    let raf = 0;
    row.addEventListener("pointermove", (event) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = row.getBoundingClientRect();
        const dx = (event.clientX - rect.left - rect.width / 2) / rect.width;
        const dy = (event.clientY - rect.top - rect.height / 2) / rect.height;
        row.style.transform = `translate(${dx * 4}px, ${dy * 2}px)`;
      });
    });
    row.addEventListener("pointerleave", () => {
      cancelAnimationFrame(raf);
      row.style.transform = "";
    });
  }
}
