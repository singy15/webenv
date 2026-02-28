import vector from "/sikisai.js/core/vector.js";
const v$ = vector.Vector.$;

class PhysicsComponent {
  constructor(entity) {
    this.a = v$(0.0, 0.0);
    this.oa = v$(0.0, 0.0);
    this.p = v$(0.0, 0.0);
    this.op = v$(0.0, 0.0);
    this.v = v$(0.0, 0.0);
    this.ov = v$(0.0, 0.0);
    this.vdump = 0.0;
    this.g = v$(0.0, 0.0);
    this.r = 0.0;
    this.vr = 0.0;
    this.maxVelocity = 9999999.0;
  }

  // impulse(v) {
  //   this.v.add(v);
  // }

  // spin() {
  //   this.vr += v;
  // }

  // distanceTo(entity) {
  //   return this.entity.physics.p.dup().sub(entity.physics.p).norm();
  // }
}

export { PhysicsComponent };

export default {
  PhysicsComponent,
};
