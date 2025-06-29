class Counter {
  constructor(tmax = 1, step = 1, t = 0) {
    this.t = t;
    this.step = step;
    this.tmax = tmax;
  }

  tick() {
    console.assert(this.tmax !== 0);

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
}

export default {
  Counter: Counter,
};
