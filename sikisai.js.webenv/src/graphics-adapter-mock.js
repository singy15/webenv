import graphicsAdapter from "./graphics-adapter.js";

class GraphicsAdapterMock extends graphicsAdapter.GraphicsAdapter {
  constructor() {
    super();
    // this.canvas = canvas;
    // this.context = canvas.getContext("2d");
    this.cameraEnabled = true;
    this.cameraPos = { x: 0.0, y: 0.0 };
    this.cameraPosSave = { x: 0.0, y: 0.0 };
  }

  global(x, y) {
    return [x + this.cameraPos.x, y + this.cameraPos.y];
  }

  swapCamera() {
    let tmp = this.cameraPos;
    this.cameraPos = this.cameraPosSave;
    this.cameraPosSave = tmp;
  }

  enableCamera() {
    if (!this.cameraEnabled) {
      this.swapCamera();
    }
  }

  disableCamera() {
    if (this.cameraEnabled) {
      this.swapCamera();
    }
  }

  withoutCamera(fn) {
    this.swapCamera();
    fn();
    this.swapCamera();
  }

  cameraTranslate() {
    // let c = this.context;
    // let cp = this.cameraPos;
    // c.translate(-cp.x, -cp.y);
  }

  line(x1, y1, x2, y2, opts = {}) {
    // let c = this.context;
    // c.save();
    // this.cameraTranslate();
    // c.strokeStyle = opts.strokeStyle || "rgb(255,255,255)";
    // c.lineWidth = opts.lineWidth || 1.0;
    // c.beginPath();
    // c.moveTo(x1, y1);
    // c.lineTo(x2, y2);
    // c.stroke();
    // c.restore();
  }

  rect(x1, y1, x2, y2, opts = {}) {
    // let c = this.context;
    // c.save();
    // this.cameraTranslate();
    // c.fillStyle = opts.fillStyle || "rgba(0,0,0,1.0)";
    // c.strokeStyle = opts.strokeStyle || "rgba(0,0,0,1.0)";
    // c.fillRect(x1, y1, x2 - x1, y2 - y1);
    // c.strokeRect(x1, y1, x2 - x1, y2 - y1);
    // c.restore();
  }

  createSprite(opts = {}) {
    // let img = new Image();
    // img.src = opts.path;
    // let s = new spriteCanvas.SpriteCanvas(img);
    // return s;
    return {};
  }

  draw(sprite, x, y, opts = {}) {
    // let c = this.context;
    // let beforeAlpha = c.globalAlpha;
    // c.save();
    // this.cameraTranslate();
    // c.translate(x, y);
    // c.rotate(opts.angle || 0.0);
    // c.scale(opts.scaleX || 1.0, opts.scaleY || 1.0);
    // c.globalAlpha = opts.globalAlpha ?? 1.0;
    // //c.filter = ``;
    // if (
    //   opts.sx !== undefined &&
    //   opts.sy !== undefined &&
    //   opts.sheight !== undefined &&
    //   opts.swidth !== undefined
    // ) {
    //   c.drawImage(
    //     sprite.image,
    //     opts.sx,
    //     opts.sy,
    //     opts.swidth,
    //     opts.sheight,
    //     0 - opts.swidth / 2,
    //     0 - opts.sheight / 2,
    //     opts.swidth,
    //     opts.sheight,
    //   );
    // } else {
    //   c.drawImage(
    //     sprite.image,
    //     0 - sprite.image.width / 2,
    //     0 - sprite.image.height / 2,
    //   );
    // }
    // c.globalAlpha = beforeAlpha;
    // c.restore();
  }

  text(str, x, y, opts = {}) {
    // let c = this.context;
    // c.save();
    // this.cameraTranslate();
    // c.font = opts.font || "12px system";
    // c.fillStyle = opts.fillStyle || "rgba(255,255,255,1.0)";
    // c.textAlign = opts.textAlign ?? "left";
    // c.fillText(str, x, y);
    // c.restore();
  }

  arc(x, y, radius, opts = {}) {
    // let c = this.context;
    // c.save();
    // this.cameraTranslate();
    // c.strokeStyle = opts.strokeStyle ?? "rgb(255,255,255)";
    // c.fillStyle = opts.fillStyle ?? "rgb(255,255,255)";
    // c.lineWidth = opts.lineWidth || 1.0;
    // if (opts.lineDash) {
    //   c.setLineDash(opts.lineDash);
    // }
    // c.beginPath();
    // c.arc(x, y, radius, opts.startAngle ?? 0.0, opts.endAngle ?? Math.PI * 2.0);
    // c.stroke();
    // c.fill();
    // c.restore();
  }

  width() {
    // return this.context.canvas.clientWidth;
    return 768;
  }

  height() {
    // return this.context.canvas.clientHeight;
    return 768;
  }
}

export default {
  GraphicsAdapterMock: GraphicsAdapterMock,
};
