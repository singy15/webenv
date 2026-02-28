import component from "/sikisai.js/core/component.js";
const Component = component.Component;
import task from "/sikisai.js/core/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import killable from "./killable.js";

const hsvToRgb = (h, s, v) => {
  let r, g, b;

  let i = Math.floor(h * 6);
  let f = h * 6 - i;
  let p = v * (1 - s);
  let q = v * (1 - f * s);
  let t = v * (1 - (1 - f) * s);

  switch (i % 6) {
    case 0:
      (r = v), (g = t), (b = p);
      break;
    case 1:
      (r = q), (g = v), (b = p);
      break;
    case 2:
      (r = p), (g = v), (b = t);
      break;
    case 3:
      (r = p), (g = q), (b = v);
      break;
    case 4:
      (r = t), (g = p), (b = v);
      break;
    case 5:
      (r = v), (g = p), (b = q);
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
};

class FlameColorComponent extends Component {
  constructor(entity) {
    super(entity, killable.KillableComponent);

    this.r = 255;
    this.g = 255;
    this.b = 255;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {}

  setColor(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  getColor() {
    return { r: this.r, g: this.g, b: this.b };
  }

  setColorHSV(h, s, v) {
    let rgb = hsvToRgb(h, s, v);
    this.r = rgb.r;
    this.g = rgb.g;
    this.b = rgb.b;
  }
}

export default {
  FlameColorComponent,
};
