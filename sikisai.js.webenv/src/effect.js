import actor from "./actor.js";
import timer from "./timer.js";
import def from "./def.js";

class Effect extends actor.Actor {
  constructor(scene, gadpt, aadpt) {
    super();

    // prerequisite
    this.scene = scene;
    this.gadpt = gadpt;
    this.aadpt = aadpt;

    // definition
    this.def = {
      id: "",
      name: "",
      imagePath: "",
      frame: 0,
      width: 0,
      height: 0,
      nrow: 0,
      ncol: 0,
      frameLength: 0,
      startFrame: 0,
      scaleX: 1.0,
      scaleY: 1.0,
      a: 0.0,
      fadeout: false,
    };

    // state
    this.image = null;
    this.timerFrame = null;
    this.curFrame = 0;
  }

  setDef(def) {
    this.def = def;
  }

  init() {
    let def = this.def;
    this.image = this.gadpt.createSprite({
      path: def.imagePath,
    });
    this.timerFrame = new timer.Timer(def.frameLength, 1);
    this.curFrame = this.def.startFrame;
  }

  update() {
    super.update();

    let def = this.def;

    this.timerFrame.tick();
    if (this.timerFrame.isFull()) {
      this.curFrame++;
      if (this.curFrame >= def.frame) {
        this.kill();
        return;
      }
      this.timerFrame.reset();
    }
  }

  draw() {
    let g = this.gadpt;
    let def = this.def;
    let p = this.p;

    let max = def.frame * def.frameLength;
    let cur = this.curFrame * def.frameLength + this.timerFrame.t;
    let progress = cur / max;
    let nprogress = 1.0 - progress;

    g.draw(this.image, p.x, p.y, {
      angle: p.a + Math.PI * 0.5,
      scaleX: def.scaleX,
      scaleY: def.scaleY,
      globalAlpha: def.fadeout ? nprogress : 1.0,
      sx: (this.curFrame % def.ncol) * def.width,
      sy: Math.floor(this.curFrame / def.ncol) * def.height,
      swidth: def.width,
      sheight: def.height,
    });
  }

  setPosition(x, y) {
    this.p.x = x;
    this.p.y = y;
  }

  setDirection(a) {
    this.p.a = a;
  }
}

class EffectFactory {
  constructor(scene, gadpt, aadpt) {
    if (EffectFactory.instance) {
      return EffectFactory.instance;
    }

    EffectFactory.instance = this;
    this.scene = scene;
    this.gadpt = gadpt;
    this.aadpt = aadpt;
  }

  createByDef(def) {
    let e = new Effect(this.scene, this.gadpt, this.aadpt);
    e.setDef(def);
    e.init();
    this.scene.actors.add(e, "effect");
    return e;
  }

  createById(id) {
    return this.createByDef(def.def.effect[id]);
  }
}

export default {
  Effect: Effect,
  EffectFactory: EffectFactory,
};
