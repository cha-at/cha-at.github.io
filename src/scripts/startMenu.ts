import { sections } from "../data/site";

export function initStartMenu(): void {
  const startBtn = document.getElementById("start-button");
  const menu = document.getElementById("start-menu");

  if (startBtn && menu) {
    const setOpen = (open: boolean): void => {
      menu.hidden = !open;
      startBtn.setAttribute("aria-expanded", String(open));
      startBtn.classList.toggle("bevel-thin", !open);
      startBtn.classList.toggle("bevel-thin-in", open);
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
      if (event.key === "Escape" && !menu.hidden) {
        setOpen(false);
        startBtn.focus();
      }
    });

    for (const link of menu.querySelectorAll<HTMLAnchorElement>("a[data-section-link]")) {
      link.addEventListener("click", () => {
        setOpen(false);
        startBtn.focus();
      });
    }
  }

  const taskBtn = document.getElementById("task-button");
  const taskLabel = document.getElementById("task-button-label");
  if (!taskBtn || !taskLabel) return;

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
