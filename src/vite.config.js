import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), viteSingleFile(), vueDevTools()],
  // build: {
  //   minify: false,
  //   terserOptions: {
  //     compress: false,
  //     mangle: false,
  //   },
  // },
  build: {
    sourceMap: "inline",
    assetsInlineLimit: 100000000,
  },
  assetsInclude: ["**/*.wasm"],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
