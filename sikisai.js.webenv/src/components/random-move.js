import component from "../component.js";
const Component = component.Component;
import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class RandomMoveComponent extends Component {
  constructor(entity, interval = 60, spd = 3.0) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.t = 0;
    this.tmax = interval;
    this.tx = 0;
    this.ty = 0;
    this.interval = interval;
    this.spd = spd;
    this.phase = 1; // 1: stop, 2: move
    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    this.t++;
    if (this.t >= this.tmax) {
      this.t = 0;
      this.phase = this.phase === 1 ? 2 : 1;
      let p = this.entity.physics.p;
      let v = this.entity.physics.v;
      if (this.phase === 2) {
        let d = Math.random() * Math.PI * 2.0;
        let spd = this.spd;
        v.val(Math.cos(d) * spd, Math.sin(d) * spd);
      } else {
        v.val(0.0, 0.0);
      }
    }
  }
}

export default {
  RandomMoveComponent,
};
