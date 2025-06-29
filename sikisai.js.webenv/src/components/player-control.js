import component from "../component.js";
const Component = component.Component;
import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
import input from "./input.js";
import createPlayerBullet from "../tasks/create-player-bullet.js";

class PlayerControlComponent extends Component {
  constructor(entity, gadpt) {
    super(
      entity,
      killable.KillableComponent,
      physics.PhysicsComponent,
      input.InputComponent,
    );

    this.gadpt = gadpt;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let phys = this.entity.physics;
    let ip = this.entity.input;
    let speed = 0.6;

    if (ip.keydown(87)) {
      phys.v.add(v$(0.0, -speed));
    }
    if (ip.keydown(83)) {
      phys.v.add(v$(0.0, speed));
    }
    if (ip.keydown(65)) {
      phys.v.add(v$(-speed, 0.0));
    }
    if (ip.keydown(68)) {
      phys.v.add(v$(speed, 0.0));
    }

    if (ip.keypush(74)) {
      new createPlayerBullet.TaskCreatePlayerBullet(this.gadpt, this.entity);
    }
  }
}

export default {
  PlayerControlComponent,
};
