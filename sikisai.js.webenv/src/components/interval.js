import component from './component.js';
import task from '../tasks/task.js';
import vector from '../vector.js';
import list from '../list.js';
import killable from './killable.js';
const Component = component.Component;
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const v$ = vector.Vector.$;
const List = list.List;
const KillableComponent = killable.KillableComponent;

class IntervalComponent extends Component {
  constructor(entity,handler) {
    super(entity,KillableComponent);
    this.t = 0;
    this.interval = 60;
    this.handler = handler;
    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) { task.kill(); }
      this.run();
    });
    this.init();
  }
  init() {
    //noop
  }
  run() {
    this.t++;
    if(this.t % this.interval === 0) {
      this.handler();
    }
  }
  setInterval(interval) {
    this.interval = interval;
  }
}

export default {
  IntervalComponent: IntervalComponent,
};