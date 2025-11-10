import { describe, test, expect } from "vitest";
import masspoint from "./masspoint.js";

describe("masspoint.js", () => {
  test("test - new", () => {
    let p = new masspoint.Masspoint();
    expect(p.px).toBe(0.0);
    expect(p.py).toBe(0.0);
    expect(p.pa).toBe(0.0);
    expect(p.pdx).toBe(0.0);
    expect(p.pdy).toBe(0.0);
    expect(p.pda).toBe(0.0);
    expect(p.x).toBe(0.0);
    expect(p.y).toBe(0.0);
    expect(p.a).toBe(0.0);
    expect(p.dx).toBe(0.0);
    expect(p.dy).toBe(0.0);
    expect(p.da).toBe(0.0);
    expect(p.ddx).toBe(0.0);
    expect(p.ddy).toBe(0.0);
    expect(p.dda).toBe(0.0);
    expect(p.dump).toBe(0.0);
  });

  test("test - update", () => {
    let p = new masspoint.Masspoint();
    p.ddx = 1.0;
    p.ddy = 1.0;
    p.dda = 1.0;
    p.update();
    p.update();
    expect(p.pdx).toBe(1.0);
    expect(p.pdy).toBe(1.0);
    expect(p.pda).toBe(1.0);
    expect(p.ddx).toBe(1.0);
    expect(p.dx).toBe(2.0);
    expect(p.x).toBe(3.0);
    expect(p.ddy).toBe(1.0);
    expect(p.dy).toBe(2.0);
    expect(p.y).toBe(3.0);
    expect(p.dda).toBe(1.0);
    expect(p.da).toBe(2.0);
    expect(p.a).toBe(3.0);
  });

  test("test - normVel", () => {
    let p = new masspoint.Masspoint();
    p.dx = 1.0;
    p.dy = 1.0;
    expect(p.normVel()).toBe(Math.sqrt(1.0 ** 2.0 + 1.0 ** 2.0));
  });

  test("test - normAcc", () => {
    let p = new masspoint.Masspoint();
    p.ddx = 1.0;
    p.ddy = 1.0;
    expect(p.normAcc()).toBe(Math.sqrt(1.0 ** 2.0 + 1.0 ** 2.0));
  });

  test("test - actualNormVel", () => {
    let p = new masspoint.Masspoint();
    p.x = 1.0;
    p.y = 1.0;
    p.px = 0.0;
    p.py = 0.0;
    expect(p.actualNormVel()).toBe(Math.sqrt(1.0 ** 2.0 + 1.0 ** 2.0));
  });

  test("clone", () => {
    let a = new masspoint.Masspoint();
    a.px = {};
    a.py = {};
    a.pa = {};
    a.pdx = {};
    a.pdy = {};
    a.pda = {};
    a.x = {};
    a.y = {};
    a.a = {};
    a.dx = {};
    a.dy = {};
    a.da = {};
    a.ddx = {};
    a.ddy = {};
    a.dda = {};
    a.dump = {};

    let b = masspoint.Masspoint.clone(a);
    expect(a.px).toBe(b.px);
    expect(a.py).toBe(b.py);
    expect(a.pa).toBe(b.pa);
    expect(a.pdx).toBe(b.pdx);
    expect(a.pdy).toBe(b.pdy);
    expect(a.pda).toBe(b.pda);
    expect(a.x).toBe(b.x);
    expect(a.y).toBe(b.y);
    expect(a.a).toBe(b.a);
    expect(a.dx).toBe(b.dx);
    expect(a.dy).toBe(b.dy);
    expect(a.da).toBe(b.da);
    expect(a.ddx).toBe(b.ddx);
    expect(a.ddy).toBe(b.ddy);
    expect(a.dda).toBe(b.dda);
    expect(a.dump).toBe(b.dump);
  });

  test("isCollisionCourse", () => {
    let a = new masspoint.Masspoint();
    let b = new masspoint.Masspoint();

    a.x = 0.0;
    a.y = 0.0;
    a.px = 0.0;
    a.py = 0.0;
    a.dx = 5.0;
    a.dy = 5.0;

    b.x = 0.0;
    b.y = 5.0;
    b.px = 0.0;
    b.py = 5.0;
    b.dx = 5.0;
    b.dy = -5.0;

    expect(a.isCollisionCourse(b, 10)).toStrictEqual({
      collision: true,
      frameAfter: 1,
      skipped: false,
    });
  });

  test("isCollisionCourse - no intersection", () => {
    let a = new masspoint.Masspoint();
    let b = new masspoint.Masspoint();

    a.x = 0.0;
    a.y = 0.0;
    a.px = 0.0;
    a.py = 0.0;
    a.dx = 1.0;
    a.dy = 0.0;

    b.x = 0.0;
    b.y = 10.0;
    b.px = 0.0;
    b.py = 10.0;
    b.dx = 1.0;
    b.dy = 0.0;

    expect(a.isCollisionCourse(b, 10)).toStrictEqual({
      collision: false,
      frameAfter: -1,
      skipped: false,
    });
  });

  test("isCollisionCourse - with skip function", () => {
    let a = new masspoint.Masspoint();
    let b = new masspoint.Masspoint();

    a.x = 0.0;
    a.y = 0.0;
    a.px = 0.0;
    a.py = 0.0;
    a.dx = 1.0;
    a.dy = 0.0;

    b.x = 0.0;
    b.y = 11.0;
    b.px = 0.0;
    b.py = 10.0;
    b.dx = 1.0;
    b.dy = -1.0;

    let skip = (a, b) => {
      if (a.distance(b) <= 10.0) {
        return true;
      }
    };

    expect(a.isCollisionCourse(b, 2, skip)).toStrictEqual({
      collision: true,
      frameAfter: 1,
      skipped: true,
    });
  });
});
