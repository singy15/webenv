<script setup>
import moment from "moment";
import { get, set, clear, del } from "idb-keyval";
import bundler from "../bundler.js";
import { ref, onMounted } from "vue";

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

async function loadIframe() {
  await buildForDebug(localStorage.getItem(`webenv/curappid`));
  let src = await get(`webenv/debug/index`);
  const blob = new Blob([src], { type: "text/html" });
  const objurl = URL.createObjectURL(blob);
  iframe.value.src = objurl;
}

function setVerCheckInterval(interval) {
  let lastVer = "";
  setInterval(() => {
    let nowVer = localStorage.getItem(`webenv/debug/version`);
    if (lastVer === nowVer) return;
    lastVer = nowVer;
    showMsg(`RELOAD ver.${nowVer}`);
    loadIframe();
  }, interval);
}

function showMsg(str) {
  msg.value = str;
  msgSpan.value.classList.remove("fade-out");
  void msgSpan.value.offsetWidth;
  msgSpan.value.classList.add("fade-out");
}

onMounted(() => {
  setVerCheckInterval(1000);
});

let icons = document.querySelector('link[rel="icon"]');
if(icons) {
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
  top:1em;
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
