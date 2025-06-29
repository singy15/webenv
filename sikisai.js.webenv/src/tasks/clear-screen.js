import task from "./task.js";
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;

class TaskClearScreen extends Task {
  constructor(gadpt) {
    super(TaskPriorities.draw + 9000);
    this.gadpt = gadpt;
  }

  run() {
    let g = this.gadpt;
    g.rect(0.0, 0.0, g.width(), g.height(), {
      fillStyle: "rgba(0,0,0,1.0)",
    });
  }
}

export default {
  TaskClearScreen,
};
