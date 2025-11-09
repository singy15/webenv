import sprite from "./sprite.js";

class SpriteCanvas extends sprite.Sprite {
  constructor(image) {
    super();
    this.image = image;
  }
}

export default {
  SpriteCanvas: SpriteCanvas,
};
