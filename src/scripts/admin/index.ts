import { play } from "../audio";
import {
  ARTICLES_DIR,
  COLLECTIONS_DIR,
  GitHubError,
  checkRepo,
  deleteFile,
  getFile,
  getUser,
  listDir,
  putFile,
  resolveTarget,
} from "./api";
import {
  emptyArticle,
  emptyCollection,
  parseArticle,
  parseCollection,
  serializeArticle,
  serializeCollection,
  todayISO,
} from "./frontmatter";
import {
  findEntry,
  isTestTarget,
  markDirty,
  removeEntry,
  resetConnection,
  resetEditor,
  state,
  upsertEntry,
  type FileEntry,
  type Kind,
} from "./state";

const TOKEN_KEY = "chakerat.admin.token";
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const ACTIONS_URL = (owner: string, repo: string) =>
  `https://github.com/${owner}/${repo}/actions`;

const el = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const loginPanel = el<HTMLDivElement>("login-panel");
const managerPanel = el<HTMLDivElement>("manager-panel");
const loginForm = el<HTMLFormElement>("login-form");
const tokenInput = el<HTMLInputElement>("admin-token");
const loginError = el<HTMLParagraphElement>("admin-login-error");
const testBadge = el<HTMLSpanElement>("admin-test-badge");
const listArticles = el<HTMLUListElement>("list-articles");
const listCollections = el<HTMLUListElement>("list-collections");
const editorPath = el<HTMLParagraphElement>("editor-path");
const editorEmpty = el<HTMLDivElement>("editor-empty");
const articleForm = el<HTMLFormElement>("article-form");
const collectionForm = el<HTMLFormElement>("collection-form");
const artSlug = el<HTMLInputElement>("art-slug");
const artTitle = el<HTMLInputElement>("art-title");
const artUpdated = el<HTMLInputElement>("art-updated");
const artType = el<HTMLInputElement>("art-type");
const artBody = el<HTMLTextAreaElement>("art-body");
const colSlug = el<HTMLInputElement>("col-slug");
const colUrl = el<HTMLInputElement>("col-url");
const colNote = el<HTMLInputElement>("col-note");
const dirtyArticle = el<HTMLSpanElement>("dirty-article");
const dirtyCollection = el<HTMLSpanElement>("dirty-collection");
const statusUser = el<HTMLSpanElement>("admin-status-user");
const statusMsg = el<HTMLSpanElement>("admin-status-msg");
const statusLink = el<HTMLAnchorElement>("admin-status-link");
const confirmDialogEl = el<HTMLDialogElement>("confirm-dialog");
const confirmMsg = el<HTMLParagraphElement>("confirm-msg");
const confirmOk = el<HTMLButtonElement>("confirm-ok");
const confirmCancel = el<HTMLButtonElement>("confirm-cancel");
const newDialogEl = el<HTMLDialogElement>("new-dialog");
const newLabel = el<HTMLSpanElement>("new-label");
const newSlugInput = el<HTMLInputElement>("new-slug");
const newError = el<HTMLParagraphElement>("new-error");
const newOk = el<HTMLButtonElement>("new-ok");
const newCancel = el<HTMLButtonElement>("new-cancel");
const typeOptions = el<HTMLDataListElement>("type-options");

/* ---------- status bar ---------- */

function setStatus(
  msg: string,
  tone: "ok" | "err" | "info" = "info",
  actionsUrl?: string,
): void {
  statusMsg.textContent = msg;
  statusMsg.classList.toggle("text-red", tone === "err");
  if (actionsUrl) {
    statusLink.href = actionsUrl;
    statusLink.classList.remove("hidden");
  } else {
    statusLink.classList.add("hidden");
  }
}

function setStatusUser(): void {
  const t = state.target;
  statusUser.textContent = `USER: ${state.user || "?"} · REPO: ${t.owner}/${t.repo}@${t.branch}`;
}

/* ---------- error text ---------- */

