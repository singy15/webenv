import list from "./list.js";

class TaskPriorities {
  static initialize = 30000;
  static update = 20000;
  static draw = 10000;
}

let taskRepository = new list.List();
let lastPointer = {};

class TaskManager {
  static tasks;

  static register(task) {
    let startFrom = null;

    if (lastPointer[task.priority]) {
      // if last pointer found, use it as first node for iterator
      startFrom = lastPointer[task.priority];
    } else {
      // if last pointer not found, use nearest pointer as first node for iterator
      for (let p in lastPointer) {
        if (lastPointer[p] == null) continue;
        let pi = parseInt(p, 10);
        if (pi <= task.priority) {
          startFrom = lastPointer[pi];
        }
      }
    }

    if (startFrom != null) {
      taskRepository.each(
        (e, i, l, n) => {
          if (task.priority >= e.priority) {
            lastPointer[task.priority] = l.insertBefore(i.currNode(), task);
            return false;
          }
          return true;
        },
        startFrom,
        true,
      );
    } else {
      lastPointer[task.priority] = taskRepository.append(task);
    }
  }

  static runAll() {
    taskRepository.each((e, i, l, n) => {
      if (e.killed) {
        if (lastPointer[e.priority] == i.currNode()) {
          if (
            i.currNode().prev &&
            i.currNode().prev.value.priority === e.priority
          ) {
            lastPointer[e.priority] = i.currNode().prev;
          } else {
            lastPointer[e.priority] = null;
          }
        }
        l.removeNode(i.currNode());
        return;
      }
      // try {
      e.run();
      // } catch (e) {
      // console.error(e);
      // }
    });
  }

  static clearAll() {
    taskRepository.each((e, i, l, n) => {
      e.kill();
    });
    taskRepository = new list.List();
    lastPointer = {};
  }

  static count() {
    return taskRepository.count();
  }

  static pointer() {
    return lastPointer;
  }

  static repository() {
    return taskRepository;
  }
}

class Task {
  constructor(priority, fn = null) {
    this.priority = priority;
    this.fn = fn;
    this.killed = false;
    this.onKill = () => {};
    TaskManager.register(this);
  }

  run() {
    if (this.fn) {
      this.fn(this);
    }
  }

  kill() {
    this.killed = true;
    this.onKill();
  }
}

export default {
  TaskPriorities: TaskPriorities,
  Task: Task,
  TaskManager: TaskManager,
};
