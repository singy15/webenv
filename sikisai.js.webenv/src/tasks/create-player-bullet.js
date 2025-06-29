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
import createExplosion1 from "./create-explosion1.js";

class TaskCreatePlayerBullet extends Task {
  constructor(gadpt, player) {
    super(TaskPriorities.update);
    this.player = player;
    this.gadpt = gadpt;
  }

  run() {
    this.spawn();
    this.kill();
  }

  spawn() {
    let chr = new char.Char();
    new killable.KillableComponent(chr);
    new physics.PhysicsComponent(chr);
    new draw.DrawComponent(chr, this.gadpt, {
      sx: 416,
      sy: 160,
      swidth: 30,
      sheight: 30,
      smoothing: false,
      scaleY: 1.0,
      scaleX: 1.0,
    });
    new killTimer.KillTimerComponent(chr, 180);
    new collision.CollisionComponent(chr, (self, they) => {
      if (they.tag === "enemy") {
        self.entity.killable.kill();
        they.entity.hitpoint.damage(1);
        let d = they.entity.physics.p
          .dup()
          .sub(self.entity.physics.p)
          .normalize()
          .mult(3.0);
        they.entity.physics.impulse(d);

        new createExplosion1.TaskCreateExplosion1(
          this.gadpt,
          self.entity.physics.p,
        );
      }
    });

    let g = this.gadpt;
    let pp = this.player.physics.p;
    chr.physics.p.val(pp.x, pp.y);
    chr.physics.v.val(0.0, -5.0);
    chr.collision.setTag("player-bullet");
    chr.collision.setRadius(4.0);
  }
}

export default {
  TaskCreatePlayerBullet,
};
