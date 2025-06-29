import interfaceAdapter from "./interface-adapter.js";

class InterfaceAdapterCanvas extends interfaceAdapter.InterfaceAdapter {
  constructor(canvas) {
    super();
    this.stateKeydown = {};
    this.stateKeypush = {};
    this.stateKeylock = {};
    this.stateMouse = { x: 0, y: 0, left: false, right: false };
    this.stateMousepush = { left: false, right: false };
    this.stateMouselock = { left: false, right: false };
    this.setCanvas(canvas);
    this.metrics = this.canvas.getBoundingClientRect();
    this.stateQueue = [];
  }

  setCanvas(canvas) {
    this.canvas = canvas;
    canvas.tabIndex = 9999;

    canvas.addEventListener("keydown", (e) => {
      let keyCode = e.keyCode;
      this.stateQueue.push(() => {
        this.stateKeydown[keyCode] = true;
      });
      e.preventDefault();
    });

    canvas.addEventListener("keyup", (e) => {
      let keyCode = e.keyCode;
      this.stateQueue.push(() => {
        this.stateKeydown[keyCode] = false;
        this.stateKeylock[keyCode] = false;
      });
      e.preventDefault();
    });

    canvas.addEventListener("mousemove", (e) => {
      let x = e.clientX - this.metrics.x;
      let y = e.clientY - this.metrics.y;
      this.stateQueue.push(() => {
        this.stateMouse.x = x;
        this.stateMouse.y = y;
      });
    });

    canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    canvas.addEventListener("click", (e) => {
      // this
    });

    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 0) {
        this.stateQueue.push(() => {
          this.stateMouse.left = true;
        });
      }
      if (e.button === 2) {
        this.stateQueue.push(() => {
          this.stateMouse.right = true;
        });
      }
      e.preventDefault();
      e.stopPropagation();
    });

    canvas.addEventListener("mouseup", (e) => {
      if (e.button === 0) {
        this.stateQueue.push(() => {
          this.stateMouse.left = false;
          this.stateMouselock.left = false;
        });
      }
      if (e.button === 2) {
        this.stateQueue.push(() => {
          this.stateMouse.right = false;
          this.stateMouselock.right = false;
        });
      }
      e.preventDefault();
      e.stopPropagation();
    });
  }

  keydown(keyCode) {
    return this.stateKeydown[keyCode];
  }

  keypush(keyCode) {
    return this.stateKeypush[keyCode];
  }

  // 1:left, 2:right, 3:middle
  mousedown(mouseCode) {
    if (mouseCode === 1) return this.stateMouse.left;
    if (mouseCode === 2) return this.stateMouse.right;
  }

  // 1:left, 2:right, 3:middle
  mousepush(mouseCode) {
    if (mouseCode === 1) return this.stateMousepush.left;
    if (mouseCode === 2) return this.stateMousepush.right;
  }

  mouseX() {
    return this.stateMouse.x;
  }

  mouseY() {
    return this.stateMouse.y;
  }

  update() {
    this.stateQueue.forEach((s) => s());
    Object.keys(this.stateKeydown).forEach((k) => {
      this.stateKeypush[k] = false;
      if (this.stateKeydown[k] && !this.stateKeylock[k]) {
        this.stateKeypush[k] = true;
        this.stateKeylock[k] = true;
      }
    });

    this.stateMousepush.left = false;
    if (this.stateMouse.left && !this.stateMouselock.left) {
      this.stateMousepush.left = true;
      this.stateMouselock.left = true;
    }

    this.stateMousepush.right = false;
    if (this.stateMouse.right && !this.stateMouselock.right) {
      this.stateMousepush.right = true;
      this.stateMouselock.right = true;
    }

    this.stateQueue = [];
  }
}

export default {
  InterfaceAdapterCanvas: InterfaceAdapterCanvas,
};
