import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pages = [
  { text: "使用文档", file: "../index.md", link: "/" },
  { text: "API 文档", file: "../api/index.md", link: "/api/" },
  { text: "服务端自部署", file: "../deploy/index.md", link: "/deploy/" },
  { text: "常见问答", file: "../faq/index.md", link: "/faq/" },
];

const CJK =
  "\\u4e00-\\u9fff\\u3400-\\u4dbf\\u{20000}-\\u{2a6df}\\u{2a700}-\\u{2b73f}\\u{2b740}-\\u{2b81f}";

function cleanText(raw) {
  return (
    raw
      // 去掉 HTML 标签
      .replace(/<[^>]+>/g, "")
      // Markdown 链接：[text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
      // 行内代码 `code` -> code
      .replace(/`([^`]*)`/g, "$1")
      // 粗体、斜体、删除线、高亮标记
      .replace(/(\*\*\*|___|\*\*|__|~~|==)([^*_~={}\n]+)\1/g, "$2")
      // 去掉转义反斜杠
      .replace(/\\(.)/g, "$1")
      .trim()
  );
}

function slugify(raw) {
  const text = cleanText(raw);
  const allowed = `a-zA-Z0-9${CJK}`;
  let slug = text
    .replace(new RegExp(`[^${allowed}]+`, "gu"), "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  if (/^\d/.test(slug)) slug = `_${slug}`;
  return slug || "heading";
}

function extractHeadings(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const headings = [];
  const seen = new Map();

  const regex = /^(#{2,3})\s+(.+)$/gm;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length;
    const rawText = match[2].trim();
    let slug = slugify(rawText);
    const count = seen.get(slug) || 0;
    seen.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count}`;

    headings.push({
      level,
      text: cleanText(rawText),
      link: slug,
    });
  }
  return headings;
}

function buildPageItems(page) {
  const filePath = path.resolve(__dirname, page.file);
  if (!fs.existsSync(filePath)) {
    return { text: page.text, link: page.link };
  }

  const headings = extractHeadings(filePath);
  const items = [];
  let lastH2 = null;

  for (const h of headings) {
    const item = { text: h.text, link: `${page.link}#${h.link}` };
    if (h.level === 2) {
      lastH2 = { ...item, items: [] };
      items.push(lastH2);
    } else if (h.level === 3 && lastH2) {
      lastH2.items.push(item);
    } else {
      items.push(item);
    }
  }

  return {
    text: page.text,
    link: page.link,
    collapsible: true,
    collapsed: true,
    items,
  };
}

export function buildSidebar() {
  return [
    {
      text: "导航",
      items: pages.map(buildPageItems),
    },
  ];
}

export default buildSidebar;
