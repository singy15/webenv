import graphicsAdapter from "./graphics-adapter.js";
import spriteCanvas from "./sprite-canvas.js";

class GraphicsAdapterCanvas extends graphicsAdapter.GraphicsAdapter {
  constructor() {
    super();
  }

  cameraTranslate() {
    let c = this.currentContext.context;
    let cp = this.currentContext.cameraPos;
    c.translate(-cp.x, -cp.y);
  }

  line(x1, y1, x2, y2, opts = {}) {
    let c = this.currentContext.context;
    let beforeAlpha = c.globalAlpha;
    c.save();
    this.cameraTranslate();

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = false;
      c.mozImageSmoothingEnabled = false;
      c.imageSmoothingEnabled = false;
    }

    if (opts.shadowColor) {
      c.shadowColor = opts.shadowColor;
      c.shadowBlur = opts.shadowBlur;
      c.shadowOffsetX = opts.shadowOffsetX;
      c.shadowOffsetY = opts.shadowOffsetY;
    }

    c.strokeStyle = opts.strokeStyle || "rgb(255,255,255)";
    c.lineWidth = opts.lineWidth || 1.0;
    if (opts.lineDash) {
      c.setLineDash(opts.lineDash);
    }
    c.globalAlpha = opts.globalAlpha ?? 1.0;
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x2, y2);
    c.stroke();
    c.globalAlpha = beforeAlpha;

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = true;
      c.mozImageSmoothingEnabled = true;
      c.imageSmoothingEnabled = true;
    }

    c.restore();
  }

  rect(x1, y1, x2, y2, opts = {}) {
    let c = this.currentContext.context;
    c.save();
    this.cameraTranslate();
    c.fillStyle = opts.fillStyle || "rgba(0,0,0,1.0)";
    c.strokeStyle = opts.strokeStyle || "rgba(0,0,0,1.0)";
    c.fillRect(x1, y1, x2 - x1, y2 - y1);
    c.strokeRect(x1, y1, x2 - x1, y2 - y1);
    c.restore();
  }

  clear(x, y, w, h, opts = {}) {
    let c = this.currentContext.context;
    c.save();
    this.cameraTranslate();
    c.clearRect(x, y, w, h);
    c.restore();
  }

  createSprite(opts = {}) {
    let img = new Image();
    img.src = opts.path;
    let s = new spriteCanvas.SpriteCanvas(img);
    img
      .decode()
      .then(() => {
        createImageBitmap(img).then((bitmap) => {
          s.image = bitmap;
        });
      })
      .catch((encodingError) => {
        // エラー時に何かをする。
      });

    return s;
  }

  draw(sprite, x, y, opts = {}) {
    let c = this.currentContext.context;
    let beforeAlpha = c.globalAlpha;
    c.save();
    this.cameraTranslate();

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = false;
      c.mozImageSmoothingEnabled = false;
      c.imageSmoothingEnabled = false;
    }

    if (opts.shadowColor) {
      c.shadowColor = opts.shadowColor;
      c.shadowBlur = opts.shadowBlur;
      c.shadowOffsetX = opts.shadowOffsetX;
      c.shadowOffsetY = opts.shadowOffsetY;
    }

    c.translate(x, y);
    c.rotate(opts.angle || 0.0);
    c.scale(opts.scaleX || 1.0, opts.scaleY || 1.0);
    c.globalAlpha = opts.globalAlpha ?? 1.0;
    //c.filter = ``;
    if (
      opts.sx !== undefined &&
      opts.sy !== undefined &&
      opts.sheight !== undefined &&
      opts.swidth !== undefined
    ) {
      c.drawImage(
        sprite.image,
        opts.sx,
        opts.sy,
        opts.swidth,
        opts.sheight,
        0 - opts.swidth / 2,
        0 - opts.sheight / 2,
        opts.swidth,
        opts.sheight,
      );
    } else {
      c.drawImage(
        sprite.image,
        0 - sprite.image.width / 2,
        0 - sprite.image.height / 2,
      );
    }
    c.globalAlpha = beforeAlpha;

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = true;
      c.mozImageSmoothingEnabled = true;
      c.imageSmoothingEnabled = true;
    }

    c.restore();
  }

  text(str, x, y, opts = {}) {
    let c = this.currentContext.context;
    c.save();
    this.cameraTranslate();

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = false;
      c.mozImageSmoothingEnabled = false;
      c.imageSmoothingEnabled = false;
    }

    c.lineWidth = opts.lineWidth ?? 1.0;
    c.font = opts.font || "12px system";
    c.fillStyle = opts.fillStyle || "rgba(255,255,255,1.0)";
    c.strokeStyle = opts.strokeStyle || "transparent";
    c.textAlign = opts.textAlign ?? "left";
    c.fillText(str, x, y);
    c.strokeText(str, x, y);

    if (opts.smoothing === false) {
      c.webkitImageSmoothingEnabled = true;
      c.mozImageSmoothingEnabled = true;
      c.imageSmoothingEnabled = true;
    }

    c.restore();
  }

  arc(x, y, radius, opts = {}) {
    let c = this.currentContext.context;
    c.save();
    this.cameraTranslate();

    if (opts.shadowColor) {
      c.shadowColor = opts.shadowColor;
      c.shadowBlur = opts.shadowBlur;
      c.shadowOffsetX = opts.shadowOffsetX;
      c.shadowOffsetY = opts.shadowOffsetY;
    }

    c.strokeStyle = opts.strokeStyle ?? "rgb(255,255,255)";
    c.fillStyle = opts.fillStyle ?? "rgb(255,255,255)";
    c.lineWidth = opts.lineWidth || 1.0;
    if (opts.lineDash) {
      c.setLineDash(opts.lineDash);
    }
    c.beginPath();
    c.arc(x, y, radius, opts.startAngle ?? 0.0, opts.endAngle ?? Math.PI * 2.0);
    c.stroke();
    c.fill();
    c.restore();
  }

  ellipse(x, y, w, h, opts = {}) {
    let c = this.currentContext.context;
    c.save();
    this.cameraTranslate();
    c.strokeStyle = opts.strokeStyle ?? "rgb(255,255,255)";
    c.fillStyle = opts.fillStyle ?? "rgb(255,255,255)";
    c.lineWidth = opts.lineWidth || 1.0;
    if (opts.lineDash) {
      c.setLineDash(opts.lineDash);
    }
    c.beginPath();
    c.ellipse(x, y, w, h, 0, 0, 2 * Math.PI);
    c.fill();
    c.restore();
  }

  width() {
    return this.currentContext.context.canvas.clientWidth;
  }

  height() {
    return this.currentContext.context.canvas.clientHeight;
  }
}

export default {
  GraphicsAdapterCanvas: GraphicsAdapterCanvas,
};
