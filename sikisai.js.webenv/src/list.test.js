import { describe, test, expect, assert } from "vitest";
import list from "./list.js";

describe("list.js", () => {
  test("initialize", () => {
    let l = new list.List();
    expect(l).not.toBe(null);
  });

  test("iterate", () => {
    let l = new list.List();
    let xs = [{}, {}];
    l.append(xs[0]);
    l.append(xs[1]);
    let c = 0;
    for (let i = l.iter(), e = i.begin(); e; e = i.next()) {
      expect(e).toBe(xs[c]);
      c++;
    }
  });

  test("each", () => {
    let l = new list.List();
    let xs = [1, 2];
    l.append(xs[0]);
    l.append(xs[1]);

    let cx = 0;
    l.each((e, i, l, n) => {
      expect(n).toBe(cx);
      expect(e).toBe(xs[cx]);
      cx++;
    });
  });

  test("filter", () => {
    let l = new list.List();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.append(x));
    l.filter((x) => x % 2 === 0).each((e, i, l, n) => {
      expect(e % 2).toBe(0);
    });
  });

  test("map", () => {
    let l = new list.List();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.append(x));
    l.map((x) => x * 2).each((e, i, l, n) => {
      expect(e % 2).toBe(0);
    });
  });

  test("reduce", () => {
    let l = new list.List();
    let xs = [1, 2, 3, 4];
    xs.forEach((x) => l.append(x));
    expect(l.reduce((m, x) => m + x * 2, 0)).toBe(2 + 4 + 6 + 8);
  });

  test("remove while each", () => {
    let l = new list.List();
    let xs = [1, 2, 3, 4];
    l.append(xs[0]);
    l.append(xs[1]);
    l.append(xs[2]);
    l.append(xs[3]);

    l.each((e, i, l) => {
      if (e % 2 === 0) l.removeNode(i.currNode());
    });

    expect(l.count()).toBe(2);

    l.each((e, i, l) => {
      expect(e % 2).not.toBe(0);
    });
  });

  test("insertAfter", () => {
    let l = new list.List();
    [1, 2, 3, 5].forEach((e) => l.append(e));
    l.each((e, i, l) => {
      if (e === 3) {
        l.insertAfter(i.currNode(), 4);
      }
    });
    let ac = [];
    l.each((e, i, l, n) => {
      ac.push(e);
    });
    expect(ac).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("insertAfter - tail", () => {
    let l = new list.List();
    [1, 2, 3].forEach((e) => l.append(e));
    l.each((e, i, l) => {
      if (e === 3) {
        l.insertAfter(i.currNode(), 4);
      }
    });
    expect(l.tail.value).toStrictEqual(4);
  });

  test("insertBefore", () => {
    let l = new list.List();
    [1, 2, 3, 5].forEach((e) => l.append(e));
    l.each((e, i, l) => {
      if (e === 5) {
        //console.log(i.currNode());
        l.insertBefore(i.currNode(), 4);
      }
    });
    let ac = [];
    l.each((e, i, l, n) => {
      ac.push(e);
    });
    expect(ac).toStrictEqual([1, 2, 3, 4, 5]);
  });

  test("insertBefore - tail", () => {
    let l = new list.List();
    [1, 2, 3].forEach((e) => l.append(e));
    l.each((e, i, l) => {
      if (e === 1) {
        l.insertBefore(i.currNode(), 0);
      }
    });
    expect(l.head.value).toStrictEqual(0);
  });

  // test("performance - 1", () => {
  //   let l = new list.List();
  //   let s = new Date();
  //   for(let i = 0; i < 1000000; i++) {
  //     l.append(i);
  //   }
  //   let e = new Date();
  //   assert((e - s) < 1000);
  // });
  //
  // test("performance - 2", () => {
  //   let l = new list.List();
  //   let s = new Date();
  //   for(let i = 0; i < 1000000; i++) {
  //     l.prepend(i);
  //   }
  //   let e = new Date();
  //   assert((e - s) < 1000);
  // });
});
