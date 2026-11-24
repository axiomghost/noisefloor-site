import { defineConfig } from "astro/config";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

const base = "/noisefloor-site";

// Markdown uses site-root paths, while Pages serves the site under a repository path.
function remarkSitePaths() {
  return (tree) => {
    function visit(node) {
      if (
        typeof node.url === "string" &&
        /^\/(?!\/)/.test(node.url) &&
        node.url !== base &&
        !node.url.startsWith(base + "/")
      ) {
        node.url = base + node.url;
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}

// Give wide tables a scrolling container without changing native table layout.
function rehypeArticleTables() {
  return (tree) => {
    function visit(node) {
      if (!node.children) return;
      node.children = node.children.map((child) => {
        if (child.tagName === "table") {
          return {
            type: "element",
            tagName: "div",
            properties: { className: ["article-table"] },
            children: [child],
          };
        }
        visit(child);
        return child;
      });
    }
    visit(tree);
  };
}

// Keep inline maths and the punctuation right after it on one line ("$d$." must not wrap before ".").
function rehypeMathPunctuation() {
  return (tree) => {
    function visit(node) {
      if (!node.children) return;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        const next = node.children[i + 1];
        const inlineMath =
          child.tagName === "span" &&
          child.properties?.className?.includes("katex") &&
          !node.properties?.className?.includes("katex-display");
        const mark = next?.type === "text" && next.value.match(/^[.,;:!?)\]]+/);
        if (inlineMath && mark) {
          next.value = next.value.slice(mark[0].length);
          node.children[i] = {
            type: "element",
            tagName: "span",
            properties: { className: ["math-nowrap"] },
            children: [child, { type: "text", value: mark[0] }],
          };
        } else if (!inlineMath) {
          visit(child);
        }
      }
    }
    visit(tree);
  };
}

export default defineConfig({
  site: "https://axiomghost.github.io",
  base,
  trailingSlash: "always",
  markdown: {
    // $...$ and $$...$$ become KaTeX HTML at build time; BlogPostLayout imports its stylesheet.
    remarkPlugins: [remarkSitePaths, remarkMath],
    rehypePlugins: [rehypeKatex, rehypeMathPunctuation, rehypeArticleTables],
    // Shiki colours code fences at build time, writing both themes as CSS variables;
    // src/styles/site.css picks the one that matches the page's light or dark theme.
    syntaxHighlight: "shiki",
    shikiConfig: { themes: { light: "github-light", dark: "poimandres" }, defaultColor: false },
  },
});
