<script setup>
import moment from "moment";
import { get, set, clear, del } from "idb-keyval";
import bundler from "../bundler.js";
import { ref, onMounted } from "vue";
import storageUtil from "../storage-util.js";

import iconDebug from "../icon-debug.png?url";

const iframe = ref(null);
const msg = ref("");
const msgSpan = ref(null);

async function buildForDebug(appOid) {
  await set(`webenv/debug/index`, await bundler.build(appOid));
}

function htmlToBase64DataURI_UTF8(html) {
  // to byte array
  const uint8Array = new TextEncoder().encode(html);

  // to base64
  let binary = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64 = btoa(binary);

  return `data:text/html;base64,${base64}`;
}

async function createLoadingScreen() {
  let src = `<DOCTYPE html>
<body style="background-color:#555">
Loading...
</body>
</html>`;
  const blob = new Blob([src], { type: "text/html" });
  const objurl = URL.createObjectURL(blob);
  return objurl;
}

async function loadIframe() {
  let classicReload = storageUtil.getStorage("classicReload", false);

  console.log("building...");
  // if (fullPageReload) {
  //   console.log("using full-page-reload");
  // } else
  if (classicReload) {
    console.log("using classic-reload");
    iframe.value.src = await createLoadingScreen();
  }

  // await buildForDebug(localStorage.getItem(`webenv/curappid`));
  // let src = await get(`webenv/debug/index`);
  let appOid = localStorage.getItem(`webenv/curappid`);
  let src;
  let startTime = Date.now();
  try {
    src = await bundler.build(appOid);
  } catch (err) {
    console.error("build failed, abort loading.");
    console.error(err);
    reloading = false;
    return;
  }
  let endTime = Date.now();
  // console.log(startTime, endTime);
  // storageUtil.setStorage("buildTime", endTime - startTime);

  console.log("loading...");
  // if(fullPageReload) {
  //   console.clear();
  //   location.reload();
  // } else
  if (classicReload) {
    const blob = new Blob([src], { type: "text/html" });
    const objurl = URL.createObjectURL(blob);
    iframe.value.src = objurl;
  } else {
    document.open();
    document.write(src);
    document.close();
  }
  console.clear();
  // let sec = (storageUtil.getStorage("buildTime", 0)) / 1000;
  let sec = Math.floor((endTime - startTime) / 1000);
  let min = Math.floor(sec / 60);
  console.log(`loaded. [build: ${min} min ${sec - min * 60} sec]`);

  // console.log(src);
  // let parser = new DOMParser();
  // let dom = parser.parseFromString(src, "text/html");
  // console.log(dom.querySelector("html"));
  // console.log(document.querySelector("html"));
  // document.querySelector("html").innerHTML = dom.querySelector("html").innerHTML;

  reloading = false;
}

let lastVer = "";
let reloading = false;
function setVerCheckInterval(interval) {
  setInterval(() => {
    if (reloading) {
      // console.log("waiting for reload...");
      return;
    }

    let nowVer = localStorage.getItem(`webenv/debug/version`);
    if (lastVer === nowVer) return;
    lastVer = nowVer;
    showMsg(`RELOAD ver.${nowVer}`);

    reloading = true;

    let fullPageReload = storageUtil.getStorage("fullPageReload", false);
    if (fullPageReload) {
      location.reload();
      return;
    }

    // if (storageUtil.getStorage("reload", false)) {
    //   storageUtil.setStorage("reload", false);
    //   location.reload();
    //   return;
    // }

    // try {
    loadIframe();
    // } catch (err) {
    //   console.error(err);
    // } finally {
    //   reloading = false;
    // }
  }, interval);
}

function showMsg(str) {
  msg.value = str;
  msgSpan.value.classList.remove("fade-out");
  void msgSpan.value.offsetWidth;
  msgSpan.value.classList.add("fade-out");
}

onMounted(() => {
  loadIframe();
  lastVer = localStorage.getItem(`webenv/debug/version`);
  setVerCheckInterval(1000);
});

let icons = document.querySelector('link[rel="icon"]');
if (icons) {
  icons.remove();
}
let lnk = document.createElement("LINK");
lnk.rel = "icon";
lnk.href = iconDebug;
document.head.appendChild(lnk);

document.querySelector("title").innerText = "debug";
</script>

<template>
  <iframe ref="iframe" class="debug"></iframe>
  <span ref="msgSpan" class="msg fade-out">{{ msg }}</span>
</template>

<style>
.debug {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  outline: none;
}

.msg {
  z-index:9999;
  position:fixed;
  bottom:1em;
  left:1em;
  font-size: 0.7em;
}

.fade-out {
  animation: fadeOut 5s ease-out forwards;
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
</style>
