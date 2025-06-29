import component from "./component.js";
import task from "./task.js";
import vector from "./vector.js";
import list from "./list.js";
let v$ = vector.Vector.$;
const Component = component.Component;

class Char {
  constructor() {}
}

class KillableComponent extends Component {
  constructor(entity) {
    super(entity);
    this.killed = false;
  }

  kill() {
    this.killed = true;
  }
}

class KillTimerComponent extends Component {
  constructor(entity, tmax) {
    super(entity);
    this.tmax = tmax;
    this.t = 0;

    new task.Task(task.TaskPriorities.update, (task) => {
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
}


class PhysicsComponent extends Component {
  constructor(entity, opts = {}) {
    super(entity);
    this.p = v$(0.0, 0.0);
    this.v = v$(0.0, 0.0);
    this.vdump = opts.vdump ?? 0.0;

    new task.Task(task.TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let p = this.p;
    let v = this.v;
    v.sub(v.dup().mult(this.vdump));
    p.add(v);
  }
}

class InputComponent extends Component {
  constructor(entity, iadpt) {
    super(entity);
    this.iadpt = iadpt;
  }

  keydown(code) {
    return this.iadpt.keydown(code);
  }

  keypush(code) {
    return this.iadpt.keypush(code);
  }
}

class MovementComponent extends Component {
  constructor(entity) {
    super(entity, InputComponent);
    this.speed = 0.1;
    new task.Task(task.TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    if (this.entity.input) {
      if (this.entity.input.keydown(87)) {
        this.entity.position.v.add(v$(0.0, -this.speed));
      }
      if (this.entity.input.keydown(83)) {
        this.entity.position.v.add(v$(0.0, +this.speed));
      }
      if (this.entity.input.keydown(65)) {
        this.entity.position.v.add(v$(-this.speed, 0.0));
      }
      if (this.entity.input.keydown(68)) {
        this.entity.position.v.add(v$(this.speed, 0.0));
      }
    }
  }
}

class DrawComponent extends Component {
  constructor(entity, gadpt, image, region) {
    super(entity, PositionComponent);
    this.gadpt = gadpt;
    this.image = image;
    this.region = region;
    new task.Task(task.TaskPriorities.draw, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let g = this.gadpt;
    let p = this.entity.position.p;
    // g.arc(p.x, p.y, 16.0, {
    //   fillStyle: `rgba(255,255,255,1.0)`,
    // });
    let r = this.region;
    g.draw(this.image, Math.round(p.x), Math.round(p.y), {
      sx: r.sx,
      sy: r.sy,
      swidth: r.swidth,
      sheight: r.sheight,
      smoothig: r.smoothing,
      globalAlpha: r.globalAlpha,
      scaleX: r.scaleX,
      scaleY: r.scaleY,
    });
  }
}

class DrawCollisionLightComponent extends Component {
  constructor(entity, gadpt, position) {
    super(entity);
    this.gadpt = gadpt;
    this.position = position;
    this.t = 0;
    new task.Task(task.TaskPriorities.draw - 20, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let g = this.gadpt;
    let p = this.entity.position.p;
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

class SpawnComponent extends Component {
  constructor(entity, scene, interval, spawnFn) {
    super(entity);
    this.scene = scene;
    this.interval = interval;
    this.t = 0;
    this.spawnFn = spawnFn;
    new task.Task(task.TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    this.t++;
    if (this.t >= this.interval) {
      this.spawnFn(this.scene, this.entity);
      this.t = 0;
    }
  }
}

class DrawTrail extends Component {
  constructor(entity) {
    super(entity, PositionComponent);
  }
}

class RandomMoveComponent extends Component {
  constructor(entity, interval = 60, spd = 3.0) {
    super(entity, PositionComponent);
    this.t = 0;
    this.tmax = interval;
    this.tx = 0;
    this.ty = 0;
    this.interval = interval;
    this.spd = spd;
    this.phase = 1; // 1: stop, 2: move
    new task.Task(task.TaskPriorities.update, (task) => {
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
      this.t = 0;
      this.phase = this.phase === 1 ? 2 : 1;
      let p = this.entity.position.p;
      let v = this.entity.position.v;
      if (this.phase === 2) {
        let d = Math.random() * Math.PI * 2.0;
        let spd = this.spd;
        v.val(Math.cos(d) * spd, Math.sin(d) * spd);
      } else {
        v.val(0.0, 0.0);
      }
    }
  }
}

class BoundaryComponent extends Component {
  constructor(entity, gadpt) {
    super(entity, PositionComponent);
    this.gadpt = gadpt;
    new task.Task(task.TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  run() {
    let p = this.entity.position.p;
    let v = this.entity.position.v;
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
  Char: Char,
  PositionComponent: PositionComponent,
  MovementComponent: MovementComponent,
  InputComponent: InputComponent,
  DrawComponent: DrawComponent,
  PhysicsComponent: PhysicsComponent,
  KillableComponent: KillableComponent,
  KillTimerComponent: KillTimerComponent,
  SpawnComponent: SpawnComponent,
  DrawCollisionLightComponent: DrawCollisionLightComponent,
  RandomMoveComponent: RandomMoveComponent,
  BoundaryComponent: BoundaryComponent,
};
