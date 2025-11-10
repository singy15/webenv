import component from "/sikisai.js/core/component.js";
const Component = component.Component;
import task from "/sikisai.js/core/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "/sikisai.js/core/vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class GravityComponent extends Component {
  constructor(entity, g = 0.97) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.g = g;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    this.entity.physics.v.y += this.g;
  }
}

export default {
  GravityComponent,
};
