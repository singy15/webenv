import Counter from "./counter.ts";

describe("counter.ts", () => {
  beforeEach(function () { });

  it("new and props", function () {
    let c: Counter = new Counter(0);
    expect(c.current).toBe(0);
  });


  it("tick", function () {
    let c: Counter = new Counter(0);
    c.tick();
    expect(c.current).toBe(1);
    c.tick(2);
    expect(c.current).toBe(3);
  });


  it("reset", function () {
    let c: Counter = new Counter(0);
    c.tick();
    expect(c.current).toBe(1);
    c.reset(0);
    expect(c.current).toBe(0);
  });
});
