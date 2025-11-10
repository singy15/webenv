import { describe, test, expect } from "vitest";
import mathUtil from "./math-util.js";

describe("math-util.js", () => {
  test("intersect", () => {
    let a = { x: 0.0, y: 0.0 };
    let b = { x: 1.0, y: 1.0 };
    let c = { x: 1.0, y: 0.0 };
    let d = { x: 0.0, y: 1.0 };
    expect(mathUtil.MathUtil.intersect(a, b, c, d)).toBe(true);

    a = { x: 4.0, y: 0.0 };
    b = { x: 3.0, y: 1.0 };
    c = { x: 1.0, y: 0.0 };
    d = { x: 0.0, y: 1.0 };
    expect(mathUtil.MathUtil.intersect(a, b, c, d)).toBe(false);
  });
});
