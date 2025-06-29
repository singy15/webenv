// import './assets/main.css'

import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import icon from "./icon.png?url";

const app = createApp(App);

app.use(router);

app.mount("#app");

let lnk = document.createElement("LINK");
lnk.rel = "icon";
lnk.href = icon;
document.head.appendChild(lnk);
