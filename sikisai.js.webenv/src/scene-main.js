import scene from "./scene.js";
import list from "./list.js";
import fw from "./fireworks.js";
import task from "./tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const TaskManager = task.TaskManager;
import clearScreen from "./tasks/clear-screen.js";
import killable from "./components/killable.js";
import killTimer from "./components/kill-timer.js";
import physics from "./components/physics.js";
import interval from "./components/interval.js";
import downTrigger from "./components/down-trigger.js";
import drawTrail from "./components/draw-trail.js";

class SceneMain extends scene.Scene {
  constructor(gadpt, iadpt, fpsc, aadpt) {
    super();
    this.gadpt = gadpt;
    this.iadpt = iadpt;
    this.fpsc = fpsc;
    this.aadpt = aadpt;
    this.fireworks = new list.List();
  }

  init() {
    super.init();

    new clearScreen.TaskClearScreen(this.gadpt);

    let createFireworks = () => {
      let f = new fw.Fireworks();
      new killable.KillableComponent(f);
      new killTimer.KillTimerComponent(f, 600);
      new physics.PhysicsComponent(f);
      new drawTrail.DrawTrailComponent(f, this.gadpt);
      f.physics.g.val(0.0, 0.05);
      f.physics.vdump = 0.01;
      return f;
    };

    let createBurst = (parent, n, offset, speed, r = 255, g = 255, b = 255) => {
      let p = parent.physics.p;
      let pt = (Math.PI * 2.0) / n;
      for (let i = 0; i < n; i++) {
        let a = pt * i + offset;
        let s = createFireworks();
        s.killTimer.setTimer(60);
        s.physics.p.x = p.x;
        s.physics.p.y = p.y;
        s.physics.op.x = p.x;
        s.physics.op.y = p.y;
        s.physics.v.x = Math.cos(a) * speed;
        s.physics.v.y = Math.sin(a) * speed;
        s.physics.vdump = 0.05;
        s.physics.g.y = 0.01;
        s.drawTrail.setColor(r, g, b);
      }
    };

    let hsvToRgb = (h, s, v) => {
      let r, g, b;

      let i = Math.floor(h * 6);
      let f = h * 6 - i;
      let p = v * (1 - s);
      let q = v * (1 - f * s);
      let t = v * (1 - (1 - f) * s);

      switch (i % 6) {
        case 0:
          (r = v), (g = t), (b = p);
          break;
        case 1:
          (r = q), (g = v), (b = p);
          break;
        case 2:
          (r = p), (g = v), (b = t);
          break;
        case 3:
          (r = p), (g = q), (b = v);
          break;
        case 4:
          (r = t), (g = p), (b = v);
          break;
        case 5:
          (r = v), (g = p), (b = q);
          break;
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    };

    //// spawner
    let spawner = new fw.FireworksSpawner();
    new killable.KillableComponent(spawner);
    new interval.IntervalComponent(spawner, () => {
      let f = createFireworks();
      new downTrigger.DownTriggerComponent(f, () => {
        let r = Math.random() * Math.PI * 2.0;
        let c = hsvToRgb(Math.random(), 1.0, 1.0);
        createBurst(f, 17, r + 0.0, 5.0, c.r, c.g, c.b);
        createBurst(f, 9, r + 0.2, 4.0, c.r, c.g, c.b);
        createBurst(f, 7, r + 0.3, 3.0, c.r, c.g, c.b);
        createBurst(f, 5, r + 0.4, 2.0, c.r, c.g, c.b);
      });

      f.physics.p.val(250.0, 450.0);
      f.physics.op.val(250.0, 450.0);
      f.physics.v.val(Math.random() * 3.0 - 1.5, -8.0 + Math.random() * 3.0 - 1.5);
      f.physics.g.val(0.0, 0.05);
      f.physics.vdump = 0.01;
      f.drawTrail.setMaxTrails(10);
    });

    spawner.interval.setInterval(60);
  }

  update() {
    let iadpt = this.iadpt;

    super.update();

    for (let i = 0; i < this.fpsc.updateFrames; i++) {
      this.tick();
    }

    if (iadpt.keypush(/*esc*/ 27)) {
      return new sceneMain.SceneMain(
        this.gadpt,
        this.iadpt,
        this.fpsc,
        this.aadpt,
      );
    }
  }

  tick() {
    let iadpt = this.iadpt;

    TaskManager.runAll();

    if (iadpt.keypush(/*z*/ 90)) {
      // noop
    }

    if (iadpt.mousedown(1)) {
      // noop
    }

    if (iadpt.keydown(32)) {
      // noop
    }
  }

  // moveCamera() {
  //   let iadpt = this.iadpt;
  //   let camspd = iadpt.keydown(32) ? 45.0 : 15.0;
  //   if (iadpt.keydown(87)) {
  //     this.gadpt.moveCamera(0, -camspd);
  //   }
  //   if (iadpt.keydown(83)) {
  //     this.gadpt.moveCamera(0, camspd);
  //   }
  //   if (iadpt.keydown(65)) {
  //     this.gadpt.moveCamera(-camspd, 0);
  //   }
  //   if (iadpt.keydown(68)) {
  //     this.gadpt.moveCamera(camspd, 0);
  //   }
  // }

  draw() {
    let gadpt = this.gadpt;
    let iadpt = this.iadpt;

    //// alternative
    // for (let i = as.iter("default"), e = i.begin(); e; e = i.next()) {
    //   e.draw();
    // }
  }
}

export default {
  SceneMain: SceneMain,
};
