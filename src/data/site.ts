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

export const sections = [
  { id: "about", num: "01", title: "ABOUT", cn: "关于" },
  { id: "archive", num: "02", title: "THE ARCHIVE", cn: "档案柜" },
  { id: "neighbors", num: "03", title: "NEIGHBORS", cn: "网上邻居" },
  { id: "workbench", num: "04", title: "THE WORKBENCH", cn: "工作台" },
  { id: "guestbook", num: "05", title: "USELESS GUESTBOOK", cn: "留言区" },
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
