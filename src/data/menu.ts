export type IconName =
  | "globe"
  | "house"
  | "user"
  | "folder"
  | "network"
  | "shutdown"
  | "doc";

export type StartMenuItem =
  | { type: "link"; label: string; href: string; icon: IconName; external?: boolean; accel?: number }
  | { type: "submenu"; label: string; href: string; icon: IconName; accel?: number; recent?: number }
  | { type: "action"; label: string; icon: IconName; action: "shutdown"; accel?: number }
  | { type: "sep" };

// accel: index of the letter to underline (defaults to 0)
// recent: how many recent articles the submenu injects (renderer defaults to 4)
export const startMenu: StartMenuItem[] = [
  { type: "link", label: "OS UPDATE", href: "https://github.com/cha-at", icon: "globe", external: true },
  { type: "sep" },
  { type: "link", label: "HOME", href: "/", icon: "house" },
  { type: "link", label: "USER", href: "/user", icon: "user" },
  { type: "submenu", label: "THE ARCHIVE", href: "/archive", icon: "folder", recent: 4 },
  { type: "link", label: "NETWORK NEIGHBORHOOD", href: "/neighbors", icon: "network" },
  { type: "sep" },
  { type: "action", label: "SHUT DOWN...", icon: "shutdown", action: "shutdown" },
];
