import component from "../component.js";
const Component = component.Component;
import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";

class HitpointComponent extends Component {
  constructor(entity, hpmax = 1) {
    super(entity, killable.KillableComponent);
    this.hpmax = hpmax;
    this.hp = this.hpmax;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    if(this.hp <= 0) {
      this.entity.killable.kill();
    }
  }

  damage(point) {
    this.hp -= point;
    if(this.hp <= 0) {
      this.entity.killable.kill();
    }
  }
}

export default {
  HitpointComponent,
};
