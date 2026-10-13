import component from "./component.js";
const Component = component.Component;
import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
import vector from "../vector.js";
const v$ = vector.Vector.$;
import killable from "./killable.js";
import physics from "./physics.js";
import input from "./input.js";
import mobilitySpec from "./mobility-spec.js";
import drawSpin from "./draw-spin.js";
import char from "../char.js";
import imageRepository from "../image-repository.js";
import killTimer from "./kill-timer.js";
// import createPlayerBullet from "../tasks/create-player-bullet.js";

class MissileControlComponent extends Component {
  constructor(entity, gadpt, opts = {}) {
    super(
      entity,
      killable.KillableComponent,
      physics.PhysicsComponent,
      mobilitySpec.MobilitySpecComponent,
    );

    this.gadpt = gadpt;
    this.waypoint = v$(entity.physics.x, entity.physics.y);
    this.target = null;
    this.mode = "dryrun"; // pursuit, firing, dryrun
    this.dryrunTime = opts.dryrunTime ?? 0;

    new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
        return;
      }
      this.run();
    });
  }

  think() {
    if (this.mode === "dryrun") {
      this.dryrunTime--;
      if(this.dryrunTime <= 0) {
        this.mode = "wait";
        return;
      } else {
        this.mode = "dryrun";
        return;
      }
    }

    if (!this.target) {
      this.mode = "wait";
      return;
    }

    let phys = this.entity.physics;

    //  /*
    //      -y
    //
    //  -x  o> ---> t +x

    //      +y
    //  */
    //}

    let tp = this.target.physics.p;
    this.waypoint.val(tp.x, tp.y);
    let lv = this.waypoint.toLocal(phys.p, phys.r);

    if (lv.y > 1.0) {
      this.mode = "pursuit";
      return;
    } else if (lv.y < -1.0) {
      this.mode = "pursuit";
      return;
    }

    this.mode = "pursuit";

    return;
  }

  pursuit() {
    let phys = this.entity.physics;
    //    toLocal(pOrigin, theta) {
    //  /*
    //      -y
    //
    //  -x  o> ---> t +x

    //      +y
    //  */
    //  let v = this.clone().sub(pOrigin);
    //  let lx = v.x * Math.cos(-theta) - v.y * Math.sin(-theta);
    //  let ly = v.x * Math.sin(-theta) + v.y * Math.cos(-theta);
    //  v.x = lx;
    //  v.y = ly;
    //  return v;
    //}

    if (!this.target) {
      return;
    }

    let tp = this.target.physics.p;
    this.waypoint.val(tp.x, tp.y);

    let lv = this.waypoint.toLocal(phys.p, phys.r);

    let rotSpeed = this.entity.mobilitySpec.getRotationSpeed();
    let topSpeed = this.entity.mobilitySpec.getTopSpeed();
    phys.vdump = this.entity.mobilitySpec.getInertialDump();

    if (lv.y > 1.0) {
      phys.r += rotSpeed;
    } else if (lv.y < -1.0) {
      phys.r -= rotSpeed;
    }

    let acc = this.entity.mobilitySpec.getAcceleration();
    let av = v$(Math.cos(phys.r), Math.sin(phys.r)).mult(acc);
    phys.v.add(av);

    if (phys.v.norm() > topSpeed) {
      phys.v.normalize().mult(topSpeed);
    }
  }

  firing() {
    let tp = this.target.physics.p;
    let c = this.entity;
    let maingun = this.entity.equip.getById("main");
    if (maingun.recharge.ready()) {
      // aadpt.playSound("sndLblaster", { gain: 0.1 });
      // console.log(1);
      maingun.recharge.empty();
      let t = this.spawnBlaster();
      t.physics.p.setn(c.physics.p);
      let r = Math.random() * Math.PI * 2.0;
      let rv = v$(1.0, 0.0)
        .rotate(r)
        .mult(Math.random() * 32.0);
      let vp = tp.dup();
      // vp.add(rv);
      let spd = 20.0;
      // let vv = vp.dup().sub(c.physics.p).normalize().mult(spd);
      let d = vp.dup().sub(t.physics.p).norm();
      //t.physics.r = vv.rad();
      //t.physics.v.setn(vv);
      let uv = v$(1.0, 0.0).rotate(c.physics.r).mult(spd);
      t.physics.v.setn(uv);
      t.physics.r = c.physics.r;
      t.killTimer.setTimer(Math.ceil(d / spd));
    }
  }

  action() {
    if (this.mode === "wait") {
      //this.entity.physics.v.mult(0.8);
    }
    if (this.mode === "pursuit") {
      this.pursuit();
    }
    if (this.mode === "firing") {
      this.firing();
    }
  }

  run() {
    this.think();
    this.action();
  }

  setTarget(target) {
    this.target = target;
  }
}

export default {
  MissileControlComponent,
};
