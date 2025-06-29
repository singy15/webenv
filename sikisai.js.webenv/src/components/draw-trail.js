import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class DrawTrailComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    this.trailColor = { r: 255, g: 255, b: 255 };
    this.trails = [];
    this.maxTrails = 5;
    new Task(TaskPriorities.draw, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let g = this.gadpt;
    let p1 = this.entity.physics.p;
    let c = this.trailColor;

    this.trails.unshift(this.entity.physics.p.dup());
    if (this.trails.length > this.maxTrails) {
      this.trails.pop();
    }

    for (let i = 0; i < this.trails.length; i++) {
      let op = i == 0 ? this.trails[i] : this.trails[i - 1];
      let p = this.trails[i];
      g.line(op.x, op.y, p.x, p.y, {
        strokeStyle: `rgba(${c.r},${c.g},${c.b},1.0)`,
        lineWidth: 2.0,
        globalAlpha: 1.0 - (1.0 / this.trails.length) * i,
      });
    }

    g.rect(p1.x, p1.y, p1.x + 1, p1.y + 1, {
      strokeStyle: `transparent`,
      fillStyle: `rgba(255,255,255,1.0)`,
    });
  }

  setColor(r, g, b) {
    this.trailColor.r = r;
    this.trailColor.g = g;
    this.trailColor.b = b;
  }

  setMaxTrails(maxTrails) {
    this.maxTrails = maxTrails;
  }
}

export default {
  DrawTrailComponent,
};
