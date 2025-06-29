import fpsController from "./fps-controller.js";
import sceneMain from "./scene-main.js";
import sceneGraph from "./scene-graph.js";
import graphicsAdapterCanvas from "./graphics-adapter-canvas.js";
import interfaceAdapterCanvas from "./interface-adapter-canvas.js";
import audioAdapterWebAudio from "./audio-adapter-web-audio.js";

let canvas = document.querySelector("#canvas");

canvas.addEventListener("click", () => {
  canvas.focus();
});

canvas.focus();

let gadpt = new graphicsAdapterCanvas.GraphicsAdapterCanvas();
gadpt.addContext("main", canvas.getContext("2d"));
gadpt.changeContext("main");

let iadpt = new interfaceAdapterCanvas.InterfaceAdapterCanvas(canvas);
let fpsc = new fpsController.FPSController();
let aadpt = new audioAdapterWebAudio.AudioAdapterWebAudio();

let scMain = new sceneMain.SceneMain(gadpt, iadpt, fpsc, aadpt);
scMain.init();

let scGraph = new sceneGraph.SceneGraph(gadpt, iadpt, fpsc, aadpt);
scGraph.init();

let currentScene = scMain;

fpsc.updateFn = () => {
  let next = currentScene.update();
  if (next != null) currentScene = next;
};

fpsc.drawFn = () => {
  currentScene.draw();
};

fpsc.start();
