import { defineConfig } from "vite";
//import vue from "@vitejs/plugin-vue";

export default defineConfig({
  //plugins: [vue()],
  build: {
    outDir: "public",
    emptyOutDir: false,
    rollupOptions: {
      input: {
        //main: "index.html",
        sw: "src/sw.js",
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "sw") {
            return "sw.js";
          }
          return "assets/[name]-[hash].js";
        },
      },
    },
  },
});
