import { describe, test, expect } from "vitest";
import linkedList from "./linked-list.js";

describe("linked-list.js", () => {
  test("initialize", () => {
    let l = new linkedList.LinkedList();
    expect(l).not.toBe(null);
  });

  test("iterate", () => {
    let l = new linkedList.LinkedList();
    let xs = [{}, {}];
    l.add(xs[0], "g1");
    l.add(xs[1], "g1");
    let c = 0;
    for (let i = l.iter(), e = i.begin(); e; e = i.next()) {
      expect(e).toBe(xs[c]);
      c++;
    }
  });

  test("iterate group", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2];
    let ys = [3, 4];
    l.add(xs[0], "g1");
    l.add(xs[1], "g1");
    l.add(ys[0], "g2");
    l.add(ys[1], "g2");

    let cx = 0;
    for (let i = l.iter("g1"), e = i.begin(); e; e = i.next()) {
      expect(e).toBe(xs[cx]);
      cx++;
    }

    let cy = 0;
    for (let i = l.iter("g2"), e = i.begin(); e; e = i.next()) {
      expect(e).toBe(ys[cy]);
      cy++;
    }
  });

  test("each", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2];
    l.add(xs[0], "g1");
    l.add(xs[1], "g1");

    let cx = 0;
    l.each((e, i, l, n) => {
      expect(n).toBe(cx);
      expect(e).toBe(xs[cx]);
      cx++;
    }, "g1");
  });

  test("each group", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2];
    let ys = [3, 4];
    l.add(xs[0], "g1");
    l.add(xs[1], "g1");
    l.add(ys[0], "g2");
    l.add(ys[1], "g2");

    let cx = 0;
    l.each((e, i, l) => {
      expect(e).toBe(xs[cx]);
      cx++;
    }, "g1");

    let cy = 0;
    l.each((e, i, l) => {
      expect(e).toBe(ys[cy]);
      cy++;
    }, "g2");
  });

  test("filter", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.add(x, "g1"));

    let list = l.filter((x) => x % 2 === 0, "g1");
    list.each((e, i, l, n) => {
      expect(e % 2).toBe(0);
    }, "g1");
  });

  test("map", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.add(x, "g1"));

    let list = l.map((x) => x * 2, "g1");
    list.each((e, i, l, n) => {
      expect(e % 2).toBe(0);
    }, "g1");
  });

  test("reduce", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.add(x, "g1"));

    let result = l.reduce((m, x) => m + x * 2, 0, "g1");
    expect(result).toBe(2 + 4 + 6 + 8);
  });

  test("remove while each", () => {
    let l = new linkedList.LinkedList();
    let xs = [1, 2, 3, 4];
    l.add(xs[0], "g1");
    l.add(xs[1], "g1");
    l.add(xs[2], "g1");
    l.add(xs[3], "g1");

    l.each((e, i, l) => {
      if (e % 2 === 0) l.removeNode(i.currNode());
    }, "g1");

    expect(l.count("g1")).toBe(2);

    l.each((e, i, l) => {
      expect(e % 2).not.toBe(0);
    }, "g1");
  });
});
