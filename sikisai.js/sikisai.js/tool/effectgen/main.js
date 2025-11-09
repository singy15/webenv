// @@@webenv.script(effectmain)

import editor from "./editor.vue?text";

let fileRepository = {
  "./editor.vue": editor,
};

const options = {
  moduleCache: {
    vue: Vue,
  },

  async getFile(url) {
    return {
      getContentData: () => fileRepository[url],
    };
  },

  addStyle(textContent) {
    const style = Object.assign(document.createElement("style"), {
      textContent,
    });
    const ref = document.head.getElementsByTagName("style")[0] || null;
    document.head.insertBefore(style, ref);
  },
};
const { loadModule } = window["vue3-sfc-loader"];

const app = Vue.createApp(
  Vue.defineAsyncComponent(() => loadModule("./editor.vue", options)),
);

app.mount("#app");
