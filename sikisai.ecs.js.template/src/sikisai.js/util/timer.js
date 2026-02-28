class Timer {
  constructor(tmax = 1, step = 1, t = 0) {
    this.ot = t;
    this.t = t;
    this.step = step;
    this.tmax = tmax;
  }

  tick() {
    console.assert(this.tmax !== 0);

    this.ot = this.t;
    this.t += this.step;
    if (this.t > this.tmax) {
      this.t = this.tmax;
    }
    if (this.t < 0) {
      this.t = 0;
    }
  }

  isFull() {
    return this.t === this.tmax;
  }

  isFullOnce() {
    return this.isFull() && this.t !== this.ot;
  }

  isZero() {
    return this.t === 0;
  }

  reset() {
    this.t = 0;
  }

  setT(t) {
    this.t = t;
  }

  setTmax(tmax) {
    this.tmax = tmax;
  }

  setStep(step) {
    this.step = step;
  }

  setFull() {
    this.t = this.tmax;
  }
}

export default {
  Timer: Timer,
};

// test

if (import.meta.vitest) {
  const { it, expect } = import.meta.vitest;

  it("initialize", () => {
    let t = new Timer();
    expect(t).not.toBe(null);
    expect(t.tmax).toBe(1);
    expect(t.step).toBe(1);
    expect(t.t).toBe(0);
  });

  it("initialize with params", () => {
    let t = new Timer(300, 2, 1);
    expect(t.tmax).toBe(300);
    expect(t.step).toBe(2);
    expect(t.t).toBe(1);
  });

  it("tick", () => {
    let t = new Timer(10, 1, 0);
    t.tick();
    expect(t.t).toBe(1);
    t.tick();
    expect(t.t).toBe(2);
  });

  it("isFull", () => {
    let t = new Timer(2, 1, 0);
    t.tick();
    expect(t.isFull()).toBe(false);
    t.tick();
    expect(t.isFull()).toBe(true);
  });

  it("isFullOnce", () => {
    let t = new Timer(1, 1, 0);
    t.tick();
    expect(t.isFullOnce()).toBe(true);
    t.tick();
    expect(t.isFullOnce()).toBe(false);
  });

  it("isZero", () => {
    let t = new Timer(1, 1, 0);
    expect(t.isZero()).toBe(true);
    t.tick();
    expect(t.isZero()).toBe(false);
  });

  it("reset", () => {
    let t = new Timer(2, 1, 0);
    t.tick();
    t.reset();
    expect(t.t).toBe(0);
  });

  it("setT", () => {
    let t = new Timer(2, 1, 0);
    t.setT(2);
    expect(t.t).toBe(2);
  });

  it("setTmax", () => {
    let t = new Timer(2, 1, 0);
    t.setTmax(10);
    expect(t.tmax).toBe(10);
  });
}
