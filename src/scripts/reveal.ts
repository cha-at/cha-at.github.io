export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (targets.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    for (const el of targets) el.classList.add("in");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -4% 0px" },
  );

  for (const el of targets) observer.observe(el);
}
