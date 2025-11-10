import mathUtil from "./math-util.js";

class Masspoint {
  constructor() {
    this.px = 0.0;
    this.py = 0.0;
    this.pa = 0.0;

    this.pdx = 0.0;
    this.pdy = 0.0;
    this.pda = 0.0;

    this.x = 0.0;
    this.y = 0.0;
    this.a = 0.0;

    this.dx = 0.0;
    this.dy = 0.0;
    this.da = 0.0;

    this.ddx = 0.0;
    this.ddy = 0.0;
    this.dda = 0.0;

    this.dump = 0.0;
  }

  update() {
    this.px = this.x;
    this.py = this.y;
    this.pa = this.a;

    this.pdx = this.dx;
    this.pdy = this.dy;
    this.pda = this.da;

    this.da += this.dda;

    this.dx += this.ddx - this.dump * this.dx;
    this.dy += this.ddy - this.dump * this.dy;

    this.a += this.da;
    this.x += this.dx;
    this.y += this.dy;
  }

  normVel() {
    return Math.sqrt(this.dx ** 2.0 + this.dy ** 2.0);
  }

  normAcc() {
    return Math.sqrt(this.ddx ** 2.0 + this.ddy ** 2.0);
  }

  actualNormVel() {
    return Math.sqrt((this.px - this.x) ** 2.0 + (this.py - this.y) ** 2.0);
  }

  angleVelocity() {
    return Math.atan2(this.dy, this.dx);
  }

  actualAngleVelocity() {
    return Math.atan2(this.py - this.x, this.px - this.y);
  }

  normVelocity() {
    return Math.sqrt(this.dx ** 2.0 + this.dy ** 2.0);
  }

  actualNormVelocity() {
    return Math.sqrt((this.pdx - this.dx) ** 2.0 + (this.pdy - this.dy) ** 2.0);
  }

  distance(b) {
    let a = this;
    return Math.sqrt((a.x - b.x) ** 2.0 + (a.y - b.y) ** 2.0);
  }

  static clone(a) {
    let c = new Masspoint();
    c.px = a.px;
    c.py = a.py;
    c.pa = a.pa;
    c.pdx = a.pdx;
    c.pdy = a.pdy;
    c.pda = a.pda;
    c.x = a.x;
    c.y = a.y;
    c.a = a.a;
    c.dx = a.dx;
    c.dy = a.dy;
    c.da = a.da;
    c.ddx = a.ddx;
    c.ddy = a.ddy;
    c.dda = a.dda;
    c.dump = a.dump;
    return c;
  }

  isCollisionCourse(ob, frames, skipFn) {
    let a = Masspoint.clone(this);
    let b = Masspoint.clone(ob);

    for (let i = 0; i < frames; i++) {
      let p1 = { x: a.px, y: a.py };
      let q1 = { x: a.x, y: a.y };
      let p2 = { x: b.px, y: b.py };
      let q2 = { x: b.x, y: b.y };
      let intersect = mathUtil.MathUtil.intersect(p1, q1, p2, q2);
      if (intersect) {
        return { collision: true, frameAfter: i, skipped: false };
      }
      if (skipFn) {
        let result = skipFn(a, b);
        if (result === true) {
          return { collision: result, frameAfter: i, skipped: true };
        } else if (result === false) {
          return { collision: result, frameAfter: -1, skipped: true };
        }
      }

      a.update();
      b.update();
    }

    return { collision: false, frameAfter: -1, skipped: false };
  }
}

export default {
  Masspoint: Masspoint,
};
