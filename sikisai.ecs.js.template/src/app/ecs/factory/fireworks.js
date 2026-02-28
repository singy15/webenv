// import vector from "/sikisai.js/core/vector.js";
// const v$ = vector.Vector.$;
// import char from "../entities/char.js";
// import killable from "../components/killable.js";
// import physics from "../components/physics.js";
import { PhysicsComponent } from "../components/physics.js";
import { SparkComponent } from "../components/spark.js";
import { TimerComponent } from "../components/timer.js";
import { DownwardTriggerComponent } from "../components/downward-trigger.js";
// import drawFlame from "../components/draw-flame.js";
// import drawTrail from "../components/draw-trail.js";
// import gravity from "../components/gravity.js";
// import killTimer from "../components/kill-timer.js";
// import interval from "../components/interval.js";
// import flameColor from "../components/flame-color.js";

function spawnParticle(registry) {
  return registry
    .deferCreateEntity(
      new SparkComponent(),
      new PhysicsComponent(),
      new TimerComponent(),
    )
    .after((e) => {
      const physics = registry.getComponent(e, PhysicsComponent);
      physics.vdump = 0.03;
      physics.g.val(0, 0.005);

      const timer = registry.getComponent(e, TimerComponent);
      timer.tmax = 60 * 5 + Math.random() * 30;
      timer.onTrigger = (entity, registry) => {
        registry.deferDeleteEntity(entity);
      };
    });

  // let c = new char.Char();
  // new killable.KillableComponent(c);
  // new physics.PhysicsComponent(c);
  // c.physics.vdump = 0.03;
  // new gravity.GravityComponent(c, 0.005);
  // new killTimer.KillTimerComponent(c, 300);
  // new flameColor.FlameColorComponent(c, gadpt);
  // new drawFlame.DrawFlameComponent(c, gadpt);
  // new drawTrail.DrawTrailComponent(c, gadpt);
  // return c;
  // return e;
}

function spawnBurst(registry, x, y) {
  const layers = [
    { count: 15, offset: Math.random() * Math.PI, speed: 3.0 },
    { count: 11, offset: Math.random() * Math.PI, speed: 1.7 },
    { count: 9, offset: Math.random() * Math.PI, speed: 1.0 },
  ];
  for (const layer of layers) {
    const n = layer.count;
    for (let i = 0; i < n; i++) {
      spawnParticle(registry).after((e, reg) => {
        const physics = reg.getComponent(e, PhysicsComponent);
        physics.p.val(x, y);
        physics.v
          .val(layer.speed, 0.0)
          .rotate(((Math.PI * 2) / n) * i + layer.offset);
      });
    }
  }
}

export function spawnProjector(registry, vPos, vVel) {
  return registry
    .deferCreateEntity(
      new SparkComponent(),
      new PhysicsComponent(),
      new TimerComponent(),
      new DownwardTriggerComponent(),
    )
    .after((e) => {
      const physics = registry.getComponent(e, PhysicsComponent);
      physics.p.setn(vPos);
      physics.v.setn(vVel);
      physics.vdump = 0.01;
      physics.g.val(0, 0.005);

      const downwardTrigger = registry.getComponent(
        e,
        DownwardTriggerComponent,
      );
      downwardTrigger.onTrigger = (entity, registry) => {
        registry.deferDeleteEntity(entity);
        spawnBurst(registry, physics.p.x, physics.p.y);
      };
    });
}

// function spawnClusterParticle(gadpt, n, x, y) {
//   let ps = [];
//   for (let i = 0; i < n; i++) {
//     let c = new spawnParticle(gadpt);
//     c.killTimer.setTimer(c.killTimer.tmax + Math.floor(Math.random() * 30));
//     c.physics.p.setn(v$(x, y));
//     c.physics.v.setn(v$(1.0, 0.0).rotate(((Math.PI * 2.0) / n) * i));
//     ps.push(c);
//   }
//   return ps;
// }

// function spawnSimple1(gadpt, size = 1.0) {
//   let hue = Math.random() * 365;
//   let p = spawnParticle(gadpt);
//   p.flameColor.setColorHSV(hue, 0.8, 1.0);
//   p.physics.vdump = 0.02;
//   p.killTimer.setTimer(180);
//   p.killable.onKilled = () => {
//     let ph = p.physics;
//     let ps0 = spawnClusterParticle(gadpt, 7, ph.p.x, ph.p.y);
//     ps0.forEach((p) => {
//       p.physics.v.mult(size * 0.5);
//       p.flameColor.setColorHSV(hue, 1.0, 1.0);
//     });
//     let ps1 = spawnClusterParticle(gadpt, 8, ph.p.x, ph.p.y);
//     ps1.forEach((p) => {
//       p.physics.v.mult(size * 1.0);
//       p.flameColor.setColorHSV(hue, 1.0, 1.0);
//     });
//     let ps2 = spawnClusterParticle(gadpt, 13, ph.p.x, ph.p.y);
//     ps2.forEach((p) => {
//       p.physics.v.mult(size * 2.0);
//       p.flameColor.setColorHSV(hue, 1.0, 1.0);
//     });
//     let ps3 = spawnClusterParticle(gadpt, 18, ph.p.x, ph.p.y);
//     ps3.forEach((p) => {
//       p.physics.v.mult(size * 3.0);
//       p.flameColor.setColorHSV(hue, 1.0, 1.0);
//     });
//   };
//   return p;
// }

// function spawnSpawnerSimple1(gadpt) {
//   let c = new char.Char();
//   new killable.KillableComponent(c);
//   new interval.IntervalComponent(c, () => {
//     let c1 = spawnSimple1(gadpt, 1.0 + (Math.random() - 0.5) * 0.5);
//     c1.physics.p.x = gadpt.width() / 2;
//     c1.physics.p.y = gadpt.height();
//     c1.physics.v.y = -8.0 + 3.0 * (Math.random() - 0.5);
//     c1.physics.v.x = (Math.random() - 0.5) * 6.0;
//   });
//   return c;
// }

export {
  spawnParticle,
  spawnBurst,
  // spawnSimple1,
  // , spawnSpawnerSimple1
};

// export default {
//   spawnSimple1,
//   spawnSpawnerSimple1,
// };
