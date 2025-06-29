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

class PhysicsComponent extends Component {
  constructor(entity) {
    super(entity,KillableComponent);
    this.p = v$(0.0,0.0);
    this.op = v$(0.0,0.0);
    this.v = v$(0.0,0.0);
    this.ov = v$(0.0,0.0);
    this.vdump = 0.0;
    this.g = v$(0.0,0.0);
    this.r = 0.0;
    this.vr = 0.0;
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
    let p = this.p;
    let v = this.v;
    this.op = this.p.dup();
    this.ov = this.v.dup();
    v.add(this.g);
    v.sub(v.dup().mult(this.vdump));
    p.add(v);
    this.r = this.r + this.vr;
  }
  impulse() {
    this.v.add(v);
  }
  spin() {
    this.vr += v;
  }
}

export default {
  PhysicsComponent: PhysicsComponent,
};