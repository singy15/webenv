export default class Counter {
  current: number;

  constructor(current: number) {
    this.current = current;
  }

  tick(step: number = 1): void {
    this.current += step;
  }

  reset(val: number): void {
    this.current = val;
  }
}