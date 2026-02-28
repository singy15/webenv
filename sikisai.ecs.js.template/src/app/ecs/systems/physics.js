import { PhysicsComponent } from "../components/physics.js";
import { DownwardTriggerComponent } from "../components/downward-trigger.js";

export function updatePhysics(registry) {
  for (let entity of registry.query(false, PhysicsComponent)) {
    const ph = registry.getComponent(entity, PhysicsComponent);
    let a = ph.a;
    let p = ph.p;
    let v = ph.v;
    ph.oa = ph.a.dup();
    ph.op = ph.p.dup();
    ph.ov = ph.v.dup();
    v.add(a);
    v.add(ph.g);
    v.clampSqr(ph.maxVelocity);
    v.sub(v.dup().mult(ph.vdump));
    p.add(v);
    a.val(0.0, 0.0);
    ph.r = ph.r + ph.vr;
  }
}

export function downwardTrigger(registry) {
  for (let e of registry.query(false, DownwardTriggerComponent)) {
    const downwardTrigger = registry.getComponent(e, DownwardTriggerComponent);
    const physics = registry.getComponent(e, PhysicsComponent);
    if (downwardTrigger.onTrigger && physics.v.y > 0) {
      downwardTrigger.onTrigger(e, registry);
      downwardTrigger.onTrigger = null;
    }
  }
}
