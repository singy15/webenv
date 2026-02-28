console.log("it works!");
await devidb.set("test", "ok");
console.log(await devidb.get("test"));

import ecs from "/sikisai.js/core/ecs.js";

// import fpsController from "/sikisai.js/core/fps-controller.js";
// import graphicsAdapterCanvas from "/sikisai.js/core/graphics-adapter-canvas.js";
// import interfaceAdapterCanvas from "/sikisai.js/core/interface-adapter-canvas.js";
// import audioAdapterWebAudio from "/sikisai.js/core/audio-adapter-web-audio.js";
// import sceneMain from "./scene-main.js";
// // import fontMplus from "/sikisai.js/res/fonts/MPLUS1-Regular.ttf";

// // const style = document.createElement("style");
// // style.textContent = `
// // @font-face {
// //   font-family: 'mplus-regular';
// //   src: url(${fontMplus}) format('truetype');
// //   font-weight: normal;
// //   font-style: normal;
// // }
// // `;
// // document.head.appendChild(style);

// let canvas = document.querySelector("#canvas");
// let canvasSub = document.querySelector("#canvasSub");

// canvas.addEventListener("click", () => {
//   canvas.focus();
// });
// canvas.focus();

// let gadpt = new graphicsAdapterCanvas.GraphicsAdapterCanvas();
// gadpt.addContext("main", canvas.getContext("2d"));
// gadpt.addContext("sub", canvasSub.getContext("2d"));
// gadpt.changeContext("main");
// let iadpt = new interfaceAdapterCanvas.InterfaceAdapterCanvas(canvas);
// let fpsc = new fpsController.FPSController();
// let aadpt = new audioAdapterWebAudio.AudioAdapterWebAudio();

// let scMain = new sceneMain.SceneMain(fpsc, gadpt, iadpt, aadpt);
// scMain.init();
// let currentScene = scMain;

// fpsc.updateFn = () => {
//   let next = currentScene.update();
//   if (next != null) {
//     currentScene = next;
//   }
// };

// fpsc.drawFn = () => {
//   currentScene.draw();
// };

// fpsc.start();
