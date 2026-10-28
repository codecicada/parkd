import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const root = import.meta.dirname;

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Chrome supports modulepreload natively; the polyfill would only add fetch code.
    modulePreload: { polyfill: false },
    rollupOptions: {
      input: {
        list: resolve(root, "list.html"),
        transfer: resolve(root, "transfer.html"),
        background: resolve(root, "src/background.ts"),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === "background" ? "background.js" : "assets/[name]-[hash].js",
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
});
