
class Point {
  constructor() {
    this.x = 0.0; this.y = 0.0;
  }

  distanceToXY(x,y) {
    return Math.sqrt((x - this.x)**2 + (y - this.y) **2);
  }
}
