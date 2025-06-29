class Vector2 {
  constructor() {
    this.x = 0.0;
    this.y = 0.0;
  }

  dot(b) {
    let a = this;
    return a.x * b.x + a.y * b.y;
  }

  cross(b) {
    let a = this;
    return a.x * b.y - a.y * b.x;
  }
}

export default {
  Vector2: Vector2,
};
