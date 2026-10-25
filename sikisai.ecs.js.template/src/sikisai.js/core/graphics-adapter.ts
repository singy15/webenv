
export type GraphicsContextId = string & { readonly __brand: "GraphicsContextId" };

export type CameraPosition = {
  x: number,
  y: number
}

export type GraphicsContext = {
  context: any,
  cameraEnabled: boolean,
  cameraPos: CameraPosition,
  cameraPosSave: CameraPosition,
}

export default abstract class GraphicsAdapter {
  originContextId: GraphicsContextId;
  currentContextId: GraphicsContextId;
  currentContext: GraphicsContext;
  contexts: { [key: GraphicsContextId]: GraphicsContext };

  constructor() {
    this.originContextId = null;
    this.currentContextId = null;
    this.currentContext = null;
    this.contexts = {};
  }

  addContext(id: string, context: any) {
    const cid = id as GraphicsContextId;
    this.contexts[cid] = {
      context: context,
      cameraEnabled: true,
      cameraPos: { x: 0.0, y: 0.0 },
      cameraPosSave: { x: 0.0, y: 0.0 },
    };
  }

  changeContext(id: string): void {
    const cid = id as GraphicsContextId;
    this.currentContextId = cid;
    this.currentContext = this.contexts[cid];
  }

  getContextById(id: string): GraphicsContext {
    const cid = id as GraphicsContextId;
    return this.contexts[cid];
  }

  getCurrentContextId(): GraphicsContextId {
    return this.currentContextId;
  }

  camera(id = null): CameraPosition {
    let cid = id as GraphicsContextId;
    let context = this.currentContext;
    if (cid != null) {
      context = this.contexts[cid];
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

  getCamera() {
    let cp = this.currentContext.cameraPos;
    return { x: cp.x, y: cp.y };
  }

  global(x, y) {
    return [
      x + this.currentContext.cameraPos.x,
      y + this.currentContext.cameraPos.y,
    ];
  }

  inScreen(x, y) {
    let cp = this.currentContext.cameraPos;
    return (
      cp.x <= x &&
      x <= cp.x + this.width() &&
      cp.y <= y &&
      y <= cp.y + this.height()
    );
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

  withContext(id: string, fn: Function) {
    let cid = id as GraphicsContextId;
    if (this.originContextId != null)
      throw new Error("cannot use withContext in withContext");

    this.originContextId = this.currentContextId;
    this.changeContext(cid);
    fn();
    this.changeContext(this.originContextId);
    this.originContextId = null;
  }

  abstract line(x1, y1, x2, y2, opts: object): void;

  abstract rect(x1, y1, x2, y2, opts: object): void;

  abstract createSprite(opts: object);

  abstract draw(sprite, x, y, opts: object);

  abstract text(str, x, y, opts: object);

  abstract arc(x, y, radius, opts: object);

  abstract width(): number;

  abstract height(): number;
}
