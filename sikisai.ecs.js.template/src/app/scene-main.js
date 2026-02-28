import scene from "/sikisai.js/core/scene.js";
import task from "/sikisai.js/core/task.js";
import { Registry, TaskPriority } from "/sikisai.js/core/ecs.js";
import vector from "/sikisai.js/core/vector.js";
const v$ = vector.Vector.$;
// import clearScreen from "./tasks/clear-screen.js";
// import fireworksFactory from "./factories/fireworks-factory.ecs.js";
import { PhysicsComponent } from "./ecs/components/physics.js";
import { SparkComponent } from "./ecs/components/spark.js";
import { TimerComponent } from "./ecs/components/timer.js";
import { updateTimer } from "./ecs/systems/timer-sys.js";
import { clearScreen, entityMonitorSystem } from "./ecs/systems/common.js";
import { updatePhysics, downwardTrigger } from "./ecs/systems/physics.js";
import { drawSpark } from "./ecs/systems/spark.js";
import {
  spawnParticle,
  spawnBurst,
  spawnProjector,
} from "./ecs/factory/fireworks.js";

class SceneMain extends scene.Scene {
  constructor(fpsc, gadpt, iadpt, aadpt) {
    super();
    this.fpsc = fpsc;
    this.gadpt = gadpt;
    this.iadpt = iadpt;
    this.aadpt = aadpt;
    this.registry = new Registry(10000);
  }

  init() {
    let ga = this.gadpt,
      rg = this.registry;

    super.init();

    // // bvh.BvhComponent.initialize(ga);

    rg.registerTask((task) => updateTimer(rg), TaskPriority.Update + 100);
    rg.registerTask((task) => updatePhysics(rg), TaskPriority.Update);
    rg.registerTask((task) => downwardTrigger(rg), TaskPriority.Update + 100);
    rg.registerTask((task) => clearScreen(ga), TaskPriority.Draw + 100);
    rg.registerTask((task) => drawSpark(rg, ga), TaskPriority.Draw);
    rg.registerTask(
      (task) => entityMonitorSystem(rg, ga),
      TaskPriority.Draw - 100,
    );

    // spawnBurst(rg, 200, 200);
    spawnProjector(rg, v$(250, 500), v$(0, -4.5));

    // let c1 = fireworksFactory.spawnSpawnerSimple1(this.gadpt);
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
    // task.TaskManager.runAll();
    this.registry.update();
  }

  draw() {
    let ga = this.gadpt;
    ga.text(`${this.fpsc.actualFps}`, 0, 10);
  }
}

export default {
  SceneMain: SceneMain,
};
