// Content of the /user "properties dialog". Edit here, the page renders it.

export const userIntro = [
  "Chaker Atlas — web and game developer on the MIAR STAFF team, full-time internet resident.",
  "Vibe coding addict. Half of this site was prompted, the other half was arguing with the AI about why the texts are absolute garbage.",
  "A Chinese with poor English. (running an English-first website anyway)",
  "Uses Windows 11 for absolutely no reason, maybe switch to Arch someday.",
  "Main hobby: bumping random bullshits onto the internet.",
] as const;

export const userSkills = [
  { k: "WEB DEV", v: "Actually, I just prompt in most of the time." },
  { k: "GAME DEV", v: "Bearly counts. Have experience with Source engine." },
  { k: "LANGUAGE", v: "Chinese (native), English (kinda poor)" },
] as const;

export const userGear = [
  { k: "COMPUTER01", v: "Surface Pro 11 X Elite 32GB (why???)" },
  { k: "COMPUTER02", v: "E5-2684v4 + Radeon RX 6750 GRE 10GB + 64GB DDR3 (trash)" },
  { k: "TABLET", v: "iPad Air 5th Generation" },
  { k: "PHONE", v: "Nothing Phone (3a) Pro" },
  { k: "MOUSE", v: "AM Infinity Mouse" },
  { k: "HEADPHONE", v: "Nothing Headphone (1)" },
  { k: "VR HEADSET", v: "Meta Quest 3 512GB" },
] as const;

export const userFavorites = [
  { label: "GAMES", cn: "游戏", items: ["BONELAB", "Hypnospace Outlaw", "Project Sekai", "Phigros", "CONTROL", "Beat Block"] },
  { label: "MUSIC", cn: "音乐", items: ["bôa", "Cafuné", "Glass Animal", "Charli xcx", "Michael Wyckoff", "LINKIN PARK", "Radiohead", "The Rare Occasions", "Malcolm Todd", "Pink Floyd"] },
] as const;
