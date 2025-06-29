import component from './component.js';
import task from '../tasks/task.js';
import vector from '../vector.js';
import list from '../list.js';
import killable from './killable.js';
import physics from './physics.js';
const Component = component.Component;
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const v$ = vector.Vector.$;
const List = list.List;
const KillableComponent = killable.KillableComponent;
const PhysicsComponent = physics.PhysicsComponent;

class DownTriggerComponent extends Component {
  constructor(entity,handler) {
    super(entity,KillableComponent,PhysicsComponent);
    this.handler = handler;
    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) { task.kill(); return; }
      this.run();
    });
    this.init();
  }
  init() {
    //noop
  }
  run() {
    if(this.entity.physics.v.y > 0.0) {
      this.entity.killable.kill();
      this.handler();
    }
  }
}

export default {
  DownTriggerComponent: DownTriggerComponent,
};