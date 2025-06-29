import { describe, test, expect } from "vitest";
import sceneMain from "./scene-main.js";

describe("scene-main.js", () => {
  test("test - new", () => {
    let gadpt = {};
    let iadpt = {};
    let fpsc = {};
    let aadpt = {};

    let s = new sceneMain.SceneMain(gadpt, iadpt, fpsc, aadpt);
    expect(s).not.toBe(null);
    expect(s.gadpt).toBe(gadpt);
    expect(s.iadpt).toBe(iadpt);
    expect(s.fpsc).toBe(fpsc);
    expect(s.aadpt).toBe(aadpt);
  });
});
