import component from "../component.js";
const Component = component.Component;
import task from "../task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";

class CollisionLightComponent extends Component {
  constructor(entity, gadpt, position) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);
    this.gadpt = gadpt;
    this.position = position;
    this.t = 0;
    new Task(TaskPriorities.draw - 200, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let g = this.gadpt;
    let p = this.entity.physics.p;
    let ps = this.position;
    this.t++;
    let interval = this.position.interval ?? 60;
    if (this.t % interval > interval / 2) {
      g.arc(p.x + ps.left.x, p.y + ps.left.y, 1.0, {
        fillStyle: `rgba(255,255,255,1.0)`,
        shadowColor: `rgba(0,255,0,1.0)`,
        shadowBlur: 4.0,
        shadowOffsetX: 0.0,
        shadowOffsetY: 0.0,
      });
      g.arc(p.x + ps.right.x, p.y + ps.right.y, 1.0, {
        fillStyle: `rgba(255,255,255,1.0)`,
        shadowColor: `rgba(255,0,0,1.0)`,
        shadowBlur: 4.0,
        shadowOffsetX: 0.0,
        shadowOffsetY: 0.0,
      });
    }
  }
}

export default {
  CollisionLightComponent,
};
