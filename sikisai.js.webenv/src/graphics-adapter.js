class GraphicsAdapter {
  constructor() {
    this.originContextId = null;
    this.currentContextId = null;
    this.currentContext = null;
    this.contexts = {};
  }

  addContext(id, context) {
    this.contexts[id] = {
      context: context,
      cameraEnabled: true,
      cameraPos: { x: 0.0, y: 0.0 },
      cameraPosSave: { x: 0.0, y: 0.0 },
    };
  }

  changeContext(id) {
    this.currentContextId = id;
    this.currentContext = this.contexts[id];
  }

  getContextById(id) {
    return this.contexts[id];
  }

  getCurrentContextId() {
    return this.currentContextId;
  }

  camera(id = null) {
    let context = this.currentContext;
    if (id != null) {
      context = this.contexts[id];
    }
    return context.cameraPos;
  }

  moveCamera(dx, dy) {
    let cp = this.currentContext.cameraPos;
    cp.x += dx;
    cp.y += dy;
  }

  setCamera(x, y) {
    let cp = this.currentContext.cameraPos;
    cp.x = x;
    cp.y = y;
  }

  global(x, y) {
    return [
      x + this.currentContext.cameraPos.x,
      y + this.currentContext.cameraPos.y,
    ];
  }

  swapCamera() {
    let tmp = this.currentContext.cameraPos;
    this.currentContext.cameraPos = this.currentContext.cameraPosSave;
    this.currentContext.cameraPosSave = tmp;
  }

  enableCamera() {
    if (!this.currentContext.cameraEnabled) {
      this.swapCamera();
    }
  }

  disableCamera() {
    if (this.currentContext.cameraEnabled) {
      this.swapCamera();
    }
  }

  withoutCamera(fn) {
    this.swapCamera();
    fn();
    this.swapCamera();
  }

  withContext(id, fn) {
    if (this.originContextId != null)
      throw new Error("cannot use withContext in withContext");

    this.originContextId = this.currentContextId;
    this.changeContext(id);
    fn();
    this.changeContext(this.originContextId);
    this.originContextId = null;
  }

  line(x1, y1, x2, y2, opts = {}) {}

  rect(x1, y1, x2, y2, opts = {}) {}

  createSprite(opts = {}) {}

  draw(sprite, x, y, opts = {}) {}

  text(str, x, y, opts = {}) {}

  arc(x, y, radius, opts = { startAngle: 0.0, endAngle: Math.PI * 2.0 }) {}

  width() {}

  height() {}
}

export default {
  GraphicsAdapter: GraphicsAdapter,
};
