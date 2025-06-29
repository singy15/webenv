import component from "../component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import killable from "./killable.js";

class KillTimerComponent extends Component {
  constructor(entity, tmax) {
    super(entity, killable.KillableComponent);
    this.tmax = tmax;
    this.t = 0;

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
      this.entity.killable.kill();
    }
  }

  setTimer(time) {
    this.t = 0;
    this.tmax = time;
  }
}

export default {
  KillTimerComponent: KillTimerComponent,
};