function errorText(err: unknown): string {
  if (!(err instanceof GitHubError)) return "未知错误 — UNKNOWN ERROR";
  switch (err.kind) {
    case "auth":
      return "令牌无效或已过期 — TOKEN INVALID OR EXPIRED";
    case "forbidden":
      return "权限不足 — 需要 Contents: Read and write";
    case "ratelimit":
      return "API 限流 — RATE LIMITED, TRY LATER";
    case "network":
      return "网络错误 — NETWORK ERROR";
    case "notfound":
      return "文件或目录不存在 — NOT FOUND";
    case "conflict":
      return "远端已修改 — REMOTE CHANGED";
    default:
      return err.message ? `请求失败 — ${err.message}` : "请求失败 — REQUEST FAILED";
  }
}

/* ---------- panels ---------- */

function showLogin(): void {
  loginPanel.classList.remove("hidden");
  managerPanel.classList.add("hidden");
  tokenInput.value = "";
  loginError.classList.add("hidden");
}

function setLoginError(msg: string): void {
  loginError.textContent = msg;
  loginError.classList.remove("hidden");
}

function showManager(): void {
  loginPanel.classList.add("hidden");
  managerPanel.classList.remove("hidden");
  testBadge.classList.toggle("hidden", !isTestTarget());
  setStatusUser();
}

/* ---------- dialogs ---------- */

function confirmDialog(message: string): Promise<boolean> {
  confirmMsg.textContent = message;
  return new Promise((resolve) => {
    const ac = new AbortController();
    const finish = (v: boolean): void => {
      ac.abort();
      if (confirmDialogEl.open) confirmDialogEl.close();
      resolve(v);
    };
    confirmOk.addEventListener("click", () => finish(true), { signal: ac.signal });
    confirmCancel.addEventListener("click", () => finish(false), { signal: ac.signal });
    confirmDialogEl.addEventListener("cancel", () => finish(false), { signal: ac.signal });
    confirmDialogEl.showModal();
    confirmOk.focus();
  });
}

function promptSlug(kind: Kind): Promise<string | null> {
  newLabel.textContent =
    kind === "article" ? "FILENAME — 新文章 (.md)" : "FILENAME — 新收藏 (.json)";
  newSlugInput.value = "";
  newError.classList.add("hidden");
  return new Promise((resolve) => {
    const ac = new AbortController();
    const finish = (v: string | null): void => {
      ac.abort();
      if (newDialogEl.open) newDialogEl.close();
      resolve(v);
    };
    const submit = (): void => {
      const slug = newSlugInput.value.trim();
      if (!SLUG_RE.test(slug) || slug.length > 80) {
        newError.textContent =
          "slug 只能小写字母/数字/连字符,且以字母或数字开头 — INVALID SLUG";
        newError.classList.remove("hidden");
        return;
      }
      finish(slug);
    };
    newOk.addEventListener("click", submit, { signal: ac.signal });
    newCancel.addEventListener("click", () => finish(null), { signal: ac.signal });
    newDialogEl.addEventListener("cancel", () => finish(null), { signal: ac.signal });
    newSlugInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    }, { signal: ac.signal });
    newDialogEl.showModal();
    newSlugInput.focus();
  });
}

/* ---------- sidebar ---------- */

function renderSidebar(): void {
  renderList(listArticles, "article");
  renderList(listCollections, "collection");
}

function renderList(ul: HTMLUListElement, kind: Kind): void {
  ul.replaceChildren();
  const files = state.files
    .filter((f) => f.kind === kind)
    .sort((a, b) => a.name.localeCompare(b.name));
  for (const file of files) {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "admin-file";
    btn.setAttribute("data-cursor", "link");
    btn.setAttribute("data-snd", "click");
    btn.setAttribute(
      "aria-current",
      String(state.selected?.path === file.path && !state.isNew),
    );
    if (file.dirty) {
      const dot = document.createElement("span");
      dot.className = "dirty-dot";
      dot.setAttribute("aria-hidden", "true");
      btn.append(dot);
    }
    const label = document.createElement("span");
    label.textContent = file.name;
    btn.append(label);
    btn.addEventListener("click", () => void openFile(file));
    li.append(btn);
    ul.append(li);
  }
  if (files.length === 0) {
    const li = document.createElement("li");
    li.className = "px-1 py-1 font-mono text-[10px] text-win-shadow";
    li.textContent = kind === "article" ? "(empty — 空无一文)" : "(empty — 空无一链)";
    ul.append(li);
  }
}

