import { describe, test, expect } from "vitest";
import vector2 from "./vector2.js";

describe("vector2.js", () => {
  test("new", () => {
    let v = new vector2.Vector2();
    expect(v).not.toBe(null);
  });

  test("dot", () => {
    let a = new vector2.Vector2();
    let b = new vector2.Vector2();
    a.x = 1.0;
    a.y = 2.0;
    b.x = 3.0;
    b.y = 4.0;
    expect(a.dot(b)).not.toBe(null);
    expect(a.dot(b)).toBe(11.0);
  });

  test("cross", () => {
    let a = new vector2.Vector2();
    let b = new vector2.Vector2();
    a.x = 1.0;
    a.y = 2.0;
    b.x = 3.0;
    b.y = 4.0;
    expect(a.cross(b)).not.toBe(null);
    expect(a.cross(b)).toBe(-2.0);
  });
});
