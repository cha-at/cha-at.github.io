export type ArticleDoc = {
  title: string;
  updated: string;
  type: string;
  body: string;
};

export type CollectionDoc = {
  url: string;
  note: string;
};

export function normalizeRaw(raw: string): string {
  return raw.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
}

export function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function emptyArticle(): ArticleDoc {
  return { title: "", updated: todayISO(), type: "", body: "" };
}

export function emptyCollection(): CollectionDoc {
  return { url: "", note: "" };
}

function unquote(value: string): string {
  const v = value.trim();
  if (v.length >= 2 && v.startsWith('"') && v.endsWith('"')) {
    return v.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  if (v.length >= 2 && v.startsWith("'") && v.endsWith("'")) {
    return v.slice(1, -1);
  }
  return v;
}

function quote(value: string): string {
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function parseFields(rawFrontmatter: string): Map<string, string> {
  const fields = new Map<string, string>();
  for (const line of rawFrontmatter.split("\n")) {
    const idx = line.indexOf(":");
    if (idx < 1) continue;
    const key = line.slice(0, idx).trim();
    if (!/^[a-z]+$/i.test(key)) continue;
    fields.set(key, unquote(line.slice(idx + 1)));
  }
  return fields;
}

export function parseArticle(raw: string): ArticleDoc {
  const text = normalizeRaw(raw);
  const fence = /^---[ \t]*$/m;
  const open = fence.exec(text);
  if (!open) {
    return { title: "", updated: "", type: "", body: text };
  }
  const rest = text.slice(open.index + open[0].length);
  const close = /^---[ \t]*$/m.exec(rest);
  if (!close) {
    return { title: "", updated: "", type: "", body: text };
  }
  const fields = parseFields(rest.slice(0, close.index));
  const body = rest
    .slice(close.index + close[0].length)
    .replace(/^\n+/, "")
    .replace(/\s+$/, "");
  return {
    title: fields.get("title") ?? "",
    updated: fields.get("updated") ?? "",
    type: fields.get("type") ?? "",
    body,
  };
}

export function serializeArticle(doc: ArticleDoc): string {
  const head = [
    "---",
    `title: ${quote(doc.title)}`,
    `updated: ${doc.updated}`,
    `type: ${quote(doc.type)}`,
    "---",
  ].join("\n");
  const body = doc.body.replace(/\s+$/, "");
  return body ? `${head}\n\n${body}\n` : `${head}\n`;
}

export function parseCollection(raw: string): CollectionDoc {
  const text = normalizeRaw(raw);
  try {
    const obj = JSON.parse(text) as Record<string, unknown>;
    return {
      url: typeof obj.url === "string" ? obj.url : "",
      note: typeof obj.note === "string" ? obj.note : "",
    };
  } catch {
    return { url: "", note: "" };
  }
}

export function serializeCollection(doc: CollectionDoc): string {
  const out: Record<string, string> = { url: doc.url };
  if (doc.note !== "") out.note = doc.note;
  return JSON.stringify(out, null, 4) + "\n";
}
