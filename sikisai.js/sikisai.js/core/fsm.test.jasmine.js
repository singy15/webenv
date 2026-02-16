import fsm from "./fsm.js";

describe("fsm.js", () => {
  beforeEach(function () {});

  it("FSM.run", function () {
    let s1 = new fsm.State((ctx) => {
      ctx.count++;
      if (ctx.count > 2) {
        return s2;
      }
    });

    let s2 = new fsm.State((ctx) => {
      return s1;
    });

    let sm = new fsm.FSM(
      {
        count: 0,
      },
      s1,
    );

    expect(sm.state).toBe(s1);
    sm.run();
    expect(sm.state).toBe(s1);
    sm.run();
    expect(sm.state).toBe(s1);
    sm.run();
    expect(sm.state).toBe(s2);
    sm.run();
    expect(sm.state).toBe(s1);
  });
});
