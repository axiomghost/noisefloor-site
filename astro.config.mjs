import { defineConfig } from "astro/config";

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

export default defineConfig({
  site: "https://axiomghost.github.io",
  base,
  trailingSlash: "always",
  markdown: { remarkPlugins: [remarkSitePaths] },
});
