import type { Target } from "./api";

export type Kind = "article" | "collection";

export type FileEntry = {
  kind: Kind;
  path: string;
  name: string;
  sha: string;
  dirty: boolean;
};

export const state = {
  token: "",
  user: "",
  target: { owner: "", repo: "", branch: "main" } as Target,
  files: [] as FileEntry[],
  selected: null as FileEntry | null,
  loadedText: "",
  isNew: false,
  dirty: false,
};

export function isTestTarget(): boolean {
  return (
    state.target.owner !== "cha-at" || state.target.repo !== "cha-at.github.io"
  );
}

export function markDirty(): void {
  state.dirty = true;
  if (state.selected) state.selected.dirty = true;
}

export function upsertEntry(entry: FileEntry): void {
  const idx = state.files.findIndex((f) => f.path === entry.path);
  if (idx >= 0) Object.assign(state.files[idx], entry);
  else state.files.push(entry);
}

export function removeEntry(path: string): void {
  state.files = state.files.filter((f) => f.path !== path);
}

export function findEntry(path: string): FileEntry | undefined {
  return state.files.find((f) => f.path === path);
}

export function resetConnection(): void {
  state.token = "";
  state.user = "";
  state.files = [];
  state.selected = null;
  state.loadedText = "";
  state.isNew = false;
  state.dirty = false;
}

export function resetEditor(): void {
  state.selected = null;
  state.loadedText = "";
  state.isNew = false;
  state.dirty = false;
}
