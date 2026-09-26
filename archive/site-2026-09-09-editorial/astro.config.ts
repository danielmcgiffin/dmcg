import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://dannymcgiffin.com",
  output: "static",
  trailingSlash: "always",
  build: {
    inlineStylesheets: "always",
  },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !["/workflow-review", "/go/", "/machinery/"].some((path) =>
          page.includes(path),
        ),
    }),
  ],
  redirects: {
    "/workflow-review": "/contact/",
    "/ai-opportunity-sprint": "/contact/",
    "/still-on-tools": "/contact/",
    "/score-one-workflow": "/contact/",
    "/northern-virginia-ai-workflow-automation": "/about/",
    "/proposal-factory": "/field-notes/proposal-factory/",
  },
  vite: {
    // Preserve animation-timeline longhands; shorthand folding breaks current browsers.
    build: { cssMinify: false },
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ["beelink", ".tailfd4c00.ts.net"],
    },
  },
});
