import { describe, test, expect } from "vitest";
import actor from "./actor.js";
import collisionActor from "./collision-actor.js";

describe("actor.js", () => {
  test("initialize", () => {
    let a = new actor.Actor();
    expect(a).not.toBe(null);
    expect(a.p).not.toBe(null);
    expect(a.killed).toBe(false);
    expect(a.ctrl).toBe(null);
    expect(a.oid).not.toBe(null);
    expect(a.faction).toBe(null);
    expect(a.collision).toBe(null);
    expect(a.radius).toBe(0.0);
  });

  test("test collision check", () => {
    let a1 = new actor.Actor();
    a1.collision = new collisionActor.CollisionActor("circle", a1);
    a1.p.x = 0.0;
    a1.radius = 5.0;

    let a2 = new actor.Actor();
    a2.collision = new collisionActor.CollisionActor("circle", a2);
    a2.p.x = 10.0;
    a2.radius = 5.0;

    expect(a1.isCollideWith(a2)).toBe(true);
  });
});
