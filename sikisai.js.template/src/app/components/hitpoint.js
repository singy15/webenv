import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";

class HitpointComponent extends Component {
  constructor(entity, hpmax = 1) {
    super(entity, killable.KillableComponent);
    this.hpmax = hpmax;
    this.hp = this.hpmax;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    if (this.hp <= 0) {
      this.entity.killable.kill();
    }
  }

  setHitpoint(hp) {
    this.hpmax = hp;
    this.hp = hp;
  }

  getHitpointRate() {
    return this.hp / this.hpmax;
  }

  damage(point, causeEntity = null) {
    this.hp -= point;
    if (this.hp <= 0) {
      this.entity.killable.kill();
    } else if (this.hp > this.hpmax) {
      this.hp = this.hpmax;
    }

    if (point > 0) {
      let fromRadian = null;
      if (causeEntity) {
        fromRadian = causeEntity.physics.p
          .dup()
          .sub(this.entity.physics.p)
          .rad();
      }
      if (this.entity.damageEffect) {
        this.entity.damageEffect.getDamaged(fromRadian);
      }
    }
  }
}

export default {
  HitpointComponent,
};
