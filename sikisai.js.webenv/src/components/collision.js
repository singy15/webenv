class Collision {
  constructor(model, obj) {
    this.model = model;
    this.obj = obj;
  }

  position() {
    return { x: this.obj.x, y: this.obj.y };
  }

  radius() {
    return this.obj.radius;
  }

  isCollideWith(another) {
    // circle vs circle
    if (this.model === "circle" && another.model === "circle") {
      let p0 = this.position();
      let r0 = this.radius();
      let p1 = another.position();
      let r1 = another.radius();

      let d = (p0.x - p1.x) ** 2.0 + (p0.y - p1.y) ** 2.0;
      return d <= (r0 + r1) ** 2.0;
    }
  }
}

export default {
  Collision: Collision,
};
