export const site = {
  name: "ChakerAt",
  chineseName: "查子",
  title: "ChakerAt's Cyber Nest",
  description:
    "ChakerAt's personal website.",
  url: "https://cha-at.github.io",
} as const;

export const bootLines = [
  "OPERATION SYSTEM v1.42 (C) 2026 [REDACTED]",
  "> mount ~/cyber-nest .......... OK",
  "> loading kernel     .......... OK",
  "> checking integrity .......... OK",
  "READY - EVERYTHING DONE",
] as const;

export const tickerLines = [
  "WELCOME TO THE CYBER NEST",
  "欢迎光临",
  "BEST VIEWED WITH LOVE",
  "Y2K COMPLIANT",
  "SIGN THE GUESTBOOK",
  "40PX GRID NATIVE",
  "NO FRAMES WERE HARMED",
] as const;

export const socials = [
  { label: "X", handle: "@not_chakerat", href: "https://x.com/not_chakerat" },
  { label: "GITHUB", handle: "cha-at", href: "https://github.com/cha-at" },
  { label: "BILIBILI", handle: "查子CHAKER", href: "https://space.bilibili.com/1543261354" },
  { label: "YOUTUBE", handle: "NotChakerAt", href: "https://www.youtube.com/@NotChakerAt" },
  { label: "EMAIL", handle: "notchakerat@gmail.com", href: "mailto:notchakerat@gmail.com" },
] as const;

export const neighbors = [
  { name: "NinJATE 的神秘博客", subtitle: "NinJATE's mystery blog", href: "https://ninjate11.github.io/" },
  { name: "某种烧饼", subtitle: "some kind of shaobing", href: "https://qwq9scan114514.github.io/" },
  { name: "Colin 的博客", subtitle: "Colin's blog", href: "https://qsdwindows.qzz.io/" },
  { name: "Asutaka 的小站", subtitle: "Asutaka's little station", href: "https://www.asutaka.ink" },
] as const;

export const archiveEntries = [
  { id: "2009", title: "my first HTML page", note: "marquee era. comic sans was involved. no regrets.", size: "4 KB" },
  { id: "2014", title: "penguin blog", note: "three readers, one of them my mom.", size: "12 KB" },
  { id: "2019", title: "lost flash game archive", note: "the games are gone. the nostalgia remains.", size: "88 KB" },
  { id: "????", title: "REDACTED FILE", note: "ask nicely and we will talk.", size: "???", redacted: true },
] as const;

export const aboutFacts = [
  { k: "LOCATION", v: "somewhere on the open web" },
  { k: "STATUS", v: "browsing" },
  { k: "UPTIME", v: "since the dial-up era" },
  { k: "STACK", v: "HTML, habits, hope" },
  { k: "FAVORITE PROTOCOL", v: "http:// forever" },
] as const;

export const footerCredits = {
  oldweb: { label: "A R T W O R K", href: "https://artwork.neocities.org/oldweb" },
} as const;
