import component from "./component.js";
import task from "../tasks/task.js";
import vector from "../vector.js";
import list from "../list.js";
import killable from "./killable.js";
const Component = component.Component;
const Task = task.Task;
const TaskPriorities = task.TaskPriorities;
const v$ = vector.Vector.$;
const List = list.List;
const KillableComponent = killable.KillableComponent;

let subscribers = {
  spawn: [],
  destroy: [],
};

class MessengerComponent extends Component {
  constructor(entity) {
    super(entity, KillableComponent);
    this.subscribed = [];

    let task = new Task(TaskPriorities.update, (task) => {
      if (entity.killable.killed) {
        task.kill();
      }
      this.run();
    });

    task.onKill = () => {
      [...this.subscribed].forEach((s) => this.unsubscribe(s));
    };

    this.init();
  }

  init() {
    //noop
  }

  run() {}

  getSubscribers(messageType) {
    let sub = subscribers[messageType];
    if (!sub) throw new Error(`unknown message type [${messageType}]`);
    return sub;
  }

  subscribe(messageType, onReceived) {
    let sub = this.getSubscribers(messageType);
    if (sub.findIndex((s) => s.entity == this.entity) >= 0)
      throw new Error(`invalid operation. already subscribed`);
    sub.push({
      entity: this.entity,
      onReceived: onReceived,
    });
    this.subscribed.push(messageType);
  }

  unsubscribe(messageType) {
    let sub = this.getSubscribers(messageType);
    let indx = sub.findIndex((s) => s.entity == this.entity);
    if (indx < 0) throw new Error("invalid operation. not subscribed");
    sub.splice(indx, 1);
    this.subscribed.splice(this.subscribed.indexOf(this.entity), 1);
  }

  send(messageType, ...params) {
    if (Object.keys(subscribers).indexOf(messageType) < 0)
      throw new Error(`unknown message type [${messageType}]`);
    let sub = this.getSubscribers(messageType);
    sub.forEach((s) => {
      s.onReceived(...params);
    });
  }
}

export default {
  MessengerComponent,
};
