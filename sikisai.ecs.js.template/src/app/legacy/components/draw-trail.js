import component from "/sikisai.js/core/component.js";
const Component = component.Component;
import task from "/sikisai.js/core/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "/sikisai.js/core/vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class DrawTrailComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);

    this.gadpt = gadpt;
    this.trailColor = { r: 255, g: 255, b: 255 };
    this.trails = [];
    this.maxTrails = 8;
    this.updateInterval = 5;
    this.offsetX = 0.0;
    this.offsetY = 0.0;
    this.t = 0;

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
    
    if(this.entity.flameColor) {
      c = this.entity.flameColor.getColor();
    }

    let a = 1.0;
    if (this.entity.killTimer) {
      let r = this.entity.killTimer.getRatio();
      a = r < 0.3 ? r / 0.3 : a;
    }

    this.t++;

    if (this.t % this.updateInterval === 0) {
      let pp = this.entity.physics.p.dup();
      let r = this.entity.physics.r;
      let vy = v$(Math.cos(r), Math.sin(r));
      let vx = vy.dup().rotate(Math.PI * 0.5);
      pp.add(vy.dup().mult(this.offsetY));
      pp.add(vx.dup().mult(this.offsetX));
      this.trails.unshift(pp);
      if (this.trails.length > this.maxTrails) {
        this.trails.pop();
      }
    }

    for (let i = 0; i < this.trails.length; i++) {
      let op = i == 0 ? this.trails[i] : this.trails[i - 1];
      let p = this.trails[i];
      g.line(op.x, op.y, p.x, p.y, {
        strokeStyle: `rgba(${c.r},${c.g},${c.b},${ a - (a / this.trails.length) * i })`,
        lineWidth: 1.0,
        //globalAlpha: 1.0 - (1.0 / this.trails.length) * i,
      });
    }

    if (this.trails.length > 0) {
      g.line(p1.x, p1.y, this.trails[0].x, this.trails[0].y, {
        strokeStyle: `rgba(${c.r},${c.g},${c.b},${a})`,
        lineWidth: 1.0,
        //globalAlpha: 1.0,
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
