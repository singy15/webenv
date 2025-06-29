import audioAdapter from "./audio-adapter.js";

class AudioAdapterWebAudio extends audioAdapter.AudioAdapter {
  constructor() {
    super();
    this.context = new AudioContext();
    this.bufferId = 0;
    this.buffers = {};
  }

  createBuffer(data, id = null) {
    let newid;

    if (id == null) {
      this.bufferId++;
      newid = this.bufferId;
    } else {
      newid = id;
    }

    let buffer = {
      id: newid,
      data: data,
    };

    this.buffers[newid] = buffer;

    return buffer;
  }

  getBuffer(id) {
    return this.buffers[id];
  }

  fetchFile(url, id = null) {
    var req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.responseType = "arraybuffer";

    // let stringToArrayBuffer = (str) => {
    //   var buf = new ArrayBuffer(str.length);
    //   var bufView = new Uint8Array(buf);

    //   for (var i = 0, strLen = str.length; i < strLen; i++) {
    //     bufView[i] = str.charCodeAt(i);
    //   }

    //   return buf;
    // };

    req.onload = () => {
      // let res = stringToArrayBuffer(req.response);
      let res = req.response;
      this.context.decodeAudioData(res, (data) => {
        this.createBuffer(data, id);
      });
    };
    req.send();
  }

  async fetchFile2(url, id = null) {
    let ab = await (await fetch(url)).arrayBuffer();
    let decoded = await this.context.decodeAudioData(ab);
    this.createBuffer(decoded, id);
  }

  createSource(id) {
    let source = this.context.createBufferSource();
    if (!this.buffers[id]) {
      return null;
    }
    source.buffer = this.buffers[id].data;
    return source;
  }

  createGain() {
    return this.context.createGain();
  }

  getDestination() {
    return this.context.destination;
  }

  async playSound(id, opt = { url: undefined, loop: undefined }) {
    if (opt.url && !this.buffers[id]) {
      await this.fetchFile2(opt.url, id);
    }

    let config = new audioAdapter.AudioAdapterConfig();
    let source = this.createSource(id);

    if (!source) {
      // console.error("no audio source");
      return;
    }

    if (opt.loop) {
      source.loop = true;
    }

    if (opt.gain) {
      let gain = this.createGain();
      source.connect(gain);
      gain.connect(this.getDestination());
      gain.gain.setValueAtTime(
        opt.gain * config.masterVolume,
        this.context.currentTime,
      );
    } else {
      source.connect(this.getDestination());
    }

    source.start();
  }
}

export default {
  AudioAdapterWebAudio: AudioAdapterWebAudio,
};
