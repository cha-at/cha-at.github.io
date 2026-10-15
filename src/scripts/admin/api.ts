export const OWNER = "cha-at";
export const REPO = "cha-at.github.io";
export const DEFAULT_BRANCH = "main";
export const ARTICLES_DIR = "src/content/articles";
export const COLLECTIONS_DIR = "src/content/collections";

export type Target = { owner: string; repo: string; branch: string };

/** ?repo=owner/name&branch=x overrides the target for testing against a scratch repo. */
export function resolveTarget(): Target {
  let owner = OWNER;
  let repo = REPO;
  let branch = DEFAULT_BRANCH;
  try {
    const params = new URLSearchParams(window.location.search);
    const repoParam = params.get("repo");
    if (repoParam && /^[^/\s]+\/[^/\s]+$/.test(repoParam)) {
      owner = repoParam.slice(0, repoParam.indexOf("/"));
      repo = repoParam.slice(repoParam.indexOf("/") + 1);
    }
    const branchParam = params.get("branch");
    if (branchParam) branch = branchParam;
  } catch {
    // non-browser context: production defaults
  }
  return { owner, repo, branch };
}

export type ErrorKind =
  | "auth"
  | "forbidden"
  | "conflict"
  | "notfound"
  | "ratelimit"
  | "network"
  | "unknown";

export class GitHubError extends Error {
  status: number;
  kind: ErrorKind;

  constructor(status: number, kind: ErrorKind, message: string) {
    super(message);
    this.name = "GitHubError";
    this.status = status;
    this.kind = kind;
  }
}

function kindForStatus(status: number, apiMessage: string): ErrorKind {
  if (status === 401) return "auth";
  if (status === 404) return "notfound";
  if (status === 409 || status === 422) return "conflict";
  if (status === 403) {
    if (/rate limit/i.test(apiMessage)) return "ratelimit";
    return "forbidden";
  }
  return "unknown";
}

const API_BASE = "https://api.github.com";

function headers(token: string, accept: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function request<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: headers(token, (init.headers as string) ?? "application/vnd.github+json"),
    });
  } catch {
    throw new GitHubError(0, "network", "Network request failed");
  }
  if (res.status >= 200 && res.status < 300) {
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  }
  let apiMessage = "";
  try {
    const body = (await res.json()) as { message?: string };
    apiMessage = typeof body.message === "string" ? body.message : "";
  } catch {
    // non-JSON error body
  }
  throw new GitHubError(res.status, kindForStatus(res.status, apiMessage), apiMessage || `HTTP ${res.status}`);
}

function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const clean = b64.replace(/\n/g, "");
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function repoPath(t: Target, path: string): string {
  return `/repos/${encodeURIComponent(t.owner)}/${encodeURIComponent(t.repo)}/contents/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function getUser(token: string): Promise<{ login: string }> {
  return request<{ login: string }>(token, "/user");
}

/** 200 = token can see the repo; 404 = fine-grained PAT not scoped to it. */
export async function checkRepo(token: string, t: Target): Promise<void> {
  await request<unknown>(token, `/repos/${encodeURIComponent(t.owner)}/${encodeURIComponent(t.repo)}`);
}

export type DirEntry = { name: string; sha: string };

type ContentsJson = {
  name?: string;
  sha?: string;
  type?: string;
  content?: string;
  encoding?: string;
};

export async function listDir(
  token: string,
  t: Target,
  dir: string,
): Promise<DirEntry[]> {
  const url = `${repoPath(t, dir)}?ref=${encodeURIComponent(t.branch)}`;
  const items = await request<ContentsJson[]>(token, url);
  if (!Array.isArray(items)) return [];
  return items
    .filter((i) => i.type === "file" && i.name && i.sha)
    .map((i) => ({ name: i.name as string, sha: i.sha as string }));
}

export async function getFile(
  token: string,
  t: Target,
  path: string,
): Promise<{ text: string; sha: string }> {
  const url = `${repoPath(t, path)}?ref=${encodeURIComponent(t.branch)}`;
  const item = await request<ContentsJson>(token, url);
  if (item.encoding !== "base64" || typeof item.content !== "string" || !item.sha) {
    throw new GitHubError(0, "unknown", "Unexpected contents API response");
  }
  return { text: decodeBase64(item.content), sha: item.sha };
}

type PutResponse = {
  content?: { sha?: string };
  commit?: { sha?: string };
};

export async function putFile(
  token: string,
  t: Target,
  path: string,
  text: string,
  sha: string | null,
  message: string,
): Promise<{ sha: string; commit: string }> {
  const body: Record<string, unknown> = {
    message,
    content: encodeBase64(text),
    branch: t.branch,
  };
  if (sha) body.sha = sha;
  const res = await request<PutResponse>(token, repoPath(t, path), {
    method: "PUT",
    headers: "application/vnd.github+json",
    body: JSON.stringify(body),
  });
  const newSha = res.content?.sha;
  const commit = res.commit?.sha;
  if (!newSha || !commit) {
    throw new GitHubError(0, "unknown", "Unexpected PUT response");
  }
  return { sha: newSha, commit };
}

export async function deleteFile(
  token: string,
  t: Target,
  path: string,
  sha: string,
  message: string,
): Promise<{ commit: string }> {
  const res = await request<PutResponse>(token, repoPath(t, path), {
    method: "DELETE",
    headers: "application/vnd.github+json",
    body: JSON.stringify({ message, sha, branch: t.branch }),
  });
  const commit = res.commit?.sha;
  if (!commit) throw new GitHubError(0, "unknown", "Unexpected DELETE response");
  return { commit };
}
