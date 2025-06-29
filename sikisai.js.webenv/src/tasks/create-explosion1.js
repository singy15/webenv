import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

import killable from "../components/killable.js";
import physics from "../components/physics.js";
import draw from "../components/draw.js";
import collision from "../components/collision.js";
import killTimer from "../components/kill-timer.js";
import vector from "../vector.js";
const v$ = vector.Vector.$;
import char from "../entities/char.js";

class TaskCreateExplosion1 extends Task {
  constructor(gadpt, p) {
    super(TaskPriorities.update);
    this.gadpt = gadpt;
    this.p = p;
  }

  run() {
    for (let i = 0; i < 3; i++) {
      this.spawn();
    }
    this.kill();
  }

  spawn() {
    let chr = new char.Char();
    new killable.KillableComponent(chr);
    new physics.PhysicsComponent(chr);
    new draw.DrawComponent(chr, this.gadpt, {
      sx: 416,
      sy: 192,
      swidth: 30,
      sheight: 30,
      smoothing: false,
      scaleY: 0.7,
      scaleX: 0.7,
      globalAlpha: () => {
        return 1.0 - chr.killTimer.progress();
      }
    });
    new killTimer.KillTimerComponent(chr, 30);
    let g = this.gadpt;
    let pp = this.p;
    chr.physics.p.val(pp.x, pp.y);
    let r = Math.random() * 2.0 * Math.PI;
    let s = Math.random() * 1.0;
    chr.physics.impulse(v$(Math.cos(r) * s, Math.sin(r) * s));
    chr.physics.spin((Math.random() - 1.0) * 0.5);
  }
}

export default {
  TaskCreateExplosion1,
};
