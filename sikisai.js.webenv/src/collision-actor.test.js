import { describe, test, expect } from "vitest";
import collision from "./collision.js";
import collisionActor from "./collision-actor.js";
import actor from "./actor.js";

describe("collision-actor.js", () => {
  test("initialize", () => {
    let oa = new actor.Actor();
    let ca = new collisionActor.CollisionActor("circle", oa);
    expect(ca).not.toBe(null);
    expect(ca.model).toBe("circle");
    expect(ca.obj).toBe(oa);
  });

  

  test("isCollideWith - actor vs someobject", () => {
    let oa = new actor.Actor(null, null, null, null);
    oa.radius = 5.0;
    oa.p.x = 0.0;
    oa.p.y = 0.0;
    let ca = new collisionActor.CollisionActor("circle", oa);

    let ob = { x: 12.0, y: 0.0, radius: 5.0 };
    let cb = new collision.Collision("circle", ob);

    expect(ca.isCollideWith(cb)).toBe(false);

    ob.x = 10.0;
    expect(ca.isCollideWith(cb)).toBe(true);

    ob.x = 9.9;
    expect(ca.isCollideWith(cb)).toBe(true);

    ob.x = 0.0;
    expect(ca.isCollideWith(cb)).toBe(true);
  });
});
