import component from "./component.js";
import task from "../tasks/task.js";
import vector from "../vector.js";
import list from "../list.js";
import killable from "./killable.js";
const Component = component.Component;
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const v$ = vector.Vector.$;
const List = list.List;
const KillableComponent = killable.KillableComponent;

class FreeprocComponent extends Component {
  constructor(entity, proc, priority = TaskPriorities.update) {
    super(entity, KillableComponent);
    this.proc = proc;
    new Task(priority, (task) => {
      if (entity.killable.killed) {
        task.kill();
      }
      this.run();
    });
    this.init();
  }

  init() {
    //noop
  }

  run() {
    this.proc();
  }
}

export default {
  FreeprocComponent,
};
