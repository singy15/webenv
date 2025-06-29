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
  constructor() {}

  createBuffer(data, id = null) {}

  getBuffer(id) {}

  fetchFile(url, id = null) {}

  createSource(id) {}

  createGain() {}

  getDestination() {}

  playSound(id, opt = {}) {}
}

export default {
  AudioAdapter: AudioAdapter,
  AudioAdapterConfig: AudioAdapterConfig,
};