/* ---------- editor ---------- */

function displayPath(path: string): string {
  return `C:\\CHAKERAT\\${path.toUpperCase().replace(/\//g, "\\")}`;
}

function renderEditor(): void {
  const sel = state.selected;
  editorPath.textContent = sel ? displayPath(sel.path) : "";
  editorEmpty.classList.toggle("hidden", sel !== null);
  articleForm.classList.toggle("hidden", sel?.kind !== "article");
  collectionForm.classList.toggle("hidden", sel?.kind !== "collection");
  dirtyArticle.classList.add("hidden");
  dirtyCollection.classList.add("hidden");
}

function updateDirtyUI(): void {
  const on = state.dirty;
  dirtyArticle.classList.toggle("hidden", !on);
  dirtyCollection.classList.toggle("hidden", !on);
  renderSidebar();
}

function addTypeOption(type: string): void {
  if (!type) return;
  for (const opt of typeOptions.options) {
    if (opt.value === type) return;
  }
  const opt = document.createElement("option");
  opt.value = type;
  typeOptions.append(opt);
}

function openArticleForm(): void {
  const doc = parseArticle(state.loadedText);
  artSlug.value = state.selected?.name.replace(/\.md$/, "") ?? "";
  artTitle.value = doc.title;
  artUpdated.value = /^\d{4}-\d{2}-\d{2}$/.test(doc.updated) ? doc.updated : todayISO();
  artType.value = doc.type;
  artBody.value = doc.body;
  addTypeOption(doc.type);
}

function openCollectionForm(): void {
  const doc = parseCollection(state.loadedText);
  colSlug.value = state.selected?.name.replace(/\.json$/, "") ?? "";
  colUrl.value = doc.url;
  colNote.value = doc.note;
}

async function openFile(
  entry: FileEntry,
  opts: { force?: boolean } = {},
): Promise<void> {
  if (state.dirty && !opts.force) {
    const go = await confirmDialog(
      "有未保存的更改,放弃并继续? — DISCARD UNSAVED CHANGES?",
    );
    if (!go) return;
  }
  if (state.selected) state.selected.dirty = false;
  resetEditor();
  state.selected = entry;
  renderEditor();
  renderSidebar();
  setStatus(`读取中 ${entry.name}… LOADING…`);
  try {
    const { text, sha } = await getFile(state.token, state.target, entry.path);
    entry.sha = sha;
    state.loadedText = text;
    if (entry.kind === "article") openArticleForm();
    else openCollectionForm();
    state.isNew = false;
    state.dirty = false;
    renderEditor();
    renderSidebar();
    setStatus(`已打开 ${entry.name}`, "ok");
  } catch (err) {
    state.selected = null;
    renderEditor();
    renderSidebar();
    setStatus(errorText(err), "err");
  }
}

/* ---------- save / delete / new ---------- */

function slugOf(entry: FileEntry): string {
  return entry.name.replace(/\.(md|json)$/, "");
}

function commitMessage(
  action: "create" | "update" | "delete",
  entry: FileEntry,
): string {
  const cn = entry.kind === "article" ? "文章" : "收藏";
  const verb = action === "create" ? "新增" : action === "update" ? "更新" : "删除";
  return `CMS:${verb}${cn} ${slugOf(entry)}`;
}

function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

