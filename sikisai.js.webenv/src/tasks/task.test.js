import { describe, test, expect, assert } from "vitest";
import task from "./task.js";

class TestTask extends task.Task {
  constructor(ls, add, priority) {
    super(priority);
    this.ls = ls;
    this.add = add;
  }

  run() {
    this.ls.push(this.add);
  }
}

describe("task.js", () => {
  test("TaskManager", () => {
    let ls = [];
    let t1 = new TestTask(ls, 3, 100);
    let t2 = new TestTask(ls, 1, 200);
    let t3 = new TestTask(ls, 2, 150);
    let t4 = new TestTask(ls, 4, 50);

    let ts = [t2, t3, t1, t4];
    task.TaskManager.tasks.each((e, i, l, n) => {
      expect(e).toBe(ts[n]);
    });

    task.TaskManager.runAll();
    expect(ls).toStrictEqual([1, 2, 3, 4]);
  });
});
