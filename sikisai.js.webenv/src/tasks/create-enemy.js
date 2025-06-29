import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

import killable from "../components/killable.js";
import physics from "../components/physics.js";
import draw from "../components/draw.js";
import collisionLight from "../components/collision-light.js";
import collision from "../components/collision.js";
import randomMove from "../components/random-move.js";
import boundary from "../components/boundary.js";
import hitpoint from "../components/hitpoint.js";

import char from "../entities/char.js";

class TaskCreateEnemy extends Task {
  constructor(gadpt, tmax) {
    super(TaskPriorities.update);
    this.gadpt = gadpt;
    this.t = 0;
    this.tmax = tmax;
  }

  run() {
    this.t++;
    if (this.t >= this.tmax) {
      this.t = 0;
      this.spawn();
    }
  }

  spawn() {
    let chr = new char.Char();
    new killable.KillableComponent(chr);
    new physics.PhysicsComponent(chr);
    new draw.DrawComponent(chr, this.gadpt, {
      sx: 512,
      sy: 224,
      swidth: 30,
      sheight: 30,
      smoothing: false,
      scaleY: -1.0,
      scaleX: 1.0,
    });
    new collisionLight.CollisionLightComponent(chr, this.gadpt, {
      left: { x: -8, y: -7 },
      right: { x: +9, y: -7 },
      interval: 40,
    });
    new collision.CollisionComponent(chr, (self, they) => {});
    new randomMove.RandomMoveComponent(chr);
    new boundary.BoundaryComponent(chr, this.gadpt);
    new hitpoint.HitpointComponent(chr, 3);

    let g = this.gadpt;
    chr.physics.p.val(g.width() / 2.0, g.height() * 0.2);
    chr.physics.vdump = 0.05;
    chr.collision.setTag("enemy");
  }
}

export default {
  TaskCreateEnemy,
};
