import list from "./list.js";
import audioAdapter from "./audio-adapter.js";

class AudioAdapterWebAudio extends audioAdapter.AudioAdapter {
  constructor() {
    super();
    this.context = new AudioContext();
    this.bufferId = 0;
    this.buffers = {};
    this.notAuthorizedWarned = false;
    //this.channels = new Array(16);
    this.activeSources = [];
    this.maxActiveSources = 16;
    this.maxChannels = 16;

    this.config = new audioAdapter.AudioAdapterConfig();

    this.channelsAvailable = new list.List();
    this.channelsInUse = new list.List();
    for (let i = 0; i < this.maxChannels; i++) {
      this.channelsAvailable.push({
        gainNode: this.context.createGain(),
        source: null,
      });
    }

    // this.channels = [];
    // for (let i = 0; i < this.maxChannels; i++) {
    //   this.channels.push({
    //     currentSource: null,
    //     gainNode: this.context.createGain(),
    //   });
    // }
    // this.channelIndex = -1;
    // this.channelInUse = 0;
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
    // if (this.activeSources.length > this.maxActiveSources) {
    //   this.activeSources[0].stop();
    //   this.activeSources.shift();
    // }

    // let channel = null;
    // if (this.channelInUse === this.maxChannels) {
    //   // stop and release
    //   this.channelIndex++;
    //   this.channelIndex = this.channelIndex % this.maxChannels;
    //   channel = this.channels[this.channelIndex];
    //   channel.currentSource.stop();
    //   channel.currentSource = null;
    //   this.channelInUse--;
    // } else {
    //   // fetch channel
    //   let channelFound = false;
    //   for (let i = 0; i < this.maxChannels; i++) {
    //     this.channelIndex++;
    //     this.channelIndex = this.channelIndex % this.maxChannels;
    //     if (this.channels[this.channelIndex].currentSource == null) {
    //       channel = this.channels[this.channelIndex];
    //       channelFound = true;
    //       break;
    //     }
    //   }
    //   if (!channelFound) {
    //     //console.log(2);
    //     return;
    //   }
    // }

    let audioContext = this.context;

    if (audioContext.state === "suspended") {
      audioContext
        .resume()
        .then(() => {
          //console.log("AudioContext resumed successfully");
        })
        .catch((err) => {
          //console.error("Failed to resume AudioContext:", err);
        });
      if (audioContext.state === "suspended") {
        if (!this.notAuthorizedWarned) {
          this.notAuthorizedWarned = true;
          console.error("audio not authorized");
        }
        return;
      }
    }
    if (this.context.state !== "running") {
      if (!this.notAuthorizedWarned) {
        this.notAuthorizedWarned = true;
        console.error("audio not authorized");
      }
      return;
    }

    if (opt.url && !this.buffers[id]) {
      await this.fetchFile2(opt.url, id);
    }

    //let config = new audioAdapter.AudioAdapterConfig();
    let source = this.createSource(id);

    if (!source) {
      console.error("no audio source");
      return;
    }

    let channel = null;
    if (this.channelsAvailable.count() > 0) {
      channel = this.channelsAvailable.shift();
    } else {
      channel = this.channelsInUse.shift();
      channel.source.stop();
      channel.source = null;
    }
    let node = this.channelsInUse.push(channel);

    if (opt.loop) {
      source.loop = true;
    }

    if (opt.gain) {
      let gain = channel.gainNode; // this.createGain();
      source.connect(gain);
      gain.connect(this.getDestination());
      gain.gain.setValueAtTime(
        opt.gain * this.config.masterVolume,
        this.context.currentTime,
      );
    } else {
      source.connect(this.getDestination());
    }

    // channel.currentSource = source;
    // source.onended = () => {
    //   //console.log(1);
    //   channel.currentSource = null;
    //   this.channelInUse--;
    //   console.log(this.channelInUse);
    // };
    // this.channelInUse++;
    // console.log(this.channelInUse);

    // source.onended = () => {
    //   const i = this.activeSources.indexOf(source);
    //   if (i !== -1) this.activeSources.splice(i, 1);
    // };
    // this.activeSources.push(source);

    channel.source = source;
    source.onended = () => {
      this.channelsInUse.removeNode(node);
      this.channelsAvailable.push(node.value);
    };

    source.start();

    return source;
  }

  suspend() {
    this.context.suspend();
  }

  resume() {
    this.context.resume();
  }
}

export default {
  AudioAdapterWebAudio: AudioAdapterWebAudio,
};
