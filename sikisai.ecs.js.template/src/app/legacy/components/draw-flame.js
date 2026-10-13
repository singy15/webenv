import component from "/sikisai.js/core/component.js";
const Component = component.Component;
import task from "/sikisai.js/core/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "/sikisai.js/core/vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class DrawFlameComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;

    new Task(TaskPriorities.draw, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let ph = this.entity.physics;
    let ga = this.gadpt;

    let a = 1.0;
    if (this.entity.killTimer) {
      let r = this.entity.killTimer.getRatio();
      a = r < 0.3 ? r / 0.3 : a;
    }

    let r = 255,
      g = 255,
      b = 255;

    if (this.entity.flameColor) {
      let rgb = this.entity.flameColor.getColor();
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
    }


    ga.arc(ph.p.x, ph.p.y, 4.0, {
      fillStyle: `rgba(${r},${g},${b},0.1)`,
      strokeStyle: `transparent`,
    });

    ga.arc(ph.p.x, ph.p.y, 8.0, {
      fillStyle: `rgba(${r},${g},${b},0.05)`,
      strokeStyle: `transparent`,
    });

    ga.arc(ph.p.x, ph.p.y, 1.0, {
      fillStyle: `rgba(${r},${g},${b},${a})`,
      strokeStyle: `transparent`,
    });

    // ga.rect(ph.p.x - 0.5, ph.p.y - 0.5, ph.p.x + 0.5, ph.p.y + 0.5, {
    //   fillStyle: `rgba(255,255,255,${a})`,
    //   strokeStyle: `transparent`,
    // });
    ga.arc(ph.p.x, ph.p.y, 0.5, {
      fillStyle: `rgba(${255 * a},${255 * a},${255 * a},${a})`,
      strokeStyle: `transparent`,
    });
  }
}

export default {
  DrawFlameComponent,
};
