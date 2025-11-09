class EffectGenerator {
  constructor() {}

  async createImage(effect) {
    let canvas = document.createElement("canvas");

    let x = 0;
    let y = 0;
    let w = effect.size;
    let h = effect.size;
    let hw = w / 2;
    let hh = h / 2;
    let r1 = effect.radius1;
    let r2 = effect.radius2;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");

    ctx.clearRect(x, y, w, h);
    ctx.beginPath();

    const gradient = ctx.createRadialGradient(
      x + hw,
      y + hh,
      r1,
      x + hw,
      y + hh,
      r2,
    );

    effect.gradient.forEach((g) => {
      let cr = parseInt(g.color.substring(1, 3), 16);
      let cg = parseInt(g.color.substring(3, 5), 16);
      let cb = parseInt(g.color.substring(5, 7), 16);
      gradient.addColorStop(
        g.pos,
        /*g.color*/ `rgba(${cr},${cg},${cb},${g.alpha})`,
      );
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, x + w, y + h);

    return canvas;
  }
}

export default {
  EffectGenerator,
};
