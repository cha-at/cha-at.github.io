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
  { id: "workbench", num: "03", title: "THE WORKBENCH", cn: "工作台" },
  { id: "guestbook", num: "04", title: "USELESS GUESTBOOK", cn: "留言区" },
] as const;

export const socials = [
  { label: "X", handle: "@not_chakerat", href: "https://x.com/not_chakerat" },
  { label: "GITHUB", handle: "cha-at", href: "https://github.com/cha-at" },
  { label: "BILIBILI", handle: "查子CHAKER", href: "https://space.bilibili.com/1543261354" },
  { label: "YOUTUBE", handle: "NotChakerAt", href: "https://www.youtube.com/@NotChakerAt" },
  { label: "EMAIL", handle: "notchakerat@gmail.com", href: "mailto:notchakerat@gmail.com" },
] as const;

export const neighbors = [
  { name: "NinJATE 的神秘博客", href: "https://ninjate11.github.io/" },
  { name: "某种烧饼", href: "https://qwq9scan114514.github.io/" },
  { name: "Colin 的博客", href: "https://qsdwindows.qzz.io/" },
  { name: "Asutaka 的小站", href: "https://www.asutaka.ink" },
] as const;

export const aboutFacts = [
  { k: "LOCATION", v: "somewhere on the internet" },
  { k: "STATUS", v: "living (probably)" },
  { k: "DEVICE", v: "Nothing Phone (3a) Pro" },
  { k: "MUSIC GENRE", v: "Alternative" },
  { k: "FAVORITE GAME", v: "BONELAB, Project Sekai" },
] as const;

// Currently unused
export const footerCredits = {
  oldweb: { label: "EXAMPLE", href: "https://example.com" },
} as const;
