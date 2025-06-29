import collision from "./collision.js";

class CollisionActor extends collision.Collision {
  constructor(model, obj) {
    super(model, obj);
  }

  position() {
    return { x: this.obj.p.x, y: this.obj.p.y };
  }

  radius() {
    return this.obj.radius;
  }
}

export default {
  CollisionActor: CollisionActor,
};
