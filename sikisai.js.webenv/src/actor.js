import masspoint from "./masspoint.js";
import uuid4 from "./uuid4.js";

/*
  // Example: a simple character.

  import actor from "./Actor.js";

  class Foo extends actor.Actor {
    constructor() {
      super();
      // Some initialize process ...
    }

    update() {
      super.update();
      // Some update process ...
    }

    draw() {
      // Some draw process ...
    }
  }
*/

class Actor {
  constructor() {
    this.p = new masspoint.Masspoint();
    this.killed = false;
    this.ctrl = null;
    this.oid = uuid4.genUuid4();
    this.faction = null;
    this.collision = null;
    this.radius = 0.0;
  }

  belongs(faction) {
    this.faction = faction;
  }

  update() {
    this.p.update();
  }

  draw() {}

  kill() {
    this.onKilled();
    this.killed = true;
  }

  onKilled() {}

  distanceTo(x, y) {
    return Math.sqrt((x - this.p.x) ** 2.0 + (y - this.p.y) ** 2.0);
  }

  distance(another) {
    return this.distanceTo(another.p.x, another.p.y);
  }

  toRad(deg) {
    return deg / (180 / Math.PI);
  }

  toDeg(rad) {
    return rad * (180 / Math.PI);
  }

  normal(x, y) {
    return Math.sqrt(x ** 2.0 + y ** 2.0);
  }

  turnDirection(tx, ty, x, y, a) {
    let deg = a * (180 / Math.PI);
    let tdeg = Math.atan2(y - ty, x - tx);

    tdeg = tdeg * (180 / Math.PI);
    deg = deg % 360;

    let delta = tdeg - deg;

    if (delta > 180) {
      delta -= 360;
    } else if (delta < -180) {
      delta += 360;
    }

    return { delta: delta, direction: delta > 0 ? -1 : 1 };
  }

  calcRotation(tx, ty, x, y, a) {
    let targetAngle = Math.atan2(ty - y, tx - x);

    a = a % (2 * Math.PI);
    if (a < 0) a += 2 * Math.PI;

    targetAngle = targetAngle % (2 * Math.PI);
    if (targetAngle < 0) targetAngle += 2 * Math.PI;

    let rotation = targetAngle - a;

    if (rotation > Math.PI) {
      rotation -= 2 * Math.PI;
    } else if (rotation < -Math.PI) {
      rotation += 2 * Math.PI;
    }

    return rotation;
  }

  faceto(x, y, delta) {
    let ta = Math.atan2(y - this.p.y, x - this.p.x);
    let rot = this.calcRotation(x, y, this.p.x, this.p.y, this.p.a);
    if (Math.abs(rot) < delta) {
      this.p.a = ta;
      return 0;
    } else {
      this.p.a += rot > 0.0 ? delta : -delta;
      return rot > 0.0 ? 1 : -1;
    }
  }

  calcETASimulation(
    distance,
    acceleration,
    resistance,
    velocity,
    errorTolerance,
    maximumIteration,
  ) {
    let d = distance;
    let a = acceleration;
    let k = resistance;
    let v = velocity;
    let m = maximumIteration;
    let e = errorTolerance;

    let t = 0;
    let i = 0;
    let x = 0.0;
    while (i < m) {
      if (Math.abs(d - x) < e) {
        return t;
      }

      v = v + (a - k * v);
      x = x + v;

      t++;
      i++;
    }

    return NaN;
  }

  calcETANewton(
    distance,
    acceleration,
    resistance,
    initialVelocity,
    errorTolerance,
    maximumIteration,
  ) {
    let d = distance;
    let a = acceleration;
    let k = resistance;
    let v0 = initialVelocity;
    let e = errorTolerance;
    let m = maximumIteration;
    let f = (a, k, t) =>
      (a / k) * (t + (1.0 - Math.E ** (-k * t)) / k) +
      (v0 / k) * (1.0 - Math.E ** (-k * t)) -
      d;
    let df = (a, k, t) =>
      (a / k) * (1.0 - Math.E ** (-k * t)) + v0 * Math.E ** (-k * t);
    let t = 2.0;
    let t2;
    let i = 0;

    while (i < m) {
      let f1 = f(a, k, t);
      let f2 = df(a, k, t);
      t2 = t - f1 / f2;
      if (Math.abs(t2 - t) < e) {
        return t;
      }
      t = t2;
      i++;
    }

    return NaN;
  }

  mpos() {
    let p = this.p;
    return [Math.floor(p.x / 64.0), Math.floor(p.y / 64.0)];
  }

  isCollideWith(another) {
    return this.collision.isCollideWith(another.collision);
  }
}

export default {
  Actor: Actor,
};
