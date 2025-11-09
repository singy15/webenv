import task from "/sikisai.js/core/task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

class TaskClearScreen extends Task {
  constructor(gadpt) {
    super(TaskPriorities.draw + 9000);
    this.gadpt = gadpt;
    this.alpha = 1.0;
  }

  run() {
    let g = this.gadpt;

    g.changeContext("main");
    g.withoutCamera(() => {
      g.rect(0.0, 0.0, g.width(), g.height(), {
        fillStyle: `rgba(0,0,0,${this.alpha})`,
      });
    });

    g.changeContext("sub");
    g.withoutCamera(() => {
      g.rect(0.0, 0.0, g.width(), g.height(), {
        fillStyle: `rgba(0,0,0,${this.alpha})`,
      });
    });

    g.changeContext("main");
  }

  setAlpha(alpha) {
    this.alpha = alpha;
  }
}

export default {
  TaskClearScreen,
};
