import component from "./component.js";
const Component = component.Component;

class KillableComponent extends Component {
  constructor(entity) {
    super(entity);
    this.killed = false;
    this.onKilled = () => {};
    this.subscribers = [];
  }

  kill(force = false) {
    this.killed = true;
    if (!force) {
      this.onKilled();
      this.subscribers.forEach((x) => x(this.entity));
    }
  }

  subscribeOnKilled(handler) {
    this.subscribers.push(handler);
  }
}

export default {
  KillableComponent: KillableComponent,
};