async function saveCurrent(): Promise<void> {
  const entry = state.selected;
  if (!entry) return;

  let text: string;
  if (entry.kind === "article") {
    const title = artTitle.value.trim();
    const type = artType.value.trim();
    if (!title) {
      setStatus("TITLE 不能为空 — TITLE REQUIRED", "err");
      artTitle.focus();
      return;
    }
    if (!type) {
      setStatus("TYPE 不能为空 — TYPE REQUIRED", "err");
      artType.focus();
      return;
    }
    text = serializeArticle({
      title,
      type,
      updated: artUpdated.value || todayISO(),
      body: artBody.value,
    });
  } else {
    const url = colUrl.value.trim();
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      parsed = null as unknown as URL;
    }
    if (!parsed || (parsed.protocol !== "http:" && parsed.protocol !== "https:")) {
      setStatus("URL 无效 — INVALID URL (http/https)", "err");
      colUrl.focus();
      return;
    }
    text = serializeCollection({ url, note: colNote.value.trim() });
  }

  if (!state.isNew && text === state.loadedText) {
    setStatus("无更改 — NOT SAVED", "ok");
    return;
  }

  const isNew = state.isNew;
  setStatus(isNew ? `创建中 ${entry.name}… CREATING…` : `保存中 ${entry.name}… SAVING…`);
  try {
    const res = await putFile(
      state.token,
      state.target,
      entry.path,
      text,
      isNew ? null : entry.sha || null,
      commitMessage(isNew ? "create" : "update", entry),
    );
    entry.sha = res.sha;
    state.loadedText = text;
    state.isNew = false;
    state.dirty = false;
    upsertEntry({ ...entry, dirty: false });
    state.selected = findEntry(entry.path) ?? entry;
    renderSidebar();
    updateDirtyUI();
    play("chime");
    setStatus(
      `已保存 ✓ ${shortSha(res.commit)} — Actions 重建中… REBUILDING`,
      "ok",
      ACTIONS_URL(state.target.owner, state.target.repo),
    );
  } catch (err) {
    if (err instanceof GitHubError && err.kind === "conflict") {
      const reload = await confirmDialog(
        "远端文件已被修改(stale sha)。重新加载远端版本并放弃本地更改? — REMOTE CHANGED. RELOAD?",
      );
      if (reload && state.selected) await openFile(state.selected, { force: true });
      return;
    }
    setStatus(errorText(err), "err");
  }
}

async function deleteCurrent(): Promise<void> {
  const entry = state.selected;
  if (!entry) return;

  if (state.isNew) {
    const go = await confirmDialog(`放弃新建 ${entry.name}? — DISCARD NEW FILE?`);
    if (!go) return;
    resetEditor();
    renderEditor();
    renderSidebar();
    setStatus("已放弃新建 — DISCARDED", "ok");
    return;
  }

  const go = await confirmDialog(
    `删除 ${entry.name}?将提交一个删除 commit,Actions 会自动重建。 — DELETE FILE?`,
  );
  if (!go) return;
  play("destroy");
  setStatus(`删除中 ${entry.name}… DELETING…`);
  try {
    const res = await deleteFile(
      state.token,
      state.target,
      entry.path,
      entry.sha,
      commitMessage("delete", entry),
    );
    removeEntry(entry.path);
    resetEditor();
    renderEditor();
    renderSidebar();
    setStatus(
      `已删除 ✓ ${shortSha(res.commit)} — Actions 重建中… REBUILDING`,
      "ok",
      ACTIONS_URL(state.target.owner, state.target.repo),
    );
  } catch (err) {
    if (err instanceof GitHubError && err.kind === "conflict") {
      setStatus("远端已修改 — 请重新打开该文件再删除 — REOPEN AND RETRY", "err");
      return;
    }
    setStatus(errorText(err), "err");
  }
}

