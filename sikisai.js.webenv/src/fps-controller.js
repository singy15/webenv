// set updateFn and drawFn, then call start()

class FPSController {
  constructor() {
    this.updateFn = null;
    this.drawFn = null;
    this.fps = 60;
    this.targetInterval = 1000 / this.fps;
    this.updateLoadCoeff = 0.5;
    this.prevTime = performance.now() - this.targetInterval;
    this.enabled = false;
    this.frames = 0;
    this.lastSec = performance.now();
    this.actualFps = 0;
    this.updateFrames = 1;
  }
  
  setFps(desiredFps) {
    this.fps = desiredFps;
    this.targetInterval = 1000 / this.fps;
  }

  tick() {
    if (!this.enabled) return;

    let currentTime = performance.now();
    let updated = false;
    while (currentTime - this.prevTime > this.targetInterval * 0.5) {
      this.updateFn();
      updated = true;
      this.prevTime += this.targetInterval;
      let now = performance.now();
      let updateTime = now - currentTime;
      if (updateTime > this.targetInterval * this.updateLoadCoeff) {
        if (this.prevTime < now - this.targetInterval) {
          this.prevTime = now - this.targetInterval;
        }
        break;
      }
    }

    if (updated) {
      this.drawFn();
      this.frames = this.frames + 1;
      if (performance.now() - this.lastSec >= 1000) {
        this.actualFps = this.frames;
        this.lastSec = performance.now();
        this.frames = 0;
      }
    }

    requestAnimationFrame(() => {
      this.tick();
    });
  }

  forceUpdateNFrames(nframes) {
    for (let i = 0; i < nframes; i++) {
      this.updateFn();
    }
  }

  start() {
    this.enabled = true;
    this.tick();
  }

  stop() {
    this.enabled = false;
  }
}

export default {
  FPSController: FPSController,
};
