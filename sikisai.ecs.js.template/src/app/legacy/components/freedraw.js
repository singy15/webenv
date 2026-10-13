import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class FreedrawComponent extends Component {
  constructor(entity, gadpt, drawFn, priority = 0) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    this.drawFn = drawFn ?? ((gadpt) => {});
    new Task(TaskPriorities.draw + priority, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    this.drawFn(this.gadpt);
  }
}

export default {
  FreedrawComponent,
};
