import { describe, test, expect } from "vitest";
import collision from "./collision.js";

describe("collision.js", () => {
  test("initialize", () => {
    let oa = { x: 0.0, y: 0.0, radius: 0.0 };
    let ca = new collision.Collision("circle", oa);
    expect(ca).not.toBe(null);
    expect(ca.model).toBe("circle");
    expect(ca.obj).toBe(oa);
  });

  test("collideWith - circle vs circle", () => {
    let oa = { x: 0.0, y: 0.0, radius: 5.0 };
    let ca = new collision.Collision("circle", oa);

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
