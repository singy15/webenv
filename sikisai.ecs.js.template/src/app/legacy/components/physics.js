import component from "/sikisai.js/core/component.js";
import list from "/sikisai.js/core/list.js";
import task from "/sikisai.js/core/task.js";
import vector from "/sikisai.js/core/vector.js";
import killable from "./killable.js";
const Component = component.Component;
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const v$ = vector.Vector.$;
const List = list.List;
const KillableComponent = killable.KillableComponent;

class PhysicsComponent extends Component {
  constructor(entity) {
    super(entity, KillableComponent);
    this.a = v$(0.0, 0.0);
    this.oa = v$(0.0, 0.0);
    this.p = v$(0.0, 0.0);
    this.op = v$(0.0, 0.0);
    this.v = v$(0.0, 0.0);
    this.ov = v$(0.0, 0.0);
    this.vdump = 0.0;
    this.g = v$(0.0, 0.0);
    this.r = 0.0;
    this.vr = 0.0;
    this.maxVelocity = 9999999.0;
    new Task(TaskPriorities.update - 500, (task) => {
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
    let a = this.a;
    let p = this.p;
    let v = this.v;
    this.oa = this.a.dup();
    this.op = this.p.dup();
    this.ov = this.v.dup();
    v.add(a);
    v.add(this.g);
    v.clampSqr(this.maxVelocity);
    v.sub(v.dup().mult(this.vdump));
    p.add(v);
    a.val(0.0,0.0);
    this.r = this.r + this.vr;
  }

  impulse(v) {
    this.v.add(v);
  }

  spin() {
    this.vr += v;
  }

  distanceTo(entity) {
    return this.entity.physics.p.dup().sub(entity.physics.p).norm();
  }
}

export default {
  PhysicsComponent: PhysicsComponent,
};
