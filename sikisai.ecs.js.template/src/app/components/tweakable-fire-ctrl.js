import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
import weaponSpec from "./weapon-spec.js";
import equippable from "./equippable.js";
import profiler from "./profiler.js";

let performanceTable = {
  recruit: {
    moveNoiseFactor: 7.0,
    initialNoiseRadius: 64.0,
    convergenceFactor: 0.9,
  },
  novice: {
    moveNoiseFactor: 6.0,
    initialNoiseRadius: 64.0,
    convergenceFactor: 0.8,
  },
  hotshot: {
    moveNoiseFactor: 5.0,
    initialNoiseRadius: 64.0,
    convergenceFactor: 0.7,
  },
  lethal: {
    moveNoiseFactor: 5.0,
    initialNoiseRadius: 64.0,
    convergenceFactor: 0.6,
  },
};

class TweakableFireCtrlComponent extends Component {
  static registrationName() {
    return "fireCtrl";
  }

  constructor(entity, gadpt) {
    super(entity, killable.KillableComponent, physics.PhysicsComponent);

    this.gadpt = gadpt;

    this.invalidInterval = 180;
    this.updateInterval = 20;

    this.moveNoiseFactor = 5.0;
    this.initialNoiseRadius = 64.0;
    this.convergenceFactor = 0.7;

    this.setPerformance("hotshot");

    this.context = {};
    this.t = 0;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });

    // new Task(TaskPriorities.draw, (task) => {
    //   if (entity.killable.killed) {
    //     task.kill();
    //     return;
    //   }
    //   this.draw();
    // });
  }

  run() {
    this.t += 1;
  }

  setPerformance(id) {
    let pt = performanceTable[id];
    this.moveNoiseFactor = pt.moveNoiseFactor;
    this.initialNoiseRadius = pt.initialNoiseRadius;
    this.convergenceFactor = pt.convergenceFactor;
  }

  isUpdatable(id) {
    return this.t - this.context[id].updateT >= this.updateInterval;
  }

  isInvalid(id) {
    return this.t - this.context[id].invalidT > this.invalidInterval;
  }

  createNoiseVector(factor) {
    return v$(1.0, 0.0)
      .rotate(Math.random() * Math.PI * 2.0)
      .mult(this.initialNoiseRadius)
      .mult(factor);
  }

  convergeNoiseVector(noiseVec) {
    noiseVec.mult(this.convergenceFactor);
  }

  getContext(id, target) {
    let existingContext = this.context[id];
    if (
      !existingContext ||
      existingContext.target != target ||
      this.isInvalid(id)
    ) {
      this.context[id] = {
        target: target,
        noiseVec: this.createNoiseVector(1.0),
        updateT: -this.updateInterval,
        invalidT: this.t,
        last: null,
        lastVec: target.physics.v.dup(),
        relativeVec: null,
        tti: 0,
      };
    }
    return this.context[id];
  }

  aim(target, weapon, id) {
    let c = this.getContext(id, target);

    if (this.isUpdatable(id)) {
      c.updateT = this.t;
      c.invalidT = this.t;
      let moveNoise = target.physics.v
        .dup()
        .sub(c.lastVec.dup().mult(this.moveNoiseFactor));
      c.noiseVec.sub(moveNoise);
      c.lastVec = target.physics.v.dup();
      this.convergeNoiseVector(c.noiseVec);
      c.last = this._aim(target, weapon, id, c.noiseVec);
    }

    return c.last;
  }

  _aim(target, weapon, id, noiseVec) {
    profiler.ProfilerComponent.start("_aim");

    let phT = target.physics; // physics target
    let phE = this.entity.physics; // physics entity
    const spdP = weapon.weaponSpec.getProjectileSpeed(); // speed of projectile

    let velP = v$(1.0, 0.0).rotate(phE.r).mult(spdP).sub(phE.v); // velocity of projectile
    let vEtoT = phT.p.dup().sub(phE.p); // vector entity to target

    let tti;
    if (
      this.context[id].relativeVec != null &&
      this.context[id].relativeVec.dup().sub(vEtoT).norm2() < 16 ** 2
    ) {
      tti = this.context[id].tti;
    } else {
      let rvPtoT = velP.project(vEtoT); // relative velocity projectile to target
      let rspdPtoT = rvPtoT.norm(); // relative speed projectile to target
      tti = vEtoT.norm() / rspdPtoT; // time to impact

      // cache
      this.context[id].relativeVec = vEtoT.dup();
      this.context[id].tti = tti;
    }

    let fposT = phT.p.dup().add(phT.v.dup().mult(tti)); // future target position
    let posA = fposT.dup(); // position to aim point

    // Add noise
    posA.add(noiseVec);

    let vEtoA = posA.dup().sub(phE.p); // vector entity to aim point
    const rngW = weapon.weaponSpec.getMaxRange(); // weapon max range
    let radEtoA = vEtoA.rad();

    let result = {
      inRange: vEtoA.norm2() <= rngW ** 2,
      position: posA,
      rotation: radEtoA,
      rotationDiff: vector.Vector.raddiff(phE.r, radEtoA),
    };

    profiler.ProfilerComponent.stop("_aim");
    return result;
  }

  inRange(target, weapon) {
    return (
      target.physics.p.dup().sub(this.entity.physics.p).norm2() <=
      weapon.weaponSpec.getMaxRange() ** 2
    );
  }

  draw() {
    let ga = this.gadpt;

    for (let k in this.context) {
      let ctx = this.context[k];
      if (!this.isInvalid(k) && ctx.last) {
        let rs = ctx.last;

        let lp = rs.position;
        let p = this.entity.physics.p;
        ga.line(lp.x, lp.y, p.x, p.y, {
          strokeStyle: `rgba(255,50,50,0.5)`,
          fillStyle: `rgba(255,50,50,0.5)`,
          lineDash: [6, 6],
        });
        ga.rect(lp.x - 2, lp.y - 2, lp.x + 2, lp.y + 2, {
          strokeStyle: `rgba(255,50,50,0.5)`,
          fillStyle: `rgba(255,50,50,0.5)`,
        });
      }
    }
  }
}

export default {
  TweakableFireCtrlComponent,
};
