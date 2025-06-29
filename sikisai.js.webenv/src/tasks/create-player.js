import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

import killable from "../components/killable.js";
import physics from "../components/physics.js";
import draw from "../components/draw.js";
import input from "../components/input.js";
import playerControl from "../components/player-control.js";
import collisionLight from "../components/collision-light.js";
import collision from "../components/collision.js";
import boundary from "../components/boundary.js";

import char from "../entities/char.js";

class TaskCreatePlayer extends Task {
  constructor(gadpt, iadpt) {
    super(TaskPriorities.initialize);
    this.gadpt = gadpt;
    this.iadpt = iadpt;
  }

  run() {
    let chr = new char.Char();
    new killable.KillableComponent(chr);
    new physics.PhysicsComponent(chr);
    new input.InputComponent(chr, this.iadpt);
    new playerControl.PlayerControlComponent(chr, this.gadpt);
    new draw.DrawComponent(chr, this.gadpt, {
      sx: 480,
      sy: 160,
      swidth: 30,
      sheight: 30,
      smoothing: false,
    });
    new collisionLight.CollisionLightComponent(chr, this.gadpt, {
      left: { x: -10, y: 6 },
      right: { x: +10, y: 6 },
    });
    new boundary.BoundaryComponent(chr, this.gadpt);
    new collision.CollisionComponent(chr, (self, they) => {
      if (they.tag === "enemy") {
        self.entity.killable.kill();
      }
    });

    let g = this.gadpt;
    chr.physics.p.val(g.width() / 2.0, g.height() - g.height() * 0.2);
    chr.physics.vdump = 0.1;
    chr.collision.setTag("player");

    this.kill();
  }
}

export default {
  TaskCreatePlayer,
};
