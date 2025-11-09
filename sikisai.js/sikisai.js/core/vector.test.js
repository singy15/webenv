import { describe, test, expect } from "vitest";
import vector from "./vector.js";

describe("vector.js", () => {
  test("new", () => {
    let v = new vector.Vector(2, [1, 2]);
    expect(v).not.toBe(null);
    expect(v.x).toBe(1.0);
    expect(v.y).toBe(2.0);
    expect(v.z).toBe(0.0);
    expect(v.w).toBe(0.0);

    expect(() => {
      let v = new vector.Vector(0);
    }).toThrowError(/0 dimension vector is not supported/);

    expect(() => {
      let v = new vector.Vector(5);
    }).toThrowError(/5 dimension vector is not supported/);
  });

  test("create", () => {
    let v = vector.Vector.create(1.0, 2.0);
    expect(v).not.toBe(null);
    expect(v.x).toBe(1.0);
    expect(v.y).toBe(2.0);
    expect(v.z).toBe(0.0);
    expect(v.w).toBe(0.0);
    expect(v.n).toBe(2);
  });

  test("$", () => {
    let v = vector.Vector.$(1.0, 2.0);
    expect(v).not.toBe(null);
    expect(v.x).toBe(1.0);
    expect(v.y).toBe(2.0);
    expect(v.z).toBe(0.0);
    expect(v.w).toBe(0.0);
    expect(v.n).toBe(2);
  });

  test("checkDimension", () => {
    let a = new vector.Vector(2, [1.0, 2.0]);
    let b = new vector.Vector(3, [3.0, 4.0, 5.0]);

    expect(() => {
      a.checkDimension(b);
    }).toThrowError(/dimension not match/);
  });

  test("add", () => {
    let a = new vector.Vector(2, [1.0, 2.0, 3.0, 4.0]);
    let b = new vector.Vector(2, [3.0, 4.0, 5.0, 6.0]);
    a.add(b);
    expect(a.x).toBe(4.0);
    expect(a.y).toBe(6.0);
    expect(a.z).toBe(8.0);
    expect(a.w).toBe(10.0);
  });

  test("sub", () => {
    let a = new vector.Vector(2, [1.0, 2.0, 3.0, 4.0]);
    let b = new vector.Vector(2, [3.0, 4.0, 5.0, 6.0]);
    a.sub(b);
    expect(a.x).toBe(-2.0);
    expect(a.y).toBe(-2.0);
    expect(a.z).toBe(-2.0);
    expect(a.w).toBe(-2.0);
  });

  test("dot", () => {
    let a = new vector.Vector(2, [1.0, 2.0]);
    let b = new vector.Vector(2, [3.0, 4.0]);
    expect(a.dot(b)).toBe(11.0);
  });

  test("cross", () => {
    let a = new vector.Vector(2, [1.0, 2.0]);
    let b = new vector.Vector(2, [3.0, 4.0]);
    expect(a.cross(b)).toBe(-2.0);
  });

  test("val", () => {
    let v1 = vector.Vector.create(0.0, 0.0, 0.0, 0.0);
    v1.val(1.0, 2.0, 3.0, 4.0);
    expect(v1.x).toBe(1.0);
    expect(v1.y).toBe(2.0);
    expect(v1.z).toBe(3.0);
    expect(v1.w).toBe(4.0);
  });

  test("toArray", () => {
    let a = new vector.Vector(1, [1.0]);
    expect(a.toArray()).toStrictEqual([1.0]);

    let b = new vector.Vector(2, [1.0, 2.0]);
    expect(b.toArray()).toStrictEqual([1.0, 2.0]);

    let c = new vector.Vector(3, [1.0, 2.0, 3.0]);
    expect(c.toArray()).toStrictEqual([1.0, 2.0, 3.0]);

    let d = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    expect(d.toArray()).toStrictEqual([1.0, 2.0, 3.0, 4.0]);
  });

  test("clone", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    let b = a.clone();
    expect(a).not.toBe(b);
    expect(b.x).toBe(1.0);
    expect(b.y).toBe(2.0);
    expect(b.z).toBe(3.0);
    expect(b.w).toBe(4.0);
  });

  test("dup", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    let b = a.dup();
    expect(a).not.toBe(b);
    expect(b.x).toBe(1.0);
    expect(b.y).toBe(2.0);
    expect(b.z).toBe(3.0);
    expect(b.w).toBe(4.0);
  });

  test("mult", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    a.mult(2.0);
    expect(a.x).toBe(2.0);
    expect(a.y).toBe(4.0);
    expect(a.z).toBe(6.0);
    expect(a.w).toBe(8.0);
  });

  test("div", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    a.div(2.0);
    expect(a.x).toBe(0.5);
    expect(a.y).toBe(1.0);
    expect(a.z).toBe(1.5);
    expect(a.w).toBe(2.0);

    expect(() => {
      a.div(0.0);
    }).toThrowError(/division by zero/);
  });

  test("norm", () => {
    let a = new vector.Vector(1, [1.0]);
    expect(a.norm()).toStrictEqual(1.0);

    let b = new vector.Vector(2, [1.0, 2.0]);
    expect(b.norm()).toStrictEqual(Math.sqrt(5.0));

    let c = new vector.Vector(3, [1.0, 2.0, 3.0]);
    expect(c.norm()).toStrictEqual(Math.sqrt(14.0));

    let d = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    expect(d.norm()).toStrictEqual(Math.sqrt(30.0));
  });

  test("normalize", () => {
    let a = new vector.Vector(2, [2.0, 0.0]);
    let n = a.normalize();
    expect(n.toArray()).toStrictEqual([1.0, 0.0]);
  });

  test("fromArray", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    a.fromArray([5.0, 6.0, 7.0, 8.0]);
    expect(a.toArray()).toStrictEqual([5.0, 6.0, 7.0, 8.0]);
  });

  test("createRandom", () => {
    for (let i = 0; i < 100; i++) {
      let v = vector.Vector.createRandom(2, 0.0, 1.0);
      expect(v.x >= 0.0 && v.x < 1.0).toBe(true);
    }

    for (let i = 0; i < 100; i++) {
      let v = vector.Vector.createRandom(2, -0.5, 2.0);
      expect(v.x >= -0.5 && v.x < 2.0).toBe(true);
    }
  });

  test("toLocal", () => {
    let t = new vector.Vector(2, [1.5, 0.0]);
    let o = new vector.Vector(2, [1.0, 1.0]);
    let otheta = -(Math.PI / 2.0);
    let lt = t.toLocal(o, otheta);
    let roundx = (val, rate) => {
      return Math.round(val * rate) / rate;
    };
    expect(roundx(lt.x, 100.0)).toBe(1.0);
    expect(roundx(lt.y, 100.0)).toBe(0.5);
  });

  test("toWorld", () => {
    let t = new vector.Vector(2, [1.0, 0.5]);
    let o = new vector.Vector(2, [1.0, 1.0]);
    let otheta = -(Math.PI / 2.0);
    let wt = t.toWorld(o, otheta);
    let roundx = (val, rate) => {
      return Math.round(val * rate) / rate;
    };
    expect(roundx(wt.x, 100.0)).toBe(1.5);
    expect(roundx(wt.y, 100.0)).toBe(0.0);
  });

  test("map", () => {
    let v = new vector.Vector(2, [1.4, 0.5]);
    v.map(Math.round);
    expect(v.toArray()).toStrictEqual([1.0, 1.0]);
  });

  test("equal", () => {
    let a = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    let b = new vector.Vector(4, [1.0, 2.0, 3.0, 4.0]);
    let c = new vector.Vector(4, [1.0, 2.0, 3.0, 5.0]);
    expect(a.equal(b)).toBe(true);
    expect(a.equal(c)).toBe(false);
  });

  test("truncate", () => {
    let a = new vector.Vector(2, [5.0, 0.0]);
    a.truncate(3.0);
    expect(a.toArray()).toStrictEqual([3.0, 0.0]);
  });

  // test("toLocal / rotation", () => {
  //   let t = new vector.Vector(2, [1.0, 0.0]);
  //   let o = new vector.Vector(2, [1.0, 1.0]);
  //   let otheta = -(Math.PI / 2.0);
  //   let lt = t.toLocal(t, o, otheta);
  //   expect(Math.round(lt.x) + 0.0).toBe(1); // +0.0 means converting -0 to 0
  //   expect(Math.round(lt.y) + 0.0).toBe(0); // +0.0 means converting -0 to 0
  // });

  // test("toWorld", () => {
  //   let t = new vector.Vector(2, [1.0, 0.0]);
  //   let o = new vector.Vector(2, [1.0, 1.0]);
  //   let otheta = -(Math.PI / 2.0);
  //   let wt = t.toWorld(t, o, otheta);
  //   expect(wt.x).toBe(1.0);
  //   expect(wt.y).toBe(0.0);
  // });
});
