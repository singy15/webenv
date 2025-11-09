class AudioAdapterConfig {
  constructor() {
    if (AudioAdapterConfig.instance) {
      return AudioAdapterConfig.instance;
    }

    AudioAdapterConfig.instance = this;
    this.masterVolume = 1.0;
  }
}

class AudioAdapter {
  constructor() {
    if (typeof document.hidden !== "undefined") {
      document.addEventListener(
        "visibilitychange",
        () => {
          if (document.visibilityState === "hidden") {
            this.suspend();
          } else {
            this.resume();
          }
        },
        false,
      );
    }
  }

  createBuffer(data, id = null) {}

  getBuffer(id) {}

  fetchFile(url, id = null) {}

  createSource(id) {}

  createGain() {}

  getDestination() {}

  playSound(id, opt = {}) {}

  suspend() {}

  resume() {}
}

export default {
  AudioAdapter: AudioAdapter,
  AudioAdapterConfig: AudioAdapterConfig,
};
