import { play } from "./audio";
import { sections } from "../data/site";

const OPEN_DELAY = 100;
const CLOSE_DELAY = 220;

export function initStartMenu(): void {
  const startBtn = document.getElementById("start-button");
  const menu = document.getElementById("start-menu");

  if (startBtn && menu) {
    /* ---------- SHUT DOWN easter egg ---------- */
    let overlay: HTMLButtonElement | null = null;
    let shutdownOpen = false;

    const ensureOverlay = (): HTMLButtonElement => {
      if (overlay) return overlay;
      overlay = document.createElement("button");
      overlay.type = "button";
      overlay.id = "shutdown-overlay";
      // no display class here: visibility is CSS-driven via html.shutdown-active
      overlay.className =
        "fixed inset-0 z-[var(--z-shutdown)] flex-col items-center justify-center gap-5 bg-black text-center font-mono focus:outline-none";
      overlay.setAttribute(
        "aria-label",
        "It's now safe to turn off your computer. Click or press Escape to restart.",
      );
      overlay.innerHTML =
        '<span class="px-6 text-base font-bold leading-relaxed tracking-[0.25em] text-amber sm:text-2xl">' +
        "It's now safe to turn off your computer.</span>" +
        '<span class="text-[10px] tracking-[0.3em] text-amber/40">CLICK ANYWHERE OR PRESS ESC TO RESTART</span>';
      overlay.addEventListener("click", () => dismissShutdown());
      document.body.appendChild(overlay);
      return overlay;
    };

    const showShutdown = (): void => {
      ensureOverlay();
      document.documentElement.classList.add("shutdown-active");
      shutdownOpen = true;
      overlay!.focus();
      play("minimize");
    };

    const dismissShutdown = (): void => {
      if (!shutdownOpen) return;
      document.documentElement.classList.remove("shutdown-active");
      shutdownOpen = false;
      play("restore");
      startBtn.focus();
    };

    /* ---------- submenu machinery ---------- */
    const submenus = [...menu.querySelectorAll<HTMLElement>("[data-submenu]")].map((li) => ({
      li,
      trigger: li.querySelector<HTMLAnchorElement>("[data-submenu-trigger]")!,
      panel: li.querySelector<HTMLUListElement>(":scope > ul[role='menu']")!,
    }));

    const anyOpen = (): boolean => submenus.some((s) => !s.panel.hidden);

    const closeSub = (s: (typeof submenus)[number]): void => {
      if (s.panel.hidden) return;
      s.panel.hidden = true;
      s.trigger.setAttribute("aria-expanded", "false");
      s.panel.style.transform = "";
    };

    const closeAllSubmenus = (): void => {
      for (const s of submenus) closeSub(s);
    };

    const clampPanel = (panel: HTMLElement): void => {
      panel.style.transform = "";
      const r = panel.getBoundingClientRect();
      const dx = Math.min(0, window.innerWidth - 8 - r.right);
      let dy = Math.min(0, window.innerHeight - 8 - r.bottom);
      if (dy < 0 && r.top < 40) dy = 0;
      if (dx || dy) panel.style.transform = `translate(${dx}px, ${dy}px)`;
    };

    const openSub = (s: (typeof submenus)[number]): void => {
      for (const o of submenus) if (o !== s) closeSub(o);
      s.panel.hidden = false;
      s.trigger.setAttribute("aria-expanded", "true");
      clampPanel(s.panel);
    };

    let openTimer = 0;
    let closeTimer = 0;

    for (const s of submenus) {
      s.li.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch") return;
        window.clearTimeout(closeTimer);
        window.clearTimeout(openTimer);
        openTimer = window.setTimeout(() => openSub(s), OPEN_DELAY);
      });
      s.li.addEventListener("pointerleave", (e) => {
        if (e.pointerType === "touch") return;
        window.clearTimeout(openTimer);
        closeTimer = window.setTimeout(() => closeSub(s), CLOSE_DELAY);
      });
      s.trigger.addEventListener("click", (event) => {
        if (!s.panel.hidden) return;
        event.preventDefault();
        window.clearTimeout(openTimer);
        window.clearTimeout(closeTimer);
        openSub(s);
      });
    }

    window.addEventListener(
      "resize",
      () => {
        for (const s of submenus) if (!s.panel.hidden) clampPanel(s.panel);
      },
      { passive: true },
    );

    /* ---------- top-level open/close ---------- */
    const setOpen = (open: boolean): void => {
      menu.hidden = !open;
      startBtn.setAttribute("aria-expanded", String(open));
      startBtn.classList.toggle("bevel-thin", !open);
      startBtn.classList.toggle("bevel-thin-in", open);
      if (!open) closeAllSubmenus();
    };

    setOpen(false);

    startBtn.addEventListener("click", () => {
      setOpen(menu.hidden);
    });

    document.addEventListener("pointerdown", (event) => {
      const target = event.target as Element | null;
      if (!menu.hidden && !menu.contains(target) && !startBtn.contains(target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;
      if (shutdownOpen) {
        dismissShutdown();
        return;
      }
      if (anyOpen()) {
        closeAllSubmenus();
        return;
      }
      if (!menu.hidden) {
        setOpen(false);
        startBtn.focus();
      }
    });

    menu.addEventListener("click", (event) => {
      if (event.defaultPrevented) return;
      const el = (event.target as Element | null)?.closest<HTMLElement>("a, [data-menu-action]");
      if (!el || el.dataset.menuAction) return;
      setOpen(false);
      startBtn.focus();
    });

    for (const btn of menu.querySelectorAll<HTMLElement>("[data-menu-action='shutdown']")) {
      btn.addEventListener("click", () => {
        setOpen(false);
        showShutdown();
      });
    }
  }

  const taskBtn = document.getElementById("task-button");
  const taskLabel = document.getElementById("task-button-label");
  if (!taskBtn || !taskLabel || taskBtn.hasAttribute("data-task-static")) return;

  const spy = (): void => {
    let current = "";
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el && el.getBoundingClientRect().top <= 96) current = s.id;
    }
    if (
      !current &&
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
    ) {
      current = sections[sections.length - 1].id;
    }
    const s = sections.find((x) => x.id === current);
    taskBtn.classList.toggle("is-active", Boolean(s));
    if (s) {
      taskLabel.textContent = `${s.num} — ${s.title} ${s.cn}`;
      taskBtn.setAttribute("href", `#${s.id}`);
    }
  };

  let raf = 0;
  const queue = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      spy();
    });
  };

  window.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue, { passive: true });
  spy();
}
