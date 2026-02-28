import scene from "/sikisai.js/core/scene.js";
import task from "/sikisai.js/core/task.js";
import clearScreen from "./tasks/clear-screen.js";
import fireworksFactory from "./factories/fireworks-factory.js";

class SceneMain extends scene.Scene {
  constructor(fpsc, gadpt, iadpt, aadpt) {
    super();
    this.fpsc = fpsc;
    this.gadpt = gadpt;
    this.iadpt = iadpt;
    this.aadpt = aadpt;
  }

  init() {
    super.init();

    let ga = this.gadpt;

    task.TaskManager.clearAll();

    new clearScreen.TaskClearScreen(ga);
    // bvh.BvhComponent.initialize(ga);

    let c1 = fireworksFactory.spawnSpawnerSimple1(this.gadpt);
  }

  update() {
    super.update();

    this.iadpt.update();

    for (let i = 0; i < this.fpsc.updateFrames; i++) {
      this.tick();
    }

    if (this.iadpt.keypush(/*esc*/ 27)) {
      // return new sceneMenu.SceneMenu(
      //   this.fpsc,
      //   this.gadpt,
      //   this.iadpt,
      //   this.aadpt,
      // );
    }
  }

  tick() {
    task.TaskManager.runAll();
  }

  draw() {
    let ga = this.gadpt;
    ga.text(`${this.fpsc.actualFps}`, 0, 10);
  }
}

export default {
  SceneMain: SceneMain,
};
