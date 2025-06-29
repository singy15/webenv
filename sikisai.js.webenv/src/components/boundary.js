import component from "./component.js";
import task from "../tasks/task.js";
import vector from "../vector.js";
import killable from "./killable.js";
import physics from "./physics.js";
const Component = component.Component;
const Task = task.Task;
const v$ = vector.Vector.$;
const KillableComponent = killable.KillableComponent;
const PhysicsComponent = physics.PhysicsComponent;

class BoundaryComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, KillableComponent, PhysicsComponent);
    this.gadpt = gadpt;
    new Task(task.TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
      }
      this.run();
    });
  }
  run() {
    let p = this.entity.physics.p;
    let v = this.entity.physics.v;
    let g = this.gadpt;
    if (p.x > g.width()) {
      p.x = g.width();
      v.x = 0.0;
    }
    if (p.x < 0.0) {
      p.x = 0.0;
      v.x = 0.0;
    }
    if (p.y > g.height()) {
      p.y = g.height();
      v.y = 0.0;
    }
    if (p.y < 0.0) {
      p.y = 0.0;
      v.y = 0.0;
    }
  }
}

export default {
  BoundaryComponent: BoundaryComponent,
};
