import task from "../tasks/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

class TaskMusic extends Task {
  constructor(gadpt, aadpt) {
    super(TaskPriorities.update);
    this.gadpt = gadpt;
    this.aadpt = aadpt;
    this.t = 0;
    this.queue = [];
    this.loop = true;

    this.onKill = () => {
      this.queue.forEach((q) => {
        if (q.started && !q.stopped && q.source != null) {
          q.source.stop();
        }
      });
    };
  }

  run() {
    this.t++;
    this.queue.forEach((q, i) => {
      if (q.startAt <= this.t && !q.started) {
        q.started = true;
        (async () => {
          let src = await this.aadpt.playSound(q.id, { gain: q.gain });
          q.source = src;
        })();
      }

      if (
        q.stopAt >= 0 &&
        q.stopAt <= this.t &&
        q.started &&
        !q.stopped &&
        q.source != null
      ) {
        q.stopped = true;
        q.source.stop();

        if (i === this.queue.length - 1) {
          this.restartQueue();
        }
      }
    });
  }

  queueMusic(id, startAt = -1, stopAt = -1, gain = 1.0) {
    this.queue.push({
      startAt: startAt === -1 ? this.t : startAt,
      stopAt: stopAt,
      id: id,
      gain: gain,
      started: false,
      stopped: false,
      source: null,
    });
  }

  restartQueue() {
    this.queue.forEach((q) => {
      q.started = false;
      q.stopped = false;
      q.source = null;
    });
    this.t = 0;
  }
}

export default {
  TaskMusic,
};