async function newFile(kind: Kind): Promise<void> {
  if (state.dirty) {
    const go = await confirmDialog(
      "有未保存的更改,放弃并新建? — DISCARD UNSAVED CHANGES?",
    );
    if (!go) return;
  }
  if (state.selected) state.selected.dirty = false;
  resetEditor();
  renderEditor();
  renderSidebar();
  const slug = await promptSlug(kind);
  if (slug === null) return;
  const ext = kind === "article" ? "md" : "json";
  const dir = kind === "article" ? ARTICLES_DIR : COLLECTIONS_DIR;
  const path = `${dir}/${slug}.${ext}`;
  if (findEntry(path)) {
    setStatus(`已存在同名文件 ${slug}.${ext} — DUPLICATE`, "err");
    return;
  }
  state.selected = { kind, path, name: `${slug}.${ext}`, sha: "", dirty: false };
  state.isNew = true;
  state.loadedText = "";
  state.dirty = false;
  if (kind === "article") {
    const doc = emptyArticle();
    artSlug.value = slug;
    artTitle.value = "";
    artUpdated.value = doc.updated;
    artType.value = "";
    artBody.value = "";
  } else {
    colSlug.value = slug;
    colUrl.value = "";
    colNote.value = "";
  }
  renderEditor();
  renderSidebar();
  setStatus(`新建 ${state.selected.name} — 尚未保存,填好后点 SAVE`, "ok");
}

/* ---------- token ---------- */

function loadStoredToken(): string {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

function persistToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    setStatus("本机存储不可用,令牌仅本次会话有效 — STORAGE UNAVAILABLE", "err");
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

/* ---------- connect ---------- */

async function connect(
  token: string,
  opts: { silent?: boolean } = {},
): Promise<boolean> {
  setStatus("连接中… CONNECTING…");
  try {
    const me = await getUser(token);
    await checkRepo(token, state.target);
    const [arts, cols] = await Promise.all([
      listDir(token, state.target, ARTICLES_DIR),
      listDir(token, state.target, COLLECTIONS_DIR),
    ]);
    state.token = token;
    state.user = me.login;
    state.files = [
      ...arts.map(
        (a): FileEntry => ({
          kind: "article",
          path: `${ARTICLES_DIR}/${a.name}`,
          name: a.name,
          sha: a.sha,
          dirty: false,
        }),
      ),
      ...cols.map(
        (c): FileEntry => ({
          kind: "collection",
          path: `${COLLECTIONS_DIR}/${c.name}`,
          name: c.name,
          sha: c.sha,
          dirty: false,
        }),
      ),
    ];
    showManager();
    renderSidebar();
    renderEditor();
    setStatus(`已连接 ${me.login} — CONNECTED`, "ok");
    return true;
  } catch (err) {
    resetConnection();
    if (err instanceof GitHubError && err.kind === "auth") clearToken();
    if (opts.silent) {
      setLoginError(
        err instanceof GitHubError && err.kind === "auth"
          ? "存储的令牌已失效,请重新输入 — STORED TOKEN EXPIRED"
          : errorText(err),
      );
    } else {
      setLoginError(errorText(err));
    }
    return false;
  }
}

function logout(): void {
  clearToken();
  resetConnection();
  showLogin();
  play("close");
}

/* ---------- init ---------- */

function init(): void {
  state.target = resolveTarget();

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const token = tokenInput.value.trim();
    if (!token) return;
    void connect(token).then((ok) => {
      if (ok) persistToken(token);
    });
  });

  for (const form of [articleForm, collectionForm]) {
    form.addEventListener("input", () => {
      if (!state.dirty) {
        markDirty();
        updateDirtyUI();
      }
    });
  }

  articleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    void saveCurrent();
  });
  collectionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    void saveCurrent();
  });

  el<HTMLButtonElement>("btn-delete-article").addEventListener("click", () =>
    void deleteCurrent(),
  );
  el<HTMLButtonElement>("btn-delete-collection").addEventListener("click", () =>
    void deleteCurrent(),
  );
  el<HTMLButtonElement>("btn-new-article").addEventListener("click", () =>
    void newFile("article"),
  );
  el<HTMLButtonElement>("btn-new-link").addEventListener("click", () =>
    void newFile("collection"),
  );
  el<HTMLButtonElement>("btn-logout").addEventListener("click", logout);

  window.addEventListener("beforeunload", (e) => {
    if (!state.dirty) return;
    e.preventDefault();
    e.returnValue = "";
  });

  const stored = loadStoredToken();
  if (stored) {
    state.token = stored;
    void connect(stored, { silent: true });
  } else {
    showLogin();
  }
}

init();
