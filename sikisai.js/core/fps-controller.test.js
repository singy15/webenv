import { describe, test, expect } from "vitest";
import fpsController from "./fps-controller.js";

describe("fps-controller.js", () => {
  test("test - new", () => {
    let fpsc = new fpsController.FPSController();
    expect(fpsc).not.toBe(null);
    expect(fpsc.updateFn).toBe(null);
    expect(fpsc.drawFn).toBe(null);
    expect(fpsc.fps).toBe(60);
    expect(fpsc.updateLoadCoeff).toBe(0.5);
    expect(fpsc.targetInterval).toBe(1000 / 60);
    expect(fpsc.enabled).toBe(false);
    expect(fpsc.frames).toBe(0);
    expect(fpsc.actualFps).toBe(0);
    expect(fpsc.updateFrames).toBe(1);
  });

  test("test - start / updateFn not set", () => {
    let fpsc = new fpsController.FPSController();
    expect(() => {
      fpsc.start();
    }).toThrowError(/updateFn/);
  });

  test("test - start / drawFn not set", () => {
    let fpsc = new fpsController.FPSController();
    fpsc.updateFn = () => {};
    expect(() => {
      fpsc.start();
    }).toThrowError(/drawFn/);
  });
});
