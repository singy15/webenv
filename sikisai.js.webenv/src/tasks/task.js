import list from "../list.js";

class TaskPriorities {
  static initialize = 30000;
  static update = 20000;
  static draw = 10000;
}

let taskRepository = new list.List();

class TaskManager {
  static tasks;

  static register(task) {
    let last = null;
    let inserted = false;
    taskRepository.each((e, i, l, n) => {
      if (inserted) return;
      if (task.priority >= e.priority) {
        l.insertBefore(i.currNode(), task);
        inserted = true;
      }
    });
    if (!inserted) {
      taskRepository.append(task);
    }
  }

  static runAll() {
    taskRepository.each((e, i, l, n) => {
      if (e.killed) {
        l.removeNode(i.currNode());
        return;
      }
      e.run();
    });
  }

  static clearAll() {
    taskRepository = new list.List();
  }
}

class Task {
  constructor(priority, fn = null) {
    this.priority = priority;
    this.fn = fn;
    this.killed = false;
    TaskManager.register(this);
  }

  run() {
    if (this.fn) {
      this.fn(this);
    }
  }

  kill() {
    this.killed = true;
  }
}

export default {
  TaskPriorities: TaskPriorities,
  Task: Task,
  TaskManager: TaskManager,
};
