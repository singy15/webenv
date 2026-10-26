import { Registry } from "../../../sikisai.js/core/ecs.ts";
import { PhysicsComponent } from "../components/physics.ts";
import { DownwardTriggerComponent } from "../components/downward-trigger.js";

export function updatePhysics(registry: Registry) {
  for (let q of registry.query(false, PhysicsComponent) as any) {
    const [ph] = q.array(q.id, PhysicsComponent) as [PhysicsComponent];
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
  for (let q of registry.query(false, DownwardTriggerComponent, PhysicsComponent)) {
    const [downward, physics] = q.array() as [any, PhysicsComponent];
    if (downward.onTrigger && physics.v.y > 0) {
      downward.onTrigger(q.id, registry);
      downward.onTrigger = null;
    }
  }
}
